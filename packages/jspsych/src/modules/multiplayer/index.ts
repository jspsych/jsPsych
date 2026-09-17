import autoBind from "auto-bind";

/** Group session snapshot keyed by participantId, then by data key. */
export type GroupSessionData = Record<string, Record<string, unknown>>;

/** Calling this removes the associated subscription. */
export type Unsubscribe = () => void;

/**
 * Rejection produced by MultiplayerAPI.wait() when its timeout elapses before
 * the condition is met. Exported so callers (e.g. multiplayer plugins) can
 * distinguish a genuine timeout from a throwing predicate or network error.
 * When checking across separately-bundled packages, prefer matching
 * `error.name === "MultiplayerTimeoutError"` over instanceof, which fails if
 * two copies of jspsych are loaded.
 */
export class MultiplayerTimeoutError extends Error {
  constructor(timeout: number) {
    super(`MultiplayerAPI.wait() timed out after ${timeout}ms`);
    this.name = "MultiplayerTimeoutError";
  }
}

/**
 * Rejection produced by MultiplayerAPI.wait() when the wait is cancelled before
 * the condition is met, by cancelAllSubscriptions(), disconnect(), or the
 * experiment ending. Like MultiplayerTimeoutError, match on
 * `error.name === "MultiplayerCancelledError"` across bundles.
 */
export class MultiplayerCancelledError extends Error {
  constructor() {
    super("MultiplayerAPI.wait() was cancelled before its condition was met");
    this.name = "MultiplayerCancelledError";
  }
}

/** Largest delay setTimeout accepts; larger values overflow and fire immediately. */
const MAX_TIMEOUT = 2 ** 31 - 1;

/**
 * Contract that any multiplayer network backend must implement.
 * The core MultiplayerAPI calls these methods; adapters handle the network layer.
 * Plugin authors code against MultiplayerAPI and never touch the adapter directly.
 */
export interface MultiplayerAdapter {
  /** Stable identifier for this participant within the group session namespace. */
  readonly participantId: string;

  /** Open the communication channel and establish group membership. */
  connect(): Promise<void>;

  /** Write this participant's data into the shared group session. */
  push(data: Record<string, unknown>): Promise<void>;

  /** Read the full current group session (all participants). */
  getAll(): GroupSessionData;

  /** Read one participant's data. Returns undefined if they haven't pushed yet. */
  get(participantId: string): Record<string, unknown> | undefined;

  /**
   * Register a callback to fire on every group session update.
   * Returns an unsubscribe function — call it to stop receiving updates.
   */
  subscribe(callback: (data: GroupSessionData) => void): Unsubscribe;

  /** Close the channel cleanly. */
  disconnect(): Promise<void>;
}

export class MultiplayerAPI {
  /** Set only once the adapter's connect() has resolved. */
  private adapter: MultiplayerAdapter | null = null;

  /** The adapter whose connect() is in flight, if any. */
  private connectingAdapter: MultiplayerAdapter | null = null;

  /**
   * Tracks every active unsubscribe handle so cancelAllSubscriptions() can clean
   * up on experiment end, mirroring KeyboardListenerAPI's cancelAllKeyboardResponses().
   */
  private activeUnsubscribes = new Set<Unsubscribe>();

  /** Cancel functions for pending wait() calls, run by cancelAllSubscriptions(). */
  private pendingWaits = new Set<() => void>();

  constructor() {
    autoBind(this);
  }

  /** This participant's ID within the group. Null until connect() resolves and after disconnect(). */
  get participantId(): string | null {
    return this.adapter?.participantId ?? null;
  }

  private requireAdapter(): MultiplayerAdapter {
    if (!this.adapter) {
      throw new Error(
        "MultiplayerAPI: connect() must be called with an adapter before using multiplayer methods."
      );
    }
    return this.adapter;
  }

  /**
   * Register a backend adapter and open the communication channel.
   * Must be called (and awaited) before jsPsych.run() and before any other
   * multiplayer method.
   */
  async connect(adapter: MultiplayerAdapter): Promise<void> {
    if (this.adapter || this.connectingAdapter) {
      throw new Error(
        "MultiplayerAPI: connect() has already been called. " +
          "Call disconnect() first before registering a new adapter."
      );
    }
    this.connectingAdapter = adapter;
    try {
      await adapter.connect();
    } catch (e) {
      // Roll back so a failed connection doesn't block a retry, unless
      // disconnect() already abandoned this attempt and a newer one is running.
      if (this.connectingAdapter === adapter) {
        this.connectingAdapter = null;
      }
      throw e;
    }
    if (this.connectingAdapter !== adapter) {
      // disconnect() was called while this adapter was connecting
      await adapter.disconnect();
      throw new Error("MultiplayerAPI: disconnect() was called before connect() finished.");
    }
    this.connectingAdapter = null;
    this.adapter = adapter;
  }

  /** Write this participant's data to the shared group session. */
  push(data: Record<string, unknown>): Promise<void> {
    return this.requireAdapter().push(data);
  }

  /**
   * Shallow-merge partial data into this participant's own slot, then push
   * the result. Equivalent to `push({ ...get(participantId), ...data })`,
   * saving plugin authors from hand-rolling that get→merge→push sequence
   * (every existing multiplayer plugin does it manually today).
   *
   * The merge is shallow (top-level keys only) since each participant only
   * ever writes their own slot, which avoids cross-client conflicts by
   * construction. Callers that need to merge into a nested key themselves
   * (e.g. a keyed collection within their slot) should read, merge, and
   * push directly.
   *
   * Not atomic against itself: two overlapping update() calls from the same
   * client read the same base and the later push wins. Await each update()
   * before issuing the next.
   */
  update(data: Record<string, unknown>): Promise<void> {
    const current = this.get(this.requireAdapter().participantId) ?? {};
    return this.push({ ...current, ...data });
  }

