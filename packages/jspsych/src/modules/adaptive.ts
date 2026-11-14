/**
 * Adaptive procedures. Pure logic: no DOM, no timing.
 *
 * The only source of randomness is `Math.random()` (used by interleaved tracks to choose the next
 * track). `jsPsych.randomization.setSeed()` replaces `Math.random()`, so seeding makes the track
 * order reproducible.
 */

export type StepSize = number | { up: number; down: number };

export interface StaircaseStopRules {
  /** Stop after this many calls to `update()`. */
  trials?: number;
  /** Stop after this many reversals. */
  reversals?: number;
  /** Stop after this many consecutive incorrect responses (at any level). */
  consecutive_failures?: number;
  /** `ascending_discontinue` mode only: stop after this many incorrect responses at one level. */
  failures_at_level?: number;
}

export interface StaircaseConfig {
  /** Level of the first trial. */
  start_level: number;
  /**
   * Number of consecutive incorrect responses that moves the level in the "up" direction.
   * Default 1. (`staircase` mode only.)
   */
  up?: number;
  /**
   * Number of consecutive correct responses that moves the level in the "down" direction.
   * Default 1. (`staircase` mode only.)
   */
  down?: number;
  /**
   * Which way a run of correct responses moves the level. `'down'` (default) is the psychophysics
   * convention, where the level is stimulus intensity and correct responses make the task harder
   * by lowering it. Use `'up'` when a higher level is harder (stop-signal delay, list length), so
   * that a run of correct responses raises the level. `up` and `down` always count incorrect and
   * correct responses respectively, regardless of this setting.
   */
  correct_moves?: "down" | "up";
  /**
   * Step magnitude. A number, or `{ up, down }` with the (positive) size of a move in each
   * direction of the level. Default 1.
   */
  step_size?: StepSize;
  /**
   * Step sizes indexed by the number of reversals so far (entry 0 is used until the first
   * reversal, entry 1 after it, ...). The last entry is used from then on. Overrides `step_size`.
   */
  step_sizes?: StepSize[];
  /** `[min, max]`. Levels are clamped to this range. Default unbounded. */
  bounds?: [number, number];
  stop?: StaircaseStopRules;
  /**
   * `'staircase'` (default): n-up/m-down rule.
   * `'ascending_discontinue'`: the level moves up by the up-step after a correct response and
   * never moves otherwise; the procedure ends on a stop rule or on a correct response at the
   * upper bound.
   */
  mode?: "staircase" | "ascending_discontinue";
  /** Optional label, copied into `toJSON()` and `history` (useful for interleaved tracks). */
  label?: string;
}

export interface StaircaseHistoryEntry {
  /** 1-based index of this update. */
  trial: number;
  /** The level that was presented on this trial. */
  level: number;
  correct: boolean;
  /** The level after this update. */
  next_level: number;
  /** Whether this update caused a reversal. */
  reversal: boolean;
}

export interface ThresholdOptions {
  /** Average this many of the most recent reversal levels. Default: all reversals. */
  last_n_reversals?: number;
}

const round = (x: number) => Math.round(x * 1e10) / 1e10;

function resolveStep(step: StepSize): { up: number; down: number } {
  const s = typeof step === "number" ? { up: step, down: step } : step;
  if (!(s.up > 0) || !(s.down > 0)) {
    throw new Error("jsPsych.adaptive: step sizes must be positive numbers.");
  }
  return { up: s.up, down: s.down };
}

export class Staircase {
  private readonly config: StaircaseConfig;
  private readonly n_up: number;
  private readonly n_down: number;
  private readonly correct_moves: "down" | "up";
  private readonly mode: "staircase" | "ascending_discontinue";
  private readonly steps: { up: number; down: number }[];
  private readonly min: number;
  private readonly max: number;

  private _level: number;
  private _history: StaircaseHistoryEntry[] = [];
  private _reversal_levels: number[] = [];
  private _last_move: "up" | "down" | null = null;
  private _correct_run = 0;
  private _incorrect_run = 0;
  private _failures_at_level = 0;
  private _consecutive_failures = 0;
  private _done = false;
  private _stop_reason: string | null = null;

