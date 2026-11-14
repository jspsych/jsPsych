/**
 * Failing tests for the issues found in the review of PR #3741. Each describe block names the
 * finding it covers. Loops are capped so that a "never done" bug fails an assertion instead of
 * hanging the test run.
 */
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";
import { createInterleaved, createStaircase } from "../../src/modules/adaptive";

/** Calls update() up to `max` times while the staircase is not done. */
function run(s: ReturnType<typeof createStaircase>, response: () => boolean, max = 50) {
  for (let i = 0; i < max && !s.done; i++) s.update(response());
  return s;
}

describe("finding 1: saving a staircase as the docs describe", () => {
  // docs/reference/jspsych-adaptive.md documents `jsPsych.data.write({...})` for saving
  // `toJSON()`. If the fix is to change the docs instead of core, update this test to the new
  // documented pattern.
  test("jsPsych.data.write accepts the documented plain object", () => {
    const jsPsych = initJsPsych();
    const s = createStaircase({ start_level: 1, stop: { trials: 1 } });
    s.update(true);
    expect(() =>
      jsPsych.data.write({ threshold: s.threshold(), staircase: s.toJSON() } as any)
    ).not.toThrow();
    expect(jsPsych.data.get().values()[0].staircase.trial_count).toBe(1);
  });
});

describe("finding 2: stop-signal example records ssd and track", () => {
  test("data fields set on trial.data in on_start are saved", async () => {
    const ssd = createInterleaved(
      [{ start_level: 200, step_size: 50, correct_moves: "up", bounds: [0, 900], label: "track1" }],
      { order: "alternate" }
    );
    const { getData } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "<p>stop</p>",
        data: { task: "stop" },
        on_start: (trial) => {
          const track = ssd.next();
          trial.data.ssd = track.level;
          trial.data.track = track.label;
        },
        on_finish: (data) => {
          ssd.update(data.response === null);
        },
      },
    ]);
    await pressKey("a");
    const row = getData().values()[0];
    expect(row.task).toBe("stop");
    expect(row.ssd).toBe(200);
    expect(row.track).toBe("track1");
  });
});

describe("finding 3: clamp() rounds after clamping", () => {
  test("ascending_discontinue reaches the 'ceiling' stop with a fractional upper bound", () => {
    const s = createStaircase({
      start_level: 0,
      step_size: 0.1,
      bounds: [0, 1 / 3],
      mode: "ascending_discontinue",
    });
    run(s, () => true, 20);
    expect(s.done).toBe(true);
    expect(s.stop_reason).toBe("ceiling");
  });

  test("the level never exceeds a fractional upper bound", () => {
    const s = createStaircase({ start_level: 0.5, step_size: 0.5, bounds: [0, 2 / 3] });
    s.update(false); // moves up, clamped to the max
    expect(s.level).toBeLessThanOrEqual(2 / 3);
  });

  test("the level never falls below a fractional lower bound", () => {
    const s = createStaircase({ start_level: 1, step_size: 1, bounds: [1 / 3, 2] });
    s.update(true); // moves down, clamped to the min
    expect(s.level).toBeGreaterThanOrEqual(1 / 3);
  });
});

describe("finding 4: update() accepts non-boolean responses", () => {
  // The span and psychophysics doc examples pass fields that are never defined, so update()
  // receives undefined and silently counts it as incorrect.
  test.each([
    ["undefined", undefined],
    ["null", null],
    ["a string", "f"],
    ["a number", 1],
  ])("update(%s) throws", (_, value) => {
    const s = createStaircase({ start_level: 5 });
    expect(() => s.update(value as any)).toThrow();
  });

  test("interleaved update() also rejects non-booleans", () => {
    const tracks = createInterleaved([{ start_level: 5 }]);
    tracks.next();
    expect(() => tracks.update(undefined as any)).toThrow();
  });
});

