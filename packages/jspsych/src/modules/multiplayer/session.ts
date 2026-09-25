import autoBind from "auto-bind";

import { MultiplayerError } from "./errors";
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
 * Safety valve for subscribers that write different data on every notification, which would
 * otherwise loop forever.
 */
const MAX_NOTIFY_ROUNDS = 100;

/** How long a participant can be away before they count as having left, in ms. */
export const DEFAULT_DROPOUT_TIMEOUT = 10000;

/** Delays between retries of a failed push, in ms. Each failure doubles the delay up to the max. */
const RETRY_DELAY_MIN = 250;
const RETRY_DELAY_MAX = 10000;

/**
 * Version of the format each participant's pushed data is in. Later versions only add fields, so
 * a client reads what it understands of a newer peer's data.
 */
export const PROTOCOL_VERSION = 1;

/**
 * Read a timeout option: null or undefined means none, and a positive number is milliseconds.
 * Infinity, and delays too long for setTimeout, also mean none. Anything else throws, so a typo
 * like "5000" can't silently mean "wait forever".
 */
export function parseTimeout(value: unknown, name: string): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    throw new TypeError(
      `MultiplayerAPI: ${name} must be a positive number of milliseconds, or null for none.`
    );
  }
  return value > MAX_TIMEOUT ? null : value;
}

/**
 * Which part of the shared data a call reads or writes: a trial's scope, by name, or null for
 * the session scope that lasts the whole session.
 */
export type ScopeName = string | null;

export interface SessionOptions {
  /**
   * How long a participant can stay disconnected before they count as having left, in
   * milliseconds. Defaults to 10000. null means never.
   */
  dropoutTimeout?: number | null;

  /**
   * How long this participant's own connection can stay `reconnecting` before the API gives up
   * and closes it, in milliseconds. Defaults to null: keep trying for as long as the adapter does.
   */
  reconnectTimeout?: number | null;

  /**
   * Seed for random(), randomInt(), shuffle(), and sample() in place of the session ID. Every
   * participant in the group must pass the same value. Use it to make the random values the
   * same in every session.
   */
  randomSeed?: string;

  /**
   * Called once when another participant reaches the `left` presence status, whether their
   * connection dropped for longer than the dropout timeout or they reloaded the page.
   */
  onParticipantLeft?: (participantId: string) => void;

  /** Called whenever this client's connection status changes. */
  onStatusChange?: (status: ConnectionStatus) => void;
}

export type SessionListener = (
  data: GroupSessionData,
  presence: PresenceData,
  group: GroupState
) => void;

interface ListenerOptions {
  scope: ScopeName;
  signal?: AbortSignal;
  /** Removed when the trial it was created in ends. */
  trialBound: boolean;
}

export interface SessionWaitOptions extends ListenerOptions {
  timeout?: unknown;
  participants?: string[];
}

interface Listener {
  callback: SessionListener;
  active: boolean;
  scope: ScopeName;
  trialBound: boolean;
  /** For a wait(), rejects it. */
  cancel?: (error: Error) => void;
}

