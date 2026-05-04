import * as randomization from "./randomization";

// ---------------------------------------------------------------------------
// Schema types (schema_version: 1)
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
  end_reason: "finished" | "aborted" | "unload" | null;
}

// A snapshot of one stylesheet attached to the document. `inline` covers
// `<style>` tags; `link` covers `<link rel="stylesheet">`. `css` is the
// resolved rule text where readable; cross-origin sheets throw SecurityError
// on `cssRules` access, so for those we record `href` only and leave `css`
// null so a replayer can fetch the source out-of-band. `id` is unique within
// the session and shared with `stylesheet_events` so add/remove/update
// events can reference snapshots created at start.
export type StylesheetSnapshot =
  | { id: number; kind: "inline"; css: string; media: string | null }
  | { id: number; kind: "link"; href: string; css: string | null; media: string | null };

// Session-scope log entries for `<head>` stylesheet changes after start.
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

// ---------------------------------------------------------------------------
// SessionRecorder
// ---------------------------------------------------------------------------

const SCHEMA_VERSION = 1;
const VIEWPORT_DEBOUNCE_MS = 100;
const MEDIA_TIME_THROTTLE_MS = 250;
// Hoisted to avoid allocating a fresh empty array on every Math.random
// call; the rng_calls log can grow into the millions for a long
// randomization-heavy session.
const RNG_NO_ARGS: JsonValue[] = [];
// Events listened on `<video>` / `<audio>` while a trial is active.
// Listed once so attach/detach iterate the same set without drift.
const MEDIA_EVENTS = ["play", "pause", "ended", "seeked", "timeupdate"] as const;
// Per-canvas minimum gap between gesture-driven snapshots. Bounds the
// `toDataURL` cost for users who rapidly click/release; trial-end
// captures bypass this so the final state always lands.
const CANVAS_SNAPSHOT_MIN_INTERVAL_MS = 250;
// When the changed bounding box covers more than this fraction of the
// canvas, fall back to a full snapshot. Cropping a near-full region
// pays the `getImageData` + `drawImage` + `toDataURL` cost of a full
// snapshot anyway, so the partial-snapshot bookkeeping is wasted.
const CANVAS_FULL_SNAPSHOT_AREA_FRACTION = 0.8;
// Per-canvas minimum gap between draw-triggered animation snapshots.
// Distinct from `CANVAS_SNAPSHOT_MIN_INTERVAL_MS`, which throttles the
// gesture-driven path. ~15 Hz is enough fidelity for replaying typical
// canvas animations without producing 60 PNGs/sec for a continuously-
// repainting stimulus.
const CANVAS_ANIMATION_MIN_INTERVAL_MS = 66;
// Pixel-mutating methods on `CanvasRenderingContext2D`. Path-state
// methods (`beginPath`, `moveTo`, `lineTo`, …) are intentionally
// omitted: they don't change pixels until `fill` or `stroke` is called.
const CANVAS_DRAW_METHODS = [
  "clearRect",
  "fillRect",
  "strokeRect",
  "fill",
  "stroke",
  "fillText",
  "strokeText",
  "drawImage",
  "putImageData",
] as const;

// Per-canvas snapshot bookkeeping. All fields are optional because they
// fill in lazily as the canvas first emits, throttles, or animates.
interface CanvasState {
  // Last full-canvas data URL. Used to dedupe byte-identical
  // re-snapshots from the gesture/forced paths.
  lastSnapshot?: string;
  // Last time any snapshot was emitted for this canvas. Drives the
  // gesture-path throttle (`CANVAS_SNAPSHOT_MIN_INTERVAL_MS`).
  lastSnapshotTime?: number;
  // Last full-canvas pixel buffer; the next snapshot diffs against
  // this to find the changed bounding box. Absent for canvases
  // without a readable 2d context (WebGL); those always emit full
  // snapshots.
  shadowData?: ImageData;
  // Last time the draw-detection animation path emitted, throttled
  // independently of the gesture path via `CANVAS_ANIMATION_MIN_INTERVAL_MS`.
  animationLastTime?: number;
  // Set by the patched 2d-context draw methods; read-and-cleared by
  // the frame tick. `undefined` and `false` are equivalent.
  dirty?: boolean;
}

export interface SessionRecorderOptions {
  jspsychVersion: string;
}

export class SessionRecorder {
  private readonly jspsychVersion: string;
  private recording: SessionRecording;
  private displayElement: HTMLElement | null = null;
  // Outermost layout root for the experiment. The spine in `initial_dom`
  // walks from `displayElement` up to and including this element so the
  // jsPsych layout containers (and the host's classes/attrs) are
  // captured. When unset we fall back to serializing only `displayElement`.
  private displayContainer: HTMLElement | null = null;
  private running = false;

  private startPerf = 0;
  private currentTrial: TrialRecording | null = null;

  private nodeIds = new WeakMap<Node, number>();
  private nextNodeId = 1;

  private mutationObserver: MutationObserver | null = null;

  // Session-scope: tracks stylesheet `<style>`/`<link>` elements in
  // `<head>` so add/remove/update events can be emitted by stable id.
  private headObserver: MutationObserver | null = null;
  private styleNodeIds = new WeakMap<Node, number>();
  private nextStylesheetId = 1;

  // RAF-coalesced flushers. Each entry is keyed by a channel name
  // (mouse / scroll / input); presence of a key means a flush is
  // already scheduled for that channel.
  private rafScheduled = new Set<string>();

  private lastMouseX = 0;
  private lastMouseY = 0;
  private mouseDirty = false;

  // Pending scroll state to flush at next animation frame. Key "window"
  // refers to the document scroll; numeric keys are tracked node IDs.
  private pendingScroll: Map<number | "window", { x: number; y: number }> = new Map();

  // Latest value-per-input collected within the current animation frame.
  // Coalesced so a fast typist produces one record per RAF rather than
  // one per keystroke (matching how mouse.move is throttled).
  private pendingInput: Map<number, string> = new Map();

  private viewportTimer: ReturnType<typeof setTimeout> | null = null;
  private lastViewport: ViewportState | null = null;

  // Tracked media elements with their attached listener. Strong refs so
  // we can iterate at trial end to detach. `mediaTimeLast` is keyed by
  // element for its `timeupdate`-throttle bookkeeping.
  private mediaListeners = new Map<HTMLMediaElement, (ev: Event) => void>();
  private mediaTimeLast = new WeakMap<HTMLMediaElement, number>();

  // Per-canvas state: strong-ref Map (we explicitly delete entries on
  // canvas removal and trial end) so iteration and lookup are one
  // structure. Replaces five parallel WeakMaps that all keyed off the
  // same canvas element.
  private canvasStates = new Map<HTMLCanvasElement, CanvasState>();
  // True when an in-flight RAF-deferred sweep should bypass the per-
  // canvas throttle. Set by initial-baseline schedules; gesture-driven
  // schedules leave it alone.
  private pendingCanvasSnapshotForce = false;
  private canvasFrameLoopScheduled = false;

  private boundHandlers: Array<{
    target: EventTarget;
    type: string;
    handler: EventListenerOrEventListenerObject;
    options?: AddEventListenerOptions | boolean;
    // True for handlers attached during a trial; cleared together at
    // trial end. Session-scoped handlers (e.g. window resize) leave it
    // unset and are torn down in `detachSessionListeners`.
    trial?: boolean;
  }> = [];

