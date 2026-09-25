/**
 * Why a multiplayer operation failed.
 * - `timeout`: a wait() or connect() ran out of time.
 * - `cancelled`: the operation was cancelled on purpose: by its signal, by disconnect(), or
 *   because its trial or the experiment ended.
 * - `participant_left`: a participant the wait depended on left the session.
 * - `connection_lost`: this participant's connection was lost for good.
 * - `not_connected`: there is no open session to use.
 * - `unsupported`: the adapter can't do what was asked, e.g. seal a group.
 */
export type MultiplayerErrorCode =
  | "timeout"
  | "cancelled"
  | "participant_left"
  | "connection_lost"
  | "not_connected"
  | "unsupported";

/**
 * Every error the multiplayer API raises on its own account; `code` says why. Invalid arguments
 * throw a TypeError or RangeError instead.
 *
 * Code checking errors from separately bundled packages should compare `error.name` to
 * "MultiplayerError" rather than use instanceof, which fails if two copies of jspsych are loaded.
 */
export class MultiplayerError extends Error {
  readonly code: MultiplayerErrorCode;

  /** With `participant_left`, the participant who left. */
  readonly participantId?: string;

  constructor(code: MultiplayerErrorCode, message: string, participantId?: string) {
    super(`MultiplayerAPI: ${message}`);
    this.name = "MultiplayerError";
    this.code = code;
    if (participantId !== undefined) {
      this.participantId = participantId;
    }
  }
}
