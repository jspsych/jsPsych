import { TrialResult } from "../../timeline";
import { DataCollection } from "../data/DataCollection";

/**
 * The version of the persisted session format. Sessions stored in a different format version are
 * discarded rather than replayed.
 */
export const RESUME_FORMAT_VERSION = 1;

const STORAGE_KEY_PREFIX = "jspsych-resume:";

/** The message that is displayed instead of the experiment when a saved session blocks the run */
export const DEFAULT_BLOCK_MESSAGE = "<p>This experiment is no longer available to you.</p>";

/**
 * An entry of the session log. Each entry records the outcome of one nondeterministic decision that
 * the timeline engine made while running the experiment. Replaying the log therefore reproduces the
 * exact same sequence of trials without re-evaluating any of those decisions.
 */
export type SessionLogEntry =
  | { type: "tv-order"; order: Array<number | null> }
  | { type: "conditional"; result: boolean }
  | { type: "loop"; result: boolean }
  /** `result` is `null` for trials whose `record_data` parameter was `false` */
  | { type: "trial"; result: TrialResult | null };

export type SessionLogEntryType = SessionLogEntry["type"];

/** The subset of the DOM `Storage` interface that the resume feature relies on */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** The `resume` option of `initJsPsych()` */
export interface ResumeOptions {
  /**
   * Identifies the saved session. A saved session is only resumed if it was stored using the same
   * key, so changing the key invalidates all previously saved sessions.
   */
  key: string;

  /** Where to store the session. Defaults to `window.localStorage`. */
  storage?: StorageLike;

  /**
   * How long a saved session may be resumed for, in milliseconds. A session that was saved longer
   * ago than this is discarded and the experiment starts from the beginning. Defaults to
   * `undefined`, which means that a saved session never expires. Only applies to the `"resume"`
   * value of `incomplete_session`.
   */
  max_age?: number;

  /**
   * What happens when the page is loaded and jsPsych finds a session that was interrupted before the
   * experiment finished.
   *
   * - `"resume"` (default) continues the experiment where it was interrupted.
   * - `"restart"` discards the saved session and starts the experiment from the beginning.
   * - `"block"` does not run the experiment and displays `block_message` instead. The saved session
   *   stays in storage, so every further page load is blocked as well.
   */
  incomplete_session?: "resume" | "restart" | "block";

  /**
   * What happens when the page is loaded and jsPsych finds that the experiment has already been
   * completed in this browser.
   *
   * - `"restart"` (default) deletes the saved session when the experiment ends, so the participant
   *   can take the experiment again.
   * - `"block"` records that the experiment was completed instead of deleting the saved session, and
   *   displays `block_message` instead of running the experiment on every further page load.
   */
  completed_session?: "restart" | "block";

  /** The HTML that is displayed instead of the experiment when a saved session blocks the run. */
  block_message?: string;

  /** Invoked once when a saved session has been replayed and the experiment continues live. */
  on_resume?: (data: DataCollection) => void;
}

export interface SessionRecorderOptions extends ResumeOptions {
  /** Returns the total time elapsed in the experiment so far, in milliseconds */
  getElapsedTime?: () => number;

  /** Invoked once when replay of a non-empty session log has completed */
  onReplayComplete?: () => void;
}

function getDefaultStorage(): StorageLike | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    // Accessing `localStorage` throws in some privacy modes
    return undefined;
  }
}

export function isPlainObject(value: any) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Records the outcome of every nondeterministic decision made while an experiment runs and persists
 * it to storage, so that a reloaded page can replay the log to restore the experiment to the state
 * it was in before the reload.
 */
export class SessionRecorder {
  private log: SessionLogEntry[] = [];

  /**
   * The current position in the log. While replaying, it is the index of the next entry to be
   * consumed; while running live, it is always the end of the log.
   */
  private pointer = 0;

  /** Index of the entry returned by the most recent successful `consume()` call */
  private lastConsumedIndex?: number;

  /** Whether `onReplayComplete` still has to be fired */
  private isReplayCompletePending = false;

  /** Arbitrary user data that is persisted alongside the log */
  public state: Record<string, any> = {};

  private restoredElapsedTime = 0;

  /** Whether the saved session that was found forbids running the experiment */
  private blocked = false;

  private readonly key: string;
  private readonly storageKey: string;
  private readonly storage?: StorageLike;
  private readonly maxAge?: number;
  private readonly incompletePolicy: "resume" | "restart" | "block";
  private readonly completedPolicy: "restart" | "block";
  private readonly getElapsedTime: () => number;
  private readonly onReplayComplete?: () => void;