/** A caller waiting for the backend to confirm their write. */
interface Caller {
  resolve: () => void;
  reject: (e: unknown) => void;
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
 * Data is stored as a frozen JSON round-trip, which matches what other participants receive
 * over the network. JSON.stringify throws on BigInt and circular data, so bad data fails at the
 * call that wrote it, and comparing the JSON text tells whether anything changed.
 */
function fromJson<T>(json: string): T {
  return deepFreeze(JSON.parse(json));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isIdList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((id) => typeof id === "string");
}

/** Sorted, without duplicates, so every participant lists a roster the same way. */
function sortedIds(ids: Iterable<string>): string[] {
  return [...new Set(ids)].sort();
}

/** Key of the session's bookkeeping in each participant's pushed data. */
const META_KEY = "$mp";

/** Identifies one page load. Shared by every session made from one jsPsych.multiplayer. */
export interface SessionIdentity {
  /** Random, and new on every page load. */
  instance: string;
  /** Goes up every time this page (re)announces itself to the group. */
  epoch: number;
}

/** The session's bookkeeping, pushed with each participant's data. */
interface SlotMeta extends SessionIdentity {
  v: number;
  /** Participants this one has seen leave, so the rest of the group can agree. */
  left?: string[];
}

/** One participant's data, as the session keeps it. */
interface SlotData {
  /** The session scope; undefined until they write to it. */
  session?: Record<string, unknown>;
  /** Each trial scope they have written to, by name. */
  scopes: Record<string, Record<string, unknown>>;
}

interface Slot extends SlotData {
  meta: SlotMeta;
}

/** Read one participant's pushed data, or null if it isn't in a format this client knows. */
function parseSlot(raw: unknown): Slot | null {
  if (!isRecord(raw)) {
    return null;
  }
  const meta = raw[META_KEY];
  if (
    !isRecord(meta) ||
    typeof meta.v !== "number" ||
    typeof meta.instance !== "string" ||
    typeof meta.epoch !== "number"
  ) {
    return null;
  }
  const scopes: Record<string, Record<string, unknown>> = {};
  if (isRecord(raw.scopes)) {
    for (const [name, data] of Object.entries(raw.scopes)) {
      if (isRecord(data)) scopes[name] = data;
    }
  }
  return {
    meta: {
      v: meta.v,
      instance: meta.instance,
      epoch: meta.epoch,
      left: isIdList(meta.left) ? meta.left : undefined,
    },
    session: isRecord(raw.session) ? raw.session : undefined,
    scopes,
  };
}

function scopeData(slot: SlotData, scope: ScopeName): Record<string, unknown> | undefined {
  return scope === null ? slot.session : slot.scopes[scope];
}

function assertRecord(data: unknown): asserts data is Record<string, unknown> {
  if (!isRecord(data)) {
    throw new TypeError("MultiplayerAPI: data must be a plain object of JSON values.");
  }
}

/**
 * One connection to a multiplayer backend. jsPsych.multiplayer opens it and forwards to it. All
 * state belongs to the session, so work left over from an earlier connection can never touch a
 * later one.
 */
export class MultiplayerSession {
  readonly participantId: string;

  /** Identifies the group session; the same for every participant in the group. */
  readonly sessionId: string;

  /**
   * True when this participant's data came from an earlier page load: they reloaded or opened
   * the study again, so their experiment restarted while the group moved on.
   */
  readonly restarted: boolean;

  /** Seeded with `options.randomSeed`, or else the session ID. */
  private readonly rng: SharedRandom;

  private currentStatus: ConnectionStatus = "connected";

  /** Why the session closed; pending and later waits reject with it. */
  private closeReason: MultiplayerError | null = null;

  /** Memoized so overlapping disconnect() calls close the connection once. */
  private closing: Promise<void> | null = null;

  /** JSON of the adapter's latest getAll(), to skip reads that change nothing. */
  private remoteJson = "{}";

  /** JSON of every other participant's data, without bookkeeping, to tell whether it changed. */
  private remoteDataJson = "{}";

  /** Every other participant's data and bookkeeping, frozen. */
  private slots: Record<string, Slot> = {};

  /**
   * This participant's own data. The session is its source of truth: writes change it at once
   * and the backend is brought up to date after.
   */
  private own: SlotData = { scopes: {} };
  private ownJson: string;

  /** Participants this one has seen leave, sent to the group. */
  private ownLeft: string[] = [];

  /** Bumped whenever the bookkeeping changes, so a push of older bookkeeping doesn't count. */
  private metaVersion = 0;

  /** True when the backend is known to hold the current data and bookkeeping. */
  private slotConfirmed = true;

  /** Frozen view of each scope's data that readers have asked for, rebuilt on every change. */
  private views = new Map<ScopeName, GroupSessionData>();

  private presenceData: PresenceData = {};

  /** Frozen snapshot of the group's membership. */
  private groupData: GroupState = Object.freeze({ size: null, members: [], sealed: false });

  /**
   * When the adapter forms groups, its members; only their data is shown. Null when it doesn't.
   */
  private memberFilter: Set<string> | null = null;