  constructor(options: SessionRecorderOptions) {
    this.jspsychVersion = options.jspsychVersion;
    this.recording = this.createBlankRecording();
  }

  private createBlankRecording(): SessionRecording {
    return {
      schema_version: SCHEMA_VERSION,
      jspsych_version: this.jspsychVersion,
      recording_started_at: "",
      recording_started_at_perf: 0,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      viewport: { w: 0, h: 0, dpr: 1, scale: 1, offset_x: 0, offset_y: 0 },
      rng: { seed: null, math_random_patched: false },
      display_element_id: "",
      stylesheets: [],
      stylesheet_events: [],
      trials: [],
      viewport_changes: [],
      rng_calls: [],
      ended_at_perf: null,
      end_reason: null,
    };
  }

  // -------- lifecycle --------

  start(displayElement: HTMLElement, displayContainer?: HTMLElement) {
    // Idempotent: starting an already-running recorder is a no-op.
    if (this.running) return;

    // If the recorder previously ran and stopped, replace the recording
    // object with a blank one so this `start()` begins a fresh session.
    // The previous recording remains accessible to any caller who captured
    // it via `getRecording()` before restarting.
    if (this.recording.end_reason !== null) {
      this.recording = this.createBlankRecording();
    }

    this.running = true;
    this.displayElement = displayElement;
    this.displayContainer = displayContainer ?? null;
    this.startPerf = performance.now();
    this.recording.recording_started_at = new Date().toISOString();
    this.recording.recording_started_at_perf = this.startPerf;
    this.recording.display_element_id = displayElement.id || "";
    this.recording.viewport = readViewport();
    this.lastViewport = { ...this.recording.viewport };

    // Reset per-session ephemeral state so a reused recorder doesn't carry
    // stale node ids, throttle flags, or pending event buffers.
    this.currentTrial = null;
    this.resetNodeIds();
    this.styleNodeIds = new WeakMap();
    this.nextStylesheetId = 1;
    this.recording.stylesheets = this.captureStylesheets();
    this.mouseDirty = false;
    this.rafScheduled.clear();
    this.pendingScroll.clear();
    this.pendingInput.clear();
    this.canvasFrameLoopScheduled = false;
    this.pendingCanvasSnapshotForce = false;

    const seed = registerMathRandomRecorder(this);
    if (seed !== null) this.recording.rng.seed = seed;
    this.recording.rng.math_random_patched = true;
    registerCanvasRecorder(this);
    this.attachSessionListeners();
  }

  stop(reason: "finished" | "aborted" | "unload" = "finished") {
    // Idempotent: stopping an already-stopped recorder is a no-op.
    if (!this.running) return;

    // Flush any throttled events from an in-flight trial so events near
    // an abort boundary aren't silently dropped.
    if (this.currentTrial !== null) {
      this.flushPendingMouse();
      this.flushPendingScroll();
      this.flushPendingInput();
      this.captureCanvasSnapshots(true);
      this.currentTrial.t_end = this.t();
      this.currentTrial = null;
    }

    this.detachTrialListeners();
    this.detachSessionListeners();
    unregisterMathRandomRecorder(this);
    unregisterCanvasRecorder(this);
    this.recording.ended_at_perf = this.t();
    this.recording.end_reason = reason;
    this.running = false;
  }

  getRecording(): SessionRecording {
    return this.recording;
  }

  // -------- per-trial hooks --------

  onTrialStart(info: { trial_index: number; plugin: string }) {
    this.currentTrial = {
      trial_index: info.trial_index,
      t_start: this.t(),
      t_dom_ready: null,
      t_end: null,
      plugin: info.plugin,
      initial_dom: null,
      events: [],
      trial_data: null,
    };
    this.recording.trials.push(this.currentTrial);
  }

  onTrialLoad() {
    if (!this.currentTrial || !this.displayElement) return;
    this.currentTrial.t_dom_ready = this.t();
    this.resetNodeIds();
    this.currentTrial.initial_dom = this.serializeDisplaySpine(this.displayElement);
    this.attachTrialListeners();
    this.scanForMediaElements(this.displayElement);
    // `scanForCanvasElements` registers each canvas via
    // `trackCanvasElement`, which schedules the initial baseline
    // snapshot for the next animation frame so synchronously-drawn
    // stimuli (canvas-button-response, canvas-keyboard-response, ...)
    // are captured before any interaction.
    this.scanForCanvasElements(this.displayElement);
  }

  onTrialFinish(trialData: unknown) {
    if (!this.currentTrial) return;
    this.flushPendingMouse();
    this.flushPendingScroll();
    this.flushPendingInput();
    this.captureCanvasSnapshots(true);
    this.detachTrialListeners();
    this.currentTrial.t_end = this.t();
    this.currentTrial.trial_data = serializeJson(trialData);
    this.currentTrial = null;
  }

  // -------- session listeners (viewport, focus) --------