  constructor(options: SessionRecorderOptions) {
    this.key = options.key;
    this.storageKey = STORAGE_KEY_PREFIX + options.key;
    this.storage = options.storage ?? getDefaultStorage();
    this.maxAge = options.max_age;
    this.incompletePolicy = options.incomplete_session ?? "resume";
    this.completedPolicy = options.completed_session ?? "restart";
    this.getElapsedTime = options.getElapsedTime ?? (() => 0);
    this.onReplayComplete = options.onReplayComplete;
  }

  /** Whether there are unconsumed log entries, i.e. whether the experiment is being replayed */
  isReplaying() {
    return this.pointer < this.log.length;
  }

  /** Appends an entry to the log. Does nothing while replaying. */
  record(entry: SessionLogEntry) {
    this.checkReplayTransition();
    if (!this.isReplaying()) {
      this.log.push(entry);
      this.pointer++;
    }
  }

  /**
   * Records a trial result, or replaces the log entry at `replaceIndex` with it. The latter is used
   * for `run_on_resume` trials, which are re-executed during replay so their fresh result has to
   * take the place of the logged one.
   */
  recordTrial(result: TrialResult | null, replaceIndex?: number) {
    if (typeof replaceIndex === "number") {
      if (replaceIndex < this.log.length) {
        this.log[replaceIndex] = { type: "trial", result };
      }
    } else {
      this.record({ type: "trial", result });
    }
  }

  /**
   * Returns the next log entry if it is of the expected type. If the log is exhausted, returns
   * `null`. If the next entry does not match `expectedType` or is malformed, the saved session is
   * unusable from this point on: the remainder of the log is discarded, execution continues live,
   * and `null` is returned.
   */
  consume<T extends SessionLogEntryType>(
    expectedType: T
  ): Extract<SessionLogEntry, { type: T }> | null {
    if (!this.isReplaying()) {
      return null;
    }

    const entry = this.log[this.pointer];
    if (!this.isValidEntry(entry, expectedType)) {
      console.warn(
        `jsPsych: the saved session does not match this experiment (expected a "${expectedType}" entry). ` +
          "Discarding the rest of the saved session and continuing the experiment live."
      );
      this.discardRemainingLog();
      return null;
    }

    this.lastConsumedIndex = this.pointer;
    this.pointer++;

    // Trial entries need further processing by the `Trial` before the replayed experiment state is
    // complete, so trials signal the transition themselves via `checkReplayTransition()`.
    if (expectedType !== "trial") {
      this.checkReplayTransition();
    }

    return entry as Extract<SessionLogEntry, { type: T }>;
  }

  /** The index of the entry returned by the most recent successful `consume()` call */
  getLastConsumedIndex() {
    return this.lastConsumedIndex;
  }

  /** The total experiment time that had elapsed when the loaded session was persisted */
  getRestoredElapsedTime() {
    return this.restoredElapsedTime;
  }

  /**
   * Fires the `onReplayComplete` hook if a non-empty log has been fully replayed. Safe to call
   * repeatedly; the hook is fired at most once.
   */
  checkReplayTransition() {
    if (this.isReplayCompletePending && !this.isReplaying()) {
      this.isReplayCompletePending = false;
      this.onReplayComplete?.();
    }
  }

  /** Writes the current session to storage. Storage failures never interrupt the experiment. */
  persist() {
    if (!this.storage) {
      return;
    }

    try {
      this.storage.setItem(
        this.storageKey,
        JSON.stringify({
          formatVersion: RESUME_FORMAT_VERSION,
          key: this.key,
          log: this.log,
          state: this.state,
          elapsedTime: this.getElapsedTime(),
          savedAt: Date.now(),
        })
      );
    } catch (error) {
      console.warn("jsPsych: failed to save the session for resuming.", error);
    }
  }

