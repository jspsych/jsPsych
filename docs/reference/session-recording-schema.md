# Session Recording Schema

When `initJsPsych` is called with `record_session: true`, jsPsych captures a session recording sufficient to reconstruct a visual replay of the participant's experience. This page documents the JSON-serializable shape returned by `jsPsych.getSessionRecording()`.

The schema is versioned. Schemas with the same major version are read-compatible; consumers should branch on `schema_version` and reject anything they don't understand.

**Current version: `1`.**

## Replayer model

A replayer treats this recording as observational. It does not re-execute trial code. The replay is reconstructed from three things:

1. The DOM snapshot captured at each trial's `on_load` (`trial.initial_dom`).
2. The chronological mutation and input event log scoped to that trial (`trial.events`).
3. The session-level stylesheet snapshot (`stylesheets`) so the reconstructed DOM is styled identically to the original.
4. Session-level metadata for context (viewport, scroll, RNG outputs, focus/blur, fullscreen).

Each trial is a self-contained replay unit because jsPsych wipes the display element between trials.

## Top-level shape

```ts
interface SessionRecording {
  schema_version: 1;
  jspsych_version: string;
  recording_started_at: string;       // ISO 8601 wall-clock anchor
  recording_started_at_perf: number;  // performance.now() at start
  user_agent: string;
  viewport: ViewportState;
  rng: { seed: string | null; math_random_patched: boolean };
  display_element_id: string;
  stylesheets: StylesheetSnapshot[];
  trials: TrialRecording[];
  viewport_changes: ViewportChange[];
  rng_calls: RngCall[];
  ended_at_perf: number | null;
  end_reason: "finished" | "aborted" | "unload" | null;
}
```

