import autoBind from "auto-bind";

import {
  MultiplayerCancelledError,
  MultiplayerConnectionClosedError,
  MultiplayerParticipantLeftError,
  MultiplayerTimeoutError,
} from "./errors";
import {
  ConnectionStatus,
  GroupSessionData,
  MultiplayerAdapter,
  MultiplayerConnection,
  PresenceData,
  PresenceStatus,
  Unsubscribe,
} from "./types";

/** Largest delay setTimeout accepts; larger values overflow and fire immediately. */
const MAX_TIMEOUT = 2 ** 31 - 1;

/**
 * Safety valve for subscribers that write different data on every
 * notification, which would otherwise loop forever.
 */
const MAX_NOTIFY_ROUNDS = 100;

/** How long a participant can be away before they count as having left, in ms. */
export const DEFAULT_DROPOUT_TIMEOUT = 10000;

export interface SessionOptions {
  /**
   * How long a participant can stay disconnected before they count as having
   * left, in milliseconds. Defaults to 10000. null or Infinity means never.
   */
  dropoutTimeout?: number | null;

  /** Called once when another participant reaches the `left` presence status. */
  onParticipantLeft?: (participantId: string) => void;

  /** Called whenever this client's connection status changes. */
  onStatusChange?: (status: ConnectionStatus) => void;
}

export interface SubscribeOptions {
  /** Aborting this signal removes the subscription. */
  signal?: AbortSignal;
}

export interface WaitOptions {
  /**
   * Maximum time to wait in milliseconds. null, undefined, negative, and
   * non-finite values mean no timeout.
   */
  timeout?: number | null;

  /** Aborting this signal rejects the wait with a MultiplayerCancelledError. */
  signal?: AbortSignal;

  /**
   * Participants the wait depends on. If one of them leaves before the
   * condition is met, the wait rejects with a MultiplayerParticipantLeftError.
   */
  participants?: string[];
}

export type SessionListener = (data: GroupSessionData, presence: PresenceData) => void;

interface Listener {
  callback: SessionListener;
  active: boolean;
}

interface Batch {
  promise: Promise<void>;
  resolve: () => void;
  reject: (e: unknown) => void;
}

/** A delay in ms that setTimeout can honor, or null for "never". */
function toTimeout(value: number | null | undefined): number | null {
  return typeof value === "number" && value >= 0 && value <= MAX_TIMEOUT ? value : null;
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
  }
  return value;
}

/**
 * Data is stored as a frozen JSON round-trip, which matches what other
 * participants receive over the network. JSON.stringify throws on BigInt and
 * circular data, so bad data fails at the call that wrote it, and comparing
 * the JSON text tells whether anything changed.
 */
function fromJson<T>(json: string): T {
  return deepFreeze(JSON.parse(json));
}

function assertRecord(data: unknown): asserts data is Record<string, unknown> {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new TypeError("MultiplayerAPI: data must be a plain object of JSON values.");
  }
}

function newBatch(): Batch {
  let resolve: () => void;
  let reject: (e: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve!, reject: reject! };
}

/**
 * One connection to a multiplayer backend, returned by
 * jsPsych.multiplayer.connect(). All state belongs to the session, so work
 * left over from an earlier connection can never touch a later one.
 */
export class MultiplayerSession {
  readonly participantId: string;

  private currentStatus: ConnectionStatus = "connected";

  /** Why the session closed; pending and later waits reject with it. */
  private closeReason: Error | null = null;

  /** Memoized so overlapping disconnect() calls close the connection once. */
  private closing: Promise<void> | null = null;

  /** The adapter's latest session data, as a frozen copy, and its JSON text. */
  private remote: GroupSessionData = {};
  private remoteJson = "{}";

  /**
   * This participant's own data. The session is its source of truth: writes
   * change it at once and the backend is brought up to date after.
   */
  private slot: Record<string, unknown> | undefined;
  private slotJson: string | undefined;

  /** True when the backend is known to hold the current slot. */
  private slotConfirmed = true;

