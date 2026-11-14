/**
 * Regression tests for the issues found in the review of PR #3741. Each describe block names the
 * finding it covers. Loops are capped so that a "never done" bug fails an assertion instead of
 * hanging the test run.
 */
import callFunction from "@jspsych/plugin-call-function";
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { createInterleaved, createStaircase } from "../../src/modules/adaptive";

/** Calls update() up to `max` times while the staircase is not done. */
function run(s: ReturnType<typeof createStaircase>, response: () => boolean, max = 50) {
  for (let i = 0; i < max && !s.done; i++) s.update(response());
  return s;
}

describe("finding 1: saving a staircase as the docs describe", () => {
  // `jsPsych.data.write()` is internal (it takes a Trial), so the docs now save `toJSON()` by
  // returning it from a call-function trial. This tests that documented pattern.
  test("a call-function trial saves the snapshot in its data", async () => {
    const s = createStaircase({ start_level: 1, stop: { trials: 1 } });
    s.update(true);
    const { getData } = await startTimeline([
      {
        type: callFunction,
        func: () => ({ threshold: s.threshold(), staircase: s.toJSON() }),
      },
    ]);
    const row = getData().values()[0];
    expect(row.value.threshold).toBeNull();
    expect(row.value.staircase.trial_count).toBe(1);
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
  test("an ascending procedure reaches the 'ceiling' stop with a fractional upper bound", () => {
    const s = createStaircase({
      start_level: 0,
      step_size: 0.1,
      bounds: [0, 1 / 3],
      correct_moves: "up",
      down: Infinity,
      stop: { ceiling: 1 },
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

describe("finding 5: invalid options are rejected", () => {
  // The original finding was about options that a mode ignored. The modes have since been replaced
  // by general options, so this checks that those options are validated.
  test.each<[string, object]>([
    ["up: 0", { up: 0 }],
    ["down: -Infinity", { down: -Infinity }],
    ["an unknown correct_moves", { correct_moves: "sideways" }],
    ["a non-integer stop.ceiling", { stop: { ceiling: 1.5 } }],
    ["a non-integer stop.failures_at_level", { stop: { failures_at_level: 0.5 } }],
  ])("%s throws", (_, extra) => {
    expect(() => createStaircase({ start_level: 1, bounds: [0, 10], ...extra } as any)).toThrow();
  });

  test("up and down accept null and Infinity", () => {
    for (const never of [null, Infinity]) {
      expect(() => createStaircase({ start_level: 1, up: never })).not.toThrow();
      expect(() => createStaircase({ start_level: 1, down: never })).not.toThrow();
    }
  });
});

describe("finding 6: up, down and step_size follow the direction of the move", () => {
  // Decided: `up`, `down` and `step_size.{up,down}` all refer to the direction the level moves,
  // whichever response caused the move.
  test("with correct_moves 'up', up and step_size.up apply to correct responses", () => {
    const s = createStaircase({
      start_level: 10,
      correct_moves: "up",
      up: 2,
      down: 1,
      step_size: { up: 3, down: 1 },
    });
    expect(s.update(true)).toBe(10); // one correct is not enough to go up
    expect(s.update(true)).toBe(13); // two correct: up by step_size.up
    expect(s.update(false)).toBe(12); // one error: down by step_size.down
  });

  test("with the default correct_moves, up and step_size.up apply to incorrect responses", () => {
    const s = createStaircase({ start_level: 10, up: 1, down: 2, step_size: { up: 3, down: 1 } });
    expect(s.update(false)).toBe(13);
    expect(s.update(true)).toBe(13);
    expect(s.update(true)).toBe(12);
  });
});

describe("finding 7: toJSON() and Infinity", () => {
  // JSON has no Infinity, so "no bound" and "never move" are stored and saved as null.
  test("infinite bounds and run lengths are saved as null", () => {
    const s = createStaircase({ start_level: 1, bounds: [-Infinity, Infinity], up: Infinity });
    const { config } = s.toJSON();
    expect(config.bounds).toEqual([null, null]);
    expect(config.up).toBeNull();
  });

  test("a staircase rebuilt from a JSON round-trip of its config behaves the same", () => {
    const original = createStaircase({
      start_level: 3,
      bounds: [0, Infinity],
      correct_moves: "up",
      down: Infinity,
      stop: { failures_at_level: 2 },
    });
    const rebuilt = createStaircase(JSON.parse(JSON.stringify(original)).config);
    for (const c of [true, true, false, true, false, false]) {
      expect(rebuilt.update(c)).toBe(original.update(c));
    }
    expect(rebuilt.toJSON()).toEqual(original.toJSON());
  });

  test("null means the default for neither up nor down", () => {
    const s = createStaircase({ start_level: 5, up: null });
    for (let i = 0; i < 5; i++) s.update(false);
    expect(s.level).toBe(5);
  });

  test("a bounds entry that is neither a number nor null throws", () => {
    expect(() => createStaircase({ start_level: 1, bounds: [0, undefined] } as any)).toThrow();
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
      correct_moves: "up",
      down: Infinity,
      stop: { trials: 1, ceiling: 1 },
    });
    s.update(true);
    expect(s.done).toBe(true);
    expect(s.stop_reason).toBe("trials");
  });
});
