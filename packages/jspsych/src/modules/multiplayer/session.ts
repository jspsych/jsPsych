import autoBind from "auto-bind";

import {
  MultiplayerCancelledError,
  MultiplayerConnectionClosedError,
  MultiplayerParticipantLeftError,
  MultiplayerTimeoutError,
} from "./errors";
import { SharedRandom } from "./random";
import {
  ConnectionStatus,
  GroupSessionData,
  GroupState,
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

  /**
   * Seed for random(), randomInt(), shuffle(), and sample() in place of the
   * session ID. Every participant in the group must pass the same value. Use
   * it to make the random values the same in every session.
   */
  randomSeed?: string;

  /** Called once when another participant reaches the `left` presence status. */
  onParticipantLeft?: (participantId: string) => void;

  /**
   * Called when a participant who had `left` comes back from the same page
   * load, so their experiment is still where they left it.
   */
  onParticipantRejoined?: (participantId: string) => void;

  /**
   * Called when a participant comes back from a new page load (a reload or a
   * new tab) under the same ID. Their experiment restarted, so they are out of
   * step with the group and stay `left`.
   */
  onParticipantRestarted?: (participantId: string) => void;

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

/** Options for waitForGroup(). */
export type GroupWaitOptions = Omit<WaitOptions, "participants">;

export type SessionListener = (
  data: GroupSessionData,
  presence: PresenceData,
  group: GroupState
) => void;

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

/**
 * Slot key the session reserves for its own bookkeeping. It is added to every
 * push and removed from every snapshot, so readers never see it.
 */
export const RESERVED_KEY = "$mp";

/** Identifies one page load. Shared by every session made from one jsPsych.multiplayer. */
export interface SessionIdentity {
  /** Random, and new on every page load. */
  instance: string;
  /** Goes up every time this page (re)announces itself to the group. */
  epoch: number;
}

/** What each participant's slot carries under RESERVED_KEY. */
interface SlotMeta extends SessionIdentity {
  /** Whether the participant has written any data of their own. */
  written: boolean;
  /**
   * The group's roster, once this participant's backend confirmed the group is
   * sealed. Carried in the slot because not every backend tells every member,
   * and so a reloaded page can see it.
   */
  sealed?: string[];
}

function isSlotMeta(value: unknown): value is SlotMeta {
  const meta = value as SlotMeta;
  return (
    typeof meta === "object" &&
    meta !== null &&
    typeof meta.instance === "string" &&
    typeof meta.epoch === "number"
  );
}

/** Separate the reserved bookkeeping from each participant's data. */
function splitMeta(raw: GroupSessionData): {
  data: GroupSessionData;
  metas: Record<string, SlotMeta>;
} {
  const data: GroupSessionData = {};
  const metas: Record<string, SlotMeta> = {};
  for (const [id, slot] of Object.entries(raw)) {
    if (slot === null || typeof slot !== "object" || !(RESERVED_KEY in slot)) {
      data[id] = slot;
      continue;
    }
    const { [RESERVED_KEY]: meta, ...rest } = slot;
    if (isSlotMeta(meta)) {
      metas[id] = meta;
    }
    // A participant who has only announced themselves hasn't written anything yet
    if (!isSlotMeta(meta) || meta.written) {
      data[id] = Object.freeze(rest);
    }
  }
  return { data, metas };
}

/** Sorted, without duplicates, so every participant lists a roster the same way. */
function sortedIds(ids: Iterable<string>): string[] {
  return [...new Set(ids)].sort();
}

function isIdList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((id) => typeof id === "string");
}

