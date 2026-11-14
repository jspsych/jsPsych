import { initJsPsych } from "../../src";
import { StaircaseConfig, createInterleaved, createStaircase } from "../../src/modules/adaptive";
import { setSeed } from "../../src/modules/randomization";

// Observer: P(correct) is logistic in level; a higher level is easier.
const MU = 10;
const SCALE = 2;
const p_correct = (level: number) => 1 / (1 + Math.exp(-(level - MU) / SCALE));
// Level at which the observer is correct with probability p.
const level_for = (p: number) => MU + SCALE * Math.log(p / (1 - p));

function simulate(config: StaircaseConfig, trials: number, observer = p_correct) {
  const s = createStaircase({ ...config, stop: { trials } });
  while (!s.done) s.update(Math.random() < observer(s.level));
  return s;
}

/** Mean of the levels visited after a burn-in. */
function mean_level(s: ReturnType<typeof simulate>, burn_in = 200) {
  const h = s.history.slice(burn_in);
  return h.reduce((a, b) => a + b.level, 0) / h.length;
}

beforeEach(() => setSeed("staircase-tests"));

describe("convergence (Levitt 1971)", () => {
  const base = { start_level: 20, step_size: 0.25 };

  test("1-up/1-down converges to the 50% point", () => {
    const s = simulate({ ...base, up: 1, down: 1 }, 6000);
    expect(s.threshold({ last_n_reversals: 200 })).toBeCloseTo(level_for(0.5), 0);
    expect(Math.abs(mean_level(s) - level_for(0.5))).toBeLessThan(0.4);
  });

  test("1-up/2-down converges to the 70.7% point", () => {
    const s = simulate({ ...base, up: 1, down: 2 }, 12000);
    expect(Math.abs(s.threshold({ last_n_reversals: 300 })! - level_for(0.707))).toBeLessThan(0.4);
    const h = s.history.slice(300);
    const acc = h.filter((x) => x.correct).length / h.length;
    expect(acc).toBeGreaterThan(0.67);
    expect(acc).toBeLessThan(0.74);
  });

  test("1-up/3-down converges to the 79.4% point", () => {
    const s = simulate({ ...base, up: 1, down: 3 }, 20000);
    expect(Math.abs(s.threshold({ last_n_reversals: 300 })! - level_for(0.794))).toBeLessThan(0.4);
    const h = s.history.slice(300);
    const acc = h.filter((x) => x.correct).length / h.length;
    expect(acc).toBeGreaterThan(0.76);
    expect(acc).toBeLessThan(0.83);
  });

  test("unequal steps converge near the Kaernbach target up/(up+down)", () => {
    // +20 after an error, -10 after a hit: target hit rate 20/30 = 66.7% (MID-style window).
    // Level is a response window in ms; a longer window is easier.
    const window_p = (w: number) => 1 / (1 + Math.exp(-(w - 250) / 40));
    const s = simulate(
      { start_level: 400, step_size: { up: 20, down: 10 }, bounds: [50, 1000] },
      6000,
      window_p
    );
    const h = s.history.slice(300);
    const acc = h.filter((x) => x.correct).length / h.length;
    expect(Math.abs(acc - 20 / 30)).toBeLessThan(0.04);
  });

  test("correct_moves 'up' tracks a stop-signal delay at 50% successful stops", () => {
    // Longer SSD is harder, so P(stop) falls with SSD.
    const p_stop = (ssd: number) => 1 / (1 + Math.exp((ssd - 250) / 50));
    const s = simulate(
      { start_level: 200, step_size: 50, correct_moves: "up", bounds: [0, 800] },
      4000,
      p_stop
    );
    expect(Math.abs(mean_level(s, 100) - 250)).toBeLessThan(40);
  });
});