  private attachSessionListeners() {
    this.bindSession(window, "resize", this.scheduleViewportRead);
    if (window.visualViewport) {
      this.bindSession(window.visualViewport, "resize", this.scheduleViewportRead);
      this.bindSession(window.visualViewport, "scroll", this.scheduleViewportRead);
    }
    this.bindSession(window, "focus", () => this.pushFocus("focus"));
    this.bindSession(window, "blur", () => this.pushFocus("blur"));
    this.bindSession(document, "fullscreenchange", () => {
      this.pushFocus(document.fullscreenElement ? "fullscreen.enter" : "fullscreen.exit");
    });

    // Watch <head> for stylesheet add/remove and <style> text edits.
    // Plugins commonly inject `<style>` blocks into `<head>` mid-session;
    // without this observer those rules would be missing from replay.
    if (document.head) {
      this.headObserver = new MutationObserver((records) => this.handleHeadMutations(records));
      this.headObserver.observe(document.head, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  }

  private detachSessionListeners() {
    if (this.viewportTimer) {
      clearTimeout(this.viewportTimer);
      this.viewportTimer = null;
    }
    if (this.headObserver) {
      // Drain any records the observer has queued but not yet delivered
      // so changes near `stop()` aren't dropped.
      const pending = this.headObserver.takeRecords();
      if (pending.length > 0) this.handleHeadMutations(pending);
      this.headObserver.disconnect();
      this.headObserver = null;
    }
    for (const b of this.boundHandlers) {
      b.target.removeEventListener(b.type, b.handler, b.options);
    }
    this.boundHandlers = [];
  }

  private scheduleViewportRead = () => {
    if (this.viewportTimer) clearTimeout(this.viewportTimer);
    this.viewportTimer = setTimeout(() => {
      this.viewportTimer = null;
      const v = readViewport();
      const last = this.lastViewport;
      if (
        !last ||
        last.w !== v.w ||
        last.h !== v.h ||
        last.dpr !== v.dpr ||
        last.scale !== v.scale ||
        last.offset_x !== v.offset_x ||
        last.offset_y !== v.offset_y
      ) {
        this.lastViewport = v;
        this.recording.viewport_changes.push({ t: this.t(), ...v });
      }
    }, VIEWPORT_DEBOUNCE_MS);
  };

  private pushFocus(type: FocusRecord["type"]) {
    this.pushEvent({ type, t: this.t() });
  }

  // -------- per-trial listeners (DOM, input, media) --------

  private attachTrialListeners() {
    if (!this.displayElement) return;
    const el = this.displayElement;

    this.mutationObserver = new MutationObserver((records) => this.handleMutations(records));
    this.mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    // Mouse and touch listeners are scoped to `window`/`document` in the
    // capture phase rather than to `displayElement`. The display element
    // is `#jspsych-content`, which is typically narrower than the
    // viewport (centered, optionally constrained by `experiment_width`).
    // Element-scoped listeners only fire while the cursor is over the
    // element or its descendants, so a participant moving toward the
    // browser chrome to resize/move the window — or drawing into a
    // canvas corner that extends past `#jspsych-content` — would
    // produce no `mouse.move` / `touch.move` events for the entire
    // excursion. The replay would then show the cursor stuck at its
    // last known position until it returned. Coordinates are already
    // viewport-relative (`clientX`/`clientY`) so widening the scope
    // doesn't change the recorded values; it only adds the events that
    // were silently dropped before. `targetId` may now resolve to
    // `null` when the target is outside the recorded display spine,
    // which the schema already permits.
    this.bindTrial(window, "mousemove", this.handleMouseMove, true);
    this.bindTrial(window, "mousedown", this.handleMouseButton("mouse.down"), true);
    this.bindTrial(window, "mouseup", this.handleMouseButton("mouse.up"), true);
    this.bindTrial(window, "click", this.handleMouseButton("mouse.click"), true);
    this.bindTrial(document, "touchstart", this.handleTouch("touch.start"), {
      passive: true,
      capture: true,
    });
    this.bindTrial(document, "touchmove", this.handleTouch("touch.move"), {
      passive: true,
      capture: true,
    });
    this.bindTrial(document, "touchend", this.handleTouch("touch.end"), {
      passive: true,
      capture: true,
    });
    // Keyboard and clipboard events are listened at document scope in the
    // capture phase: they may be dispatched on any element (including
    // descendants of the body), and capture-phase listening ensures we see
    // them before any user-attached handler can call stopPropagation.
    this.bindTrial(document, "keydown", this.handleKey("key.down"), true);
    this.bindTrial(document, "keyup", this.handleKey("key.up"), true);
    this.bindTrial(document, "copy", this.handleClipboard("clipboard.copy"), true);
    this.bindTrial(document, "cut", this.handleClipboard("clipboard.cut"), true);
    this.bindTrial(document, "paste", this.handleClipboard("clipboard.paste"), true);
    // Scroll events do not bubble, so capture-phase listening at document
    // scope catches scroll on any descendant element. Window scrolling is
    // handled by the same listener via a Document target check.
    this.bindTrial(document, "scroll", this.handleScroll, true);
    // Form-state events. `input` covers text fields, textareas, and
    // sliders (fires on every value change). `change` covers checkboxes,
    // radios, and selects (fires on commit). Capture phase at document
    // scope so nothing in user code can stopPropagation past us.
    this.bindTrial(document, "input", this.handleInputEvent, true);
    this.bindTrial(document, "change", this.handleChangeEvent, true);
  }

  private detachTrialListeners() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    this.detachMediaListeners();
    // WeakMap entries for the released canvases will be GC'd once the
    // Strong refs drop here; explicit deletion happens in
    // `releaseSubtree` for canvases removed mid-trial.
    this.canvasStates.clear();
    this.pendingCanvasSnapshotForce = false;
    // Tear down only the trial-scoped handlers; session-scoped handlers
    // (resize, focus, blur, fullscreenchange) stay attached until stop().
    const remaining: typeof this.boundHandlers = [];
    for (const b of this.boundHandlers) {
      if (b.trial) {
        b.target.removeEventListener(b.type, b.handler, b.options);
      } else {
        remaining.push(b);
      }
    }
    this.boundHandlers = remaining;
  }

  // -------- mutation handling --------

  private handleMutations(records: MutationRecord[]) {
    const t = this.t();
    for (const r of records) {
      try {
        if (r.type === "childList") {
          for (const removed of Array.from(r.removedNodes)) {
            const id = this.nodeIds.get(removed);
            if (id !== undefined) {
              this.pushEvent({ type: "dom.remove", t, node: id });
              this.releaseSubtree(removed);
            }
          }
          const parentId = this.nodeIds.get(r.target);
          if (parentId === undefined) continue;
          for (const added of Array.from(r.addedNodes)) {
            if (this.nodeIds.has(added)) continue;
            const node = this.serializeNode(added);
            if (!node) continue;
            const before = this.findTrackedSibling(added.nextSibling);
            this.pushEvent({ type: "dom.add", t, parent: parentId, before, node });
            if (added instanceof HTMLMediaElement) this.attachMediaListeners(added);
            else if (added instanceof Element) this.scanForMediaElements(added);
            if (added instanceof HTMLCanvasElement) this.trackCanvasElement(added);
            else if (added instanceof Element) this.scanForCanvasElements(added);
          }
        } else if (r.type === "attributes") {
          const id = this.nodeIds.get(r.target);
          if (id === undefined) continue;
          const name = r.attributeName!;
          const target = r.target as Element;
          const value = target.getAttribute(name);
          this.pushEvent({ type: "dom.attr", t, node: id, name, value });
        } else if (r.type === "characterData") {
          const id = this.nodeIds.get(r.target);
          if (id === undefined) continue;
          this.pushEvent({
            type: "dom.text",
            t,
            node: id,
            text: (r.target as CharacterData).data,
          });
        }
      } catch {
        // A capture failure must never break the experiment.
      }
    }
  }

  private findTrackedSibling(start: Node | null): number | null {
    let cur = start;
    while (cur) {
      const id = this.nodeIds.get(cur);
      if (id !== undefined) return id;
      cur = cur.nextSibling;
    }
    return null;
  }

  private releaseSubtree(node: Node) {
    if (node instanceof HTMLCanvasElement && this.canvasStates.has(node)) {
      // jsPsych core clears the display element via `innerHTML = ""`
      // immediately after each trial, before `onTrialFinish` fires. Take
      // a final snapshot here so the canvas's last pixel state is in the
      // recording instead of being silently dropped on removal.
      this.snapshotCanvas(node, this.t(), true);
      this.canvasStates.delete(node);
    }
    if (this.nodeIds.has(node)) {
      this.nodeIds.delete(node);
    }
    if (node.hasChildNodes()) {
      for (const child of Array.from(node.childNodes)) {
        this.releaseSubtree(child);
      }
    }
  }

  // Serializes `displayElement` plus the chain of ancestors leading up
  // to (and including) `displayContainer`. The returned tree is a
  // "spine": each ancestor is captured with its tag and attributes, but
  // only the descendant on the path to `displayElement` appears as a
  // child — sibling content (e.g. unrelated body elements when
  // `display_element` is `<body>`) is intentionally omitted.
  //
  // Without this, `initial_dom` would only contain `<div class=
  // "jspsych-content">` and the trial subtree below it. The CSS that
  // vertically centers experiment content lives on the wrappers
  // (`jspsych-content-wrapper`, `jspsych-display-element`); replayers
  // need those nodes to exist for `margin: auto` and the flex column
  // to do their work.
  //
  // If no `displayContainer` was provided to `start()`, we fall back to
  // serializing only `displayElement` so existing callers don't change
  // behavior.
  private serializeDisplaySpine(displayElement: HTMLElement): DomNode | null {
    let root = this.serializeNode(displayElement);
    if (!root) return null;
    if (!this.displayContainer || this.displayContainer === displayElement) return root;
    let cur: Element | null = displayElement.parentElement;
    while (cur) {
      root = this.wrapInElement(cur, root);
      if (cur === this.displayContainer) break;
      cur = cur.parentElement;
    }
    return root;
  }

  private wrapInElement(el: Element, child: DomNode): ElementNode {
    const attrs: Record<string, string> = {};
    for (const a of Array.from(el.attributes)) attrs[a.name] = a.value;
    return {
      id: this.assignId(el),
      kind: "element",
      tag: el.tagName.toLowerCase(),
      attrs,
      children: [child],
    };
  }

  private serializeNode(node: Node): DomNode | null {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const id = this.assignId(el);
      const attrs: Record<string, string> = {};
      for (const a of Array.from(el.attributes)) attrs[a.name] = a.value;
      const out: ElementNode = {
        id,
        kind: "element",
        tag: el.tagName.toLowerCase(),
        attrs,
        children: [],
      };
      if (el instanceof HTMLCanvasElement) {
        out.canvas_size = { w: el.width, h: el.height };
      }
      if (el instanceof HTMLMediaElement) {
        out.media_src = el.currentSrc || el.src || "";
      }
      for (const child of Array.from(el.childNodes)) {
        const sc = this.serializeNode(child);
        if (sc) out.children.push(sc);
      }
      return out;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      return { id: this.assignId(node), kind: "text", text: (node as Text).data };
    }
    if (node.nodeType === Node.COMMENT_NODE) {
      return { id: this.assignId(node), kind: "comment", text: (node as Comment).data };
    }
    return null;
  }