  /** Frozen snapshot shared by every reader: `remote` with `slot` on top. */
  private data: GroupSessionData = {};

  private presenceData: PresenceData = {};
  private presenceStatus = new Map<string, PresenceStatus>();
  private awayTimers = new Map<string, number>();
  private readonly dropoutTimeout: number | null;

  private listeners = new Set<Listener>();
  private pendingWaits = new Set<(error: Error) => void>();
  private notifying = false;
  private notifyAgain = false;

  /** True when `slot` has changed since it was last handed to the connection. */
  private hasUnsentChanges = false;

  /** True while sendLatestSlot() is running. */
  private sending = false;

  /** Callers whose writes will go out with the next push. */
  private nextBatch: Batch | null = null;

  /** Callers whose writes are in the push currently in flight. */
  private inFlightBatch: Batch | null = null;

  /**
   * Connect with an adapter. Once `signal` is aborted this rejects, but only
   * after any connection the adapter opened has been closed.
   */
  static async open(
    adapter: MultiplayerAdapter,
    signal: AbortSignal,
    options: SessionOptions
  ): Promise<MultiplayerSession> {
    const cancelled = () =>
      new MultiplayerCancelledError("MultiplayerAPI: connect() was cancelled before it finished.");
    if (signal.aborted) {
      throw cancelled();
    }

    // Events that arrive before the session exists are covered by the initial read below
    let session: MultiplayerSession | undefined;
    let connection: MultiplayerConnection;
    try {
      connection = await adapter.connect({
        signal,
        onChange: () => session?.handleChange(),
        onStatus: (status) => session?.handleStatus(status),
      });
    } catch (e) {
      throw signal.aborted ? cancelled() : e;
    }

    const closeQuietly = async () => {
      try {
        await connection.disconnect();
      } catch (e) {
        console.error("MultiplayerAPI: adapter disconnect threw", e);
      }
    };

    if (signal.aborted) {
      await closeQuietly();
      throw cancelled();
    }
    try {
      session = new MultiplayerSession(connection, options);
    } catch (e) {
      await closeQuietly();
      throw e;
    }
    return session;
  }

  private constructor(
    private readonly connection: MultiplayerConnection,
    private readonly options: SessionOptions
  ) {
    autoBind(this);
    this.participantId = connection.participantId;
    this.dropoutTimeout =
      options.dropoutTimeout === undefined
        ? DEFAULT_DROPOUT_TIMEOUT
        : toTimeout(options.dropoutTimeout);
    this.remoteJson = JSON.stringify(connection.getAll() ?? {});
    this.remote = fromJson(this.remoteJson);
    this.slot = this.remote[this.participantId];
    this.slotJson = this.slot === undefined ? undefined : JSON.stringify(this.slot);
    this.refreshPresence();
    this.rebuild();
  }

  /** This client's connection status. */
  get status(): ConnectionStatus {
    return this.currentStatus;
  }

  private get isClosed() {
    return this.currentStatus === "closed";
  }

  // ---------------------------------------------------------------- reading

  /** The full group session. The object is frozen and shared, so don't modify it. */
  getAll(): GroupSessionData {
    return this.data;
  }

  /** One participant's data, or undefined if they haven't written any. Frozen. */
  get(participantId: string): Record<string, unknown> | undefined {
    return this.data[participantId];
  }

  /** The presence status of every participant seen in the session, including this one. Frozen. */
  presence(): PresenceData {
    return this.presenceData;
  }

  // ---------------------------------------------------------------- writing

  /**
   * Replace this participant's data. Reads reflect the change at once; the
   * promise resolves when the backend confirms a push that includes it.
   */
  async push(data: Record<string, unknown>): Promise<void> {
    this.assertWritable();
    assertRecord(data);
    return this.write(JSON.stringify(data));
  }

  /**
   * Shallow-merge data into this participant's data. Top-level keys in `data`
   * replace the existing ones; other keys are kept.
   */
  async update(data: Record<string, unknown>): Promise<void> {
    this.assertWritable();
    assertRecord(data);
    return this.write(JSON.stringify({ ...this.slot, ...data }));
  }

