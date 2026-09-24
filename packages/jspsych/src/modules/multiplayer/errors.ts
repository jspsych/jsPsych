// Callers checking across separately-bundled packages should match on
// `error.name` rather than instanceof, which fails if two copies of jspsych
// are loaded.

/** wait() rejects with this when its timeout elapses before the condition is met. */
export class MultiplayerTimeoutError extends Error {
  constructor(timeout: number) {
    super(`MultiplayerAPI.wait() timed out after ${timeout}ms`);
    this.name = "MultiplayerTimeoutError";
  }
}

/**
 * An operation was cancelled on purpose: a wait() by its signal,
 * cancelAllSubscriptions(), disconnect(), or the experiment ending, or a
 * connect() by its signal or disconnect().
 */
export class MultiplayerCancelledError extends Error {
  constructor(message = "MultiplayerAPI.wait() was cancelled before its condition was met") {
    super(message);
    this.name = "MultiplayerCancelledError";
  }
}

/** wait() rejects with this when a participant it depends on leaves the session. */
export class MultiplayerParticipantLeftError extends Error {
  constructor(readonly participantId: string) {
    super(`MultiplayerAPI.wait() failed because participant ${participantId} left the session`);
    this.name = "MultiplayerParticipantLeftError";
  }
}

/** Pending waits and writes reject with this when the connection is lost for good. */
export class MultiplayerConnectionClosedError extends Error {
  constructor() {
    super("MultiplayerAPI: the connection to the multiplayer backend was lost");
    this.name = "MultiplayerConnectionClosedError";
  }
}