  /**
   * Every member the adapter has reported since it sealed the group. Non-null means the group is
   * sealed. It only grows, so a sealed group never becomes unsealed and nobody drops off the
   * roster, even if the backend stops listing them.
   */
  private roster: Set<string> | null = null;

  /** Memoized so overlapping sealGroup() calls ask the backend once. */
  private sealing: Promise<void> | null = null;

  private presenceStatus = new Map<string, PresenceStatus>();
  private awayTimers = new Map<string, number>();
  private readonly dropoutTimeout: number | null;
  private readonly reconnectTimeout: number | null;
  private reconnectTimer: number | undefined;

  /** Each participant's page load, as last seen while they were connected. */
  private knownInstance = new Map<string, string>();

  /**
   * Each absent participant's bookkeeping as of when they dropped out (null if they had none).
   * They count as back only after a write made since then.
   */
  private dropMeta = new Map<string, SlotMeta | null>();

  /** False until open() announces this page load; nothing is pushed before then. */
  private announced = false;

  /** True once other participants may have seen this one drop out. */
  private hasBeenAway = false;

  /** Callbacks to researcher code, run once the session's state is settled. */
  private events: Array<() => void> = [];

  private listeners = new Set<Listener>();
  private notifying = false;
  private notifyAgain = false;

  /** True when own data or bookkeeping has changed since it was last handed to the connection. */
  private hasUnsentChanges = false;

  /** True while sendLatest() is running. */
  private sending = false;

  /** Callers whose writes will go out with the next push. */
  private queued: Caller[] = [];

  /** Callers whose writes are in the push currently in flight. */
  private inFlight: Caller[] | null = null;

  private retryTimer: number | undefined;
  private retryDelay = 0;

  /**
   * Connect with an adapter. Once `signal` is aborted this rejects, but only after any
   * connection the adapter opened has been closed.
   */
  static async open(
    adapter: MultiplayerAdapter,
    signal: AbortSignal,
    options: SessionOptions,
    identity: SessionIdentity
  ): Promise<MultiplayerSession> {
    const cancelled = () =>
      new MultiplayerError("cancelled", "connect() was cancelled before it finished.");
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
        onResumed: () => session?.handleResumed(),
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
        : parseTimeout(options.dropoutTimeout, "dropoutTimeout");
    this.reconnectTimeout = parseTimeout(options.reconnectTimeout, "reconnectTimeout");

    // Pick up this participant's own data from an earlier page load, if there is any
    const previous = parseSlot(this.readRemote()[this.participantId]);
    if (previous) {
      this.own = { session: previous.session, scopes: previous.scopes };
      this.ownLeft = previous.meta.left ?? [];
    }
    this.ownJson = JSON.stringify(this.own);
    this.own = fromJson(this.ownJson);
    this.restarted = previous !== null && previous.meta.instance !== identity.instance;

    this.readSlots();
    this.refreshGroup();
    this.refreshPresence();
    // Presence can add members to a group the adapter doesn't form
    this.refreshGroup();
    this.rebuild();
    // Participants who left before this one arrived aren't news
    this.events = [];
  }

  /** This client's connection status. */
  get status(): ConnectionStatus {
    return this.currentStatus;
  }

  private get isClosed() {
    return this.currentStatus === "closed";
  }

  // ---------------------------------------------------------------- reading

  /** Every participant's data in a scope. The object is frozen and shared, so don't modify it. */
  getAll(scope: ScopeName): GroupSessionData {
    let view = this.views.get(scope);
    if (!view) {
      const data: GroupSessionData = {};
      for (const [id, slot] of Object.entries(this.slots)) {
        const value = scopeData(slot, scope);
        if (value !== undefined && (!this.memberFilter || this.memberFilter.has(id))) {
          data[id] = value;
        }
      }
      const mine = scopeData(this.own, scope);
      if (mine !== undefined) {
        data[this.participantId] = mine;
      }
      view = Object.freeze(data);
      this.views.set(scope, view);
    }
    return view;
  }

