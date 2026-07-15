import autoBind from "auto-bind";

/** Group session snapshot keyed by participantId, then by data key. */
export type GroupSessionData = Record<string, Record<string, unknown>>;

/** Calling this removes the associated subscription. */
export type Unsubscribe = () => void;

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
  private adapter: MultiplayerAdapter | null = null;

  /**
   * Tracks every active unsubscribe handle so cancelAllSubscriptions() can clean
   * up on experiment end, mirroring KeyboardListenerAPI's cancelAllKeyboardResponses().
   */
  private activeUnsubscribes = new Set<Unsubscribe>();

  /** This participant's ID within the group. Set by connect(); null before that. */
  participantId: string | null = null;

  constructor() {
    autoBind(this);
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
    if (this.adapter) {
      throw new Error(
        "MultiplayerAPI: connect() has already been called. " +
          "Call disconnect() first before registering a new adapter."
      );
    }
    this.adapter = adapter;
    try {
      await adapter.connect();
      this.participantId = adapter.participantId;
    } catch (e) {
      // Roll back so a failed connection doesn't leave the API in a
      // half-connected state that blocks a retry.
      this.adapter = null;
      this.participantId = null;
      throw e;
    }
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
    const adapterUnsub = adapter.subscribe(callback);

    // Wrap so we can remove from the tracking Set on cancellation
    let cancelled = false;
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
    callback(adapter.getAll());

    return unsubscribe;
  }

  /**
   * Returns a Promise that resolves with the group session data once condition
   * returns true. Implemented on top of subscribe() — does not poll.
   *
   * Checks the current session state immediately before subscribing, so it
   * resolves without waiting if the condition is already met.
   *
   * @param condition Predicate evaluated on every group session update.
   * @param timeout   Optional timeout in milliseconds. The promise rejects if
   *                  the condition is not met within this window.
   */
  wait(
    condition: (data: GroupSessionData) => boolean,
    timeout?: number
  ): Promise<GroupSessionData> {
    const adapter = this.requireAdapter();

    return new Promise((resolve, reject) => {
      // Fast path: condition already met with current data
      const current = adapter.getAll();
      if (condition(current)) {
        resolve(current);
        return;
      }

      let settled = false;
      let timeoutHandle: number | undefined;

      const unsubscribe = this.subscribe((data) => {
        if (!settled && condition(data)) {
          settled = true;
          if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
          unsubscribe();
          resolve(data);
        }
      });

      if (timeout !== undefined) {
        timeoutHandle = window.setTimeout(() => {
          if (!settled) {
            settled = true;
            unsubscribe();
            reject(new Error(`MultiplayerAPI.wait() timed out after ${timeout}ms`));
          }
        }, timeout);
      }
    });
  }

  /**
   * Convenience wrapper for the Push → Wait → resolve sequence.
   * Pushes local data, then waits until condition is met, then resolves
   * with the full group session data.
   */
  async communicate(
    data: Record<string, unknown>,
    condition: (groupData: GroupSessionData) => boolean,
    timeout?: number
  ): Promise<GroupSessionData> {
    await this.push(data);
    return this.wait(condition, timeout);
  }

  /**
   * Cancel all active subscriptions. Parallel to
   * KeyboardListenerAPI.cancelAllKeyboardResponses() — call at experiment end
   * to prevent ghost listeners.
   */
  cancelAllSubscriptions(): void {
    for (const unsubscribe of [...this.activeUnsubscribes]) {
      unsubscribe();
    }
  }

  /** Cancel all subscriptions and close the communication channel. */
  async disconnect(): Promise<void> {
    this.cancelAllSubscriptions();
    if (this.adapter) {
      await this.adapter.disconnect();
      this.adapter = null;
      this.participantId = null;
    }
  }
}
