import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";

describe("record_session option", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("returns undefined when not enabled", async () => {
    const jsPsych = initJsPsych();
    await startTimeline([{ type: htmlKeyboardResponse, stimulus: "hi" }], jsPsych);
    await pressKey("a");
    expect(jsPsych.getSessionRecording()).toBeUndefined();
  });

  test("produces a recording when enabled", async () => {
    const jsPsych = initJsPsych({ record_session: true });
    await startTimeline([{ type: htmlKeyboardResponse, stimulus: "<p>Press A</p>" }], jsPsych);
    await pressKey("a");

    const rec = jsPsych.getSessionRecording();
    expect(rec).toBeDefined();
    expect(rec!.schema_version).toBe(1);
    expect(rec!.trials).toHaveLength(1);

    const trial = rec!.trials[0];
    expect(trial.plugin).toBe("html-keyboard-response");
    expect(trial.t_start).toBeGreaterThanOrEqual(0);
    expect(trial.t_dom_ready).not.toBeNull();
    expect(trial.t_end).not.toBeNull();
    expect(trial.initial_dom).not.toBeNull();
  });

  test("captures Math.random calls into the active trial", async () => {
    const jsPsych = initJsPsych({ record_session: true });
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "<p>x</p>",
          // on_load fires after onTrialStart wires up the recorder, so
          // RNG calls here are attributed to this trial.
          on_load: () => {
            Math.random();
            Math.random();
          },
        },
      ],
      jsPsych
    );
    await pressKey("a");

    const rec = jsPsych.getSessionRecording()!;
    expect(rec.rng.math_random_patched).toBe(true);
    expect(rec.trials[0].rng_calls.length).toBeGreaterThanOrEqual(2);
    for (const call of rec.trials[0].rng_calls) {
      expect(call.fn).toBe("Math.random");
      expect(typeof call.result).toBe("number");
      expect(typeof call.t).toBe("number");
    }
  });

  test("restores Math.random to the original after the experiment finishes", async () => {
    // Capture the true original BEFORE the recorder has any chance to seed
    // or wrap it. After stop(), Math.random must be exactly this reference.
    const original = Math.random;
    let patchedRandom: () => number;

    const jsPsych = initJsPsych({ record_session: true });
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "x",
          on_load: () => {
            patchedRandom = Math.random;
          },
        },
      ],
      jsPsych
    );
    await pressKey("a");

    expect(patchedRandom!).toBeDefined();
    // The patched wrapper observed during the trial is a distinct function.
    expect(patchedRandom!).not.toBe(original);
    // After the experiment completes, the original is fully restored.
    expect(Math.random).toBe(original);
  });

  test("captures the keypress event during the trial", async () => {
    const jsPsych = initJsPsych({ record_session: true });
    await startTimeline([{ type: htmlKeyboardResponse, stimulus: "x" }], jsPsych);
    await pressKey("a");

    const rec = jsPsych.getSessionRecording()!;
    const keyEvents = rec.trials[0].events.filter(
      (e) => e.type === "key.down" || e.type === "key.up"
    );
    expect(keyEvents.length).toBeGreaterThan(0);
  });

  test("records seed and viewport metadata", async () => {
    const jsPsych = initJsPsych({ record_session: true });
    await startTimeline([{ type: htmlKeyboardResponse, stimulus: "x" }], jsPsych);
    await pressKey("a");

    const rec = jsPsych.getSessionRecording()!;
    expect(rec.rng.seed).not.toBeNull();
    expect(rec.viewport).toEqual(
      expect.objectContaining({
        w: expect.any(Number),
        h: expect.any(Number),
        dpr: expect.any(Number),
      })
    );
    expect(rec.user_agent).toEqual(expect.any(String));
    expect(rec.recording_started_at).toEqual(expect.any(String));
    expect(rec.end_reason).toBe("finished");
  });

  test("captures window scroll events", async () => {
    const jsPsych = initJsPsych({ record_session: true });
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "x",
          on_load: () => {
            // simulate a scroll event on the document
            document.dispatchEvent(new Event("scroll"));
          },
        },
      ],
      jsPsych
    );
    await pressKey("a");

    const rec = jsPsych.getSessionRecording()!;
    const scrollEvents = rec.trials[0].events.filter((e) => e.type === "scroll.window");
    expect(scrollEvents.length).toBeGreaterThan(0);
    expect(scrollEvents[0]).toEqual(
      expect.objectContaining({
        type: "scroll.window",
        x: expect.any(Number),
        y: expect.any(Number),
        t: expect.any(Number),
      })
    );
  });

  test("captures element scroll events keyed by node id", async () => {
    const jsPsych = initJsPsych({ record_session: true });
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus:
            '<div id="scroll-region" style="overflow:auto;height:50px;"><p>line</p><p>line</p></div>',
          on_load: () => {
            const region = document.getElementById("scroll-region")!;
            // jsdom doesn't physically scroll, but dispatching the event with
            // the element as target exercises the code path.
            region.dispatchEvent(new Event("scroll"));
          },
        },
      ],
      jsPsych
    );
    await pressKey("a");

    const rec = jsPsych.getSessionRecording()!;
    const scrollEvents = rec.trials[0].events.filter((e) => e.type === "scroll.element");
    expect(scrollEvents.length).toBeGreaterThan(0);
    expect(scrollEvents[0]).toEqual(
      expect.objectContaining({
        type: "scroll.element",
        node: expect.any(Number),
        x: expect.any(Number),
        y: expect.any(Number),
      })
    );
  });

  test("a fresh start() after stop() begins a new recording without leaking state", async () => {
    const original = Math.random;
    const jsPsych = initJsPsych({ record_session: true });

    await startTimeline([{ type: htmlKeyboardResponse, stimulus: "first" }], jsPsych);
    await pressKey("a");

    // Snapshot the first run before re-starting; the recorder will replace
    // its internal recording object on the next start().
    const firstRecording = jsPsych.getSessionRecording()!;
    expect(firstRecording.end_reason).toBe("finished");
    expect(firstRecording.trials).toHaveLength(1);
    expect(firstRecording.trials[0].plugin).toBe("html-keyboard-response");

    // Math.random must be fully restored between sessions.
    expect(Math.random).toBe(original);

    // Reach the recorder via the JsPsych instance and restart it manually
    // to exercise the reuse contract directly (without spinning up a second
    // JsPsych instance, which would obscure the test).
    const recorder = (jsPsych as any).sessionRecorder as {
      start: (el: HTMLElement) => void;
      stop: (reason?: "finished" | "aborted" | "unload") => void;
      onTrialStart: (info: {
        trial_index: number;
        plugin: string;
        trial_params: unknown;
        stimulus_source: string | null;
      }) => void;
      onTrialFinish: (data: unknown) => void;
      getRecording: () => any;
    };

    recorder.start(jsPsych.getDisplayElement());
    recorder.onTrialStart({
      trial_index: 0,
      plugin: "synthetic",
      trial_params: { foo: "bar" },
      stimulus_source: null,
    });
    recorder.onTrialFinish({ rt: 100 });
    recorder.stop("finished");

    const secondRecording = recorder.getRecording();

    // The second recording is a brand-new object with only the new trial.
    expect(secondRecording).not.toBe(firstRecording);
    expect(secondRecording.trials).toHaveLength(1);
    expect(secondRecording.trials[0].plugin).toBe("synthetic");
    expect(secondRecording.end_reason).toBe("finished");

    // The first recording is unchanged.
    expect(firstRecording.trials).toHaveLength(1);
    expect(firstRecording.trials[0].plugin).toBe("html-keyboard-response");

    // Math.random is again restored after the second stop, with no
    // double-wrapping (i.e. the function reference equals the true original).
    expect(Math.random).toBe(original);
  });

  test("stop() flushes pending throttled events from an in-flight trial", async () => {
    const jsPsych = initJsPsych({ record_session: true });

    await startTimeline([{ type: htmlKeyboardResponse, stimulus: "x" }], jsPsych);

    // Simulate user activity, then stop the recorder mid-trial without
    // letting the rAF callback fire. The pending mouse-move position must
    // still appear in the trial's events.
    const display = jsPsych.getDisplayElement();
    display.dispatchEvent(
      new MouseEvent("mousemove", { clientX: 123, clientY: 456, bubbles: true })
    );

    const recorder = (jsPsych as any).sessionRecorder as {
      stop: (reason?: "finished" | "aborted" | "unload") => void;
    };
    recorder.stop("aborted");

    const rec = jsPsych.getSessionRecording()!;
    expect(rec.end_reason).toBe("aborted");
    const moves = rec.trials[0].events.filter((e) => e.type === "mouse.move");
    expect(moves.length).toBeGreaterThan(0);
    expect(moves[moves.length - 1]).toEqual(expect.objectContaining({ x: 123, y: 456 }));

    // Tidy up: finish the still-pending pressKey-driven trial promise so
    // the experiment can settle without tripping later assertions.
    await pressKey("a");
  });
});