  /** Read the full current group session (all participants' data). */
  getAll(): GroupSessionData {
    return this.requireAdapter().getAll();
  }

  /** Read one participant's data. Returns undefined if they haven't pushed yet. */
  get(participantId: string): Record<string, unknown> | undefined {
    return this.requireAdapter().get(participantId);
  }

  /**
   * Register a callback that fires on every group session update.
   * Returns an unsubscribe function. The handle is tracked internally so
   * cancelAllSubscriptions() can clean it up at experiment end.
   */
  subscribe(callback: (data: GroupSessionData) => void): Unsubscribe {
    const adapter = this.requireAdapter();

    // Guard the callback so a throwing subscriber can't escape into the adapter's
    // own fan-out loop and abort notification of the other subscribers on that loop.
    let cancelled = false;
    const guardedCallback = (data: GroupSessionData) => {
      // Adapters that fan out over a copy of their subscriber list can still
      // deliver an in-flight update after unsubscribe.
      if (cancelled) {
        return;
      }
      try {
        callback(data);
      } catch (e) {
        console.error("MultiplayerAPI: subscriber callback threw", e);
      }
    };

    const adapterUnsub = adapter.subscribe(guardedCallback);

    // Wrap so we can remove from the tracking Set on cancellation
    const unsubscribe: Unsubscribe = () => {
      if (!cancelled) {
        cancelled = true;
        adapterUnsub();
        this.activeUnsubscribes.delete(unsubscribe);
      }
    };

    this.activeUnsubscribes.add(unsubscribe);

    // Replay current state after the unsubscribe handle exists. The register-
    // then-replay order prevents a TDZ crash: wait() references `unsubscribe`
    // inside the callback, so it must be defined before the callback fires.
    guardedCallback(adapter.getAll());

    return unsubscribe;
  }

  /**
   * Returns a Promise that resolves with the group session data once condition
   * returns true. Implemented on top of subscribe() — does not poll. Since
   * subscribe() replays the current state on registration, the promise resolves
   * without waiting if the condition is already met.
   *
   * A throwing condition rejects the promise. wait() must handle that itself:
   * subscribe()'s guard would otherwise swallow the throw (by design, to
   * protect other subscribers), leaving the wait pending forever.
   *
   * @param condition Predicate evaluated on every group session update.
   * cancelAllSubscriptions() and disconnect() reject a pending wait with a
   * MultiplayerCancelledError.
   *
   * @param timeout   Optional timeout in milliseconds. The promise rejects with
   *                  a MultiplayerTimeoutError if the condition is not met
   *                  within this window. null, undefined, and non-finite values
   *                  mean no timeout.
   */
  wait(
    condition: (data: GroupSessionData) => boolean,
    timeout?: number | null
  ): Promise<GroupSessionData> {
    this.requireAdapter();

    return new Promise((resolve, reject) => {
      let settled = false;
      let timeoutHandle: number | undefined;
      let unsubscribe: Unsubscribe | undefined;

      // `unsubscribe` is still undefined while subscribe()'s synchronous
      // replay-on-registration runs, so settling from the replay defers the
      // cleanup to the `if (settled)` check below.
      const cancel = () => settle(() => reject(new MultiplayerCancelledError()));

      const settle = (outcome: () => void) => {
        settled = true;
        if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
        this.pendingWaits.delete(cancel);
        unsubscribe?.();
        outcome();
      };

      const check = (data: GroupSessionData) => {
        if (settled) {
          return;
        }
        let met: boolean;
        try {
          met = condition(data);
        } catch (e) {
          settle(() => reject(e));
          return;
        }
        if (met) {
          settle(() => resolve(data));
        }
      };

      // Registers for future updates; the synchronous replay doubles as the
      // "already met" fast path.
      unsubscribe = this.subscribe(check);
      if (settled) {
        unsubscribe();
        return;
      }

      this.pendingWaits.add(cancel);

      if (typeof timeout === "number" && timeout >= 0 && timeout <= MAX_TIMEOUT) {
        timeoutHandle = window.setTimeout(() => {
          settle(() => reject(new MultiplayerTimeoutError(timeout)));
        }, timeout);
      }
    });
  }

  /**
   * Cancel all active subscriptions. Parallel to
   * KeyboardListenerAPI.cancelAllKeyboardResponses() — call at experiment end
   * to prevent ghost listeners. Pending wait() calls reject with a
   * MultiplayerCancelledError. jsPsych calls this automatically when the
   * experiment finishes or is aborted.
   */
  cancelAllSubscriptions(): void {
    for (const cancel of [...this.pendingWaits]) {
      cancel();
    }
    for (const unsubscribe of [...this.activeUnsubscribes]) {
      unsubscribe();
    }
  }

  /** Cancel all subscriptions and close the communication channel. */
  async disconnect(): Promise<void> {
    this.cancelAllSubscriptions();
    // Detach before awaiting so a rejecting adapter can't leave the API stuck
    // connected, and an overlapping disconnect() doesn't disconnect it twice.
    // A pending connect() sees connectingAdapter cleared and disconnects itself.
    this.connectingAdapter = null;
    const adapter = this.adapter;
    this.adapter = null;
    await adapter?.disconnect();
  }
}