  // -------- stylesheet snapshot --------

  // Captured at session start so a replayer can apply the same CSS to the
  // recorded DOM. Without this, `initial_dom` reconstructs structure but
  // not appearance — class hooks like `.jspsych-display-element` have no
  // rules to attach to.
  //
  // We walk the DOM directly (rather than just `document.styleSheets`) so
  // that <link rel="stylesheet"> tags whose sheet has not yet loaded — or
  // failed to load — are still captured by href. For each element we then
  // try to read the resolved rule text via the associated CSSStyleSheet:
  //   - <style> tags: read `cssRules` (always readable for same-document
  //     inline sheets); fall back to the element's `textContent` if rule
  //     access throws.
  //   - <link rel="stylesheet">: read `cssRules` if the sheet is loaded
  //     and same-origin (or CORS-permissive). Otherwise record `href`
  //     with `css: null` so a replayer can refetch out-of-band.
  // Each captured element is registered in `styleNodeIds` so the head
  // observer can emit remove/update events referencing the same id.
  private captureStylesheets(): StylesheetSnapshot[] {
    if (typeof document === "undefined") return [];
    const out: StylesheetSnapshot[] = [];

    const elements = document.querySelectorAll<HTMLElement>('style, link[rel~="stylesheet"]');
    for (const el of Array.from(elements)) {
      const snap = this.snapshotStylesheetElement(el);
      if (snap) out.push(snap);
    }

    // Also include any sheets that weren't reached via the DOM walk —
    // notably sheets pulled in via @import, which exist in
    // `document.styleSheets` but have no `ownerNode` element.
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const owner = sheet.ownerNode as Node | null;
        if (owner && this.styleNodeIds.has(owner)) continue;
        const css = readSheetText(sheet);
        const media = sheet.media && sheet.media.mediaText ? sheet.media.mediaText : null;
        if (sheet.href) {
          out.push({ id: this.nextStylesheetId++, kind: "link", href: sheet.href, css, media });
        } else if (css !== null) {
          out.push({ id: this.nextStylesheetId++, kind: "inline", css, media });
        }
      } catch {
        // Capture must never break the experiment.
      }
    }

    return out;
  }

  // Builds a snapshot for a single `<style>` or `<link rel=stylesheet>`
  // element and registers it in `styleNodeIds`. Returns null if the
  // element is not a stylesheet kind we track. Used both by the initial
  // capture and by the head observer for added nodes.
  private snapshotStylesheetElement(el: HTMLElement): StylesheetSnapshot | null {
    try {
      const sheet = (el as unknown as { sheet?: CSSStyleSheet | null }).sheet ?? null;
      const media = readMedia(el, sheet);
      if (el instanceof HTMLLinkElement) {
        if (!/(^|\s)stylesheet(\s|$)/i.test(el.rel)) return null;
        const href = el.href || el.getAttribute("href") || "";
        const id = this.nextStylesheetId++;
        this.styleNodeIds.set(el, id);
        return { id, kind: "link", href, css: sheet ? readSheetText(sheet) : null, media };
      }
      if (el instanceof HTMLStyleElement) {
        const css = (sheet ? readSheetText(sheet) : null) ?? el.textContent ?? "";
        const id = this.nextStylesheetId++;
        this.styleNodeIds.set(el, id);
        return { id, kind: "inline", css, media };
      }
    } catch {
      // Capture must never break the experiment.
    }
    return null;
  }

  // Reads the current resolved CSS text for a tracked `<style>` element,
  // preferring `sheet.cssRules` (which reflects rule-level edits made via
  // CSSOM) and falling back to the element's `textContent`.
  private readStyleCss(el: HTMLStyleElement): string {
    try {
      const sheet = el.sheet ?? null;
      if (sheet) {
        const text = readSheetText(sheet);
        if (text !== null) return text;
      }
    } catch {
      // fall through to textContent
    }
    return el.textContent ?? "";
  }

  private handleHeadMutations(records: MutationRecord[]) {
    const t = this.t();
    // Coalesce per-element updates so a single `textContent =` (which
    // produces multiple child mutations) emits one event, not many.
    const updated = new Set<HTMLStyleElement>();

    for (const r of records) {
      try {
        if (r.type === "childList") {
          // Mutations under a tracked <style> mean its rule text changed
          // (e.g. `style.textContent = ...` replaces the inner text node).
          if (r.target instanceof HTMLStyleElement && this.styleNodeIds.has(r.target)) {
            updated.add(r.target);
            continue;
          }
          // Otherwise, the mutation is at <head> level: stylesheets are
          // being added or removed from the document.
          for (const removed of Array.from(r.removedNodes)) {
            const id = this.styleNodeIds.get(removed);
            if (id === undefined) continue;
            this.styleNodeIds.delete(removed);
            this.recording.stylesheet_events.push({ type: "stylesheet.remove", t, id });
          }
          for (const added of Array.from(r.addedNodes)) {
            if (!(added instanceof HTMLStyleElement) && !(added instanceof HTMLLinkElement)) {
              continue;
            }
            if (this.styleNodeIds.has(added)) continue;
            const snap = this.snapshotStylesheetElement(added as HTMLElement);
            if (snap)
              this.recording.stylesheet_events.push({ type: "stylesheet.add", t, sheet: snap });
          }
        } else if (r.type === "characterData") {
          // Direct edit to the text node inside a <style> (e.g. via
          // `style.firstChild.data = ...`). Walk up to the <style>.
          let target: Node | null = r.target;
          while (target && !(target instanceof HTMLStyleElement)) {
            target = target.parentNode;
          }
          if (target && this.styleNodeIds.has(target)) {
            updated.add(target as HTMLStyleElement);
          }
        }
      } catch {
        // Capture must never break the experiment.
      }
    }

    for (const el of updated) {
      const id = this.styleNodeIds.get(el);
      if (id === undefined) continue;
      this.recording.stylesheet_events.push({
        type: "stylesheet.update",
        t,
        id,
        css: this.readStyleCss(el),
      });
    }
  }

  private assignId(node: Node): number {
    let id = this.nodeIds.get(node);
    if (id === undefined) {
      id = this.nextNodeId++;
      this.nodeIds.set(node, id);
    }
    return id;
  }

  private resetNodeIds() {
    this.nodeIds = new WeakMap();
    this.nextNodeId = 1;
  }

  // -------- input handlers --------

  // Coalesces a flush of `key`'s pending state to the next animation
  // frame. Repeated calls before the frame fires are no-ops, so a
  // burst of input events produces one flush instead of many.
  private scheduleRafFlush(key: string, flush: () => void) {
    if (this.rafScheduled.has(key)) return;
    this.rafScheduled.add(key);
    requestAnimationFrame(() => {
      this.rafScheduled.delete(key);
      flush();
    });
  }

  private handleMouseMove = (ev: Event) => {
    const e = ev as MouseEvent;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.mouseDirty = true;
    this.scheduleRafFlush("mouse", this.flushPendingMouse);
  };

  private flushPendingMouse = () => {
    if (!this.mouseDirty) return;
    this.mouseDirty = false;
    this.pushEvent({
      type: "mouse.move",
      t: this.t(),
      x: this.lastMouseX,
      y: this.lastMouseY,
    });
  };

  private handleScroll = (ev: Event) => {
    const target = ev.target;
    if (target === document || target === document.documentElement || target === document.body) {
      this.pendingScroll.set("window", { x: window.scrollX, y: window.scrollY });
    } else if (target instanceof Element) {
      const id = this.nodeIds.get(target);
      if (id === undefined) return;
      this.pendingScroll.set(id, { x: target.scrollLeft, y: target.scrollTop });
    } else {
      return;
    }
    this.scheduleRafFlush("scroll", this.flushPendingScroll);
  };

  // `input` events come from text-like form fields, textareas, and sliders.
  // Checkboxes/radios/selects also fire `input`, but they're routed through
  // `handleChangeEvent` instead so we don't double-record. The MutationObserver
  // can't see these changes — typing updates the IDL `value` property, not
  // the DOM `value` attribute.
  private handleInputEvent = (ev: Event) => {
    const target = ev.target;
    if (!(target instanceof Element)) return;
    if (target instanceof HTMLInputElement) {
      // Skip control kinds whose state lives elsewhere (handled by `change`).
      const t = target.type;
      if (t === "checkbox" || t === "radio" || t === "file") return;
    } else if (!(target instanceof HTMLTextAreaElement)) {
      return;
    }
    const id = this.nodeIds.get(target);
    if (id === undefined) return;
    this.pendingInput.set(id, target.value);
    this.scheduleRafFlush("input", this.flushPendingInput);
  };

  private flushPendingInput = () => {
    if (this.pendingInput.size === 0) return;
    const t = this.t();
    for (const [node, value] of this.pendingInput) {
      this.pushEvent({ type: "input.value", t, node, value });
    }
    this.pendingInput.clear();
  };

  private handleChangeEvent = (ev: Event) => {
    const target = ev.target;
    if (!(target instanceof Element)) return;
    const id = this.nodeIds.get(target);
    if (id === undefined) return;
    if (target instanceof HTMLInputElement) {
      const ttype = target.type;
      if (ttype === "checkbox" || ttype === "radio") {
        this.pushEvent({ type: "input.checked", t: this.t(), node: id, checked: target.checked });
      }
      // Text-like inputs are already covered by `handleInputEvent`; their
      // additional `change` event on blur would just duplicate the last
      // value we already recorded.
    } else if (target instanceof HTMLSelectElement) {
      const values = Array.from(target.selectedOptions).map((o) => o.value);
      this.pushEvent({ type: "input.select", t: this.t(), node: id, values });
    }
  };

  private flushPendingScroll = () => {
    if (this.pendingScroll.size === 0) return;
    const t = this.t();
    for (const [key, pos] of this.pendingScroll) {
      if (key === "window") {
        this.pushEvent({ type: "scroll.window", t, x: pos.x, y: pos.y });
      } else {
        this.pushEvent({ type: "scroll.element", t, node: key, x: pos.x, y: pos.y });
      }
    }
    this.pendingScroll.clear();
  };

  private handleMouseButton(type: "mouse.down" | "mouse.up" | "mouse.click") {
    return (ev: Event) => {
      const e = ev as MouseEvent;
      this.pushEvent({
        type,
        t: this.t(),
        x: e.clientX,
        y: e.clientY,
        button: e.button,
        target: this.targetId(e.target),
      });
      // Gesture release is the moment a stroke completes; snapshot any
      // tracked canvases so the drawing it produced reaches the replay.
      if (type === "mouse.up") this.scheduleCanvasSnapshot(false);
    };
  }

  private handleTouch(type: "touch.start" | "touch.move" | "touch.end") {
    return (ev: Event) => {
      const e = ev as TouchEvent;
      const touches = Array.from(e.changedTouches).map((tt) => ({
        id: tt.identifier,
        x: tt.clientX,
        y: tt.clientY,
      }));
      this.pushEvent({ type, t: this.t(), touches });
      if (type === "touch.end") this.scheduleCanvasSnapshot(false);
    };
  }

  private handleKey(type: "key.down" | "key.up") {
    return (ev: Event) => {
      const e = ev as KeyboardEvent;
      this.pushEvent({
        type,
        t: this.t(),
        key: e.key,
        code: e.code,
        mods: { ctrl: e.ctrlKey, shift: e.shiftKey, alt: e.altKey, meta: e.metaKey },
        repeat: e.repeat,
        target: this.targetId(e.target),
      });
    };
  }

  private handleClipboard(type: ClipboardRecord["type"]) {
    return (ev: Event) => {
      const e = ev as ClipboardEvent;
      let text: string | null = null;
      let html: string | null = null;
      try {
        text = e.clipboardData?.getData("text/plain") ?? null;
        html = e.clipboardData?.getData("text/html") ?? null;
        if (html === "") html = null;
      } catch {
        // clipboard data may be inaccessible in some contexts
      }
      this.pushEvent({ type, t: this.t(), text, html, target: this.targetId(e.target) });
    };
  }

  private targetId(target: EventTarget | null): number | null {
    if (!target || !(target instanceof Node)) return null;
    return this.nodeIds.get(target) ?? null;
  }

  // -------- media handling --------

  private scanForMediaElements(root: Element) {
    if (root instanceof HTMLMediaElement) this.attachMediaListeners(root);
    const els = root.querySelectorAll("video, audio");
    for (const el of Array.from(els)) {
      this.attachMediaListeners(el as HTMLMediaElement);
    }
  }

  private attachMediaListeners(media: HTMLMediaElement) {
    if (this.mediaListeners.has(media)) return;
    const id = this.assignId(media);
    const handler = (ev: Event) => {
      let type: MediaRecord["type"];
      switch (ev.type) {
        case "play":
          type = "media.play";
          break;
        case "pause":
          type = "media.pause";
          break;
        case "ended":
          type = "media.ended";
          break;
        case "seeked":
          type = "media.seeked";
          break;
        case "timeupdate": {
          const now = performance.now();
          const last = this.mediaTimeLast.get(media) ?? 0;
          if (now - last < MEDIA_TIME_THROTTLE_MS) return;
          this.mediaTimeLast.set(media, now);
          type = "media.time";
          break;
        }
        default:
          return;
      }
      this.pushEvent({ type, t: this.t(), node: id, current_time: media.currentTime });
    };
    for (const ev of MEDIA_EVENTS) media.addEventListener(ev, handler);
    this.mediaListeners.set(media, handler);
  }

  private detachMediaListeners() {
    for (const [media, handler] of this.mediaListeners) {
      for (const ev of MEDIA_EVENTS) media.removeEventListener(ev, handler);
    }
    this.mediaListeners.clear();
  }

  // -------- canvas snapshotting --------

  // Walks `root` for `<canvas>` elements and registers each one for
  // snapshotting. Called on trial load and when subtrees are added
  // mid-trial via `dom.add`.
  private scanForCanvasElements(root: Element) {
    if (root instanceof HTMLCanvasElement) {
      this.trackCanvasElement(root);
      return;
    }
    const els = root.querySelectorAll("canvas");
    for (const el of Array.from(els)) {
      this.trackCanvasElement(el as HTMLCanvasElement);
    }
  }

  private trackCanvasElement(canvas: HTMLCanvasElement) {
    if (!this.canvasStates.has(canvas)) this.canvasStates.set(canvas, {});
    // Force a baseline snapshot to capture synchronously-drawn stimuli
    // even if a gesture immediately preceded the trial. The diff path
    // dedupes already-baselined canvases, so this is cheap.
    this.scheduleCanvasSnapshot(true);
  }

  /** @internal Called from the shared draw-method wrapper. */
  notifyCanvasDraw(canvas: HTMLCanvasElement) {
    const state = this.canvasStates.get(canvas);
    if (!state) return;
    // Already-dirty short-circuit: a stroke composed of many draw calls
    // (lineTo + stroke + lineTo + stroke ...) within a frame would
    // otherwise re-write the same `true` and re-check the schedule
    // flag tens of times per frame. Once dirty, nothing else needs
    // doing until the frame tick clears the flag.
    if (state.dirty) return;
    state.dirty = true;
    this.scheduleCanvasFrameTick();
  }

  // Coalesces draw notifications into a single per-frame tick. Multiple
  // draw calls between two animation frames (e.g. a stroke composed of
  // many `lineTo`+`stroke` pairs) collapse to one snapshot attempt. The
  // tick does not re-schedule itself; further draws will reschedule it,
  // and quiescent canvases produce no work.
  private scheduleCanvasFrameTick() {
    if (this.canvasFrameLoopScheduled) return;
    if (!this.running) return;
    this.canvasFrameLoopScheduled = true;
    requestAnimationFrame(this.runCanvasFrameTick);
  }

  private runCanvasFrameTick = () => {
    this.canvasFrameLoopScheduled = false;
    if (!this.running) return;
    const t = this.t();
    for (const [canvas, state] of this.canvasStates) {
      if (!state.dirty) continue;
      const last = state.animationLastTime ?? -Infinity;
      // Skip without clearing the dirty flag: the next draw call will
      // re-schedule a tick, by which time the throttle window has
      // likely elapsed. If draws stop while throttled, the trial-end
      // `releaseSubtree` snapshot will catch the final pixels.
      if (t - last < CANVAS_ANIMATION_MIN_INTERVAL_MS) continue;
      state.animationLastTime = t;
      state.dirty = false;
      // `force = true` bypasses the gesture-path 250 ms throttle. The
      // animation throttle above already bounds frequency from this
      // path; the diff inside `snapshotCanvas` then dedupes byte-
      // identical states.
      this.snapshotCanvas(canvas, t, true);
    }
  };

  // Defers a canvas-snapshot sweep to the next animation frame so the
  // browser has had a chance to paint the post-gesture state. `force`
  // bypasses the per-canvas throttle (used for initial baselines that
  // must not be throttled out by an immediately preceding gesture).
  // If both forced and unforced are scheduled in the same frame the
  // forced wins, since it's a strict superset of the unforced sweep.
  private scheduleCanvasSnapshot(force: boolean) {
    if (this.canvasStates.size === 0) return;
    if (force) this.pendingCanvasSnapshotForce = true;
    this.scheduleRafFlush("canvas-snapshot", () => {
      const f = this.pendingCanvasSnapshotForce;
      this.pendingCanvasSnapshotForce = false;
      this.captureCanvasSnapshots(f);
    });
  }

  // Throttles to at most one snapshot per canvas per
  // `CANVAS_SNAPSHOT_MIN_INTERVAL_MS`, and dedupes by data URL so a
  // canvas whose pixels did not actually change does not produce noise.
  // `force` bypasses the throttle for trial-end captures so the final
  // state of every canvas is always recorded.
  private captureCanvasSnapshots(force: boolean) {
    if (this.canvasStates.size === 0) return;
    const now = this.t();
    for (const canvas of this.canvasStates.keys()) {
      this.snapshotCanvas(canvas, now, force);
    }
  }

  // Pushes a `canvas.snapshot` event for one canvas, applying the
  // per-canvas throttle (unless `force`). Diffs the canvas's current
  // pixels against the last shadow buffer to find the changed bounding
  // box; emits a partial snapshot when the dirty area is small and a
  // full snapshot otherwise. The first snapshot per canvas is always
  // full so subsequent partials have a baseline.
  //
  // Also called from `releaseSubtree` to capture the final pixel state
  // at the moment a canvas is removed from the trial DOM — jsPsych core
  // clears the display element via `innerHTML = ""` before
  // `onTrialFinish` runs, so a trial-end-only flush would miss it.
  private snapshotCanvas(canvas: HTMLCanvasElement, t: number, force: boolean) {
    const id = this.nodeIds.get(canvas);
    if (id === undefined) return;
    const state = this.canvasStates.get(canvas);
    if (!state) return;
    if (!force && t - (state.lastSnapshotTime ?? -Infinity) < CANVAS_SNAPSHOT_MIN_INTERVAL_MS) {
      return;
    }
    const w = canvas.width;
    const h = canvas.height;
    if (w === 0 || h === 0) return;
    try {
      const ctx = getReadable2dContext(canvas);
      const shadow = state.shadowData;
      const shadowValid = !!shadow && shadow.width === w && shadow.height === h;

      // Without a readable 2d context (WebGL canvases, or 2d contexts
      // created with `willReadFrequently: false` that subsequently fail)
      // we can't diff. Emit a full snapshot via toDataURL and skip
      // shadow tracking for this canvas.
      if (!ctx) {
        this.emitFullCanvasSnapshot(canvas, state, id, t);
        return;
      }

      // First snapshot for this canvas — no baseline to diff against.
      // Capture the current pixels into the shadow buffer and emit a
      // full snapshot so the replayer has a starting point.
      if (!shadowValid) {
        state.shadowData = ctx.getImageData(0, 0, w, h);
        this.emitFullCanvasSnapshot(canvas, state, id, t);
        return;
      }

      const current = ctx.getImageData(0, 0, w, h);
      const bbox = computeDiffBbox(shadow!.data, current.data, w, h);
      // Pixels are byte-identical to the last snapshot — emit nothing.
      if (!bbox) return;

      const fullThreshold = w * h * CANVAS_FULL_SNAPSHOT_AREA_FRACTION;
      if (bbox.w * bbox.h >= fullThreshold) {
        state.shadowData = current;
        this.emitFullCanvasSnapshot(canvas, state, id, t);
        return;
      }

      const dataUrl = cropCanvasToDataURL(canvas, bbox);
      state.shadowData = current;
      state.lastSnapshotTime = t;
      this.pushEvent({
        type: "canvas.snapshot",
        t,
        node: id,
        data_url: dataUrl,
        region: bbox,
      });
    } catch {
      // toDataURL/getImageData throw SecurityError on tainted canvases
      // (canvases that drew cross-origin images without CORS headers).
      // Skip and never break the experiment.
    }
  }

  private emitFullCanvasSnapshot(
    canvas: HTMLCanvasElement,
    state: CanvasState,
    id: number,
    t: number
  ) {
    const dataUrl = canvas.toDataURL();
    if (state.lastSnapshot === dataUrl) return;
    state.lastSnapshot = dataUrl;
    state.lastSnapshotTime = t;
    this.pushEvent({ type: "canvas.snapshot", t, node: id, data_url: dataUrl });
  }

  // -------- RNG --------

  /** @internal Called from the shared `Math.random` wrapper. */
  recordRngCall(value: number) {
    this.recording.rng_calls.push({
      t: this.t(),
      fn: "Math.random",
      args: RNG_NO_ARGS,
      result: value,
    });
  }

  // -------- helpers --------

  private bindSession(
    target: EventTarget,
    type: string,
    handler: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean
  ) {
    target.addEventListener(type, handler, options);
    this.boundHandlers.push({ target, type, handler, options, trial: false });
  }

  private bindTrial(
    target: EventTarget,
    type: string,
    handler: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean
  ) {
    target.addEventListener(type, handler, options);
    this.boundHandlers.push({ target, type, handler, options, trial: true });
  }

  private pushEvent(ev: RecordedEvent) {
    if (this.currentTrial) this.currentTrial.events.push(ev);
  }

  private t(): number {
    return performance.now() - this.startPerf;
  }
}

