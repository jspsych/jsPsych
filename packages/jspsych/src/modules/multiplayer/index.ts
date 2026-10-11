import autoBind from "auto-bind";

import { MultiplayerError } from "./errors";
import {
  MultiplayerSession,
  ScopeName,
  SessionIdentity,
  SessionListener,
  SessionOptions,
  parseTimeout,
} from "./session";
import {
  ConnectionStatus,
  GroupSessionData,
  GroupState,
  MultiplayerAdapter,
  PresenceData,
  Unsubscribe,
} from "./types";

export * from "./errors";
export * from "./types";
export { DEFAULT_DROPOUT_TIMEOUT, PROTOCOL_VERSION } from "./session";
export type { SessionListener } from "./session";

/** How long connect() waits for the adapter by default, in ms. */
export const DEFAULT_CONNECT_TIMEOUT = 20000;

export interface ConnectOptions extends SessionOptions {
  /**
   * Aborting this signal cancels a connect() that is still pending. connect() then rejects with
   * a `cancelled` MultiplayerError once the adapter has closed anything it opened.
   */
  signal?: AbortSignal;

  /**
   * How long to wait for the adapter to connect before giving up with a `timeout`
   * MultiplayerError, in milliseconds. Defaults to 20000. null means no limit.
   */
  connectTimeout?: number | null;

  /**
   * Whether to add `multiplayer_participant_id` and `multiplayer_session_id` to every row of
   * jsPsych's data recorded while connected, so data from the members of a group can be joined.
   * Defaults to true.
   */
  recordIds?: boolean;
}

export interface ScopeOptions {
  /**
   * Which part of the shared data to use. During a trial, calls use that trial's scope by
   * default, so data from one trial never shows up in another. `"session"` uses the data that
   * lasts the whole session, which is also the default outside trials. `"trial"` insists on the
   * current trial's scope and throws outside a trial.
   */
  scope?: "trial" | "session";
}

export interface SubscribeOptions extends ScopeOptions {
  /** Aborting this signal removes the subscription. */
  signal?: AbortSignal;
}

export interface WaitOptions extends SubscribeOptions {
  /** Maximum time to wait in milliseconds. null or undefined means no limit. */
  timeout?: number | null;

  /**
   * Participants the wait depends on. If one of them leaves before the condition is met, the
   * wait rejects with a `participant_left` MultiplayerError.
   */
  participants?: string[];
}

/** Options for waitForGroup(). */
export type GroupWaitOptions = Pick<WaitOptions, "timeout" | "signal">;

/** Key of the hooks jsPsych calls as its timeline runs. Not part of the public API. */
export const timelineHooks = Symbol("multiplayer timeline hooks");

interface ConnectAttempt {
  controller: AbortController;
  attempt: Promise<MultiplayerSession>;
}

/**
 * jsPsych.multiplayer: opens a session with a backend adapter and forwards every other method to
 * it, so plugins can call jsPsych.multiplayer.update() and so on without holding a session.
 */
export class MultiplayerAPI {
  /** The latest session, open or closed. Closed sessions still answer reads. */
  private session: MultiplayerSession | null = null;
  private connecting: ConnectAttempt | null = null;

  /** The running trial's scope name, or null between trials. */
  private trialScope: string | null = null;

  /** The IDs to add to each row of jsPsych's data, or null when not recording them. */
  private recordedIds: Record<string, string> | null = null;

  /**
   * This page load's identity, shared by every session opened from it, so the group can tell a
   * reconnect of this page from a reload.
   */
  private readonly identity: SessionIdentity = {
    instance: Math.random().toString(36).slice(2) + Date.now().toString(36),
    epoch: 0,
  };

  constructor() {
    autoBind(this);
  }

  /** This participant's ID within the group. Null until connect() resolves. */
  get participantId(): string | null {
    return this.session?.participantId ?? null;
  }

  /** The group session's ID, the same for every participant in the group. Null until connect() resolves. */
  get sessionId(): string | null {
    return this.session?.sessionId ?? null;
  }

  /**
   * True when this participant reloaded or reopened the study after joining the group: their
   * experiment restarted, the group has moved on, and the others count them as having left.
   */
  get restarted(): boolean {
    return this.session?.restarted ?? false;
  }

  /** This participant's connection status. Null until connect() resolves; `closed` after disconnect(). */
  get status(): ConnectionStatus | null {
    return this.session?.status ?? null;
  }

