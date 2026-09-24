/** Group session snapshot keyed by participantId, then by data key. */
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
 * - `left`: gone for good. A participant who reaches `left` stays `left`.
 */
export type PresenceStatus = "connected" | "away" | "left";

/** Presence of every participant seen in the session, keyed by participantId. */
export type PresenceData = Record<string, PresenceStatus>;

/**
 * How the group's membership stands.
 * - `size`: the most participants the group can hold, or null when the backend
 *   doesn't say.
 * - `members`: the participants assigned to the group, including this one.
 *   Once the group is sealed, this is the final roster: a member who drops out
 *   stays on it, and nobody is added.
 * - `sealed`: true once nobody new can join. Before that, a member who leaves
 *   frees their place for someone new; after it, they count as a dropout. A
 *   sealed group never becomes unsealed.
 */
export interface GroupState {
  size: number | null;
  members: string[];
  sealed: boolean;
}

/** What the MultiplayerAPI passes to MultiplayerAdapter.connect(). */
export interface AdapterConnectOptions {
  /**
   * Aborted when the caller cancels the connection attempt. The adapter should
   * stop connecting, release anything it opened, and then reject.
   */
  signal: AbortSignal;

  /**
   * Call whenever the connection's getAll(), connectedParticipants(), or
   * group() may have changed. The API re-reads them all, so extra calls are
   * harmless.
   */
  onChange(): void;

  /**
   * Call when this client's own channel drops (`reconnecting`), recovers
   * (`connected`), or is lost for good (`closed`).
   */
  onStatus(status: ConnectionStatus): void;
}

/**
 * Contract that any multiplayer network backend must implement. An adapter
 * holds configuration only; each connect() call opens a new, independent
 * MultiplayerConnection. Plugin authors code against the MultiplayerAPI and
 * never touch the adapter directly.
 */
export interface MultiplayerAdapter {
  /**
   * Open the communication channel and establish group membership. The
   * backend, not the client, decides which group an arriving participant
   * joins, so two participants who arrive together can't both take the last
   * place. connect() resolves once this participant has a group.
   */
  connect(options: AdapterConnectOptions): Promise<MultiplayerConnection>;
}

/** One open channel to the backend, returned by MultiplayerAdapter.connect(). */
export interface MultiplayerConnection {
  /** Stable identifier for this participant within the group session namespace. */
  readonly participantId: string;

  /**
   * Identifies the group session. Every participant in the group gets the same
   * non-empty value, it stays the same across reconnects and reloads, and a
   * different group gets a different value. The API seeds shared randomness
   * with it.
   */
  readonly sessionId: string;

  /** Read the full current group session (all participants). Return `{}` when empty. */
  getAll(): GroupSessionData;

  /**
   * IDs of the participants whose channels are currently open. May include
   * this participant's own ID.
   */
  connectedParticipants(): string[];

  /**
   * Write this participant's data into the shared group session, replacing the
   * previous data. Resolves when the backend confirms the write. The API sends
   * one push at a time and passes an object it owns; treat it as read-only.
   */
  push(data: Record<string, unknown>): Promise<void>;

  /**
   * Optional. The group's membership as the backend reports it. Omit it when
   * the backend doesn't form groups, e.g. when the researcher gives each group
   * its own link. Report `sealed` only once the backend has confirmed that
   * nobody new can join, and never go back to false.
   */
  group?(): GroupState;

  /**
   * Optional. Ask the backend to stop letting new participants join this
   * group. Resolves once the backend confirms. Sealing an already sealed group
   * succeeds. Omit it when the backend can't seal groups.
   */
  sealGroup?(): Promise<void>;

  /** Close the channel cleanly. The connection is not used afterward. */
  disconnect(): Promise<void>;
}
