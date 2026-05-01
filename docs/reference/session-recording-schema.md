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
  stylesheet_events: StylesheetEvent[];
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
| `stylesheet_events` | Chronological log of `<head>` stylesheet changes that occurred after `start()`. See [Stylesheet events](#stylesheet-events). |
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

- `canvas_size`: present on `<canvas>` elements; carries `width`/`height` attributes at snapshot time. The pixel contents at any later moment are recorded as separate [`canvas.snapshot`](#canvas-snapshots) events keyed by node id.
- `media_src`: present on `<video>` and `<audio>` elements; carries `currentSrc` if available, falling back to the `src` attribute.

**What is not captured.**

- Audio/video media data. Only playback events (`media.play`, `media.pause`, etc.) and the source URL are recorded.
- Shadow DOM. jsPsych does not use it in core; recordings will not capture mutations inside shadow roots.
- CSSOM rule-level edits (`sheet.insertRule`, `deleteRule`, etc.) made on a captured stylesheet after `start()` without touching the owning element's children. These bypass `MutationObserver` and so are not reflected in [`stylesheet_events`](#stylesheet-events). Edits via `<style>.textContent = …` or `appendChild`/`removeChild` on the inner text node are tracked.
- Stylesheets attached to the document outside of `<head>` (e.g. a `<style>` placed in `<body>` outside the display element) after `start()`. The initial snapshot picks them up; subsequent changes are not tracked.

## Stylesheets

```ts
type StylesheetSnapshot =
  | { id: number; kind: "inline"; css: string;        media: string | null }
  | { id: number; kind: "link";   href: string; css: string | null; media: string | null };
```

`stylesheets` is the snapshot of every entry in `document.styleSheets` at session start. It exists so a replayer can re-apply the same CSS to the reconstructed DOM — `initial_dom` carries class hooks like `.jspsych-display-element`, and without the matching rules the replay would render unstyled.

| Field | Description |
| ----- | ----------- |
| `id` | Session-unique integer that subsequent [`stylesheet_events`](#stylesheet-events) reference when this sheet is later removed or its rule text changes. |
| `kind` | `"inline"` for `<style>` tags; `"link"` for `<link rel="stylesheet">`. |
| `css` | Resolved rule text (joined `cssRules.cssText`). `null` for `<link>` sheets when `cssRules` access throws (cross-origin sheets without CORS headers). |
| `href` | The link's resolved URL. Replayers can refetch the source from this URL when `css` is `null`. |
| `media` | The sheet's `media` attribute, or `null` if unset. |

**Replay guidance.** For each entry, inject a `<style>` element with the captured `css` text into the replayer's document head. When `css` is `null` for a `link` entry, fetch the stylesheet from `href` (or substitute a known-good copy of the same asset) and inject the result. Apply the `media` attribute on the injected element so media-conditional rules behave correctly. Track the injected element by `id` so [`stylesheet_events`](#stylesheet-events) can be applied later.

**Limitations.**

- Captured at `start()`. Later mutations to `<head>` stylesheets are tracked separately in [`stylesheet_events`](#stylesheet-events); changes elsewhere (e.g. a `<style>` placed in `<body>` outside the display element) are not.
- `@import` rules within a captured stylesheet are recorded as text. The imported sheet itself is not inlined; if the replayer's environment cannot resolve the import URL, those rules will not apply.
- Pseudo-classes (`:hover`, `:focus`) and media queries are recorded as part of the rule text but only take effect during replay if the replayer reproduces the corresponding state or viewport.

## Stylesheet events

```ts
type StylesheetEvent =
  | { type: "stylesheet.add";    t: number; sheet: StylesheetSnapshot }
  | { type: "stylesheet.remove"; t: number; id: number }
  | { type: "stylesheet.update"; t: number; id: number; css: string };
```

A chronological log of `<head>` stylesheet changes after `start()`. Plugins commonly inject `<style>` blocks into `<head>` mid-session (e.g. when a survey widget mounts); without this log a replayer would only have the start-of-session snapshot and would render those trials unstyled.

| Type | Field | Meaning |
| ---- | ----- | ------- |
| `stylesheet.add` | `sheet` | Full snapshot of the newly attached element, including a fresh `id`. |
| `stylesheet.remove` | `id` | Id of an entry from `stylesheets` or a prior `stylesheet.add`. The replayer should remove the corresponding injected element. |
| `stylesheet.update` | `id` | Id of a tracked `<style>` element. |
|                    | `css` | New resolved rule text. The replayer should overwrite the injected element's text content. |

**Scope.** The observer is rooted at `document.head`. Stylesheet changes inside the trial display element are already represented by the per-trial DOM mutation stream (`dom.add` / `dom.remove` / `dom.text`); they do not appear here. Changes to stylesheets elsewhere in `<body>` (outside the display element) after `start()` are not tracked.

**Update coalescing.** Multiple child mutations to a single `<style>` element delivered in the same observer batch produce one `stylesheet.update` event carrying the final rule text. Updates and adds across separate batches are recorded individually.

**Replay procedure.** Apply each entry in order:
1. `stylesheet.add` — inject a `<style>` (or `<link>`) matching `sheet.kind`, mirroring the start-of-session snapshot logic.
2. `stylesheet.remove` — find the previously-injected element by `id` and detach it.
3. `stylesheet.update` — overwrite the previously-injected element's text content with the new `css`.

## Event types

`events` and `viewport_changes` are arrays of one of the following discriminated unions.

```ts
type RecordedEvent =
  | DomMutation
  | InputRecord
  | ClipboardRecord
  | MediaRecord
  | FocusRecord
  | ScrollRecord
  | CanvasSnapshot;
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
    }
  | { type: "input.value";   t: number; node: number; value: string }
  | { type: "input.checked"; t: number; node: number; checked: boolean }
  | { type: "input.select";  t: number; node: number; values: string[] };
```

`mouse.move` is throttled to one record per animation frame, carrying the latest position. `target` is the id of the element under the event target if it is a tracked node within the trial's DOM, otherwise `null`.

#### Form-state events

The `MutationObserver` only sees the DOM `value` *attribute*; the IDL `value` property the browser writes when a participant types or toggles a control is invisible to it. The three form-state records carry the post-change state directly so a replayer can reconstitute survey responses without replaying keystrokes through a live form.

| Type | Fires on | Carries |
| ---- | -------- | ------- |
| `input.value` | `<input>` (text-like types) and `<textarea>` | `value`: the element's current `.value` |
| `input.checked` | `<input type="checkbox">` and `<input type="radio">` | `checked`: the element's current `.checked` |
| `input.select` | `<select>` (single and `multiple`) | `values`: the `value` of each currently-selected `<option>`, in DOM order |

`node` references the element's tracked id from the trial DOM (assigned in `initial_dom` or by a `dom.add` event).

`input.value` is throttled to one record per animation frame per element: rapid typing produces one event with the latest value rather than one per keystroke. Pending values are flushed at trial end so the final state is never lost. `input.checked` and `input.select` fire on `change` (i.e. user commits) and are not throttled.

Selecting a different `<input type="radio">` in a group emits a single `input.checked` event for the newly-checked button (`checked: true`); the implicitly-deselected button does not fire a `change` event and therefore produces no record. Replayers should set the chosen radio's `.checked = true` and rely on the browser to clear the rest of the group.

Not captured: `<input type="file">` (uploaded file contents can't be replayed), `contenteditable` regions (their value lives in `textContent` and is reflected by the per-trial DOM mutation stream), and programmatic value writes that don't dispatch an `input` or `change` event.

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

### Canvas snapshots

```ts
interface CanvasSnapshot {
  type: "canvas.snapshot";
  t: number;
  node: number;     // id of the <canvas> element
  data_url: string; // PNG data URL: "data:image/png;base64,…"
}
```

The `MutationObserver` cannot see drawing operations inside `<canvas>` (the pixels are not in the DOM tree). Without these events, replay reconstructs the element but renders it blank, so anything the participant drew (e.g. plugin-sketchpad strokes) would be invisible.

**Capture timing.** Snapshots are taken at three moments:

1. After a gesture release (`mouseup` or `touchend`) anywhere within the display element. The actual `toDataURL` call is deferred to the next animation frame so the page has finished painting the post-gesture state.
2. When a tracked canvas is removed from the DOM mid-trial (jsPsych core clears the display element via `innerHTML = ""` between trials, which would otherwise lose the final pixel state).
3. When a recording is stopped while a trial is in flight (`stop("aborted")` etc.).

**Throttling and dedupe.** Per-canvas, gesture-driven snapshots are throttled to one every 250 ms; removal- and stop-driven snapshots bypass the throttle so the final state always lands. Identical consecutive data URLs are skipped, so a canvas whose pixels did not change does not produce noise.

**Tainted canvases.** If a canvas drew cross-origin images without CORS headers, `toDataURL` throws `SecurityError`. The recorder catches this, skips the offending canvas, and continues — the recording is never broken by an unreadable canvas.

**Replay procedure.** Track each `<canvas>` you instantiate from `initial_dom` by node id. When a `canvas.snapshot` event arrives, decode `data_url` (e.g. into an `Image` whose `src` is the data URL) and `drawImage` it onto the canvas at `(0, 0)`. This overwrites whatever was there and brings the canvas to the recorded state.

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