describe("basic rules", () => {
  test("1-up/2-down: two correct lower the level, one error raises it, counter resets", () => {
    const s = createStaircase({ start_level: 10, up: 1, down: 2, step_size: 1 });
    expect(s.update(true)).toBe(10);
    expect(s.update(true)).toBe(9);
    expect(s.update(true)).toBe(9); // run restarted after the move
    expect(s.update(false)).toBe(10);
    expect(s.update(true)).toBe(10);
    expect(s.update(false)).toBe(11); // an error resets the correct run
  });

  test("n-up counts consecutive errors", () => {
    const s = createStaircase({ start_level: 5, up: 2, down: 1 });
    expect(s.update(false)).toBe(5);
    expect(s.update(true)).toBe(4);
    expect(s.update(false)).toBe(4);
    expect(s.update(false)).toBe(5);
  });

  test("unequal step sizes", () => {
    const s = createStaircase({ start_level: 100, step_size: { up: 20, down: 10 } });
    expect(s.update(true)).toBe(90);
    expect(s.update(false)).toBe(110);
  });

  test("bounds clamp the level", () => {
    const s = createStaircase({ start_level: 1, step_size: 5, bounds: [0, 8] });
    expect(s.update(true)).toBe(0);
    expect(s.update(true)).toBe(0);
    expect(s.update(false)).toBe(5);
    expect(s.update(false)).toBe(8);
    expect(s.update(false)).toBe(8);
  });

  test("avoids floating point drift", () => {
    const s = createStaircase({ start_level: 0, step_size: 0.1 });
    for (let i = 0; i < 3; i++) s.update(false);
    expect(s.level).toBe(0.3);
  });

  test("invalid configs throw", () => {
    expect(() => createStaircase({ start_level: 0, bounds: [5, 1] })).toThrow();
    expect(() => createStaircase({ start_level: 9, bounds: [0, 5] })).toThrow();
    expect(() => createStaircase({ start_level: 0, step_size: 0 })).toThrow();
    expect(() => createStaircase({ start_level: 0, down: 0 })).toThrow();
    expect(() => createStaircase({ start_level: 0, step_sizes: [] })).toThrow();
  });
});

describe("reversals, schedule and threshold", () => {
  test("counts reversals and records the level where direction changed", () => {
    const s = createStaircase({ start_level: 10, step_size: 1 });
    s.update(true); // 9, first move: not a reversal
    s.update(true); // 8
    expect(s.reversals).toBe(0);
    s.update(false); // 9, reversal at 8
    s.update(false); // 10, same direction
    s.update(true); // 9, reversal at 10
    expect(s.reversals).toBe(2);
    expect(s.reversal_levels).toEqual([8, 10]);
    expect(s.history.map((h) => h.reversal)).toEqual([false, false, true, false, true]);
  });

  test("step_sizes shrink after each reversal and the last entry persists", () => {
    const s = createStaircase({ start_level: 100, step_sizes: [8, 4, 2] });
    expect(s.update(true)).toBe(92); // 8
    expect(s.update(false)).toBe(96); // the reversing move already uses step 4
    expect(s.update(true)).toBe(94); // second reversal -> 2
    expect(s.update(false)).toBe(96); // third reversal -> still 2
    expect(s.update(false)).toBe(98);
  });

  test("threshold averages the last n reversals", () => {
    const s = createStaircase({ start_level: 10, step_size: 1 });
    expect(s.threshold()).toBeNull();
    for (const c of [true, false, true, false, true, false]) s.update(c);
    // levels: 10->9, rev@9 ->10, rev@10 ->9, rev@9 ->10, rev@10 ->9, rev@9 ->10
    expect(s.reversal_levels).toEqual([9, 10, 9, 10, 9]);
    expect(s.threshold()).toBeCloseTo(9.4);
    expect(s.threshold({ last_n_reversals: 2 })).toBe(9.5);
    expect(s.threshold({ last_n_reversals: 50 })).toBeCloseTo(9.4);
    expect(() => s.threshold({ last_n_reversals: 0 })).toThrow();
  });
});

describe("stopping rules", () => {
  test("trials", () => {
    const s = createStaircase({ start_level: 0, stop: { trials: 3 } });
    s.update(true);
    s.update(true);
    expect(s.done).toBe(false);
    s.update(true);
    expect(s.done).toBe(true);
    expect(s.stop_reason).toBe("trials");
    expect(() => s.update(true)).toThrow();
  });

  test("reversals", () => {
    const s = createStaircase({ start_level: 0, stop: { reversals: 2 } });
    for (const c of [true, false, true]) s.update(c);
    expect(s.done).toBe(true);
    expect(s.stop_reason).toBe("reversals");
  });

  test("consecutive_failures is not reset by level moves", () => {
    const s = createStaircase({ start_level: 3, stop: { consecutive_failures: 3 } });
    s.update(false);
    s.update(false);
    s.update(true);
    expect(s.done).toBe(false);
    s.update(false);
    s.update(false);
    expect(s.done).toBe(false);
    s.update(false);
    expect(s.done).toBe(true);
    expect(s.stop_reason).toBe("consecutive_failures");
  });

  test("span 1-up/2-down: start 3, discontinue after 2 consecutive errors", () => {
    const s = createStaircase({
      start_level: 3,
      up: 1,
      down: 2,
      correct_moves: "up",
      bounds: [2, 12],
      stop: { consecutive_failures: 2 },
    });
    expect(s.update(true)).toBe(3);
    expect(s.update(true)).toBe(4);
    expect(s.update(false)).toBe(3);
    expect(s.done).toBe(false);
    s.update(false);
    expect(s.done).toBe(true);
  });
});