  /** One participant's data in a scope, or undefined if they haven't written any. Frozen. */
  get(participantId: string, scope: ScopeName): Record<string, unknown> | undefined {
    return this.getAll(scope)[participantId];
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

  random(key: string): number {
    return this.rng.random(key);
  }

  randomInt(key: string, lower: number, upper: number): number {
    return this.rng.randomInt(key, lower, upper);
  }

  shuffle<T>(key: string, array: readonly T[]): T[] {
    return this.rng.shuffle(key, array);
  }

  sample<T>(key: string, array: readonly T[], size: number): T[] {
    return this.rng.sample(key, array, size);
  }

  // ---------------------------------------------------------------- writing

  /**
   * Shallow-merge data into this participant's data in a scope. Top-level keys in `data` replace
   * the existing ones, other keys are kept, and a key set to undefined is removed. Reads reflect
   * the change at once; the promise resolves when the backend confirms a push that includes it.
   */
  update(data: Record<string, unknown>, scope: ScopeName): Promise<void> {
    this.assertOpen();
    assertRecord(data);
    return this.write(scope, { ...scopeData(this.own, scope), ...data });
  }

  /** Replace this participant's data in a scope. */
  replace(data: Record<string, unknown>, scope: ScopeName): Promise<void> {
    this.assertOpen();
    assertRecord(data);
    return this.write(scope, data);
  }

  /** Throw if the session can't be written to any more. */
  assertOpen() {
    if (this.isClosed) {
      throw this.closeReason?.code === "connection_lost"
        ? this.closeReason
        : new MultiplayerError("not_connected", "this session was disconnected.");
    }
  }

  /**
   * Queue the new data for sending, then show it to readers. A write that doesn't change the
   * data sends and notifies nothing, so a subscriber that writes the same value on every
   * notification can't start a loop.
   */
  private write(scope: ScopeName, data: Record<string, unknown>): Promise<void> {
    const next: SlotData =
      scope === null
        ? { session: data, scopes: this.own.scopes }
        : { session: this.own.session, scopes: { ...this.own.scopes, [scope]: data } };
    const json = JSON.stringify(next);

    if (json === this.ownJson) {
      // Share a push already on its way, or skip it if the backend has this data
      if (this.inFlight && !this.hasUnsentChanges) {
        return new Promise((resolve, reject) => this.inFlight!.push({ resolve, reject }));
      }
      if (this.slotConfirmed) {
        return Promise.resolve();
      }
      const promise = this.enqueue();
      this.requestSend();
      return promise;
    }

    this.own = fromJson(json);
    this.ownJson = json;
    this.slotConfirmed = false;
    const promise = this.enqueue();
    this.requestSend();
    this.rebuild();
    this.notify();
    return promise;
  }

  private enqueue(): Promise<void> {
    return new Promise((resolve, reject) => this.queued.push({ resolve, reject }));
  }

  /**
   * Push this page's identity with a new epoch, so the group can tell that this participant is
   * (back) on this page load. Runs on connect and whenever the connection recovers.
   */
  private announce() {
    if (this.isClosed) {
      return;
    }
    this.identity.epoch++;
    this.announced = true;
    this.sendMeta();
  }

  /** Push the bookkeeping so the group sees it. */
  private sendMeta() {
    if (this.isClosed) {
      return;
    }
    this.metaVersion++;
    this.slotConfirmed = false;
    if (this.announced) {
      this.requestSend();
    }
  }

  /** What gets pushed: this participant's data plus the bookkeeping. */
  private payload(): Record<string, unknown> {
    const meta: SlotMeta = {
      v: PROTOCOL_VERSION,
      instance: this.identity.instance,
      epoch: this.identity.epoch,
    };
    if (this.ownLeft.length > 0) {
      meta.left = [...this.ownLeft];
    }
    const payload: Record<string, unknown> = { [META_KEY]: meta, scopes: this.own.scopes };
    if (this.own.session !== undefined) {
      payload.session = this.own.session;
    }
    return deepFreeze(payload);
  }

  /** Start the sender if it's idle; a running sender picks up the change itself. */
  private requestSend() {
    this.hasUnsentChanges = true;
    if (this.sending) {
      return;
    }
    if (this.retryTimer !== undefined) {
      // New data goes out now rather than waiting for the retry
      clearTimeout(this.retryTimer);
      this.retryTimer = undefined;
    }
    // Runs synchronously up to the adapter's push, so an idle write doesn't wait a turn before
    // reaching the backend.
    void this.sendLatest();
  }

  /**
   * Push the latest data, one push at a time, until the backend has caught up. Writes made
   * during a push go out together in the next one, so values that are replaced before they are
   * sent are skipped. A failed push is retried with backoff; its callers keep waiting until a
   * push succeeds or the session closes.
   */
  private async sendLatest(): Promise<void> {
    this.sending = true;
    try {
      while (this.hasUnsentChanges && !this.isClosed) {
        const callers = this.queued;
        const json = this.ownJson;
        const metaVersion = this.metaVersion;
        this.queued = [];
        this.inFlight = callers;
        this.hasUnsentChanges = false;
        try {
          await this.connection.push(this.payload());
          if (json === this.ownJson && metaVersion === this.metaVersion) {
            this.slotConfirmed = true;
          }
          this.retryDelay = 0;
          for (const caller of callers) caller.resolve();
        } catch (e) {
          if (this.isClosed) {
            // close() has already rejected the callers
            return;
          }
          if (this.retryDelay === 0) {
            console.warn("MultiplayerAPI: a write failed and will be retried", e);
          }
          this.queued = [...callers, ...this.queued];
          this.scheduleRetry();
          return;
        } finally {
          if (this.inFlight === callers) {
            this.inFlight = null;
          }
        }
      }
    } finally {
      this.sending = false;
    }
  }

  private scheduleRetry() {
    this.retryDelay = Math.min(
      this.retryDelay === 0 ? RETRY_DELAY_MIN : this.retryDelay * 2,
      RETRY_DELAY_MAX
    );
    this.retryTimer = window.setTimeout(() => {
      this.retryTimer = undefined;
      this.requestSend();
    }, this.retryDelay);
  }

  // ---------------------------------------------------------------- listening

  /**
   * Call `callback` with the current state now, and again after every change. Returns a
   * function that removes the subscription.
   */
  subscribe(callback: SessionListener, options: ListenerOptions): Unsubscribe {
    const { signal, scope, trialBound } = options;
    const listener: Listener = { callback, active: true, scope, trialBound };
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
   * Resolve with the scope's data once `condition` returns true. Checks the current state first,
   * so it resolves at once if the condition already holds. A throwing condition rejects the wait.
   */
  wait(
    condition: (data: GroupSessionData, presence: PresenceData, group: GroupState) => boolean,
    options: SessionWaitOptions
  ): Promise<GroupSessionData> {
    const { signal, participants = [], scope, trialBound } = options;
    let timeout: number | null;
    try {
      timeout = parseTimeout(options.timeout, "timeout");
      if (!isIdList(participants)) {
        throw new TypeError("MultiplayerAPI: participants must be an array of participant IDs.");
      }
    } catch (e) {
      return Promise.reject(e);
    }

    return new Promise((resolve, reject) => {
      let timer: number | undefined;

      const finish = (outcome: () => void) => {
        if (!listener.active) {
          return;
        }
        listener.active = false;
        this.listeners.delete(listener);
        if (timer !== undefined) clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
        outcome();
      };
      const cancel = (error: Error) => finish(() => reject(error));
      const onAbort = () =>
        cancel(new MultiplayerError("cancelled", "wait() was cancelled by its signal."));

      const listener: Listener = {
        active: true,
        scope,
        trialBound,
        cancel,
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
            cancel(
              new MultiplayerError(
                "participant_left",
                `wait() failed because participant ${gone} left the session.`,
                gone
              )
            );
          }
        },
      };

      if (signal?.aborted) {
        reject(new MultiplayerError("cancelled", "wait() was cancelled by its signal."));
        return;
      }
      this.deliver(listener);
      if (!listener.active) {
        return;
      }
      if (this.isClosed) {
        cancel(this.closeReason!);
        return;
      }
      this.listeners.add(listener);
      signal?.addEventListener("abort", onAbort, { once: true });
      if (timeout !== null) {
        timer = window.setTimeout(
          () => cancel(new MultiplayerError("timeout", `wait() timed out after ${timeout}ms.`)),
          timeout
        );
      }
    });
  }

