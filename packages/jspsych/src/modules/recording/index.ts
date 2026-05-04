// Public surface for the session-recording module. The implementation is
// split across sibling files; consumers (and re-exports from the package
// entry) should import from this barrel.

export type {
  CanvasSnapshot,
  ClipboardRecord,
  CommentNode,
  DomMutation,
  DomNode,
  ElementNode,
  FocusRecord,
  InputRecord,
  JsonValue,
  MediaRecord,
  RecordedEvent,
  RngCall,
  ScrollRecord,
  SessionRecording,
  StylesheetEvent,
  StylesheetSnapshot,
  TextNode,
  TrialRecording,
  ViewportChange,
  ViewportState,
} from "./types";
export type { RecordSessionOptions } from "./options";
export { resolveRecordSessionOptions } from "./options";
export { SessionRecorder } from "./SessionRecorder";
export type { SessionRecorderOptions } from "./SessionRecorder";
// Re-exported for unit tests in this repo; a replayer doesn't need them.
export { computeDiffBbox, serializeJson } from "./helpers";