function assertRecord(data: unknown): asserts data is Record<string, unknown> {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new TypeError("MultiplayerAPI: data must be a plain object of JSON values.");
  }
  if (Object.prototype.hasOwnProperty.call(data, RESERVED_KEY)) {
    throw new TypeError(`MultiplayerAPI: "${RESERVED_KEY}" is reserved for the multiplayer API.`);
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

  /** Identifies the group session; the same for every participant in the group. */
  readonly sessionId: string;

  /** Seeded with `options.randomSeed`, or else the session ID. */
  private readonly rng: SharedRandom;

  private currentStatus: ConnectionStatus = "connected";

  /** Why the session closed; pending and later waits reject with it. */
  private closeReason: Error | null = null;

  /** Memoized so overlapping disconnect() calls close the connection once. */
  private closing: Promise<void> | null = null;

  /**
   * The adapter's latest session data as a frozen copy with the reserved key
   * removed, the JSON text of the raw and the cleaned data, and each
   * participant's reserved bookkeeping.
   */
  private remote: GroupSessionData = {};
  private remoteJson = "{}";
  private remoteDataJson = "{}";
  private metas: Record<string, SlotMeta> = {};

  /**
   * The page load this participant's slot came from before this page, if it
   * wasn't this one: this participant reloaded or opened the study again, so
   * their experiment restarted. Null otherwise.
   */
  readonly previousInstance: string | null;

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

  /** Frozen snapshot of the group's membership. */
  private groupData: GroupState = Object.freeze({ size: null, members: [], sealed: false });

  /**
   * The roster this participant's own backend confirmed as sealed, sent to the
   * group in the reserved key. Null until then.
   */
  private ownRoster: string[] | null = null;

  /**
   * Every roster seen so far, from this backend or any participant's slot.
   * Non-null means the group is sealed. It only grows, so a sealed group
   * never becomes unsealed and nobody drops off the roster.
   */
  private roster: Set<string> | null = null;

  /** Set by the first announce(); pushes wait for it. */
  private announced = false;

  /** Memoized so overlapping sealGroup() calls ask the backend once. */
  private sealing: Promise<void> | null = null;
  private presenceStatus = new Map<string, PresenceStatus>();
  private awayTimers = new Map<string, number>();
  private readonly dropoutTimeout: number | null;

  /** Each participant's page load, as last seen while they were connected. */
  private knownInstance = new Map<string, string>();

  /**
   * Each absent participant's bookkeeping as of when they dropped out (null if
   * they had none). They count as back only after a write made since then.
   */
  private dropMeta = new Map<string, SlotMeta | null>();

  /** `${id}\n${instance}` for every restart already reported. */
  private restartsReported = new Set<string>();

  /** Callbacks to researcher code, run once the session's state is settled. */
  private events: Array<() => void> = [];

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
    options: SessionOptions,
    identity: SessionIdentity
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
      session = new MultiplayerSession(connection, options, identity);
    } catch (e) {
      await closeQuietly();
      throw e;
    }
    // Tell the group which page load this participant is on
    session.announce();
    return session;
  }

  private constructor(
    private readonly connection: MultiplayerConnection,
    private readonly options: SessionOptions,
    private readonly identity: SessionIdentity
  ) {
    autoBind(this);
    this.participantId = connection.participantId;
    if (typeof connection.sessionId !== "string" || connection.sessionId === "") {
      throw new TypeError(
        "MultiplayerAPI: the adapter's connection must have a non-empty sessionId."
      );
    }
    this.sessionId = connection.sessionId;
    const { randomSeed } = options;
    if (randomSeed !== undefined && typeof randomSeed !== "string") {
      throw new TypeError("MultiplayerAPI: randomSeed must be a string.");
    }
    this.rng = new SharedRandom(randomSeed ?? this.sessionId);
    this.dropoutTimeout =
      options.dropoutTimeout === undefined
        ? DEFAULT_DROPOUT_TIMEOUT
        : toTimeout(options.dropoutTimeout);
    this.remoteJson = JSON.stringify(connection.getAll() ?? {});
    const { data, metas } = splitMeta(fromJson(this.remoteJson));
    this.remote = data;
    this.remoteDataJson = JSON.stringify(data);
    this.metas = metas;
    this.slot = this.remote[this.participantId];
    this.slotJson = this.slot === undefined ? undefined : JSON.stringify(this.slot);
    const ownMeta = metas[this.participantId];
    this.previousInstance =
      ownMeta && ownMeta.instance !== identity.instance ? ownMeta.instance : null;
    this.refreshPresence();
    // The announcement that follows open() carries any roster found here
    if (this.refreshGroup() && this.roster) {
      this.refreshPresence();
    }
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

  /** The group's size, members, and whether it is sealed. Frozen. */
  group(): GroupState {
    return this.groupData;
  }

  // ---------------------------------------------------------- randomness

  /**
   * A float in [0, 1) that is the same for every participant who asks with the
   * same `key`. Asking again with the same key returns the same value.
   */
  random(key: string): number {
    return this.rng.random(key);
  }

  /** An integer from `lower` to `upper`, inclusive, shared like random(). */
  randomInt(key: string, lower: number, upper: number): number {
    return this.rng.randomInt(key, lower, upper);
  }

  /** A shuffled copy of `array`, in the same order for every participant who uses `key`. */
  shuffle<T>(key: string, array: readonly T[]): T[] {
    return this.rng.shuffle(key, array);
  }

  /** `size` items drawn from `array` without replacement, shared like shuffle(). */
  sample<T>(key: string, array: readonly T[], size: number): T[] {
    return this.rng.sample(key, array, size);
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

  /**
   * Push this page's identity with a new epoch, so the group can tell that this
   * participant is (back) on this page load. Runs on connect and whenever the
   * connection recovers.
   */
  private announce() {
    if (this.isClosed) {
      return;
    }
    this.identity.epoch++;
    this.announced = true;
    this.sendMeta();
  }

  /** Push the slot so the group sees this participant's current bookkeeping. */
  private sendMeta() {
    if (this.isClosed) {
      return;
    }
    this.slotConfirmed = false;
    if (!this.nextBatch) {
      this.nextBatch = newBatch();
      // Nobody may be waiting on an announcement; a failure is retried by the next write
      this.nextBatch.promise.catch(() => {});
    }
    this.requestSend();
  }

  /** The slot as pushed: this participant's data plus the reserved bookkeeping. */
  private payload(): Record<string, unknown> {
    const meta: SlotMeta = {
      instance: this.identity.instance,
      epoch: this.identity.epoch,
      written: this.slot !== undefined,
    };
    if (this.ownRoster) {
      meta.sealed = this.ownRoster;
    }
    return deepFreeze({ ...this.slot, [RESERVED_KEY]: meta });
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
        const slot = this.slot;
        const epoch = this.identity.epoch;
        const batch = this.nextBatch!;
        this.hasUnsentChanges = false;
        this.nextBatch = null;
        this.inFlightBatch = batch;
        try {
          await this.connection.push(this.payload());
          if (slot === this.slot && epoch === this.identity.epoch) {
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
    condition: (data: GroupSessionData, presence: PresenceData, group: GroupState) => boolean,
    options: WaitOptions = {}
  ): Promise<GroupSessionData> {
    if (options === null || typeof options !== "object") {
      // Catches the old wait(condition, timeout) form, which would otherwise mean no timeout
      return Promise.reject(
        new TypeError(
          "MultiplayerAPI: wait()'s second argument must be an options object, e.g. { timeout: 5000 }."
        )
      );
    }
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
        callback: (data, presence, group) => {
          let met: boolean;
          try {
            met = condition(data, presence, group);
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
      listener.callback(this.data, this.presenceData, this.groupData);
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

  // ---------------------------------------------------------------- group

  /**
   * Ask the backend to stop letting new participants join, so the group is
   * sealed with the members it has now. Use it to start with fewer people than
   * the group can hold. Resolves once the backend confirms, and at once if the
   * group is already sealed. Rejects if the adapter can't seal groups.
   */
  async sealGroup(): Promise<void> {
    this.assertWritable();
    if (this.groupData.sealed) {
      return;
    }
    if (typeof this.connection.sealGroup !== "function") {
      throw new Error("MultiplayerAPI: this adapter can't seal groups.");
    }
    this.sealing ??= (async () => {
      try {
        await this.connection.sealGroup!();
      } finally {
        this.sealing = null;
      }
    })();
    await this.sealing;
    if (this.isClosed || this.ownRoster) {
      return;
    }
    // The backend confirmed, but its group() may not say so yet
    const members = this.readAdapterGroup()?.members ?? this.groupData.members;
    this.ownRoster = sortedIds([...members, this.participantId]);
    this.sendMeta();
    if (this.refreshGroup()) {
      this.refreshPresence();
      this.rebuild();
      this.notify();
      this.flushEvents();
    }
  }

  /**
   * Resolve with the group's state once it is sealed, e.g. to hold everyone in
   * a waiting room until the group is complete. Rejects at once if the adapter
   * doesn't form groups, since the group could then never be sealed.
   */
  async waitForGroup(options: GroupWaitOptions = {}): Promise<GroupState> {
    if (
      typeof this.connection.group !== "function" &&
      typeof this.connection.sealGroup !== "function"
    ) {
      throw new Error(
        "MultiplayerAPI: this adapter doesn't form groups, so waitForGroup() would never resolve. " +
          "Wait for a number of participants with wait() instead."
      );
    }
    await this.wait((_data, _presence, group) => group.sealed, { ...options, participants: [] });
    return this.groupData;
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
      listener.callback(this.data, this.presenceData, this.groupData);
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
        this.remoteJson = json;
        const { data, metas } = splitMeta(fromJson(json));
        this.metas = metas;
        const dataJson = JSON.stringify(data);
        if (dataJson !== this.remoteDataJson) {
          this.remote = data;
          this.remoteDataJson = dataJson;
          dataChanged = true;
        }
      }
    } catch (e) {
      console.error("MultiplayerAPI: could not read the adapter's session data", e);
    }
    let presenceChanged = this.refreshPresence();
    const groupChanged = this.refreshGroup();
    if (groupChanged) {
      // A newly sealed roster can add members to track
      presenceChanged = this.refreshPresence() || presenceChanged;
    }
    // Echoes of our own writes and repeated calls change nothing
    if (dataChanged || presenceChanged || groupChanged) {
      this.rebuild();
      this.notify();
    }
    this.flushEvents();
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
      // Others may have seen us drop out: show them we're back on the same page
      this.announce();
    }
    this.rebuild();
    this.notify();
    this.reportStatus();
    this.flushEvents();
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
    // A sealed group's roster says who should be here, even members never seen yet
    const ids = new Set([
      ...connectedNow,
      ...Object.keys(this.remote),
      ...this.presenceStatus.keys(),
      ...(this.roster ?? []),
    ]);
    ids.delete(this.participantId);

    let changed = false;
    for (const id of ids) {
      const current = this.presenceStatus.get(id);
      const meta = this.metas[id];
      if (!connectedNow.has(id)) {
        if (current === undefined || current === "connected") {
          this.presenceStatus.set(id, "away");
          this.dropMeta.set(id, meta ?? null);
          this.startAwayTimer(id);
          changed = true;
        }
        continue;
      }
      if (current === undefined) {
        this.presenceStatus.set(id, "connected");
        if (meta) this.knownInstance.set(id, meta.instance);
        changed = true;
      } else if (current === "connected") {
        // A new page load can take over the ID without the drop ever being visible
        const known = this.knownInstance.get(id);
        if (meta && known !== undefined && meta.instance !== known) {
          changed = this.markRestarted(id, meta, known) || changed;
        } else if (meta) {
          this.knownInstance.set(id, meta.instance);
        }
      } else {
        // Away or left: presence alone could be a reloaded page whose new identity
        // hasn't arrived yet, so wait for a write made since the drop.
        const drop = this.dropMeta.get(id) ?? null;
        if (!meta) {
          continue;
        }
        if (drop && meta.instance !== drop.instance) {
          changed = this.markRestarted(id, meta, drop.instance) || changed;
        } else if (!drop || meta.epoch > drop.epoch) {
          this.presenceStatus.set(id, "connected");
          this.clearAwayTimer(id);
          this.dropMeta.delete(id);
          this.knownInstance.set(id, meta.instance);
          if (current === "left") {
            this.events.push(() => this.options.onParticipantRejoined?.(id));
          }
          changed = true;
        }
      }
    }
    return changed;
  }

  /**
   * A participant came back from a new page load, so their experiment restarted.
   * They stay (or become) `left`. Returns whether their presence changed.
   */
  private markRestarted(id: string, meta: SlotMeta, previous: string): boolean {
    const key = `${id}\n${meta.instance}`;
    if (this.restartsReported.has(key)) {
      return false;
    }
    this.restartsReported.add(key);
    // Keep comparing later writes against the page load they left from
    this.dropMeta.set(id, { instance: previous, epoch: Infinity, written: true });
    this.clearAwayTimer(id);
    const wasLeft = this.presenceStatus.get(id) === "left";
    this.presenceStatus.set(id, "left");
    if (!wasLeft) {
      this.events.push(() => this.options.onParticipantLeft?.(id));
    }
    this.events.push(() => this.options.onParticipantRestarted?.(id));
    return !wasLeft;
  }

  /** Run queued researcher callbacks, after the session's state and snapshots are settled. */
  private flushEvents() {
    for (const event of this.events.splice(0)) {
      try {
        event();
      } catch (e) {
        console.error("MultiplayerAPI: a participant callback threw", e);
      }
    }
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
    this.events.push(() => this.options.onParticipantLeft?.(id));
    this.flushEvents();
  }

  // ---------------------------------------------------------------- group state

  /** The adapter's report of the group, or undefined if it has none or it is malformed. */
  private readAdapterGroup(): GroupState | undefined {
    if (typeof this.connection.group !== "function") {
      return undefined;
    }
    let reported: GroupState;
    try {
      reported = this.connection.group();
    } catch (e) {
      console.error("MultiplayerAPI: could not read the adapter's group", e);
      return undefined;
    }
    if (reported === null || typeof reported !== "object" || !Array.isArray(reported.members)) {
      console.error("MultiplayerAPI: the adapter's group() returned", reported);
      return undefined;
    }
    const { size } = reported;
    return {
      size: Number.isInteger(size) && size > 0 ? size : null,
      members: reported.members.map(String),
      sealed: reported.sealed === true,
    };
  }

  /**
   * Work out the group's state from the adapter and the rosters in everyone's
   * slots. Returns whether it changed. A newly sealed report from this
   * participant's own backend is sent on to the group.
   */
  private refreshGroup(): boolean {
    const reported = this.readAdapterGroup();
    if (!this.ownRoster) {
      // A roster in this participant's slot from before a reload still holds
      const previous = this.metas[this.participantId]?.sealed;
      if (reported?.sealed) {
        this.ownRoster = sortedIds([...reported.members, this.participantId]);
      } else if (isIdList(previous)) {
        this.ownRoster = sortedIds([...previous, this.participantId]);
      }
      // Before open() finishes, its announcement sends the roster instead
      if (this.ownRoster && this.announced) {
        this.sendMeta();
      }
    }

    const rosters = Object.values(this.metas)
      .map((meta) => meta.sealed)
      .filter(isIdList);
    if (this.ownRoster) {
      rosters.push(this.ownRoster);
    }
    if (rosters.length > 0) {
      this.roster ??= new Set([this.participantId]);
      for (const id of rosters.flat()) {
        this.roster.add(id);
      }
    }

    let members: string[];
    if (this.roster) {
      members = sortedIds(this.roster);
    } else if (reported) {
      members = sortedIds([...reported.members, this.participantId]);
    } else {
      // Without a backend that forms groups, the group is whoever has shown up
      members = sortedIds([this.participantId, ...this.presenceStatus.keys()]);
    }
    const next: GroupState = {
      size: reported?.size ?? this.groupData.size,
      members,
      sealed: this.roster !== null,
    };
    if (JSON.stringify(next) === JSON.stringify(this.groupData)) {
      return false;
    }
    this.groupData = deepFreeze(next);
    return true;
  }

  // ---------------------------------------------------------------- closing

  /**
   * Close the connection. Subscribers are called one last time, then removed.
   * Pending waits reject with a MultiplayerCancelledError and unsent writes
   * reject. Reads keep returning the last snapshot.
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

      // Set `closing` before anything below can call back into the session
      const disconnecting = (async () => this.connection.disconnect())();
      // A lost connection is closed on nobody's behalf, so log instead of rejecting
      this.closing = lost
        ? disconnecting.catch((e) => console.error("MultiplayerAPI: adapter disconnect threw", e))
        : disconnecting;

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

      // One last call, with this participant's presence now `left`, so a
      // plugin that only subscribes learns the session has closed
      this.rebuild();
      this.notify();
      this.cancelListeners(reason);
      this.reportStatus();
    }
    return this.closing;
  }
}