  // ---------------------------------------------------------------- group

  /**
   * Ask the backend to stop letting new participants join, so the group is sealed with the
   * members it has now. Resolves once the backend confirms, and at once if the group is already
   * sealed.
   */
  async sealGroup(): Promise<void> {
    this.assertOpen();
    if (this.groupData.sealed) {
      return;
    }
    if (typeof this.connection.sealGroup !== "function") {
      throw new MultiplayerError("unsupported", "this adapter can't seal groups.");
    }
    this.sealing ??= (async () => {
      try {
        await this.connection.sealGroup!();
      } finally {
        this.sealing = null;
      }
    })();
    await this.sealing;
    // The adapter reports the seal through group(), which may not have been announced yet
    this.handleChange();
  }

  /** Resolve with the group's state once it is sealed. */
  async waitForGroup(options: SessionWaitOptions): Promise<GroupState> {
    if (typeof this.connection.group !== "function") {
      throw new MultiplayerError(
        "unsupported",
        "this adapter doesn't form groups, so waitForGroup() would never resolve. " +
          "Wait for a number of participants with wait() instead."
      );
    }
    await this.wait((_data, _presence, group) => group.sealed, { ...options, participants: [] });
    return this.groupData;
  }

  // ---------------------------------------------------------------- lifetimes