  private assertWritable() {
    if (this.isClosed) {
      throw this.closeReason instanceof MultiplayerConnectionClosedError
        ? this.closeReason
        : new Error("MultiplayerAPI: this session was disconnected.");
    }
  }

  /**
   * Queue the new slot for sending, then show it to readers. A write that
   * doesn't change the slot sends and notifies nothing, so a subscriber that
   * writes the same value on every notification can't start a loop.
   */
  private write(json: string): Promise<void> {
    const changed = json !== this.slotJson;
    if (changed) {
      this.slot = fromJson(json);
      this.slotJson = json;
      this.slotConfirmed = false;
    } else {
      // Share a push already on its way, or skip it if the backend has this data
      const pending = this.nextBatch ?? this.inFlightBatch;
      if (pending) return pending.promise;
      if (this.slotConfirmed) return Promise.resolve();
    }
    this.nextBatch ??= newBatch();
    const { promise } = this.nextBatch;
    this.requestSend();
    if (changed) {
      this.rebuild();
      this.notify();
    }
    return promise;
  }

  /** Start the sender if it's idle; a running sender picks up the change itself. */
  private requestSend() {
    this.hasUnsentChanges = true;
    if (!this.sending) {
      // Runs synchronously up to the adapter's push, so an idle write doesn't
      // wait a turn before reaching the backend.
      void this.sendLatestSlot();
    }
  }

  /**
   * Push the latest slot, one push at a time, until the backend has caught
   * up. Writes made during a push go out together in the next one, so values
   * that are replaced before they are sent are skipped.
   */
  private async sendLatestSlot(): Promise<void> {
    this.sending = true;
    try {
      while (this.hasUnsentChanges && !this.isClosed) {
        const snapshot = this.slot!;
        const batch = this.nextBatch!;
        this.hasUnsentChanges = false;
        this.nextBatch = null;
        this.inFlightBatch = batch;
        try {
          await this.connection.push(snapshot);
          if (snapshot === this.slot) {
            this.slotConfirmed = true;
          }
          batch.resolve();
        } catch (e) {
          // The data stays in the slot and goes out with the next write
          batch.reject(e);
        } finally {
          if (this.inFlightBatch === batch) {
            this.inFlightBatch = null;
          }
        }
      }
    } finally {
      this.sending = false;
    }
  }

  // ---------------------------------------------------------------- listening

  /**
   * Call `callback` with the group session and presence now, and again after
   * every change. Returns a function that removes the subscription.
   */
  subscribe(callback: SessionListener, options: SubscribeOptions = {}): Unsubscribe {
    const { signal } = options;
    const listener: Listener = { callback, active: true };
    const unsubscribe: Unsubscribe = () => {
      listener.active = false;
      this.listeners.delete(listener);
      signal?.removeEventListener("abort", unsubscribe);
    };
    if (signal?.aborted) {
      listener.active = false;
      return unsubscribe;
    }
    if (!this.isClosed) {
      this.listeners.add(listener);
      signal?.addEventListener("abort", unsubscribe, { once: true });
    }
    this.deliver(listener);
    return unsubscribe;
  }

