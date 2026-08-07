import { TrialResult } from "../../timeline";
import { DataCollection } from "../data/DataCollection";

/**
 * The version of the persisted session format. Sessions stored in a different format version are
 * discarded rather than replayed.
 */
export const RESUME_FORMAT_VERSION = 1;

const STORAGE_KEY_PREFIX = "jspsych-resume:";

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

  private readonly key: string;
  private readonly storageKey: string;
  private readonly storage?: StorageLike;
  private readonly getElapsedTime: () => number;
  private readonly onReplayComplete?: () => void;

  constructor(options: SessionRecorderOptions) {
    this.key = options.key;
    this.storageKey = STORAGE_KEY_PREFIX + options.key;
    this.storage = options.storage ?? getDefaultStorage();
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
      session.key !== this.key ||
      !Array.isArray(session.log)
    ) {
      this.clear();
      return false;
    }

    this.log = session.log;
    this.pointer = 0;
    this.lastConsumedIndex = undefined;
    this.state = isPlainObject(session.state) ? session.state : {};
    this.restoredElapsedTime = typeof session.elapsedTime === "number" ? session.elapsedTime : 0;
    this.isReplayCompletePending = this.log.length > 0;

    return this.isReplayCompletePending;
  }

  /** Removes the saved session from storage and resets the in-memory log */
  clear() {
    this.log = [];
    this.pointer = 0;
    this.lastConsumedIndex = undefined;
    this.isReplayCompletePending = false;

    if (this.storage) {
      try {
        this.storage.removeItem(this.storageKey);
      } catch (error) {
        console.warn("jsPsych: failed to clear the saved session.", error);
      }
    }
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

/**
 * The object exposed as `jsPsych.resume`. When the resume feature is disabled, `clear()` is a
 * no-op.
 */
export class ResumeAPI {
  constructor(private readonly getRecorder: () => SessionRecorder | undefined) {}

  /** Discards the saved session so that a page reload starts the experiment from the beginning */
  clear() {
    this.getRecorder()?.clear();
  }
}