// ---------------------------------------------------------------------------
// Module-level patch coordination
// ---------------------------------------------------------------------------
// Multiple `JsPsych` instances can run with `record_session: true`
// concurrently. The previous implementation patched
// `CanvasRenderingContext2D.prototype` and `Math.random` per-recorder,
// which meant the second recorder's "original" was actually the first
// recorder's wrapper; restoring on stop in interleaved order left the
// process with stale wrappers reinstalled on the prototype. The
// helpers below install each global patch exactly once (refcounted by
// the set of active recorders) so registration/unregistration order
// is irrelevant.

const activeCanvasRecorders: Set<SessionRecorder> = new Set();
let canvasMethodOriginals: Map<string, Function> | null = null;
// Per-canvas committed context type, learned by wrapping
// `HTMLCanvasElement.prototype.getContext`. The recorder consults
// this map to decide whether `getContext("2d")` is safe to call —
// see `getReadable2dContext` for the rationale.
const committedContextTypes: WeakMap<HTMLCanvasElement, string> = new WeakMap();
let getContextOriginal: HTMLCanvasElement["getContext"] | null = null;

function registerCanvasRecorder(recorder: SessionRecorder) {
  if (activeCanvasRecorders.has(recorder)) return;
  installCanvasGlobalPatches();
  activeCanvasRecorders.add(recorder);
}