  /**
   * Resolve with the group session once `condition` returns true. Checks the
   * current state first, so it resolves at once if the condition already holds.
   * A throwing condition rejects the wait.
   */
  wait(
    condition: (data: GroupSessionData, presence: PresenceData) => boolean,
    options: WaitOptions = {}
  ): Promise<GroupSessionData> {
    const { signal, participants = [] } = options;
    const timeout = toTimeout(options.timeout);

    return new Promise((resolve, reject) => {
      let timer: number | undefined;

      const finish = (outcome: () => void) => {
        if (!listener.active) {
          return;
        }
        listener.active = false;
        this.listeners.delete(listener);
        this.pendingWaits.delete(cancel);
        if (timer !== undefined) clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
        outcome();
      };
      const cancel = (error: Error) => finish(() => reject(error));
      const onAbort = () => cancel(new MultiplayerCancelledError());

      const listener: Listener = {
        active: true,
        callback: (data, presence) => {
          let met: boolean;
          try {
            met = condition(data, presence);
          } catch (e) {
            finish(() => reject(e));
            return;
          }
          if (met) {
            finish(() => resolve(data));
            return;
          }
          const gone = participants.find((id) => presence[id] === "left");
          if (gone !== undefined) {
            cancel(new MultiplayerParticipantLeftError(gone));
          }
        },
      };

      if (signal?.aborted) {
        reject(new MultiplayerCancelledError());
        return;
      }
      listener.callback(this.data, this.presenceData);
      if (!listener.active) {
        return;
      }
      if (this.isClosed) {
        cancel(this.closeReason!);
        return;
      }
      this.listeners.add(listener);
      this.pendingWaits.add(cancel);
      signal?.addEventListener("abort", onAbort, { once: true });
      if (timeout !== null) {
        timer = window.setTimeout(() => cancel(new MultiplayerTimeoutError(timeout)), timeout);
      }
    });
  }

  /**
   * Remove every subscription and reject pending waits with a
   * MultiplayerCancelledError. The connection stays open.
   */
  cancelAllSubscriptions(): void {
    this.cancelListeners(new MultiplayerCancelledError());
  }

  private cancelListeners(error: Error) {
    for (const cancel of [...this.pendingWaits]) {
      cancel(error);
    }
    for (const listener of this.listeners) {
      listener.active = false;
    }
    this.listeners.clear();
  }

  private deliver(listener: Listener) {
    if (!listener.active) {
      return;
    }
    try {
      listener.callback(this.data, this.presenceData);
    } catch (e) {
      console.error("MultiplayerAPI: subscriber callback threw", e);
    }
  }

  /**
   * Deliver the current snapshot to every listener. A change made by a
   * listener starts another round after this one, instead of a nested one,
   * so each listener sees snapshots in order.
   */
  private notify() {
    if (this.notifying) {
      this.notifyAgain = true;
      return;
    }
    this.notifying = true;
    let rounds = 0;
    try {
      do {
        if (++rounds > MAX_NOTIFY_ROUNDS) {
          console.error(
            `MultiplayerAPI: stopped notifying after ${MAX_NOTIFY_ROUNDS} rounds because ` +
              "subscribers changed the data every time they were notified"
          );
          break;
        }
        this.notifyAgain = false;
        for (const listener of [...this.listeners]) {
          this.deliver(listener);
        }
      } while (this.notifyAgain);
    } finally {
      this.notifying = false;
    }
  }

  /** Rebuild the shared snapshots. Only the top level is new; nested data is already frozen. */
  private rebuild() {
    const data = { ...this.remote };
    if (this.slot !== undefined) {
      data[this.participantId] = this.slot;
    }
    this.data = Object.freeze(data);

    const self: Record<ConnectionStatus, PresenceStatus> = {
      connected: "connected",
      reconnecting: "away",
      closed: "left",
    };
    this.presenceData = Object.freeze({
      ...Object.fromEntries(this.presenceStatus),
      [this.participantId]: self[this.currentStatus],
    });
  }

  // ---------------------------------------------------------------- adapter events

  private handleChange() {
    if (this.isClosed) {
      return;
    }
    let dataChanged = false;
    try {
      const json = JSON.stringify(this.connection.getAll() ?? {});
      if (json !== this.remoteJson) {
        this.remote = fromJson(json);
        this.remoteJson = json;
        dataChanged = true;
      }
    } catch (e) {
      console.error("MultiplayerAPI: could not read the adapter's session data", e);
    }
    const presenceChanged = this.refreshPresence();
    // Echoes of our own writes and repeated calls change nothing
    if (dataChanged || presenceChanged) {
      this.rebuild();
      this.notify();
    }
  }