  constructor(config: StaircaseConfig) {
    this.config = config;
    this.mode = config.mode ?? "staircase";
    this.n_up = config.up ?? 1;
    this.n_down = config.down ?? 1;
    this.correct_moves = config.correct_moves ?? "down";
    [this.min, this.max] = config.bounds ?? [-Infinity, Infinity];

    if (typeof config.start_level !== "number" || isNaN(config.start_level)) {
      throw new Error("jsPsych.adaptive: `start_level` must be a number.");
    }
    if (
      !Number.isInteger(this.n_up) ||
      this.n_up < 1 ||
      !Number.isInteger(this.n_down) ||
      this.n_down < 1
    ) {
      throw new Error("jsPsych.adaptive: `up` and `down` must be positive integers.");
    }
    if (!(this.min < this.max)) {
      throw new Error("jsPsych.adaptive: `bounds` must be [min, max] with min < max.");
    }
    if (config.start_level < this.min || config.start_level > this.max) {
      throw new Error("jsPsych.adaptive: `start_level` is outside `bounds`.");
    }
    if (this.mode !== "staircase" && this.mode !== "ascending_discontinue") {
      throw new Error(`jsPsych.adaptive: unknown mode "${this.mode}".`);
    }
    const schedule = config.step_sizes ?? [config.step_size ?? 1];
    if (schedule.length === 0) {
      throw new Error("jsPsych.adaptive: `step_sizes` must not be empty.");
    }
    this.steps = schedule.map(resolveStep);
    this._level = config.start_level;
  }

  /** The level to present on the next trial. */
  get level() {
    return this._level;
  }

  get done() {
    return this._done;
  }

  /** Why the procedure ended, or `null` while it is running. */
  get stop_reason() {
    return this._stop_reason;
  }

  get label() {
    return this.config.label;
  }

  get reversals() {
    return this._reversal_levels.length;
  }

  /** Levels at which reversals occurred, in order. */
  get reversal_levels() {
    return [...this._reversal_levels];
  }

  get trial_count() {
    return this._history.length;
  }

  get history(): StaircaseHistoryEntry[] {
    return this._history.map((h) => ({ ...h }));
  }

  /**
   * Record the response to the trial presented at `level` and return the next level.
   * Throws if the procedure is already `done`.
   */
  update(correct: boolean): number {
    if (this._done) {
      throw new Error("jsPsych.adaptive: update() called on a staircase that is already done.");
    }
    const presented = this._level;
    this._consecutive_failures = correct ? 0 : this._consecutive_failures + 1;
    let reversal = false;

    if (this.mode === "ascending_discontinue") {
      if (correct) {
        this._correct_run++;
        this._incorrect_run = 0;
        this._failures_at_level = 0;
        if (presented >= this.max) {
          this._finish("ceiling", presented, correct, false);
          return this._level;
        }
        this._level = this.clamp(presented + this.currentStep().up);
      } else {
        this._incorrect_run++;
        this._correct_run = 0;
        this._failures_at_level++;
      }
    } else {
      if (correct) {
        this._correct_run++;
        this._incorrect_run = 0;
      } else {
        this._incorrect_run++;
        this._correct_run = 0;
      }
      let move: "up" | "down" | null = null;
      if (correct && this._correct_run >= this.n_down) {
        move = this.correct_moves;
        this._correct_run = 0;
      } else if (!correct && this._incorrect_run >= this.n_up) {
        move = this.correct_moves === "down" ? "up" : "down";
        this._incorrect_run = 0;
      }
      if (move) {
        if (this._last_move !== null && move !== this._last_move) {
          reversal = true;
          this._reversal_levels.push(presented);
        }
        // The move that causes a reversal already uses the post-reversal step size.
        const step = this.currentStep();
        this._last_move = move;
        this._level = this.clamp(presented + (move === "up" ? step.up : -step.down));
      }
    }

    const entry: StaircaseHistoryEntry = {
      trial: this._history.length + 1,
      level: presented,
      correct,
      next_level: this._level,
      reversal,
    };
    this._history.push(entry);
    this.checkStop();
    return this._level;
  }

  /**
   * Mean level of the last `last_n_reversals` reversals (all reversals if omitted or if fewer have
   * occurred). Returns `null` if there has been no reversal.
   */
  threshold(options: ThresholdOptions = {}): number | null {
    const n = options.last_n_reversals;
    if (n !== undefined && (!Number.isInteger(n) || n < 1)) {
      throw new Error("jsPsych.adaptive: `last_n_reversals` must be a positive integer.");
    }
    const levels = n === undefined ? this._reversal_levels : this._reversal_levels.slice(-n);
    if (levels.length === 0) return null;
    return round(levels.reduce((a, b) => a + b, 0) / levels.length);
  }

