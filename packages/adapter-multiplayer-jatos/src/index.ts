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
    onMemberClose?: (memberId: string) => void;
    onMessage?: (msg: unknown) => void;
    onGroupSession?: () => void;
    onError?: (errMsg: string) => void;
    onClose?: () => void;
  }): void;
  /** Shared persistent key-value store for the group. */
  groupSession: {
    get(key: string): Record<string, unknown> | undefined;
    set(key: string, value: unknown): Promise<void>;
    getAll(): Record<string, unknown> | null;
  };
  sendGroupMsg(msg: unknown): void;
  /** Leave the joined group and close its channel. */
  leaveGroup(onSuccess?: () => void, onError?: (errMsg: string) => void): void;
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
          resolve();
        },
        onGroupSession: () => {
          const data = this.getAll();
          for (const cb of this.subscribers) {
            cb(data);
          }
        },
        onError: (errMsg) => {
          reject(new Error(`JatosAdapter: failed to join group — ${errMsg ?? "unknown error"}`));
        },
      });
    });
  }

  async push(data: Record<string, unknown>): Promise<void> {
    // JATOS group session uses optimistic concurrency: concurrent writes from
    // multiple participants cause version conflicts. Retry with exponential
    // backoff + jitter so the retries spread out and don't re-collide.
    // All rejections are retried, not just version conflicts — jatos.js does
    // not expose a typed error to filter on, and guessing at message strings
    // would risk failing fast on retryable conflicts. Worst case for a
    // non-retryable error is ~13s of backoff before it surfaces.
    const maxAttempts = 8;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await jatos.groupSession.set(this.participantId, data);
        return;
      } catch (e) {
        if (attempt === maxAttempts - 1) {
          throw new Error(
            "JatosAdapter: push failed after retries (likely a group session version conflict)",
            { cause: e }
          );
        }
        const delayMs = 50 * Math.pow(2, attempt) + Math.random() * 50;
        await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
      }
    }
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

  /**
   * Leave the JATOS group and stop notifying subscribers. Terminal: rejoining
   * after leaving would land this worker in a different group, so only call
   * once the multiplayer phase is fully over. Leaving explicitly frees the
   * participant's maxActiveMembers slot right away; participants who never
   * call disconnect() (or close the tab) are still cleaned up by JATOS's
   * automatic leave at the end of the study run.
   */
  disconnect(): Promise<void> {
    this.subscribers.clear();
    return new Promise((resolve) => {
      // Resolve even if leaving fails: JATOS auto-leaves at study end anyway,
      // and a failed leave must not wedge experiment teardown.
      jatos.leaveGroup(
        () => resolve(),
        (errMsg) => {
          console.error(`JatosAdapter: leaveGroup failed — ${errMsg}`);
          resolve();
        }
      );
    });
  }
}