function unregisterCanvasRecorder(recorder: SessionRecorder) {
  if (!activeCanvasRecorders.delete(recorder)) return;
  if (activeCanvasRecorders.size === 0) uninstallCanvasGlobalPatches();
}

function installCanvasGlobalPatches() {
  if (canvasMethodOriginals !== null) return;
  if (typeof CanvasRenderingContext2D !== "undefined") {
    const proto = CanvasRenderingContext2D.prototype as unknown as Record<string, Function>;
    canvasMethodOriginals = new Map();
    for (const method of CANVAS_DRAW_METHODS) {
      const original = proto[method];
      if (typeof original !== "function") continue;
      canvasMethodOriginals.set(method, original);
      proto[method] = function (this: CanvasRenderingContext2D, ...args: unknown[]) {
        try {
          const canvas = this.canvas as HTMLCanvasElement | undefined;
          if (canvas) {
            for (const r of activeCanvasRecorders) r.notifyCanvasDraw(canvas);
          }
        } catch {
          // Tracking must never break the experiment's own drawing.
        }
        return (original as Function).apply(this, args);
      };
    }
  }
  // Wrap `getContext` so we learn each canvas's committed context type
  // without ever creating a context ourselves. This is what lets
  // `getReadable2dContext` skip the diff path for WebGL canvases — and,
  // crucially, for canvases that the user hasn't yet committed to any
  // type, since calling `getContext("2d")` on a fresh canvas locks it
  // into 2D and breaks any later `getContext("webgl")` call.
  if (typeof HTMLCanvasElement !== "undefined") {
    const proto = HTMLCanvasElement.prototype;
    getContextOriginal = proto.getContext;
    const wrapped = function (this: HTMLCanvasElement, ...args: unknown[]) {
      const result = (getContextOriginal as Function).apply(this, args);
      if (result && !committedContextTypes.has(this) && typeof args[0] === "string") {
        committedContextTypes.set(this, args[0] as string);
      }
      return result;
    };
    proto.getContext = wrapped as typeof proto.getContext;
  }
}