  toJSON() {
    return {
      label: this.config.label ?? null,
      mode: this.mode,
      config: JSON.parse(JSON.stringify(this.config)),
      level: this._level,
      done: this._done,
      stop_reason: this._stop_reason,
      trial_count: this.trial_count,
      reversals: this.reversals,
      reversal_levels: this.reversal_levels,
      threshold: this.threshold(),
      history: this.history,
    };
  }

  private currentStep() {
    return this.steps[Math.min(this._reversal_levels.length, this.steps.length - 1)];
  }

  private clamp(x: number) {
    return round(Math.min(this.max, Math.max(this.min, x)));
  }

  private _finish(reason: string, level: number, correct: boolean, reversal: boolean) {
    this._history.push({
      trial: this._history.length + 1,
      level,
      correct,
      next_level: this._level,
      reversal,
    });
    this._done = true;
    this._stop_reason = reason;
  }

  private checkStop() {
    const stop = this.config.stop;
    if (!stop) return;
    let reason: string | null = null;
    if (stop.trials !== undefined && this.trial_count >= stop.trials) reason = "trials";
    else if (stop.reversals !== undefined && this.reversals >= stop.reversals) reason = "reversals";
    else if (
      stop.consecutive_failures !== undefined &&
      this._consecutive_failures >= stop.consecutive_failures
    )
      reason = "consecutive_failures";
    else if (
      this.mode === "ascending_discontinue" &&
      stop.failures_at_level !== undefined &&
      this._failures_at_level >= stop.failures_at_level
    )
      reason = "failures_at_level";
    if (reason) {
      this._done = true;
      this._stop_reason = reason;
    }
  }
}

export interface InterleavedOptions {
  /** `'random'` (default) picks a random unfinished track; `'alternate'` cycles in order. */
  order?: "random" | "alternate";
}

export class InterleavedStaircases {
  readonly tracks: Staircase[];
  private readonly order: "random" | "alternate";
  private _current: number | null = null;
  private _last = -1;

  constructor(tracks: (StaircaseConfig | Staircase)[], options: InterleavedOptions = {}) {
    if (tracks.length === 0) throw new Error("jsPsych.adaptive: need at least one track.");
    this.order = options.order ?? "random";
    if (this.order !== "random" && this.order !== "alternate") {
      throw new Error(`jsPsych.adaptive: unknown order "${this.order}".`);
    }
    this.tracks = tracks.map((t) => (t instanceof Staircase ? t : new Staircase(t)));
  }

  get done() {
    return this.tracks.every((t) => t.done);
  }

  /** Index of the track chosen by the last call to `next()`, or `null`. */
  get current_index() {
    return this._current;
  }

  /** The track chosen by the last call to `next()`. */
  get current(): Staircase | null {
    return this._current === null ? null : this.tracks[this._current];
  }

  /**
   * Choose the track for the next trial among those not yet done and return it. Random choice uses
   * `Math.random()`, so it follows `jsPsych.randomization.setSeed()`.
   */
  next(): Staircase {
    const active = this.tracks.map((_, i) => i).filter((i) => !this.tracks[i].done);
    if (active.length === 0) {
      throw new Error("jsPsych.adaptive: next() called but all tracks are done.");
    }
    let idx: number;
    if (this.order === "random") {
      idx = active[Math.floor(Math.random() * active.length)];
    } else {
      idx = active.find((i) => i > this._last) ?? active[0];
    }
    this._last = idx;
    this._current = idx;
    return this.tracks[idx];
  }

  /** Update the track chosen by the last `next()` and return its next level. */
  update(correct: boolean): number {
    const track = this.current;
    if (!track) throw new Error("jsPsych.adaptive: call next() before update().");
    return track.update(correct);
  }

  toJSON() {
    return { order: this.order, done: this.done, tracks: this.tracks.map((t) => t.toJSON()) };
  }
}

export function createStaircase(config: StaircaseConfig): Staircase {
  return new Staircase(config);
}

export function createInterleaved(
  configs: (StaircaseConfig | Staircase)[],
  options?: InterleavedOptions
): InterleavedStaircases {
  return new InterleavedStaircases(configs, options);
}