| Field | Description |
| ----- | ----------- |
| `schema_version` | Always `1` for recordings produced by this codebase. |
| `jspsych_version` | The jsPsych package version that produced the recording. |
| `recording_started_at` | ISO 8601 timestamp of when `start()` was called. |
| `recording_started_at_perf` | The `performance.now()` value at recording start. All event `t` values are relative to this. |
| `user_agent` | `navigator.userAgent` at recording start. |
| `viewport` | The initial viewport state. See [`ViewportState`](#viewportstate). |
| `rng.seed` | The seed installed via `jsPsych.randomization.setSeed` for the session, or `null` if `Math.random` was already non-native at recording start. |
| `rng.math_random_patched` | `true` while recording is active; `Math.random` is wrapped to log every call into `rng_calls`. |
| `display_element_id` | The `id` attribute of the display element (`#jspsych-content` by default). |
| `stylesheets` | Snapshot of every stylesheet attached to the document at session start. See [Stylesheets](#stylesheets). |
| `trials` | Per-trial recordings, in chronological order. See [`TrialRecording`](#trialrecording). |
| `viewport_changes` | Session-level log of viewport changes (window resize, page zoom, pinch zoom, pinch pan). |
| `rng_calls` | Chronological log of every `Math.random` output. Includes calls outside trial boundaries (parameter eval, ITI, `on_finish`). |
| `ended_at_perf` | The `performance.now()` at `stop()`. |
| `end_reason` | How the session ended. `"aborted"` when `abortExperiment()` was called. |

All `t` fields elsewhere in the document are floats in milliseconds, relative to `recording_started_at_perf` (i.e. `performance.now() - recording_started_at_perf`).

## TrialRecording

```ts
interface TrialRecording {
  trial_index: number;
  t_start: number;
  t_dom_ready: number | null;
  t_end: number | null;
  plugin: string;
  initial_dom: DomNode | null;
  events: RecordedEvent[];
  trial_data: JsonValue;
}
```

| Field | Description |
| ----- | ----------- |
| `trial_index` | The jsPsych trial index. Matches `trial_data.trial_index` and the row in `data.csv`. |
| `t_start` | When the trial entered `onTrialStart` (before parameter evaluation completes). |
| `t_dom_ready` | When the plugin's initial render completed (`on_load` fired). `initial_dom` was sampled at this moment. `null` if a recording was stopped before this point. |
| `t_end` | When the trial ended. `null` if the recording was stopped before the trial finished. |
| `plugin` | The plugin name (e.g. `"html-keyboard-response"`). For labeling and filtering only; replay does not depend on it. |
| `initial_dom` | The DOM subtree of the display element at `t_dom_ready`. See [DOM representation](#dom-representation). |
| `events` | Chronological log of mutations and input events from `t_dom_ready` to `t_end`. Empty arrays are valid. |
| `trial_data` | The data row written to `jsPsych.data` for this trial (the same object exported via `data.csv` / `data.json`). Includes `rt`, `response`, `trial_type`, `trial_index`, etc. |

### Replay procedure for a single trial

1. Clear the display element.
2. Instantiate `initial_dom` into the display element.
3. Apply each entry in `events` at its `t`, in order.

## DOM representation

```ts
type DomNode = ElementNode | TextNode | CommentNode;

interface ElementNode {
  id: number;
  kind: "element";
  tag: string;                       // lowercased tag name
  attrs: Record<string, string>;
  children: DomNode[];
  canvas_size?: { w: number; h: number };
  media_src?: string;
}

interface TextNode    { id: number; kind: "text";    text: string; }
interface CommentNode { id: number; kind: "comment"; text: string; }
```

Every node in `initial_dom` is assigned a monotonically-increasing integer `id`. Mutation events reference these ids. New nodes added later (via `dom.add`) carry their own id and may have child nodes that recursively carry ids of their own.

**Per-trial scope.** Node ids are reset at every `t_dom_ready`. Ids in `trials[i]` have no relationship to ids in `trials[j]`.

**Element-specific extras.**

- `canvas_size`: present on `<canvas>` elements; carries `width`/`height` attributes at snapshot time. Note that the *contents* of a canvas (the rendered pixels) are not captured.
- `media_src`: present on `<video>` and `<audio>` elements; carries `currentSrc` if available, falling back to the `src` attribute.

**What is not captured.**

- Canvas/WebGL pixel content. Only the element and its dimensions are recorded.
- Audio/video media data. Only playback events (`media.play`, `media.pause`, etc.) and the source URL are recorded.
- Shadow DOM. jsPsych does not use it in core; recordings will not capture mutations inside shadow roots.
- Stylesheet additions, removals, or rule mutations that occur after `start()`. The session-level [stylesheets](#stylesheets) snapshot is taken once at session start; it is not updated when later trials inject `<style>` tags or modify rules at runtime.

## Stylesheets

```ts
type StylesheetSnapshot =
  | { kind: "inline"; css: string;        media: string | null }
  | { kind: "link";   href: string; css: string | null; media: string | null };
```

`stylesheets` is the snapshot of every entry in `document.styleSheets` at session start. It exists so a replayer can re-apply the same CSS to the reconstructed DOM — `initial_dom` carries class hooks like `.jspsych-display-element`, and without the matching rules the replay would render unstyled.

| Field | Description |
| ----- | ----------- |
| `kind` | `"inline"` for `<style>` tags; `"link"` for `<link rel="stylesheet">`. |
| `css` | Resolved rule text (joined `cssRules.cssText`). `null` for `<link>` sheets when `cssRules` access throws (cross-origin sheets without CORS headers). |
| `href` | The link's resolved URL. Replayers can refetch the source from this URL when `css` is `null`. |
| `media` | The sheet's `media` attribute, or `null` if unset. |

**Replay guidance.** For each entry, inject a `<style>` element with the captured `css` text into the replayer's document head. When `css` is `null` for a `link` entry, fetch the stylesheet from `href` (or substitute a known-good copy of the same asset) and inject the result. Apply the `media` attribute on the injected element so media-conditional rules behave correctly.

**Limitations.**

- Snapshot is taken once at `start()`. Later mutations to the document's stylesheets — additions, removals, or `CSSOM` rule edits — are not tracked.
- `@import` rules within a captured stylesheet are recorded as text. The imported sheet itself is not inlined; if the replayer's environment cannot resolve the import URL, those rules will not apply.
- Pseudo-classes (`:hover`, `:focus`) and media queries are recorded as part of the rule text but only take effect during replay if the replayer reproduces the corresponding state or viewport.

## Event types

`events` and `viewport_changes` are arrays of one of the following discriminated unions.

```ts
type RecordedEvent =
  | DomMutation
  | InputRecord
  | ClipboardRecord
  | MediaRecord
  | FocusRecord
  | ScrollRecord;
```

### DOM mutations

```ts
type DomMutation =
  | { type: "dom.add";    t: number; parent: number; before: number | null; node: DomNode }
  | { type: "dom.remove"; t: number; node: number }
  | { type: "dom.attr";   t: number; node: number; name: string; value: string | null }
  | { type: "dom.text";   t: number; node: number; text: string };
```

| Type | Field | Meaning |
| ---- | ----- | ------- |
| `dom.add` | `parent` | Id of the parent element. |
|          | `before` | Id of the next sibling, or `null` to append at end. |
|          | `node` | Full subtree of the added node, with ids assigned. |
| `dom.remove` | `node` | Id of the removed node. The node's children are also released. |
| `dom.attr` | `node` | Id of the element. |
|           | `name` | Attribute name. |
|           | `value` | New value, or `null` if the attribute was removed. |
| `dom.text` | `node` | Id of the text/comment node. |
|           | `text` | New text content. |

### Input events

```ts
type InputRecord =
  | { type: "mouse.move"; t: number; x: number; y: number }
  | {
      type: "mouse.down" | "mouse.up" | "mouse.click";
      t: number; x: number; y: number; button: number; target: number | null;
    }
  | {
      type: "touch.start" | "touch.move" | "touch.end";
      t: number; touches: { id: number; x: number; y: number }[];
    }
  | {
      type: "key.down" | "key.up";
      t: number; key: string; code: string;
      mods: { ctrl: boolean; shift: boolean; alt: boolean; meta: boolean };
      repeat: boolean; target: number | null;
    };
```

`mouse.move` is throttled to one record per animation frame, carrying the latest position. `target` is the id of the element under the event target if it is a tracked node within the trial's DOM, otherwise `null`.

### Clipboard events

```ts
interface ClipboardRecord {
  type: "clipboard.copy" | "clipboard.cut" | "clipboard.paste";
  t: number;
  text: string | null;
  html: string | null;
  target: number | null;
}
```

`text` and `html` carry the `text/plain` and `text/html` representations from the `ClipboardEvent.clipboardData` payload. Either may be `null` if the corresponding type isn't present or access is denied.

### Media events

```ts
type MediaRecord = {
  type: "media.play" | "media.pause" | "media.ended" | "media.seeked" | "media.time";
  t: number;
  node: number;          // id of the <video>/<audio> element
  current_time: number;  // element.currentTime, in seconds
};
```

`media.time` records throttled `timeupdate` events at roughly 4 Hz and is intended for replay scrubbing rather than exact synchronization.

### Focus events

```ts
interface FocusRecord {
  type: "focus" | "blur" | "fullscreen.enter" | "fullscreen.exit";
  t: number;
}
```

Window-level focus state. `focus`/`blur` track participant attention (e.g. switching tabs); `fullscreen.enter`/`fullscreen.exit` track whether the browser is in fullscreen mode.

### Scroll events

```ts
type ScrollRecord =
  | { type: "scroll.window";  t: number; x: number; y: number }
  | { type: "scroll.element"; t: number; node: number; x: number; y: number };
```

`scroll.window` carries `window.scrollX`/`scrollY`. `scroll.element` carries the element's `scrollLeft`/`scrollTop`, keyed by tracked node id. Both are throttled to one record per animation frame per target.

## Viewport state

```ts
interface ViewportState {
  w: number;             // window.innerWidth
  h: number;             // window.innerHeight
  dpr: number;           // window.devicePixelRatio
  scale: number;         // visualViewport.scale (pinch zoom; 1.0 = none)
  offset_x: number;      // visualViewport.offsetLeft (pinch pan)
  offset_y: number;      // visualViewport.offsetTop
}

interface ViewportChange extends ViewportState { t: number }
```

The top-level `viewport` carries the initial state. `viewport_changes` is an append-only log of changes (debounced at ~100ms trailing edge) covering window resize, page zoom (`Ctrl+/Ctrl-`), pinch zoom, and pinch pan.

To find the active viewport at any time `t`, take the last entry in `viewport_changes` with `entry.t <= t`, or fall back to the top-level `viewport` if there is none.

## RNG calls

```ts
interface RngCall {
  t: number;
  fn: string;            // currently always "Math.random"
  args: JsonValue;       // currently always []
  result: JsonValue;     // the number that was returned
}
```

While recording, `Math.random` is wrapped so every call is logged into the session-level `rng_calls` array, in the order it was consumed. This includes calls made:

- During trial parameter evaluation (before `t_start`).
- During trial execution (between `t_start` and `t_end`).
- During the post-trial gap.
- During the experimenter's session-level `on_finish` callback.

For deterministic re-execution, a replayer can patch `Math.random` to return `rng_calls[cursor++].result` and let trial code re-consume the tape in order.

## End reasons

| Value | Meaning |
| ----- | ------- |
| `"finished"` | The experiment ran to completion. |
| `"aborted"` | `jsPsych.abortExperiment()` was called. |
| `"unload"` | Reserved for future use; not currently emitted by core. |
| `null` | The recording is still active or was retrieved before `stop()` ran. |

## Privacy considerations

- **Text input is captured verbatim.** Any text typed into form fields, including in survey plugins, appears in the DOM mutation log. Inform participants accordingly when enabling `record_session`.
- **Clipboard payloads are recorded.** Content the participant copies, cuts, or pastes within the experiment is preserved.
- **Math.random is wrapped while recording is active.** The wrapper is removed when the experiment ends. User code that calls `Math.random` will have its outputs in `rng_calls`.

## Backward compatibility

`schema_version: 1` is the contract for v1 recorders. Additive fields (new event types, new optional fields on existing types) may be introduced in future minor revisions without bumping the major version. Replayers should ignore unrecognized event `type` values rather than failing.