function uninstallCanvasGlobalPatches() {
  if (canvasMethodOriginals !== null && typeof CanvasRenderingContext2D !== "undefined") {
    const proto = CanvasRenderingContext2D.prototype as unknown as Record<string, Function>;
    for (const [method, original] of canvasMethodOriginals) {
      proto[method] = original;
    }
  }
  canvasMethodOriginals = null;
  if (getContextOriginal !== null && typeof HTMLCanvasElement !== "undefined") {
    HTMLCanvasElement.prototype.getContext = getContextOriginal;
  }
  getContextOriginal = null;
}

const activeMathRandomRecorders: Set<SessionRecorder> = new Set();
let mathRandomPrePatch: typeof Math.random | null = null;
let mathRandomWrapper: typeof Math.random | null = null;

function isNativeMathRandom(fn: typeof Math.random) {
  // Native built-ins stringify with the [native code] sentinel; any
  // user-installed PRNG (e.g. via jsPsych.randomization.setSeed) will
  // serialize as JS source instead.
  return /\{\s*\[native code\]\s*\}/.test(Function.prototype.toString.call(fn));
}

// Returns the seed string assigned by auto-seeding when this recorder
// caused the install, or null when no seeding happened (either because
// the user already installed a PRNG, or because a previous recorder
// already patched).
function registerMathRandomRecorder(recorder: SessionRecorder): string | null {
  if (activeMathRandomRecorders.has(recorder)) return null;
  let seed: string | null = null;
  if (mathRandomWrapper === null) {
    mathRandomPrePatch = Math.random;
    if (isNativeMathRandom(mathRandomPrePatch)) {
      seed = randomization.setSeed();
    }
    const upstream = Math.random.bind(Math);
    mathRandomWrapper = () => {
      const v = upstream();
      // Captured at session scope on every active recorder so calls
      // outside trial boundaries (pre-trial parameter evaluation,
      // post-trial gaps, the experimenter's `on_finish`) are still
      // recorded.
      for (const r of activeMathRandomRecorders) r.recordRngCall(v);
      return v;
    };
    Math.random = mathRandomWrapper;
  }
  activeMathRandomRecorders.add(recorder);
  return seed;
}

