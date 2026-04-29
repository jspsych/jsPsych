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

  test("restores Math.random after the experiment finishes", async () => {
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
    expect(Math.random).not.toBe(patchedRandom!);
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
});