  /**
   * Remove subscriptions and reject pending waits with a `cancelled` error: those bound to the
   * trial that just ended, or all of them. The connection stays open.
   */
  cancelListeners(which: "trial" | "all"): void {
    this.cancelMatching(
      (listener) => which === "all" || listener.trialBound,
      new MultiplayerError(
        "cancelled",
        which === "all"
          ? "the experiment ended before the wait finished."
          : "the trial ended before the wait finished."
      )
    );
  }

  private cancelMatching(matches: (listener: Listener) => boolean, error: Error) {
    for (const listener of [...this.listeners]) {
      if (!matches(listener)) continue;
      if (listener.cancel) {
        listener.cancel(error);
      } else {
        listener.active = false;
        this.listeners.delete(listener);
      }
    }
  }

  private deliver(listener: Listener) {
    if (!listener.active) {
      return;
    }
    const data = this.getAll(listener.scope);
    if (listener.cancel) {
      // A wait handles its own errors
      listener.callback(data, this.presenceData, this.groupData);
      return;
    }
    try {
      listener.callback(data, this.presenceData, this.groupData);
    } catch (e) {
      console.error("MultiplayerAPI: subscriber callback threw", e);
    }
  }

  /**
   * Deliver the current state to every listener. A change made by a listener starts another
   * round after this one, instead of a nested one, so each listener sees snapshots in order.
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

  /** Drop the cached views and rebuild the presence snapshot. */
  private rebuild() {
    this.views.clear();
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

  private readRemote(): Record<string, unknown> {
    const raw = this.connection.getAll();
    return isRecord(raw) ? raw : {};
  }

  /** Re-read everyone else's data from the adapter. Returns whether their data changed. */
  private readSlots(): boolean {
    let json: string;
    try {
      json = JSON.stringify(this.readRemote());
    } catch (e) {
      console.error("MultiplayerAPI: could not read the adapter's session data", e);
      return false;
    }
    if (json === this.remoteJson) {
      return false;
    }
    this.remoteJson = json;
    const slots: Record<string, Slot> = {};
    for (const [id, raw] of Object.entries(fromJson<Record<string, unknown>>(json))) {
      if (id === this.participantId) continue;
      const slot = parseSlot(raw);
      if (slot) slots[id] = slot;
    }
    this.slots = slots;
    const dataJson = JSON.stringify(
      Object.entries(slots).map(([id, slot]) => [id, slot.session, slot.scopes])
    );
    if (dataJson === this.remoteDataJson) {
      return false;
    }
    this.remoteDataJson = dataJson;
    return true;
  }

  private handleChange() {
    if (this.isClosed) {
      return;
    }
    const dataChanged = this.readSlots();
    const groupChanged = this.refreshGroup();
    const presenceChanged = this.refreshPresence();
    // Presence can add members to a group the adapter doesn't form
    const membersChanged = presenceChanged && this.refreshGroup();
    if (this.isEvicted()) {
      void this.close(
        new MultiplayerError(
          "connection_lost",
          "the rest of the group counted this participant as having left."
        )
      );
      return;
    }
    // Echoes of our own writes and repeated calls change nothing
    if (dataChanged || groupChanged || presenceChanged || membersChanged) {
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
      void this.close(
        new MultiplayerError("connection_lost", "the connection to the backend was lost.")
      );
      return;
    }
    this.currentStatus = status;
    if (status === "reconnecting") {
      this.hasBeenAway = true;
      // While our own channel is down, others' dropout clocks pause
      this.clearAwayTimers();
      if (this.reconnectTimeout !== null) {
        this.reconnectTimer = window.setTimeout(() => {
          void this.close(
            new MultiplayerError(
              "connection_lost",
              `gave up reconnecting after ${this.reconnectTimeout}ms.`
            )
          );
        }, this.reconnectTimeout);
      }
    } else {
      this.clearReconnectTimer();
      for (const [id, presence] of this.presenceStatus) {
        if (presence === "away") this.startAwayTimer(id);
      }
      this.readSlots();
      this.refreshGroup();
      this.refreshPresence();
      // Others may have seen us drop out: show them we're back on the same page
      this.announce();
    }
    this.rebuild();
    this.notify();
    this.reportStatus();
    this.flushEvents();
  }

  private handleResumed() {
    if (this.isClosed) {
      return;
    }
    this.hasBeenAway = true;
    this.announce();
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
   * Compare the adapter's connected list with what we know, starting or stopping dropout
   * clocks, and adopt departures other participants have seen. Returns whether any presence
   * status changed.
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
      ...Object.keys(this.slots).filter((id) => !this.memberFilter || this.memberFilter.has(id)),
      ...this.presenceStatus.keys(),
      ...(this.roster ?? []),
    ]);
    ids.delete(this.participantId);

