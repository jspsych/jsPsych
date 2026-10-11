/** Shared data keyed by participantId, then by data key. */
export type GroupSessionData = Record<string, Record<string, unknown>>;

/** Calling this removes the associated subscription. */
export type Unsubscribe = () => void;

/**
 * The state of this client's own connection.
 * - `connected`: the channel is open.
 * - `reconnecting`: the channel dropped and the adapter is trying to restore it.
 * - `closed`: the channel is gone for good, either lost or closed by disconnect().
 */
export type ConnectionStatus = "connected" | "reconnecting" | "closed";

/**
 * Whether a participant is still in the session.
 * - `connected`: currently connected.
 * - `away`: dropped out, and may come back within the dropout timeout.
 * - `left`: gone for good. A participant who reaches `left` stays `left`, and the group agrees
 *   on it: once one participant sees someone leave, the others who have also lost sight of them
 *   count them as left too.
 */
export type PresenceStatus = "connected" | "away" | "left";

/** Presence of every participant seen in the session, keyed by participantId. */
export type PresenceData = Record<string, PresenceStatus>;

/**
 * How the group's membership stands.
 * - `size`: the most participants the group can hold, or null when the backend doesn't say.
 * - `members`: the participants assigned to the group, including this one. Once the group is
 *   sealed, this is the final roster: a member who drops out stays on it, and nobody is added.
 * - `sealed`: true once nobody new can join. Before that, a member who leaves frees their place
 *   for someone new; after it, they count as a dropout. A sealed group never becomes unsealed.
 */
export interface GroupState {
  size: number | null;
  members: string[];
  sealed: boolean;
}

/** What the MultiplayerAPI passes to MultiplayerAdapter.connect(). */
export interface AdapterConnectOptions {
  /**
   * Aborted when the caller cancels the connection attempt or it times out. The adapter should
   * stop connecting, release anything it opened, and then reject.
   */
  signal: AbortSignal;

  /**
   * Call whenever the connection's getAll(), connectedParticipants(), or group() may have
   * changed. The API re-reads them all, so extra calls are harmless. Calls made before
   * connect() resolves are allowed and ignored; the API reads everything once it resolves.
   */
  onChange(): void;

  /**
   * Call when this client's own channel drops (`reconnecting`), recovers (`connected`), or is
   * lost for good (`closed`).
   */
  onStatus(status: ConnectionStatus): void;

  /**
   * Call when other participants may have seen this client drop out even though its channel
   * never reported `reconnecting`, e.g. after a missed heartbeat. The API then tells the group
   * that this participant is still on the same page. Recovering from `reconnecting` does this
   * already.
   */
  onResumed(): void;
}

/**
 * Contract that any multiplayer network backend must implement. An adapter holds configuration
 * only; each connect() call opens a new, independent MultiplayerConnection. Plugin authors code
 * against the MultiplayerAPI and never touch the adapter directly.
 */
export interface MultiplayerAdapter {
  /**
   * Open the communication channel and establish group membership. The backend, not the client,
   * decides which group an arriving participant joins, so two participants who arrive together
   * can't both take the last place. connect() resolves once this participant has a group and the
   * connection's reads are ready.
   */
  connect(options: AdapterConnectOptions): Promise<MultiplayerConnection>;
}

/**
 * One open channel to the backend, returned by MultiplayerAdapter.connect().
 *
 * Reads are synchronous, so an adapter over an asynchronous backend keeps an in-memory mirror of
 * the backend's state and fills it before connect() resolves.
 */
export interface MultiplayerConnection {
  /**
   * Identifies this participant within the group session. Keep the same ID for every connection
   * made from the same page, so a participant whose network drops can rejoin.
   */
  readonly participantId: string;

  /**
   * Identifies the group session. Every participant in the group gets the same non-empty value,
   * it stays the same across reconnects and reloads, and a different group gets a different
   * value. The API seeds shared randomness with it.
   */
  readonly sessionId: string;

  /**
   * Every participant's latest pushed data, keyed by participantId. Return `{}` when empty. The
   * API owns the format of each participant's data; store and return it unchanged.
   */
  getAll(): Record<string, unknown>;

  /** IDs of the participants whose channels are currently open, including this participant's. */
  connectedParticipants(): string[];

  /**
   * Store this participant's data, replacing what they pushed before. Resolves when the backend
   * confirms the write, and rejects if it fails; the API retries. The API sends one push at a
   * time and passes an object it owns; treat it as read-only. Whether this participant's own
   * getAll() and onChange() reflect the push before it resolves is up to the adapter.
   *
   * Adapters should let a participant write only their own data where the backend allows it.
   * The API doesn't rely on it, but it keeps one participant from changing another's.
   */
  push(data: Record<string, unknown>): Promise<void>;

  /**
   * Optional. The group's membership as the backend reports it. Omit it when the backend doesn't
   * form groups, e.g. when the researcher gives each group its own link.
   *
   * Report `sealed` only once the backend has confirmed that nobody new can join, and never go
   * back to false. Every member's connection must report the seal, not only the one that asked
   * for it, and once sealed `members` must stay the final roster, including members who drop out.
   */
  group?(): GroupState;

  /**
   * Optional. Ask the backend to stop letting new participants join this group. Resolves once the
   * backend confirms, after which group() reports `sealed`. Sealing an already sealed group
   * succeeds. Omit the method when the backend can't seal groups, rather than throwing.
   */
  sealGroup?(): Promise<void>;

  /** Close the channel cleanly. The API calls it once, and doesn't use the connection afterward. */
  disconnect(): Promise<void>;
}
