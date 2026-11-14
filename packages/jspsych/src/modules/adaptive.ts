/**
 * Adaptive procedures. Pure logic: no DOM, no timing.
 *
 * The only source of randomness is `Math.random()` (used by interleaved tracks to choose the next
 * track). `jsPsych.randomization.setSeed()` replaces `Math.random()`, so seeding makes the track
 * order reproducible.
 */

import { deepCopy } from "./utils";

/**
 * What every adaptive procedure provides, so that procedures can be interleaved and saved the same
 * way. `Level` is what the procedure asks you to present (a number for a staircase) and
 * `Response` is what `update()` takes (`true`/`false` for a staircase).
 *
 * A procedure's state must depend only on its config, the sequence of responses passed to
 * `update()`, and `Math.random()` (which `jsPsych.randomization.setSeed()` controls).
 */
export interface AdaptiveProcedure<Level = number, Response = boolean> {
  /** The kind of procedure, e.g. `'staircase'`. Also included in `toJSON()`. */
  readonly procedure: string;
  /** Optional name, e.g. to tell interleaved tracks apart. */
  readonly label?: string;
  /** What to present on the next trial. */
  readonly level: Level;
  /** `true` once the procedure has ended. */
  readonly done: boolean;
  /** Why the procedure ended, or `null` while it is running. */
  readonly stop_reason: string | null;
  /** Number of calls to `update()` so far. */
  readonly trial_count: number;
  /** Record the response to the trial presented at `level` and return the next level. */
  update(response: Response): Level;
  /** Plain-object snapshot for saving in the data. */
  toJSON(): AdaptiveSnapshot;
}

/** The fields every `toJSON()` snapshot has. Each procedure adds its own. */
export interface AdaptiveSnapshot {
  procedure: string;
  label: string | null;
  done: boolean;
  stop_reason: string | null;
  trial_count: number;
  [key: string]: unknown;
}

export type StepSize = number | { up: number; down: number };

export interface StaircaseStopRules {
  /** Stop after this many calls to `update()`. */
  trials?: number;
  /** Stop after this many reversals. */
  reversals?: number;
  /** Stop after this many consecutive incorrect responses (at any level). */
  consecutive_failures?: number;
  /** Stop after this many incorrect responses since the level last changed. */
  failures_at_level?: number;
  /**
   * Stop after this many correct responses at the hardest level: the bound that correct responses
   * move toward (`max` with `correct_moves: 'up'`, `min` with `'down'`). Counted since the level
   * last reached that bound. Requires that bound to be finite.
   */
  ceiling?: number;
}

export interface StaircaseConfig {
  /** Level of the first trial. */
  start_level: number;
  /**
   * Number of consecutive responses needed to move the level up one step. These are incorrect
   * responses with the default `correct_moves: 'down'`, and correct responses with
   * `correct_moves: 'up'`. Default 1. `null` (or `Infinity`) means the level never moves up.
   */
  up?: number | null;
  /**
   * Number of consecutive responses needed to move the level down one step. These are correct
   * responses with the default `correct_moves: 'down'`, and incorrect responses with
   * `correct_moves: 'up'`. Default 1. `null` (or `Infinity`) means the level never moves down.
   */
  down?: number | null;
  /**
   * Which way correct responses move the level. `'down'` (default) is the psychophysics
   * convention, where the level is stimulus intensity and correct responses make the task harder
   * by lowering it. Use `'up'` when a higher level is harder (stop-signal delay, list length), so
   * that correct responses raise the level. `up`, `down` and `step_size` always refer to the
   * direction the level moves.
   */
  correct_moves?: "down" | "up";
  /**
   * Step magnitude. A number, or `{ up, down }` with the (positive) size of a move that raises and
   * a move that lowers the level, whichever response caused the move. Default 1.
   */
  step_size?: StepSize;
  /**
   * Step sizes indexed by the number of reversals so far (entry 0 is used until the first
   * reversal, entry 1 after it, ...). The last entry is used from then on. Overrides `step_size`.
   */
  step_sizes?: StepSize[];
  /**
   * `[min, max]`. Levels are clamped to this range. `null` (or `-Infinity`/`Infinity`) means no
   * bound on that side. Default `[null, null]`.
   */
  bounds?: [number | null, number | null];
  stop?: StaircaseStopRules;
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

const isPositiveFinite = (x: unknown): x is number =>
  typeof x === "number" && Number.isFinite(x) && x > 0;

const isPositiveInteger = (x: unknown): x is number =>
  typeof x === "number" && Number.isInteger(x) && x >= 1;

function resolveStep(step: StepSize): { up: number; down: number } {
  const s = typeof step === "number" ? { up: step, down: step } : step;
  if (typeof s !== "object" || s === null || !isPositiveFinite(s.up) || !isPositiveFinite(s.down)) {
    throw new Error("jsPsych.adaptive: step sizes must be positive finite numbers.");
  }
  return { up: s.up, down: s.down };
}

const STOP_RULES = [
  "trials",
  "reversals",
  "consecutive_failures",
  "failures_at_level",
  "ceiling",
] as const;

/** A run length for `up`/`down`: a positive integer, or Infinity for "never moves". */
const isRunLength = (x: unknown) => x === Infinity || isPositiveInteger(x);

export class Staircase implements AdaptiveProcedure<number, boolean> {
  readonly procedure = "staircase";
  private readonly config: StaircaseConfig;
  /** Run of correct responses needed to move the level in the `correct_moves` direction. */
  private readonly n_correct: number;
  /** Run of incorrect responses needed to move the level the other way. */
  private readonly n_incorrect: number;
  private readonly correct_moves: "down" | "up";
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
  private _ceiling_hits = 0;
  private _consecutive_failures = 0;
  private _done = false;
  private _stop_reason: string | null = null;