  /** The session to read from: the latest one, even if it has closed. */
  private readable(): MultiplayerSession {
    if (!this.session) {
      throw new MultiplayerError(
        "not_connected",
        "connect() must be called with an adapter before using multiplayer methods."
      );
    }
    return this.session;
  }

  /** The session to write to, which must still be open. */
  private writable(): MultiplayerSession {
    const session = this.readable();
    session.assertOpen();
    return session;
  }

  /** The scope a call uses: null for the session scope, or the running trial's. */
  private scopeOf(options: ScopeOptions | undefined): ScopeName {
    const scope = options?.scope;
    if (scope === undefined) {
      return this.trialScope;
    }
    if (scope === "session") {
      return null;
    }
    if (scope === "trial") {
      if (this.trialScope === null) {
        throw new TypeError('MultiplayerAPI: scope "trial" can only be used during a trial.');
      }
      return this.trialScope;
    }
    throw new TypeError('MultiplayerAPI: scope must be "trial" or "session".');
  }

  /**
   * Open a session with a backend adapter. Must be called (and awaited) before jsPsych.run().
   * Rejects if a session is already open or connecting; a closed session can be replaced.
   */
  async connect(adapter: MultiplayerAdapter, options: ConnectOptions = {}): Promise<void> {
    if (this.connecting || (this.session && this.session.status !== "closed")) {
      throw new Error(
        "MultiplayerAPI: connect() has already been called. " +
          "Call disconnect() first before connecting again."
      );
    }

    const { signal, connectTimeout, recordIds = true, ...sessionOptions } = options;
    const timeout =
      connectTimeout === undefined
        ? DEFAULT_CONNECT_TIMEOUT
        : parseTimeout(connectTimeout, "connectTimeout");

    const controller = new AbortController();
    const abort = () => controller.abort();
    if (signal?.aborted) {
      abort();
    } else {
      signal?.addEventListener("abort", abort, { once: true });
    }
    let timedOut = false;
    const timer =
      timeout === null
        ? undefined
        : window.setTimeout(() => {
            timedOut = true;
            controller.abort();
          }, timeout);

    const connecting: ConnectAttempt = {
      controller,
      attempt: MultiplayerSession.open(adapter, controller.signal, sessionOptions, this.identity),
    };
    this.connecting = connecting;
    try {
      const session = await connecting.attempt;
      // Cancelled after the adapter finished connecting but before we got here
      if (controller.signal.aborted) {
        await session.disconnect().catch(() => {});
        throw new MultiplayerError("cancelled", "connect() was cancelled before it finished.");
      }
      this.session = session;
      // Rows recorded from now on get this session's IDs; earlier rows keep theirs
      this.recordedIds = recordIds
        ? {
            multiplayer_participant_id: session.participantId,
            multiplayer_session_id: session.sessionId,
          }
        : null;
    } catch (e) {
      if (timedOut) {
        throw new MultiplayerError("timeout", `connect() timed out after ${timeout}ms.`);
      }
      throw e;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      if (this.connecting === connecting) {
        this.connecting = null;
      }
    }
  }

  /**
   * Close the current session, or cancel a connect() that is still pending. Resolves once the
   * adapter has closed the connection. Reads keep returning the last state.
   */
  async disconnect(): Promise<void> {
    // Captured first, so a connect() that starts while this waits isn't closed too
    const connecting = this.connecting;
    const session = this.session;
    this.connecting = null;
    if (connecting) {
      connecting.controller.abort();
      const abandoned = await connecting.attempt.catch((): null => null);
      await abandoned?.disconnect().catch((e) => {
        console.error("MultiplayerAPI: adapter disconnect threw", e);
      });
    }
    await session?.disconnect();
  }

  /**
   * Shallow-merge data into this participant's data: top-level keys in `data` replace the same
   * keys, other keys are kept, and a key set to undefined is removed. Everyone sees the change;
   * the promise resolves once the backend has it.
   */
  async update(data: Record<string, unknown>, options?: ScopeOptions): Promise<void> {
    return this.writable().update(data, this.scopeOf(options));
  }

  /** Replace this participant's data in the scope with `data`, dropping every key it omits. */
  async replace(data: Record<string, unknown>, options?: ScopeOptions): Promise<void> {
    return this.writable().replace(data, this.scopeOf(options));
  }

