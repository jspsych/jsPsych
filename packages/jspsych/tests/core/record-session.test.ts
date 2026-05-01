import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";

function findById(node: any, id: string): any {
  if (node?.attrs?.id === id) return node;
  for (const c of node?.children ?? []) {
    const found = findById(c, id);
    if (found) return found;
  }
  return null;
}

describe("record_session option", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    // initJsPsych adds the `jspsych-display-element` class to whatever
    // element it's given, defaulting to <body>. classList changes are
    // not undone by clearing innerHTML, so without this reset the body
    // accumulates layout classes from previous tests and the spine in
    // `initial_dom` extends past where it should.
    document.body.className = "";
    document.body.removeAttribute("style");
    document.body.removeAttribute("tabindex");
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

  describe("display spine in initial_dom", () => {
    test("initial_dom is rooted at the outermost jspsych-* ancestor, not at the content div", async () => {
      // Without the spine, replayers only get <div class="jspsych-content">
      // and the centering CSS (which targets the wrapper and outer container)
      // can't take effect.
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline([{ type: htmlKeyboardResponse, stimulus: "<p>x</p>" }], jsPsych);
      await pressKey("a");

      const root = jsPsych.getSessionRecording()!.trials[0].initial_dom!;
      expect(root.kind).toBe("element");
      // jsPsych adds the jspsych-display-element class to the user's
      // display container (here, the body since none was provided).
      const rootClasses = ((root as any).attrs.class ?? "").split(/\s+/);
      expect(rootClasses).toContain("jspsych-display-element");
    });

    test("the spine includes the jspsych-content-wrapper between container and content", async () => {
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline([{ type: htmlKeyboardResponse, stimulus: "<p>x</p>" }], jsPsych);
      await pressKey("a");

      const root = jsPsych.getSessionRecording()!.trials[0].initial_dom! as any;
      // root → content-wrapper → jspsych-content
      expect(root.children).toHaveLength(1);
      const wrapper = root.children[0];
      expect((wrapper.attrs.class ?? "").split(/\s+/)).toContain("jspsych-content-wrapper");
      expect(wrapper.children).toHaveLength(1);
      const content = wrapper.children[0];
      expect((content.attrs.class ?? "").split(/\s+/)).toContain("jspsych-content");
      expect(content.attrs.id).toBe("jspsych-content");
    });

    test("trial content from the plugin lives inside the jspsych-content node, not the spine wrappers", async () => {
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [{ type: htmlKeyboardResponse, stimulus: '<p id="trial-p">hello</p>' }],
        jsPsych
      );
      await pressKey("a");

      const root = jsPsych.getSessionRecording()!.trials[0].initial_dom! as any;
      // Walk down the spine to the jspsych-content node, then search its
      // subtree for the trial paragraph. Plugins typically wrap their
      // stimulus in a plugin-specific div, so the <p> is a descendant
      // of jspsych-content rather than a direct child.
      const wrapper = root.children[0];
      const content = wrapper.children[0];
      expect((content.attrs.class ?? "").split(/\s+/)).toContain("jspsych-content");
      const trialP = findById(content, "trial-p");
      expect(trialP).toBeDefined();
      // Sibling content under outer wrappers must not appear in initial_dom
      // even when display_element defaults to <body>; the spine excludes
      // body siblings by design.
      const containerSiblings = root.children.filter((c: any) => c !== wrapper);
      expect(containerSiblings).toHaveLength(0);
    });

    test("the spine stops at the displayContainer (not the body when display_element is custom)", async () => {
      // When the user provides a custom display_element, the recorder
      // should walk up through the jsPsych-managed wrappers but stop at
      // their host. Capturing further would risk including unrelated
      // page chrome (siblings of the host inside <body>).
      const host = document.createElement("div");
      host.id = "experiment-host";
      document.body.appendChild(host);

      const jsPsych = initJsPsych({ record_session: true, display_element: host });
      // `pressKey` dispatches on `document.body`, but with a custom
      // display_element the keyboard listener is rooted at `host` (which
      // sits inside body, not above it), so the keypress never reaches
      // the listener. Use `trial_duration` to auto-advance instead so the
      // run resolves and the recorder's stop() fires before the next test.
      const tl = await startTimeline(
        [{ type: htmlKeyboardResponse, stimulus: "<p>x</p>", trial_duration: 1 }],
        jsPsych
      );
      await tl.finished;

      const root = jsPsych.getSessionRecording()!.trials[0].initial_dom! as any;
      // The spine's outermost element is the user's host (which jsPsych
      // tagged with jspsych-display-element); the parent <body> is excluded
      // because it isn't the displayContainer.
      expect(root.attrs.id).toBe("experiment-host");
    });
  });

  test("captures Math.random calls in the session-level rng_calls log", async () => {
    const jsPsych = initJsPsych({ record_session: true });
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "<p>x</p>",
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
    expect(rec.rng_calls.length).toBeGreaterThanOrEqual(2);
    for (const call of rec.rng_calls) {
      expect(call.fn).toBe("Math.random");
      expect(typeof call.result).toBe("number");
      expect(typeof call.t).toBe("number");
    }
  });

  test("captures Math.random calls made during pre-trial parameter evaluation", async () => {
    // Parameter functions (e.g. a function-valued `stimulus`) are evaluated
    // before `onTrialStart` fires, so any RNG calls there happen with no
    // active trial. The session-level rng_calls log captures them anyway.
    const jsPsych = initJsPsych({ record_session: true });
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: () => {
            Math.random();
            Math.random();
            Math.random();
            return "<p>x</p>";
          },
        },
      ],
      jsPsych
    );
    await pressKey("a");

    const rec = jsPsych.getSessionRecording()!;
    expect(rec.rng_calls.length).toBeGreaterThanOrEqual(3);

    // Calls during parameter evaluation precede the trial's t_start, so we
    // expect at least one call with t < trials[0].t_start.
    const trialStart = rec.trials[0].t_start;
    const preTrialCalls = rec.rng_calls.filter((c) => c.t < trialStart);
    expect(preTrialCalls.length).toBeGreaterThanOrEqual(3);
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

  describe("stylesheet capture", () => {
    afterEach(() => {
      // Each test installs sheets directly on document.head; clean up so
      // they don't leak across cases or pollute later tests in the file.
      for (const el of Array.from(document.head.querySelectorAll("style,link"))) {
        el.remove();
      }
    });

    test("captures inline <style> rule text at session start", async () => {
      const style = document.createElement("style");
      style.textContent = ".jspsych-display-element { color: rebeccapurple; }";
      document.head.appendChild(style);

      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline([{ type: htmlKeyboardResponse, stimulus: "x" }], jsPsych);
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const inline = rec.stylesheets.filter((s) => s.kind === "inline");
      expect(inline.length).toBeGreaterThan(0);
      expect(inline.some((s) => s.css.includes("rebeccapurple"))).toBe(true);
    });

    test("captures <link rel=stylesheet> href even when CSS is unreadable", async () => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://example.test/jspsych.css";
      document.head.appendChild(link);

      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline([{ type: htmlKeyboardResponse, stimulus: "x" }], jsPsych);
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const linkSnaps = rec.stylesheets.filter((s) => s.kind === "link");
      expect(linkSnaps.some((s) => s.href === "https://example.test/jspsych.css")).toBe(true);
    });

    test("initial stylesheets array is fixed at start; later additions go to stylesheet_events", async () => {
      const style = document.createElement("style");
      style.textContent = ".pre-existing { color: red; }";
      document.head.appendChild(style);

      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus: "x",
            on_load: () => {
              const late = document.createElement("style");
              late.textContent = ".added-during-trial { color: blue; }";
              document.head.appendChild(late);
            },
          },
        ],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const initialCss = rec.stylesheets.map((s) => s.css ?? "").join("\n");
      expect(initialCss).toContain("pre-existing");
      expect(initialCss).not.toContain("added-during-trial");

      const adds = rec.stylesheet_events.filter((e) => e.type === "stylesheet.add");
      expect(adds.some((e) => (e.sheet.css ?? "").includes("added-during-trial"))).toBe(true);
    });

    test("emits stylesheet.add when a <style> is appended to <head> mid-session", async () => {
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus: "x",
            on_load: () => {
              const s = document.createElement("style");
              s.textContent = ".mid-session { color: green; }";
              document.head.appendChild(s);
            },
          },
        ],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const adds = rec.stylesheet_events.filter((e) => e.type === "stylesheet.add");
      expect(adds.length).toBeGreaterThan(0);
      const match = adds.find(
        (e) => e.sheet.kind === "inline" && e.sheet.css.includes("mid-session")
      );
      expect(match).toBeDefined();
      expect(typeof match!.sheet.id).toBe("number");
      expect(match!.t).toEqual(expect.any(Number));
    });

    test("emits stylesheet.remove referencing the original snapshot id", async () => {
      const style = document.createElement("style");
      style.textContent = ".doomed { color: red; }";
      document.head.appendChild(style);

      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus: "x",
            on_load: () => {
              style.remove();
            },
          },
        ],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const initial = rec.stylesheets.find((s) => (s.css ?? "").includes("doomed"));
      expect(initial).toBeDefined();
      const removes = rec.stylesheet_events.filter((e) => e.type === "stylesheet.remove");
      expect(removes.some((e) => e.id === initial!.id)).toBe(true);
    });

    test("emits stylesheet.update when a tracked <style>'s text changes", async () => {
      const style = document.createElement("style");
      style.textContent = ".v1 { color: red; }";
      document.head.appendChild(style);

      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus: "x",
            on_load: () => {
              style.textContent = ".v2 { color: blue; }";
            },
          },
        ],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const initial = rec.stylesheets.find((s) => (s.css ?? "").includes("v1"));
      expect(initial).toBeDefined();
      const updates = rec.stylesheet_events.filter((e) => e.type === "stylesheet.update");
      expect(updates.length).toBeGreaterThan(0);
      const last = updates[updates.length - 1];
      expect(last.id).toBe(initial!.id);
      expect(last.css).toContain("v2");
    });

    test("ignores non-stylesheet head mutations (e.g. <meta>, <title>)", async () => {
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus: "x",
            on_load: () => {
              const meta = document.createElement("meta");
              meta.name = "irrelevant";
              document.head.appendChild(meta);
            },
          },
        ],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      expect(rec.stylesheet_events).toHaveLength(0);
    });
  });

  describe("canvas snapshot capture", () => {
    test("captures a final canvas.snapshot at trial end for canvases in the initial DOM", async () => {
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus: '<canvas id="c" width="50" height="50"></canvas>',
            on_load: () => {
              const c = document.getElementById("c") as HTMLCanvasElement;
              const ctx = c.getContext("2d")!;
              ctx.fillRect(10, 10, 20, 20);
            },
          },
        ],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const snaps = rec.trials[0].events.filter((e) => e.type === "canvas.snapshot");
      expect(snaps.length).toBeGreaterThan(0);
      const last = snaps[snaps.length - 1];
      expect(typeof last.node).toBe("number");
      expect(last.data_url).toEqual(expect.stringMatching(/^data:image\/png/));
    });

    test("emits no canvas.snapshot events when the trial has no canvas", async () => {
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [{ type: htmlKeyboardResponse, stimulus: "<p>no canvas here</p>" }],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const snaps = rec.trials[0].events.filter((e) => e.type === "canvas.snapshot");
      expect(snaps).toHaveLength(0);
    });

    test("tracks canvases added mid-trial via dom.add", async () => {
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus: '<div id="host"></div>',
            on_load: () => {
              const c = document.createElement("canvas");
              c.id = "late";
              c.width = 32;
              c.height = 32;
              document.getElementById("host")!.appendChild(c);
            },
          },
        ],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const snaps = rec.trials[0].events.filter((e) => e.type === "canvas.snapshot");
      expect(snaps.length).toBeGreaterThan(0);
    });

    test("captures the canvas's final pixel state when it is removed mid-trial", async () => {
      // jsPsych core clears the display element via `innerHTML = ""` after
      // every trial, before `onTrialFinish` fires. The recorder must take
      // its final snapshot at the moment of removal — a trial-end-only
      // flush would race with the cleanup and miss the canvas entirely.
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus: '<canvas id="c" width="20" height="20"></canvas>',
            on_load: () => {
              const c = document.getElementById("c") as HTMLCanvasElement;
              c.getContext("2d")!.fillRect(0, 0, 10, 10);
              c.remove();
            },
          },
        ],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const snaps = rec.trials[0].events.filter((e) => e.type === "canvas.snapshot");
      expect(snaps).toHaveLength(1);
      expect(snaps[0].data_url).toEqual(expect.stringMatching(/^data:image\/png/));
    });

    test("a tainted canvas (toDataURL throws) does not break the recording", async () => {
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus: '<canvas id="c" width="10" height="10"></canvas>',
            on_load: () => {
              const c = document.getElementById("c") as HTMLCanvasElement;
              c.toDataURL = () => {
                throw new DOMException("tainted", "SecurityError");
              };
            },
          },
        ],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      // Recording still ends cleanly and the trial completes.
      expect(rec.end_reason).toBe("finished");
      const snaps = rec.trials[0].events.filter((e) => e.type === "canvas.snapshot");
      expect(snaps).toHaveLength(0);
    });
  });

  describe("form-state capture", () => {
    test("captures input.value events for typed text", async () => {
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus: '<input id="q" type="text">',
            on_load: () => {
              const input = document.getElementById("q") as HTMLInputElement;
              input.value = "hello";
              input.dispatchEvent(new Event("input", { bubbles: true }));
            },
          },
        ],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const inputs = rec.trials[0].events.filter((e) => e.type === "input.value");
      expect(inputs.length).toBeGreaterThan(0);
      const last = inputs[inputs.length - 1];
      expect(last.value).toBe("hello");
      expect(typeof last.node).toBe("number");
    });

    test("captures input.value events for textarea content", async () => {
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus: '<textarea id="ta"></textarea>',
            on_load: () => {
              const ta = document.getElementById("ta") as HTMLTextAreaElement;
              ta.value = "line one\nline two";
              ta.dispatchEvent(new Event("input", { bubbles: true }));
            },
          },
        ],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const inputs = rec.trials[0].events.filter((e) => e.type === "input.value");
      expect(inputs[inputs.length - 1].value).toBe("line one\nline two");
    });

    test("coalesces multiple input events on the same field within a frame", async () => {
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus: '<input id="q" type="text">',
            on_load: () => {
              const input = document.getElementById("q") as HTMLInputElement;
              for (const v of ["h", "he", "hel", "hell", "hello"]) {
                input.value = v;
                input.dispatchEvent(new Event("input", { bubbles: true }));
              }
            },
          },
        ],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const inputs = rec.trials[0].events.filter((e) => e.type === "input.value");
      // Five rapid events without an intervening RAF flush coalesce into one.
      expect(inputs).toHaveLength(1);
      expect(inputs[0].value).toBe("hello");
    });

    test("captures input.checked events for checkboxes", async () => {
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus: '<input id="cb" type="checkbox">',
            on_load: () => {
              const cb = document.getElementById("cb") as HTMLInputElement;
              cb.checked = true;
              cb.dispatchEvent(new Event("change", { bubbles: true }));
            },
          },
        ],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const checks = rec.trials[0].events.filter((e) => e.type === "input.checked");
      expect(checks).toHaveLength(1);
      expect(checks[0].checked).toBe(true);
    });

    test("captures input.checked events for radio buttons", async () => {
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus:
              '<input id="r1" type="radio" name="g" value="a">' +
              '<input id="r2" type="radio" name="g" value="b">',
            on_load: () => {
              const r2 = document.getElementById("r2") as HTMLInputElement;
              r2.checked = true;
              r2.dispatchEvent(new Event("change", { bubbles: true }));
            },
          },
        ],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const checks = rec.trials[0].events.filter((e) => e.type === "input.checked");
      expect(checks).toHaveLength(1);
      expect(checks[0].checked).toBe(true);
    });

    test("captures input.select events for single-select <select>", async () => {
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus:
              '<select id="s">' +
              '<option value="a">A</option>' +
              '<option value="b">B</option>' +
              "</select>",
            on_load: () => {
              const s = document.getElementById("s") as HTMLSelectElement;
              s.value = "b";
              s.dispatchEvent(new Event("change", { bubbles: true }));
            },
          },
        ],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const selects = rec.trials[0].events.filter((e) => e.type === "input.select");
      expect(selects).toHaveLength(1);
      expect(selects[0].values).toEqual(["b"]);
    });

    test("captures input.select events for multi-select <select multiple>", async () => {
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus:
              '<select id="s" multiple>' +
              '<option value="a">A</option>' +
              '<option value="b">B</option>' +
              '<option value="c">C</option>' +
              "</select>",
            on_load: () => {
              const s = document.getElementById("s") as HTMLSelectElement;
              (s.options[0] as HTMLOptionElement).selected = true;
              (s.options[2] as HTMLOptionElement).selected = true;
              s.dispatchEvent(new Event("change", { bubbles: true }));
            },
          },
        ],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const selects = rec.trials[0].events.filter((e) => e.type === "input.select");
      expect(selects).toHaveLength(1);
      expect(selects[0].values).toEqual(["a", "c"]);
    });

    test("ignores input events from <input type=file>", async () => {
      const jsPsych = initJsPsych({ record_session: true });
      await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus: '<input id="f" type="file">',
            on_load: () => {
              const f = document.getElementById("f") as HTMLInputElement;
              f.dispatchEvent(new Event("input", { bubbles: true }));
            },
          },
        ],
        jsPsych
      );
      await pressKey("a");

      const rec = jsPsych.getSessionRecording()!;
      const inputs = rec.trials[0].events.filter((e) => e.type === "input.value");
      expect(inputs).toHaveLength(0);
    });
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
      onTrialStart: (info: { trial_index: number; plugin: string }) => void;
      onTrialFinish: (data: unknown) => void;
      getRecording: () => any;
    };

    recorder.start(jsPsych.getDisplayElement());
    recorder.onTrialStart({ trial_index: 0, plugin: "synthetic" });
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

  test("captures multiple trials, each with its own initial_dom and events", async () => {
    const jsPsych = initJsPsych({ record_session: true });
    await startTimeline(
      [
        { type: htmlKeyboardResponse, stimulus: "<p>first</p>" },
        { type: htmlKeyboardResponse, stimulus: "<p>second</p>" },
        { type: htmlKeyboardResponse, stimulus: "<p>third</p>" },
      ],
      jsPsych
    );
    await pressKey("a");
    await pressKey("a");
    await pressKey("a");

    const rec = jsPsych.getSessionRecording()!;
    expect(rec.trials).toHaveLength(3);
    expect(rec.trials.map((t) => t.trial_index)).toEqual([0, 1, 2]);

    // Each trial has its own DOM baseline and a non-null t_dom_ready / t_end.
    for (const trial of rec.trials) {
      expect(trial.initial_dom).not.toBeNull();
      expect(trial.t_dom_ready).not.toBeNull();
      expect(trial.t_end).not.toBeNull();
    }

    // Trials are chronologically ordered (each starts after the previous ended).
    expect(rec.trials[1].t_start).toBeGreaterThanOrEqual(rec.trials[0].t_end!);
    expect(rec.trials[2].t_start).toBeGreaterThanOrEqual(rec.trials[1].t_end!);

    // The DOM baselines should reflect the distinct stimuli.
    const html = (dom: any) => JSON.stringify(dom);
    expect(html(rec.trials[0].initial_dom)).toContain("first");
    expect(html(rec.trials[1].initial_dom)).toContain("second");
    expect(html(rec.trials[2].initial_dom)).toContain("third");
  });

  test("captures viewport_changes when the window resizes", async () => {
    const jsPsych = initJsPsych({ record_session: true });
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "x",
          on_load: () => {
            // Mutate jsdom's reported viewport size, then dispatch resize.
            Object.defineProperty(window, "innerWidth", {
              configurable: true,
              value: 9999,
            });
            Object.defineProperty(window, "innerHeight", {
              configurable: true,
              value: 8888,
            });
            window.dispatchEvent(new Event("resize"));
          },
        },
      ],
      jsPsych
    );
    // The recorder debounces viewport reads with a 100 ms trailing timer; let
    // it fire before the trial ends.
    await new Promise((r) => setTimeout(r, 150));
    await pressKey("a");

    const rec = jsPsych.getSessionRecording()!;
    expect(rec.viewport_changes.length).toBeGreaterThan(0);
    const last = rec.viewport_changes[rec.viewport_changes.length - 1];
    expect(last.w).toBe(9999);
    expect(last.h).toBe(8888);
  });

  test("captures window focus/blur events", async () => {
    const jsPsych = initJsPsych({ record_session: true });
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "x",
          on_load: () => {
            window.dispatchEvent(new Event("blur"));
            window.dispatchEvent(new Event("focus"));
          },
        },
      ],
      jsPsych
    );
    await pressKey("a");

    const rec = jsPsych.getSessionRecording()!;
    const focusEvents = rec.trials[0].events.filter((e) => e.type === "focus" || e.type === "blur");
    // Both blur and focus should be present.
    expect(focusEvents.map((e) => e.type)).toEqual(expect.arrayContaining(["blur", "focus"]));
  });

  test("captures media play and pause events for video elements", async () => {
    const jsPsych = initJsPsych({ record_session: true });
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: '<video id="vid" src="about:blank"></video>',
          on_load: () => {
            const video = document.getElementById("vid") as HTMLVideoElement;
            video.dispatchEvent(new Event("play"));
            video.dispatchEvent(new Event("pause"));
          },
        },
      ],
      jsPsych
    );
    await pressKey("a");

    const rec = jsPsych.getSessionRecording()!;
    const mediaEvents = rec.trials[0].events.filter((e) =>
      ["media.play", "media.pause", "media.ended", "media.seeked", "media.time"].includes(e.type)
    );
    expect(mediaEvents.map((e) => e.type)).toEqual(
      expect.arrayContaining(["media.play", "media.pause"])
    );
  });

  test("abortExperiment marks the recording end_reason as 'aborted'", async () => {
    const jsPsych = initJsPsych({ record_session: true });
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "first",
          on_finish: () => {
            jsPsych.abortExperiment("done");
          },
        },
        { type: htmlKeyboardResponse, stimulus: "second" },
      ],
      jsPsych
    );
    await pressKey("a");

    const rec = jsPsych.getSessionRecording()!;
    expect(rec.end_reason).toBe("aborted");
    // Only the first trial should have started; the second never did.
    expect(rec.trials).toHaveLength(1);
  });
});
