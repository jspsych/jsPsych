/**
 * Checks that the adaptive module is not tied to staircases: a procedure with a different response
 * type can implement AdaptiveProcedure and be interleaved with a staircase.
 */
import {
  AdaptiveProcedure,
  AdaptiveSnapshot,
  Staircase,
  createInterleaved,
  createStaircase,
} from "../../src/modules/adaptive";

/**
 * A minimal response-window procedure: the level is a window in ms, and update() takes a response
 * time. The window shrinks by 10% after a fast response and grows by 10% after a slow one.
 */
class ResponseWindow implements AdaptiveProcedure<number, number> {
  readonly procedure = "response_window";
  private _level: number;
  private _trials = 0;

  constructor(start: number, private readonly max_trials: number, readonly label?: string) {
    this._level = start;
  }

  get level() {
    return this._level;
  }
  get done() {
    return this._trials >= this.max_trials;
  }
  get stop_reason() {
    return this.done ? "trials" : null;
  }
  get trial_count() {
    return this._trials;
  }

  update(rt: number) {
    if (typeof rt !== "number") throw new Error("ResponseWindow: update() expects a number.");
    this._level = Math.round(rt <= this._level ? this._level * 0.9 : this._level * 1.1);
    this._trials++;
    return this._level;
  }

  toJSON(): AdaptiveSnapshot {
    return {
      procedure: this.procedure,
      label: this.label ?? null,
      done: this.done,
      stop_reason: this.stop_reason,
      trial_count: this._trials,
      level: this._level,
    };
  }
}

describe("other adaptive procedures", () => {
  test("a procedure with a numeric response can be interleaved with a staircase", () => {
    const staircase = createStaircase({ start_level: 5, stop: { trials: 2 }, label: "stair" });
    const window = new ResponseWindow(500, 2, "window");
    const tracks = createInterleaved([staircase, window], { order: "alternate" });

    const seen: string[] = [];
    while (!tracks.done) {
      const track = tracks.next();
      seen.push(track.procedure);
      if (track.procedure === "staircase") tracks.update(true);
      else tracks.update(400);
    }

    expect(seen).toEqual(["staircase", "response_window", "staircase", "response_window"]);
    expect(staircase.level).toBe(3);
    expect(window.level).toBe(405); // 500 -> 450 -> 405

    const snapshot = tracks.toJSON();
    expect(snapshot.procedure).toBe("interleaved");
    expect(snapshot.tracks.map((t) => t.procedure)).toEqual(["staircase", "response_window"]);
    expect(snapshot.tracks.every((t) => t.done)).toBe(true);
  });

  test("each track still validates its own response type", () => {
    const tracks = createInterleaved([new ResponseWindow(500, 5)]);
    tracks.next();
    expect(() => tracks.update(true as any)).toThrow();
    expect(() => tracks.update(300)).not.toThrow();
  });

  test("plain objects are still taken as staircase configs", () => {
    const tracks = createInterleaved([{ start_level: 1 }, new ResponseWindow(500, 5)]);
    expect(tracks.tracks[0]).toBeInstanceOf(Staircase);
    expect(tracks.tracks[1]).toBeInstanceOf(ResponseWindow);
  });

  test("a staircase-only interleave keeps the Staircase type", () => {
    const tracks = createInterleaved([{ start_level: 1 }, { start_level: 2 }]);
    // These compile only if next() and tracks are typed as Staircase, not the general interface.
    const reversals: number = tracks.next().reversals;
    const threshold: number | null = tracks.tracks[0].threshold();
    expect(reversals).toBe(0);
    expect(threshold).toBeNull();
  });

  test("a staircase snapshot names its procedure", () => {
    expect(createStaircase({ start_level: 1 }).toJSON().procedure).toBe("staircase");
  });
});