  constructor(input: StaircaseConfig) {
    // Snapshot the config so later changes to the caller's object (or to an object shared between
    // tracks) cannot change this staircase.
    const config: StaircaseConfig = deepCopy(input);
    this.config = config;
    // `null` and `Infinity` both mean "never" here; `undefined` means the default.
    const n_up = config.up === undefined ? 1 : config.up ?? Infinity;
    const n_down = config.down === undefined ? 1 : config.down ?? Infinity;
    this.correct_moves = config.correct_moves ?? "down";
    [this.n_correct, this.n_incorrect] =
      this.correct_moves === "up" ? [n_up, n_down] : [n_down, n_up];

    if (typeof config.start_level !== "number" || !Number.isFinite(config.start_level)) {
      throw new Error("jsPsych.adaptive: `start_level` must be a finite number.");
    }
    const bounds = config.bounds ?? [null, null];
    if (
      !Array.isArray(bounds) ||
      bounds.length !== 2 ||
      bounds.some((b) => b !== null && (typeof b !== "number" || Number.isNaN(b)))
    ) {
      throw new Error(
        "jsPsych.adaptive: `bounds` must be [min, max], where each is a number or null (no bound)."
      );
    }
    this.min = bounds[0] ?? -Infinity;
    this.max = bounds[1] ?? Infinity;
    if (!isRunLength(n_up) || !isRunLength(n_down)) {
      throw new Error(
        "jsPsych.adaptive: `up` and `down` must be positive integers, or null (never move)."
      );
    }
    if (this.correct_moves !== "down" && this.correct_moves !== "up") {
      throw new Error("jsPsych.adaptive: `correct_moves` must be 'down' or 'up'.");
    }
    if (!(this.min < this.max)) {
      throw new Error("jsPsych.adaptive: `bounds` must be [min, max] with min < max.");
    }
    if (config.start_level < this.min || config.start_level > this.max) {
      throw new Error("jsPsych.adaptive: `start_level` is outside `bounds`.");
    }
    if (config.stop !== undefined && (typeof config.stop !== "object" || config.stop === null)) {
      throw new Error("jsPsych.adaptive: `stop` must be an object.");
    }
    for (const rule of STOP_RULES) {
      const value = config.stop?.[rule];
      if (value !== undefined && !isPositiveInteger(value)) {
        throw new Error(`jsPsych.adaptive: \`stop.${rule}\` must be a positive integer.`);
      }
    }
    if (config.stop?.ceiling !== undefined && !Number.isFinite(this.hardest)) {
      throw new Error(
        `jsPsych.adaptive: \`stop.ceiling\` needs a finite ${
          this.correct_moves === "up" ? "upper" : "lower"
        } bound.`
      );
    }
    const schedule = config.step_sizes ?? [config.step_size ?? 1];
    if (schedule.length === 0) {
      throw new Error("jsPsych.adaptive: `step_sizes` must not be empty.");
    }
    this.steps = schedule.map(resolveStep);
    this._level = config.start_level;

    // Store "no bound" and "never move" as null, so that toJSON() output (JSON has no Infinity)
    // can be passed back to createStaircase() unchanged.
    if (config.up === Infinity) config.up = null;
    if (config.down === Infinity) config.down = null;
    if (config.bounds) {
      config.bounds = [
        Number.isFinite(this.min) ? this.min : null,
        Number.isFinite(this.max) ? this.max : null,
      ];
    }
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
   * Record whether the response to the trial presented at `level` was correct and return the next
   * level. Throws if `correct` is not a boolean or if the procedure is already `done`.
   */
  update(correct: boolean): number {
    if (this._done) {
      throw new Error("jsPsych.adaptive: update() called on a staircase that is already done.");
    }
    if (typeof correct !== "boolean") {
      throw new Error(
        `jsPsych.adaptive: update() expects true or false, but received ${
          typeof correct === "string" ? `"${correct}"` : String(correct)
        }.`
      );
    }
    const presented = this._level;
    this._consecutive_failures = correct ? 0 : this._consecutive_failures + 1;
    let reversal = false;

    if (correct) {
      this._correct_run++;
      this._incorrect_run = 0;
    } else {
      this._incorrect_run++;
      this._correct_run = 0;
    }
    let move: "up" | "down" | null = null;
    if (correct && this._correct_run >= this.n_correct) {
      move = this.correct_moves;
      this._correct_run = 0;
    } else if (!correct && this._incorrect_run >= this.n_incorrect) {
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

    if (this._level !== presented) this._failures_at_level = 0;
    else if (!correct) this._failures_at_level++;
    if (presented !== this.hardest) this._ceiling_hits = 0;
    if (correct && presented === this.hardest) this._ceiling_hits++;

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
      procedure: this.procedure,
      label: this.config.label ?? null,
      config: deepCopy(this.config) as StaircaseConfig,
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

  /** The bound that correct responses move toward. */
  private get hardest() {
    return this.correct_moves === "up" ? this.max : this.min;
  }

  private currentStep() {
    return this.steps[Math.min(this._reversal_levels.length, this.steps.length - 1)];
  }

  /** Round first, then clamp, so that rounding can never push a level past a bound. */
  private clamp(x: number) {
    return Math.min(this.max, Math.max(this.min, round(x)));
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
      stop.failures_at_level !== undefined &&
      this._failures_at_level >= stop.failures_at_level
    )
      reason = "failures_at_level";
    else if (stop.ceiling !== undefined && this._ceiling_hits >= stop.ceiling) reason = "ceiling";
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

/** Any adaptive procedure, whatever its level and response types. */
type AnyProcedure = AdaptiveProcedure<any, any>;

type LevelOf<T> = T extends AdaptiveProcedure<infer L, any> ? L : never;
type ResponseOf<T> = T extends AdaptiveProcedure<any, infer R> ? R : never;

function isProcedure(x: unknown): x is AnyProcedure {
  return typeof x === "object" && x !== null && typeof (x as AnyProcedure).update === "function";
}

/**
 * Runs several adaptive procedures ("tracks") together and chooses which one to use on each trial.
 * The tracks can be of different kinds.
 */
export class Interleaved<T extends AnyProcedure = Staircase> {
  readonly tracks: T[];
  private readonly order: "random" | "alternate";
  private _current: number | null = null;
  private _last = -1;
  /** Whether the track chosen by the last `next()` is still waiting for its `update()`. */
  private _awaiting_update = false;

  /** Each track is a procedure, or a plain object, which is taken as a staircase config. */
  constructor(tracks: (T | StaircaseConfig)[], options: InterleavedOptions = {}) {
    if (tracks.length === 0) throw new Error("jsPsych.adaptive: need at least one track.");
    this.order = options.order ?? "random";
    if (this.order !== "random" && this.order !== "alternate") {
      throw new Error(`jsPsych.adaptive: unknown order "${this.order}".`);
    }
    this.tracks = tracks.map((t) => (isProcedure(t) ? t : (new Staircase(t) as AnyProcedure as T)));
  }

  get done() {
    return this.tracks.every((t) => t.done);
  }

  /** Index of the track chosen by the last call to `next()`, or `null`. */
  get current_index() {
    return this._current;
  }

  /** The track chosen by the last call to `next()`. */
  get current(): T | null {
    return this._current === null ? null : this.tracks[this._current];
  }

  /**
   * Choose the track for the next trial among those not yet done and return it. Random choice uses
   * `Math.random()`, so it follows `jsPsych.randomization.setSeed()`.
   */
  next(): T {
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
    this._awaiting_update = true;
    return this.tracks[idx];
  }

  /**
   * Update the track chosen by the last `next()` and return its next level. Throws if `update()`
   * was already called since the last `next()`.
   */
  update(response: ResponseOf<T>): LevelOf<T> {
    const track = this.current;
    if (!track) throw new Error("jsPsych.adaptive: call next() before update().");
    if (!this._awaiting_update) {
      throw new Error(
        "jsPsych.adaptive: update() was already called for this trial; call next() first."
      );
    }
    // Only consume the next() once the track accepts the update, so a rejected response can be
    // retried.
    const level = track.update(response);
    this._awaiting_update = false;
    return level;
  }

  toJSON() {
    return {
      procedure: "interleaved",
      order: this.order,
      done: this.done,
      tracks: this.tracks.map((t) => t.toJSON()),
    };
  }
}

export function createStaircase(config: StaircaseConfig): Staircase {
  return new Staircase(config);
}

/**
 * Interleave several adaptive procedures. Each track is a procedure (e.g. from `createStaircase()`)
 * or a plain object, which is taken as a staircase config.
 */
export function createInterleaved(
  tracks: StaircaseConfig[],
  options?: InterleavedOptions
): Interleaved<Staircase>;
export function createInterleaved<T extends AnyProcedure>(
  tracks: T[],
  options?: InterleavedOptions
): Interleaved<T>;
export function createInterleaved<T extends AnyProcedure = Staircase>(
  tracks: (T | StaircaseConfig)[],
  options?: InterleavedOptions
): Interleaved<T | Staircase>;
export function createInterleaved(
  tracks: (AnyProcedure | StaircaseConfig)[],
  options?: InterleavedOptions
): Interleaved<AnyProcedure> {
  return new Interleaved(tracks, options);
}