describe("ascending_discontinue", () => {
  test("goes up after success and stops after failures at a level", () => {
    const s = createStaircase({
      start_level: 3,
      mode: "ascending_discontinue",
      stop: { failures_at_level: 2 },
    });
    expect(s.update(true)).toBe(4);
    expect(s.update(false)).toBe(4);
    expect(s.done).toBe(false);
    expect(s.update(true)).toBe(5); // failure count resets on advancing
    s.update(false);
    expect(s.done).toBe(false);
    s.update(false);
    expect(s.done).toBe(true);
    expect(s.stop_reason).toBe("failures_at_level");
    expect(s.level).toBe(5);
  });

  test("ends with 'ceiling' on a success at the upper bound", () => {
    const s = createStaircase({ start_level: 2, mode: "ascending_discontinue", bounds: [2, 3] });
    s.update(true);
    expect(s.level).toBe(3);
    s.update(true);
    expect(s.done).toBe(true);
    expect(s.stop_reason).toBe("ceiling");
    expect(s.trial_count).toBe(2);
  });

  test("no reversals are recorded", () => {
    const s = createStaircase({ start_level: 1, mode: "ascending_discontinue" });
    for (const c of [true, false, true, false]) s.update(c);
    expect(s.reversals).toBe(0);
  });
});

describe("interleaved tracks", () => {
  const run = (order: "random" | "alternate") => {
    const t = createInterleaved(
      [
        { start_level: 100, step_size: 50, correct_moves: "up", label: "A" },
        { start_level: 300, step_size: 50, correct_moves: "up", label: "B" },
      ],
      { order }
    );
    const picks: number[] = [];
    for (let i = 0; i < 30; i++) {
      const track = t.next();
      picks.push(t.current_index!);
      t.update(track.label === "A");
    }
    return { t, picks };
  };

  test("alternate cycles through tracks", () => {
    const { picks, t } = run("alternate");
    expect(picks.slice(0, 6)).toEqual([0, 1, 0, 1, 0, 1]);
    expect(t.tracks[0].trial_count).toBe(15);
  });

  test("random order is reproducible under setSeed and uses both tracks", () => {
    setSeed("abc");
    const a = run("random").picks;
    setSeed("abc");
    const b = run("random").picks;
    expect(a).toEqual(b);
    expect(new Set(a).size).toBe(2);
    setSeed("different");
    expect(run("random").picks).not.toEqual(a);
  });

  test("jsPsych.randomization.setSeed on an instance controls the order", () => {
    const jsPsych = initJsPsych();
    const mk = () => {
      const t = jsPsych.adaptive.createInterleaved([{ start_level: 0 }, { start_level: 0 }]);
      return Array.from({ length: 20 }, () => {
        t.next();
        const i = t.current_index;
        t.update(true);
        return i;
      });
    };
    jsPsych.randomization.setSeed("x");
    const a = mk();
    jsPsych.randomization.setSeed("x");
    expect(mk()).toEqual(a);
  });

  test("finished tracks are skipped; done when all are done", () => {
    const t = createInterleaved(
      [
        { start_level: 0, stop: { trials: 1 } },
        { start_level: 0, stop: { trials: 3 } },
      ],
      { order: "alternate" }
    );
    const picks: number[] = [];
    while (!t.done) {
      t.next();
      picks.push(t.current_index!);
      t.update(true);
    }
    expect(picks).toEqual([0, 1, 1, 1]);
    expect(() => t.next()).toThrow();
  });

  test("update before next throws", () => {
    const t = createInterleaved([{ start_level: 0 }]);
    expect(() => t.update(true)).toThrow();
  });

  test("toJSON includes every track", () => {
    const { t } = run("alternate");
    const json = JSON.parse(JSON.stringify(t));
    expect(json.tracks).toHaveLength(2);
    expect(json.tracks[1].label).toBe("B");
  });
});

describe("toJSON", () => {
  test("serializes state and history", () => {
    const s = createStaircase({ start_level: 10, step_size: 1, label: "x", stop: { trials: 3 } });
    for (const c of [true, false, true]) s.update(c);
    const json = JSON.parse(JSON.stringify(s));
    expect(json).toMatchObject({
      label: "x",
      mode: "staircase",
      level: 9,
      done: true,
      stop_reason: "trials",
      trial_count: 3,
      reversals: 2,
      reversal_levels: [9, 10],
      threshold: 9.5,
    });
    expect(json.history[1]).toEqual({
      trial: 2,
      level: 9,
      correct: false,
      next_level: 10,
      reversal: true,
    });
    expect(json.config.step_size).toBe(1);
  });

  test("history is a copy", () => {
    const s = createStaircase({ start_level: 1 });
    s.update(true);
    s.history[0].level = 99;
    expect(s.history[0].level).toBe(1);
  });
});
