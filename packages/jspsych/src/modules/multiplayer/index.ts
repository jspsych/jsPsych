import autoBind from "auto-bind";

import { MultiplayerCancelledError } from "./errors";
import {
  MultiplayerSession,
  SessionIdentity,
  SessionListener,
  SessionOptions,
  SubscribeOptions,
  WaitOptions,
} from "./session";
import {
  ConnectionStatus,
  GroupSessionData,
  MultiplayerAdapter,
  PresenceData,
  Unsubscribe,
} from "./types";

export * from "./errors";
export * from "./types";
export { DEFAULT_DROPOUT_TIMEOUT, MultiplayerSession, RESERVED_KEY } from "./session";
export type { SessionListener, SubscribeOptions, WaitOptions } from "./session";

export interface ConnectOptions extends SessionOptions {
  /**
   * Aborting this signal cancels a connect() that is still pending. connect()
   * then rejects with a MultiplayerCancelledError once the adapter has closed
   * anything it opened.
   */
  signal?: AbortSignal;
}

interface ConnectAttempt {
  controller: AbortController;
  attempt: Promise<MultiplayerSession>;
}

/**
 * jsPsych.multiplayer: opens sessions and forwards every other method to the
 * current one, so plugins can call jsPsych.multiplayer.update() and so on
 * without holding a session themselves.
 */
export class MultiplayerAPI {
  private current: MultiplayerSession | null = null;
  private connecting: ConnectAttempt | null = null;

  /**
   * This page load's identity, shared by every session opened from it, so the
   * group can tell a reconnect of this page from a reload.
   */
  private readonly identity: SessionIdentity = {
    instance: Math.random().toString(36).slice(2) + Date.now().toString(36),
    epoch: 0,
  };

  constructor() {
    autoBind(this);
  }

  /** The current session. Null until connect() resolves and after disconnect(). */
  get session(): MultiplayerSession | null {
    return this.current;
  }

  /** This participant's ID within the group. Null until connect() resolves and after disconnect(). */
  get participantId(): string | null {
    return this.current?.participantId ?? null;
  }

  /**
   * Set when this participant's slot came from an earlier page load: they
   * reloaded or reopened the study, so the group is ahead of them. Null
   * otherwise, and when there is no session.
   */
  get previousInstance(): string | null {
    return this.current?.previousInstance ?? null;
  }

  /** The current session's connection status, or null when there is no session. */
  get status(): ConnectionStatus | null {
    return this.current?.status ?? null;
  }

  private requireSession(): MultiplayerSession {
    if (!this.current) {
      throw new Error(
        "MultiplayerAPI: connect() must be called with an adapter before using multiplayer methods."
      );
    }
    return this.current;
  }

  /**
   * Open a session with a backend adapter and make it the current session.
   * Must be called (and awaited) before jsPsych.run() and before any other
   * multiplayer method. Rejects if a session is already open or connecting;
   * a session whose connection was lost can be replaced.
   */
  async connect(
    adapter: MultiplayerAdapter,
    options: ConnectOptions = {}
  ): Promise<MultiplayerSession> {
    if (this.connecting || (this.current && this.current.status !== "closed")) {
      throw new Error(
        "MultiplayerAPI: connect() has already been called. " +
          "Call disconnect() first before connecting again."
      );
    }

    const { signal, ...sessionOptions } = options;
    const controller = new AbortController();
    const abort = () => controller.abort();
    if (signal?.aborted) {
      abort();
    } else {
      signal?.addEventListener("abort", abort, { once: true });
    }

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
        throw new MultiplayerCancelledError(
          "MultiplayerAPI: connect() was cancelled before it finished."
        );
      }
      this.current = session;
      return session;
    } finally {
      signal?.removeEventListener("abort", abort);
      if (this.connecting === connecting) {
        this.connecting = null;
      }
    }
  }

  /**
   * Close the current session, or cancel a connect() that is still pending.
   * Resolves once the adapter has closed the connection.
   */
  async disconnect(): Promise<void> {
    const connecting = this.connecting;
    const session = this.current;
    // Detach first so a rejecting adapter can't leave the API stuck connected
    this.connecting = null;
    this.current = null;

    if (connecting) {
      connecting.controller.abort();
      const abandoned = await connecting.attempt.catch((): null => null);
      await abandoned?.disconnect().catch((e) => {
        console.error("MultiplayerAPI: adapter disconnect threw", e);
      });
    }
    await session?.disconnect();
  }

  /** Replace this participant's data in the shared group session. */
  async push(data: Record<string, unknown>): Promise<void> {
    return this.requireSession().push(data);
  }

  /** Shallow-merge data into this participant's data in the shared group session. */
  async update(data: Record<string, unknown>): Promise<void> {
    return this.requireSession().update(data);
  }

  /** The full group session. Frozen; don't modify it. */
  getAll(): GroupSessionData {
    return this.requireSession().getAll();
  }

  /** One participant's data, or undefined if they haven't written any. Frozen. */
  get(participantId: string): Record<string, unknown> | undefined {
    return this.requireSession().get(participantId);
  }

  /** The presence status of every participant seen in the session. Frozen. */
  presence(): PresenceData {
    return this.requireSession().presence();
  }

  /** Call `callback` now and after every change to the group session or presence. */
  subscribe(callback: SessionListener, options?: SubscribeOptions): Unsubscribe {
    return this.requireSession().subscribe(callback, options);
  }

  /** Resolve with the group session once `condition` returns true. */
  async wait(
    condition: (data: GroupSessionData, presence: PresenceData) => boolean,
    options?: WaitOptions
  ): Promise<GroupSessionData> {
    return this.requireSession().wait(condition, options);
  }

  /**
   * Remove every subscription on the current session and reject its pending
   * waits with a MultiplayerCancelledError. jsPsych calls this when the
   * experiment finishes or is aborted.
   */
  cancelAllSubscriptions(): void {
    this.current?.cancelAllSubscriptions();
  }
}
