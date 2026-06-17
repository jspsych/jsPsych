import { GroupSessionData, MultiplayerAdapter, Unsubscribe } from "jspsych";

/**
 * Minimal ambient types for the jatos global injected by jatos.js.
 * Only the subset used by this adapter is declared here.
 */
declare const jatos: {
  /** Worker ID assigned by JATOS — used as the per-participant namespace key. */
  workerId: string | number;
  /** Join a group study and open the WebSocket channel. */
  joinGroup(callbacks: {
    onOpen?: () => void;
    onMemberOpen?: (memberId: string) => void;
    onMessage?: (msg: unknown) => void;
    onError?: (errMsg: string) => void;
    onClose?: () => void;
  }): void;
  /** Shared persistent key-value store for the group. */
  groupSession: {
    get(key: string): Record<string, unknown> | undefined;
    set(key: string, value: unknown): Promise<void>;
    getAll(): Record<string, unknown> | null;
  };
  /**
   * Register a callback that fires whenever the group session changes.
   * Passing null clears the handler.
   */
  onGroupSession(callback: (() => void) | null): void;
  sendGroupMsg(msg: unknown): void;
  onError(callback: (errMsg: string) => void): void;
};

/**
 * Multiplayer adapter backed by JATOS group studies.
 *
 * Usage:
 *   const jsPsych = initJsPsych({ ... });
 *   await jsPsych.pluginAPI.connect(new JatosAdapter());
 *   await jsPsych.run(timeline);
 *
 * Each participant's pushed data is stored under groupSession[workerId],
 * so keys never collide across participants.
 */
export default class JatosAdapter implements MultiplayerAdapter {
  readonly participantId: string;

  /**
   * Local fan-out list. jatos.onGroupSession accepts only a single callback,
   * so the adapter registers one dispatcher and routes it to all subscribers.
   */
  private subscribers = new Set<(data: GroupSessionData) => void>();

  constructor() {
    if (typeof jatos === "undefined") {
      throw new Error(
        "JatosAdapter: the jatos global is not defined. " +
          "Ensure jatos.js is loaded before creating a JatosAdapter. " +
          "This adapter only works when the experiment is running inside JATOS."
      );
    }
    this.participantId = String(jatos.workerId);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      jatos.joinGroup({
        onOpen: () => {
          // Wire the single JATOS handler to fan out to all local subscribers
          jatos.onGroupSession(() => {
            const data = this.getAll();
            for (const cb of this.subscribers) {
              cb(data);
            }
          });
          resolve();
        },
        onError: (errMsg) => {
          reject(new Error(`JatosAdapter: failed to join group — ${errMsg ?? "unknown error"}`));
        },
      });
    });
  }

  push(data: Record<string, unknown>): Promise<void> {
    return jatos.groupSession.set(this.participantId, data);
  }

  getAll(): GroupSessionData {
    return (jatos.groupSession.getAll() ?? {}) as GroupSessionData;
  }

  get(participantId: string): Record<string, unknown> | undefined {
    return jatos.groupSession.get(participantId);
  }

  subscribe(callback: (data: GroupSessionData) => void): Unsubscribe {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  disconnect(): Promise<void> {
    this.subscribers.clear();
    // Clear the JATOS group session handler to prevent stale callbacks
    jatos.onGroupSession(null);
    return Promise.resolve();
  }
}
