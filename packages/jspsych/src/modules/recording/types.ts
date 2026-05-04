// ---------------------------------------------------------------------------
// Schema types (schema_version: 1)
//
// These describe the public shape of `jsPsych.getSessionRecording()`.
// A replayer consumes them; the recorder emits them.
// ---------------------------------------------------------------------------

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface SessionRecording {
  schema_version: 1;
  jspsych_version: string;
  recording_started_at: string;
  recording_started_at_perf: number;
  user_agent: string;
  viewport: ViewportState;
  rng: { seed: string | null; math_random_patched: boolean };
  display_element_id: string;
  stylesheets: StylesheetSnapshot[];
  stylesheet_events: StylesheetEvent[];
  trials: TrialRecording[];
  viewport_changes: ViewportChange[];
  // Session-scoped (not per-trial) so RNG calls during pre-trial
  // parameter evaluation, between-trial gaps, and `on_finish` are
  // captured. Replayer consumes in order.
  rng_calls: RngCall[];
  ended_at_perf: number | null;
  end_reason: "finished" | "aborted" | "unload" | "memory_limit" | null;
}

// `inline` covers `<style>` tags; `link` covers `<link rel="stylesheet">`.
// `css` is the resolved rule text where readable; cross-origin sheets
// throw SecurityError on `cssRules` access, so for those `css` is null
// and a replayer can fetch the source out-of-band. `id` is unique within
// the session and shared with `stylesheet_events` so add/remove/update
// events can reference snapshots created at start.
export type StylesheetSnapshot =
  | { id: number; kind: "inline"; css: string; media: string | null }
  | { id: number; kind: "link"; href: string; css: string | null; media: string | null };

// `stylesheet.add` carries a full snapshot (with a newly-assigned `id`);
// `stylesheet.remove` and `stylesheet.update` reference an existing `id`
// from `stylesheets` or a prior `add` event.
export type StylesheetEvent =
  | { type: "stylesheet.add"; t: number; sheet: StylesheetSnapshot }
  | { type: "stylesheet.remove"; t: number; id: number }
  | { type: "stylesheet.update"; t: number; id: number; css: string };

export interface ViewportState {
  w: number;
  h: number;
  dpr: number;
  scale: number;
  offset_x: number;
  offset_y: number;
}

export interface ViewportChange extends ViewportState {
  t: number;
}

export interface TrialRecording {
  trial_index: number;
  t_start: number;
  t_dom_ready: number | null;
  t_end: number | null;
  plugin: string;
  initial_dom: DomNode | null;
  events: RecordedEvent[];
  trial_data: JsonValue;
}

export type DomNode = ElementNode | TextNode | CommentNode;

export interface ElementNode {
  id: number;
  kind: "element";
  tag: string;
  attrs: Record<string, string>;
  children: DomNode[];
  canvas_size?: { w: number; h: number };
  media_src?: string;
}

export interface TextNode {
  id: number;
  kind: "text";
  text: string;
}

export interface CommentNode {
  id: number;
  kind: "comment";
  text: string;
}

export type RecordedEvent =
  | DomMutation
  | InputRecord
  | ClipboardRecord
  | MediaRecord
  | FocusRecord
  | ScrollRecord
  | CanvasSnapshot;

export type DomMutation =
  | { type: "dom.add"; t: number; parent: number; before: number | null; node: DomNode }
  | { type: "dom.remove"; t: number; node: number }
  | { type: "dom.attr"; t: number; node: number; name: string; value: string | null }
  | { type: "dom.text"; t: number; node: number; text: string };

export type InputRecord =
  | { type: "mouse.move"; t: number; x: number; y: number }
  | {
      type: "mouse.down" | "mouse.up" | "mouse.click";
      t: number;
      x: number;
      y: number;
      button: number;
      target: number | null;
    }
  | {
      type: "touch.start" | "touch.move" | "touch.end";
      t: number;
      touches: { id: number; x: number; y: number }[];
    }
  | {
      type: "key.down" | "key.up";
      t: number;
      key: string;
      code: string;
      mods: { ctrl: boolean; shift: boolean; alt: boolean; meta: boolean };
      repeat: boolean;
      target: number | null;
    }
  // Form-state changes. The MutationObserver only sees the `value` *attribute*,
  // not the IDL property the browser writes when a participant types or
  // toggles a control. These records carry the post-change value/checked/
  // selection so a replayer can reconstitute survey responses without
  // having to replay keystrokes through a live form.
  | { type: "input.value"; t: number; node: number; value: string }
  | { type: "input.checked"; t: number; node: number; checked: boolean }
  | { type: "input.select"; t: number; node: number; values: string[] };

export interface ClipboardRecord {
  type: "clipboard.copy" | "clipboard.cut" | "clipboard.paste";
  t: number;
  text: string | null;
  html: string | null;
  target: number | null;
}

export type MediaRecord = {
  type: "media.play" | "media.pause" | "media.ended" | "media.seeked" | "media.time";
  t: number;
  node: number;
  current_time: number;
};

export interface FocusRecord {
  type: "focus" | "blur" | "fullscreen.enter" | "fullscreen.exit";
  t: number;
}

export type ScrollRecord =
  | { type: "scroll.window"; t: number; x: number; y: number }
  | { type: "scroll.element"; t: number; node: number; x: number; y: number };

// PNG data URL of `<canvas>` pixel state. MutationObserver can't see
// drawing operations, so the replayer needs these to reconstruct
// anything participants draw. `region` distinguishes a full-canvas
// baseline (omitted: drawn at 0,0 after clearing) from an incremental
// patch (present: composited at region.x,y). First snapshot per canvas
// is always full; partials only when dirty area < 80% of canvas.
export interface CanvasSnapshot {
  type: "canvas.snapshot";
  t: number;
  node: number;
  data_url: string;
  region?: { x: number; y: number; w: number; h: number };
}

export interface RngCall {
  t: number;
  fn: string;
  args: JsonValue;
  result: JsonValue;
}