describe("finding 5: options that the mode cannot use are rejected", () => {
  test.each<[string, object]>([
    [
      "stop.reversals in ascending_discontinue",
      { mode: "ascending_discontinue", stop: { reversals: 4 } },
    ],
    ["stop.failures_at_level in staircase", { mode: "staircase", stop: { failures_at_level: 2 } }],
    [
      "correct_moves in ascending_discontinue",
      { mode: "ascending_discontinue", correct_moves: "down" },
    ],
    ["up in ascending_discontinue", { mode: "ascending_discontinue", up: 2 }],
    ["down in ascending_discontinue", { mode: "ascending_discontinue", down: 2 }],
    ["step_sizes in ascending_discontinue", { mode: "ascending_discontinue", step_sizes: [2, 1] }],
  ])("%s throws", (_, extra) => {
    expect(() => createStaircase({ start_level: 1, bounds: [0, 10], ...extra })).toThrow();
  });
});

describe("finding 6: step direction and the Kaernbach target with correct_moves 'up'", () => {
  // The code matches the "direction of the level" wording of step_size, so this is a docs fix
  // (the `up` row, the JSDoc on `up`/`down`, and the formula). Whether the step should instead
  // follow the response is a design decision, so there is no failing test here.
  test.todo("decide whether step_size.{up,down} follows level direction or response");
});

describe("finding 7: toJSON() keeps Infinity bounds", () => {
  test("config.bounds keeps Infinity", () => {
    const s = createStaircase({ start_level: 1, bounds: [0, Infinity] });
    expect(s.toJSON().config.bounds).toEqual([0, Infinity]);
  });

  test("a staircase can be rebuilt from its snapshot config", () => {
    const s = createStaircase({ start_level: 1, bounds: [0, Infinity] });
    expect(() => createStaircase(s.toJSON().config)).not.toThrow();
  });
});

describe("finding 8: interleaved update() without a new next()", () => {
  test("a second update() for the same next() throws", () => {
    const tracks = createInterleaved([{ start_level: 5 }, { start_level: 5 }], {
      order: "alternate",
    });
    tracks.next();
    tracks.update(true);
    expect(() => tracks.update(true)).toThrow();
    expect(tracks.tracks[0].trial_count).toBe(1);
  });
});

describe("finding 9: the config is snapshotted at construction", () => {
  test("changing config.stop after construction does not change the stop rules", () => {
    const cfg = { start_level: 5, stop: { trials: 10 } };
    const s = createStaircase(cfg);
    cfg.stop.trials = 1;
    s.update(true);
    expect(s.done).toBe(false);
  });

  test("changing config.label after construction does not change the label", () => {
    const cfg = { start_level: 5, label: "a" };
    const s = createStaircase(cfg);
    cfg.label = "b";
    expect(s.label).toBe("a");
    expect(s.toJSON().config.label).toBe("a");
  });

  test("tracks built from one shared config object are independent", () => {
    const cfg = { start_level: 5, stop: { trials: 3 } };
    const tracks = createInterleaved([cfg, cfg], { order: "alternate" });
    cfg.stop.trials = 1;
    tracks.next();
    tracks.update(true);
    expect(tracks.tracks[0].done).toBe(false);
  });
});

describe("finding 10: constructor validation", () => {
  test.each<[string, object]>([
    ["non-numeric bounds", { bounds: ["a", "z"] }],
    ["infinite start_level", { start_level: Infinity }],
    ["string step sizes", { step_size: { up: "20", down: "10" } }],
    ["stop.consecutive_failures of 0", { stop: { consecutive_failures: 0 } }],
    ["negative stop.trials", { stop: { trials: -1 } }],
    ["non-integer stop.trials", { stop: { trials: 1.5 } }],
    ["NaN stop.reversals", { stop: { reversals: NaN } }],
    ["string stop.trials", { stop: { trials: "5" } }],
  ])("%s throws", (_, extra) => {
    expect(() => createStaircase({ start_level: 100, ...extra } as any)).toThrow();
  });
});

describe("finding 11: ceiling bypasses the other stop rules", () => {
  // When the trial that hits the ceiling is also the last allowed trial, checkStop() would
  // report 'trials' first. Which reason should win is a design choice; this test assumes the
  // usual checkStop() order applies.
  test("stop.trials is reported when it is met on the ceiling trial", () => {
    const s = createStaircase({
      start_level: 10,
      bounds: [0, 10],
      mode: "ascending_discontinue",
      stop: { trials: 1 },
    });
    s.update(true);
    expect(s.done).toBe(true);
    expect(s.stop_reason).toBe("trials");
  });
});