  private handleStatus(status: ConnectionStatus) {
    if (this.isClosed || status === this.currentStatus) {
      return;
    }
    if (status === "closed") {
      void this.close(new MultiplayerConnectionClosedError());
      return;
    }
    this.currentStatus = status;
    if (status === "reconnecting") {
      // While our own channel is down, others' dropout clocks pause
      this.clearAwayTimers();
    } else {
      for (const [id, presence] of this.presenceStatus) {
        if (presence === "away") this.startAwayTimer(id);
      }
      this.refreshPresence();
    }
    this.rebuild();
    this.notify();
    this.reportStatus();
  }

  private reportStatus() {
    try {
      this.options.onStatusChange?.(this.currentStatus);
    } catch (e) {
      console.error("MultiplayerAPI: onStatusChange threw", e);
    }
  }

  // ---------------------------------------------------------------- presence

  /**
   * Compare the adapter's connected list with what we know, starting or
   * stopping dropout clocks. Returns whether any presence status changed.
   */
  private refreshPresence(): boolean {
    // Our own outage says nothing about the others
    if (this.currentStatus !== "connected") {
      return false;
    }
    let connectedNow: Set<string>;
    try {
      connectedNow = new Set(this.connection.connectedParticipants());
    } catch (e) {
      console.error("MultiplayerAPI: could not read the adapter's connected participants", e);
      return false;
    }
    const ids = new Set([
      ...connectedNow,
      ...Object.keys(this.remote),
      ...this.presenceStatus.keys(),
    ]);
    ids.delete(this.participantId);

    let changed = false;
    for (const id of ids) {
      const current = this.presenceStatus.get(id);
      if (current === "left") {
        continue;
      }
      if (connectedNow.has(id)) {
        if (current !== "connected") {
          this.presenceStatus.set(id, "connected");
          this.clearAwayTimer(id);
          changed = true;
        }
      } else if (current !== "away") {
        this.presenceStatus.set(id, "away");
        this.startAwayTimer(id);
        changed = true;
      }
    }
    return changed;
  }

  private startAwayTimer(id: string) {
    this.clearAwayTimer(id);
    if (this.dropoutTimeout !== null) {
      this.awayTimers.set(
        id,
        window.setTimeout(() => this.markLeft(id), this.dropoutTimeout)
      );
    }
  }

  private clearAwayTimer(id: string) {
    const timer = this.awayTimers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.awayTimers.delete(id);
    }
  }

  private clearAwayTimers() {
    for (const timer of this.awayTimers.values()) {
      clearTimeout(timer);
    }
    this.awayTimers.clear();
  }

  private markLeft(id: string) {
    this.awayTimers.delete(id);
    if (this.isClosed) {
      return;
    }
    this.presenceStatus.set(id, "left");
    this.rebuild();
    this.notify();
    try {
      this.options.onParticipantLeft?.(id);
    } catch (e) {
      console.error("MultiplayerAPI: onParticipantLeft threw", e);
    }
  }

  // ---------------------------------------------------------------- closing

  /**
   * Close the connection. Pending waits reject with a MultiplayerCancelledError
   * and unsent writes reject. Reads keep returning the last snapshot.
   */
  disconnect(): Promise<void> {
    return this.close(new MultiplayerCancelledError());
  }

  private close(reason: Error): Promise<void> {
    if (!this.closing) {
      const lost = reason instanceof MultiplayerConnectionClosedError;
      this.currentStatus = "closed";
      this.closeReason = reason;
      this.clearAwayTimers();

      // The in-flight push may never settle, so don't leave its callers waiting
      const writeError = lost
        ? reason
        : new Error("MultiplayerAPI: disconnect() was called before this write was sent.");
      const unsent = [this.inFlightBatch, this.nextBatch];
      this.inFlightBatch = null;
      this.nextBatch = null;
      this.hasUnsentChanges = false;
      for (const batch of unsent) {
        batch?.reject(writeError);
      }

      this.cancelListeners(reason);
      this.rebuild();
      this.reportStatus();

      const disconnecting = (async () => this.connection.disconnect())();
      // A lost connection is closed on nobody's behalf, so log instead of rejecting
      this.closing = lost
        ? disconnecting.catch((e) => console.error("MultiplayerAPI: adapter disconnect threw", e))
        : disconnecting;
    }
    return this.closing;
  }
}