function unregisterMathRandomRecorder(recorder: SessionRecorder) {
  if (!activeMathRandomRecorders.delete(recorder)) return;
  if (activeMathRandomRecorders.size > 0) return;
  // Only restore if our wrapper is still installed. If the user
  // reassigned `Math.random` mid-session, leave their replacement in
  // place — clobbering it would silently undo a deliberate user
  // decision.
  if (mathRandomWrapper !== null && Math.random === mathRandomWrapper) {
    if (mathRandomPrePatch !== null) Math.random = mathRandomPrePatch;
  }
  mathRandomWrapper = null;
  mathRandomPrePatch = null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Reads the `media` attribute, preferring the parsed value on the
// CSSStyleSheet (which normalizes whitespace/casing) and falling back to
// the raw attribute on the owning element.
function readMedia(el: HTMLElement, sheet: CSSStyleSheet | null): string | null {
  const fromSheet = sheet?.media?.mediaText;
  if (fromSheet) return fromSheet;
  const attr = el.getAttribute("media");
  return attr && attr.length > 0 ? attr : null;
}

// Reads the resolved CSS rule text from a stylesheet. Returns null when
// `cssRules` is unreadable (cross-origin sheets without CORS access throw
// SecurityError) so callers can record only the href in that case.
function readSheetText(sheet: CSSStyleSheet): string | null {
  try {
    const rules = sheet.cssRules;
    if (!rules) return null;
    const parts: string[] = [];
    for (let i = 0; i < rules.length; i++) {
      parts.push(rules[i].cssText);
    }
    return parts.join("\n");
  } catch {
    return null;
  }
}

// Returns the canvas's 2d rendering context if one was already
// committed by user code, otherwise null. Calling `getContext("2d")`
// on a fresh canvas would permanently lock it to 2D and break any
// subsequent `getContext("webgl")` call from a plugin, so we only
// touch canvases whose committed type was learned via the
// `HTMLCanvasElement.prototype.getContext` wrapper installed in
// `installCanvasGlobalPatches`. Canvases of unknown or non-2d type
// fall through to full `toDataURL` snapshots in `snapshotCanvas`.
function getReadable2dContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  if (committedContextTypes.get(canvas) !== "2d") return null;
  try {
    const ctx = canvas.getContext("2d");
    return ctx ?? null;
  } catch {
    return null;
  }
}

// Finds the bounding box of pixels that differ between two same-size
// ImageData buffers. Uses an edge-shrink walk: scan top-down for the
// first dirty row, bottom-up for the last, then within that row band
// scan inward from each side for the first dirty column. For typical
// incremental drawing (a stroke, a localized clear) this terminates
// after only a few thousand pixel comparisons even on a multi-megapixel
// canvas. Returns null when the buffers are byte-identical.
//
// Exported for unit testing; a replayer doesn't need it.
export function computeDiffBbox(
  prev: Uint8ClampedArray,
  curr: Uint8ClampedArray,
  w: number,
  h: number
): { x: number; y: number; w: number; h: number } | null {
  let top = -1;
  for (let y = 0; y < h; y++) {
    const rowStart = y * w * 4;
    const rowEnd = rowStart + w * 4;
    for (let i = rowStart; i < rowEnd; i++) {
      if (prev[i] !== curr[i]) {
        top = y;
        break;
      }
    }
    if (top !== -1) break;
  }
  if (top === -1) return null;

  let bottom = top;
  for (let y = h - 1; y > top; y--) {
    const rowStart = y * w * 4;
    const rowEnd = rowStart + w * 4;
    let dirty = false;
    for (let i = rowStart; i < rowEnd; i++) {
      if (prev[i] !== curr[i]) {
        dirty = true;
        break;
      }
    }
    if (dirty) {
      bottom = y;
      break;
    }
  }

  let left = w - 1;
  let right = 0;
  for (let y = top; y <= bottom; y++) {
    const rowStart = y * w * 4;
    // Scan inward from the left up to the current `left` candidate.
    for (let x = 0; x < left; x++) {
      const i = rowStart + x * 4;
      if (
        prev[i] !== curr[i] ||
        prev[i + 1] !== curr[i + 1] ||
        prev[i + 2] !== curr[i + 2] ||
        prev[i + 3] !== curr[i + 3]
      ) {
        left = x;
        break;
      }
    }
    // Scan inward from the right past the current `right` candidate.
    for (let x = w - 1; x > right; x--) {
      const i = rowStart + x * 4;
      if (
        prev[i] !== curr[i] ||
        prev[i + 1] !== curr[i + 1] ||
        prev[i + 2] !== curr[i + 2] ||
        prev[i + 3] !== curr[i + 3]
      ) {
        right = x;
        break;
      }
    }
    if (left === 0 && right === w - 1) break;
  }

  return { x: left, y: top, w: right - left + 1, h: bottom - top + 1 };
}

// Copies a rectangular region out of a source canvas into a temporary
// canvas and returns its data URL. The temporary canvas is sized to
// the region so the resulting PNG carries only the dirty pixels.
function cropCanvasToDataURL(
  source: HTMLCanvasElement,
  region: { x: number; y: number; w: number; h: number }
): string {
  const tmp = document.createElement("canvas");
  tmp.width = region.w;
  tmp.height = region.h;
  const tctx = tmp.getContext("2d");
  if (!tctx) return source.toDataURL();
  tctx.drawImage(source, region.x, region.y, region.w, region.h, 0, 0, region.w, region.h);
  return tmp.toDataURL();
}

function readViewport(): ViewportState {
  const vv = window.visualViewport;
  return {
    w: window.innerWidth,
    h: window.innerHeight,
    dpr: window.devicePixelRatio || 1,
    scale: vv?.scale ?? 1,
    offset_x: vv?.offsetLeft ?? 0,
    offset_y: vv?.offsetTop ?? 0,
  };
}

/**
 * JSON-safe serialization for `trial_data` (the per-trial data row). Drops
 * functions and DOM nodes — the recording's visual fidelity comes from DOM
 * mutations, not from re-executing trial parameters.
 */
export function serializeJson(value: unknown, seen = new WeakSet<object>()): JsonValue {
  if (value === null || value === undefined) return null;
  const t = typeof value;
  if (t === "boolean" || t === "string") return value as JsonValue;
  if (t === "number") return Number.isFinite(value as number) ? (value as number) : null;
  if (t === "function") return null;
  if (t !== "object") return null;
  if (seen.has(value as object)) return null;
  seen.add(value as object);
  if (Array.isArray(value)) return value.map((v) => serializeJson(v, seen));
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Element || value instanceof Node) return null;
  const out: Record<string, JsonValue> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = serializeJson(v, seen);
  }
  return out;
}