  /** Every participant's data in the scope, keyed by participant ID. Frozen; don't modify it. */
  getAll(options?: ScopeOptions): GroupSessionData {
    return this.readable().getAll(this.scopeOf(options));
  }

  /** One participant's data in the scope, or undefined if they haven't written any. Frozen. */
  get(participantId: string, options?: ScopeOptions): Record<string, unknown> | undefined {
    return this.readable().get(participantId, this.scopeOf(options));
  }

  /** The presence status of every participant seen in the session. Frozen. */
  presence(): PresenceData {
    return this.readable().presence();
  }

  /** The group's size, members, and whether it is sealed. Frozen. */
  group(): GroupState {
    return this.readable().group();
  }

  /**
   * Stop new participants from joining, sealing the group with the members it has now. Rejects
   * with an `unsupported` MultiplayerError if the adapter can't seal groups.
   */
  async sealGroup(): Promise<void> {
    return this.writable().sealGroup();
  }

  /** Resolve with the group's state once it is sealed. */
  async waitForGroup(options: GroupWaitOptions = {}): Promise<GroupState> {
    return this.readable().waitForGroup({
      timeout: options.timeout,
      signal: options.signal,
      scope: null,
      trialBound: this.trialScope !== null,
    });
  }

  /**
   * Call `callback(data, presence, group)` now and after every change to the scope's data,
   * presence, or the group. A subscription made during a trial ends with the trial, unless it
   * uses `scope: "session"`, which lasts until the experiment ends.
   */
  subscribe(callback: SessionListener, options: SubscribeOptions = {}): Unsubscribe {
    const scope = this.scopeOf(options);
    return this.readable().subscribe(callback, {
      scope,
      signal: options.signal,
      trialBound: scope !== null,
    });
  }

  /**
   * Resolve with the scope's data once `condition(data, presence, group)` returns true. A wait
   * made during a trial is cancelled when the trial ends, unless it uses `scope: "session"`.
   */
  async wait(
    condition: (data: GroupSessionData, presence: PresenceData, group: GroupState) => boolean,
    options: WaitOptions = {}
  ): Promise<GroupSessionData> {
    if (options === null || typeof options !== "object") {
      // Catches the old wait(condition, timeout) form, which would otherwise mean no timeout
      throw new TypeError(
        "MultiplayerAPI: wait()'s second argument must be an options object, e.g. { timeout: 5000 }."
      );
    }
    const scope = this.scopeOf(options);
    return this.readable().wait(condition, {
      scope,
      signal: options.signal,
      timeout: options.timeout,
      participants: options.participants,
      trialBound: scope !== null,
    });
  }

  /**
   * A float in [0, 1) that is the same for every participant who asks with the same `key`.
   * Asking again with the same key returns the same value.
   */
  random(key: string): number {
    return this.readable().random(key);
  }

  /** An integer from `lower` to `upper`, inclusive, shared like random(). */
  randomInt(key: string, lower: number, upper: number): number {
    return this.readable().randomInt(key, lower, upper);
  }

  /** A shuffled copy of `array`, in the same order for every participant who uses `key`. */
  shuffle<T>(key: string, array: readonly T[]): T[] {
    return this.readable().shuffle(key, array);
  }

  /** `size` items drawn from `array` without replacement, shared like shuffle(). */
  sample<T>(key: string, array: readonly T[], size: number): T[] {
    return this.readable().sample(key, array, size);
  }

  /** Called by jsPsych as its timeline runs. */
  readonly [timelineHooks] = {
    /** A trial is starting; its calls use `scope` by default. */
    trialStarted: (scope: string) => {
      this.session?.cancelListeners("trial");
      this.trialScope = scope;
    },
    /** The trial's result is in: end its subscriptions and waits. */
    trialEnded: () => {
      this.session?.cancelListeners("trial");
    },
    /** The trial's on_finish has run; later calls use the session scope. */
    trialFinished: () => {
      this.session?.cancelListeners("trial");
      this.trialScope = null;
    },
    /** The experiment finished or was aborted: end every subscription and wait. */
    experimentEnded: () => {
      this.session?.cancelListeners("all");
      // A trial that threw never reported finishing
      this.trialScope = null;
    },
    /** Properties to add to a trial's data row, or null for none. */
    dataProperties: (): Record<string, string> | null => this.recordedIds,
  };
}