    let changed = false;
    for (const id of ids) {
      const current = this.presenceStatus.get(id);
      if (current === "left") {
        continue;
      }
      const meta = this.slots[id]?.meta;
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
          this.markLeft(id);
          changed = true;
        } else if (meta) {
          this.knownInstance.set(id, meta.instance);
        }
      } else if (meta) {
        // Away: presence alone could be a reloaded page whose new identity hasn't arrived yet,
        // so wait for a write made since the drop.
        const drop = this.dropMeta.get(id) ?? null;
        if (drop && meta.instance !== drop.instance) {
          this.markLeft(id);
          changed = true;
        } else if (!drop || meta.epoch > drop.epoch) {
          this.presenceStatus.set(id, "connected");
          this.clearAwayTimer(id);
          this.dropMeta.delete(id);
          this.knownInstance.set(id, meta.instance);
          changed = true;
        }
      }
    }

    // Agree with others who saw someone leave, as long as we've lost sight of them too
    for (const [declarer, slot] of Object.entries(this.slots)) {
      if (this.presenceStatus.get(declarer) !== "connected") continue;
      for (const id of slot.meta.left ?? []) {
        if (this.presenceStatus.get(id) === "away") {
          this.markLeft(id);
          changed = true;
        }
      }
    }
    return changed;
  }

  /**
   * Whether a connected participant has told the group that this one left. Only believed when
   * the others may really have seen this participant drop out.
   */
  private isEvicted(): boolean {
    if (!this.hasBeenAway && !this.restarted) {
      return false;
    }
    return Object.entries(this.slots).some(
      ([declarer, slot]) =>
        this.presenceStatus.get(declarer) === "connected" &&
        (slot.meta.left ?? []).includes(this.participantId)
    );
  }

  /** A participant is gone for good. Tell the group and the researcher. */
  private markLeft(id: string) {
    this.presenceStatus.set(id, "left");
    this.clearAwayTimer(id);
    this.dropMeta.delete(id);
    if (!this.ownLeft.includes(id)) {
      this.ownLeft = [...this.ownLeft, id];
      this.sendMeta();
    }
    this.events.push(() => this.options.onParticipantLeft?.(id));
  }

  /** Run queued researcher callbacks, after the session's state and snapshots are settled. */
  private flushEvents() {
    for (const event of this.events.splice(0)) {
      try {
        event();
      } catch (e) {
        console.error("MultiplayerAPI: onParticipantLeft threw", e);
      }
    }
  }

  private startAwayTimer(id: string) {
    this.clearAwayTimer(id);
    if (this.dropoutTimeout !== null) {
      this.awayTimers.set(
        id,
        window.setTimeout(() => {
          this.awayTimers.delete(id);
          if (this.isClosed || this.presenceStatus.get(id) !== "away") {
            return;
          }
          this.markLeft(id);
          this.rebuild();
          this.notify();
          this.flushEvents();
        }, this.dropoutTimeout)
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

  private clearReconnectTimer() {
    if (this.reconnectTimer !== undefined) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
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

  /** Work out the group's state from the adapter, or from presence. Returns whether it changed. */
  private refreshGroup(): boolean {
    const reported = this.readAdapterGroup();
    let next: GroupState;
    if (reported) {
      if (reported.sealed || this.roster) {
        this.roster ??= new Set([this.participantId]);
        if (reported.sealed) {
          for (const id of reported.members) this.roster.add(id);
        }
      }
      next = {
        size: reported.size ?? this.groupData.size,
        members: sortedIds(this.roster ?? [...reported.members, this.participantId]),
        sealed: this.roster !== null,
      };
    } else {
      // Without a backend that forms groups, the group is whoever has shown up
      next = {
        size: null,
        members: sortedIds([this.participantId, ...this.presenceStatus.keys()]),
        sealed: false,
      };
    }
    this.memberFilter = reported ? new Set(next.members) : null;
    if (JSON.stringify(next) === JSON.stringify(this.groupData)) {
      return false;
    }
    this.groupData = deepFreeze(next);
    this.views.clear();
    return true;
  }

  // ---------------------------------------------------------------- closing

  /**
   * Close the connection. Subscribers are called one last time, then removed. Pending waits
   * reject with a `cancelled` error and unsent writes reject. Reads keep returning the last
   * snapshot.
   */
  disconnect(): Promise<void> {
    return this.close(new MultiplayerError("cancelled", "the session was disconnected."));
  }

  private close(reason: MultiplayerError): Promise<void> {
    if (!this.closing) {
      const lost = reason.code === "connection_lost";
      this.currentStatus = "closed";
      this.closeReason = reason;
      this.clearAwayTimers();
      this.clearReconnectTimer();
      if (this.retryTimer !== undefined) {
        clearTimeout(this.retryTimer);
        this.retryTimer = undefined;
      }

      // Set `closing` before anything below can call back into the session
      const disconnecting = (async () => this.connection.disconnect())();
      // A lost connection is closed on nobody's behalf, so log instead of rejecting
      this.closing = lost
        ? disconnecting.catch((e) => console.error("MultiplayerAPI: adapter disconnect threw", e))
        : disconnecting;

      // The in-flight push may never settle, so don't leave its callers waiting
      const writeError = lost
        ? reason
        : new MultiplayerError("cancelled", "disconnect() was called before this write was sent.");
      const unsent = [...(this.inFlight ?? []), ...this.queued];
      this.inFlight = null;
      this.queued = [];
      this.hasUnsentChanges = false;
      for (const caller of unsent) {
        caller.reject(writeError);
      }

      // One last call, with this participant's presence now `left`, so a plugin that only
      // subscribes learns the session has closed
      this.rebuild();
      this.notify();
      this.cancelMatching(() => true, reason);
      this.reportStatus();
    }
    return this.closing;
  }
}