  /**
   * Restores a saved session from storage, if one exists and is compatible with the current
   * configuration. Returns whether a session with a non-empty log has been restored.
   */
  load() {
    if (!this.storage) {
      return false;
    }

    let serializedSession: string | null;
    try {
      serializedSession = this.storage.getItem(this.storageKey);
    } catch (error) {
      console.warn("jsPsych: failed to read the saved session.", error);
      return false;
    }

    if (!serializedSession) {
      return false;
    }

    let session: any;
    try {
      session = JSON.parse(serializedSession);
    } catch (error) {
      console.warn("jsPsych: the saved session could not be parsed and will be discarded.", error);
      this.clear();
      return false;
    }

    if (
      !isPlainObject(session) ||
      session.formatVersion !== RESUME_FORMAT_VERSION ||
      session.key !== this.key
    ) {
      this.clear();
      return false;
    }

    if (session.completed === true) {
      // A marker that the experiment has been completed in this browser, not a replayable session.
      // It only matters while completed sessions are blocked, so it is discarded otherwise.
      if (this.completedPolicy === "block") {
        this.blocked = true;
      } else {
        this.clear();
      }
      return false;
    }

    if (!Array.isArray(session.log)) {
      this.clear();
      return false;
    }

    if (this.incompletePolicy === "block") {
      // The record of the interrupted session is what blocks the experiment, so it is deliberately
      // left in storage (and never expires) rather than being cleared
      this.blocked = true;
      return false;
    }

    if (this.incompletePolicy === "restart") {
      this.clear();
      return false;
    }

    if (typeof this.maxAge === "number" && !this.isWithinMaxAge(session.savedAt)) {
      console.info(
        "jsPsych: the saved session is older than `max_age` and will be discarded. " +
          "The experiment will start from the beginning."
      );
      this.clear();
      return false;
    }

    this.log = session.log;
    this.pointer = 0;
    this.lastConsumedIndex = undefined;
    this.state = isPlainObject(session.state) ? session.state : {};
    this.restoredElapsedTime = typeof session.elapsedTime === "number" ? session.elapsedTime : 0;
    this.isReplayCompletePending = this.log.length > 0;

    if (this.isReplayCompletePending) {
      this.recordResume(session.savedAt);
    }

    return this.isReplayCompletePending;
  }

  /**
   * Appends an entry to the reserved `_resumes` array of the state, which records every time that
   * this session was restored and continued. It is appended after the saved state has been
   * restored, so that the entries of earlier interruptions are preserved.
   */
  private recordResume(savedAt: any) {
    const now = Date.now();

    // The trials of the restored log occupy the indices `0..n-1`, so the experiment continues at
    // index `n`
    const trialCount = this.log.filter(
      (entry) => isPlainObject(entry) && entry.type === "trial"
    ).length;

    if (!Array.isArray(this.state._resumes)) {
      this.state._resumes = [];
    }

    this.state._resumes.push({
      trial_index: trialCount,
      time_away: typeof savedAt === "number" ? now - savedAt : null,
      resumed_at: now,
    });
  }

  /**
   * Whether the session that was found in storage forbids running the experiment, according to the
   * `incomplete_session` and `completed_session` policies
   */
  isBlocked() {
    return this.blocked;
  }

  /**
   * Ends the session, either by removing it from storage or, when completed sessions are blocked, by
   * replacing it with a marker that the experiment has been completed.
   */
  end() {
    if (this.completedPolicy === "block") {
      this.markCompleted();
    } else {
      this.clear();
    }
  }

  /**
   * Replaces the saved session with a marker that the experiment has been completed. The log and
   * the state are deliberately dropped, so that no participant data is left behind in storage.
   */
  markCompleted() {
    this.resetLog();

    if (!this.storage) {
      return;
    }

    try {
      this.storage.setItem(
        this.storageKey,
        JSON.stringify({
          formatVersion: RESUME_FORMAT_VERSION,
          key: this.key,
          completed: true,
          completedAt: Date.now(),
        })
      );
    } catch (error) {
      console.warn("jsPsych: failed to save the completed session.", error);
    }
  }

  /**
   * Removes the saved session from storage and returns the recorder to the state it is in at the
   * start of a fresh run, so that a new session is recorded from the next trial on. `state` is not
   * touched here; jsPsych resets it, because it decides which of the reserved keys have to survive.
   */
  clear() {
    this.resetLog();
    this.blocked = false;
    this.restoredElapsedTime = 0;

    if (this.storage) {
      try {
        this.storage.removeItem(this.storageKey);
      } catch (error) {
        console.warn("jsPsych: failed to clear the saved session.", error);
      }
    }
  }

  private resetLog() {
    this.log = [];
    this.pointer = 0;
    this.lastConsumedIndex = undefined;
    this.isReplayCompletePending = false;
  }

  /** Whether a session that was saved at `savedAt` may still be resumed. `maxAge` is set. */
  private isWithinMaxAge(savedAt: any) {
    // A session without a timestamp cannot be shown to be recent enough, so it is treated as expired
    return typeof savedAt === "number" && Date.now() - savedAt <= this.maxAge;
  }

  private discardRemainingLog() {
    this.log.length = this.pointer;
    this.checkReplayTransition();
  }

  private isValidEntry(entry: any, expectedType: SessionLogEntryType) {
    if (!isPlainObject(entry) || entry.type !== expectedType) {
      return false;
    }

    switch (expectedType) {
      case "tv-order":
        return (
          Array.isArray(entry.order) &&
          entry.order.every((index: any) => index === null || typeof index === "number")
        );

      case "conditional":
      case "loop":
        return typeof entry.result === "boolean";

      case "trial":
        return entry.result === null || isPlainObject(entry.result);
    }
  }
}
