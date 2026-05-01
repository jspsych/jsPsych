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
  // Chronological log of `<head>` stylesheet mutations after `start()`.
  // Initial state is in `stylesheets`; this records subsequent additions,
  // removals, and `<style>` text edits so the replayer can apply them
  // alongside the per-trial DOM event stream.
  stylesheet_events: StylesheetEvent[];
  trials: TrialRecording[];
  viewport_changes: ViewportChange[];
  // Chronological log of every Math.random output consumed during the
  // session. Captured at session scope (rather than per-trial) so calls
  // outside trial boundaries — pre-trial parameter evaluation, post-trial
  // gaps, the experimenter's `on_finish` — are never dropped. A replayer
  // consumes this list in order.
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

// Captures `<canvas>` pixel state as a PNG data URL. The MutationObserver
// can't see drawing operations inside `<canvas>`; without these events a
// replayer reconstructs the element but renders it blank, so anything the
// participant drew (e.g. plugin-sketchpad strokes) would be invisible.
// Emitted at gesture boundaries (mouseup/touchend) and at trial end, with
// per-canvas throttling and a same-as-last-snapshot dedupe.
export interface CanvasSnapshot {
  type: "canvas.snapshot";
  t: number;
  node: number;
  data_url: string;
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
// Per-canvas minimum gap between gesture-driven snapshots. Bounds the
// `toDataURL` cost for users who rapidly click/release; trial-end
// captures bypass this so the final state always lands.
const CANVAS_SNAPSHOT_MIN_INTERVAL_MS = 250;

export interface SessionRecorderOptions {
  jspsychVersion: string;
}

export class SessionRecorder {
  private readonly jspsychVersion: string;
  private recording: SessionRecording;
  private displayElement: HTMLElement | null = null;
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

  private mouseRafScheduled = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private mouseDirty = false;

  private scrollRafScheduled = false;
  // Pending scroll state to flush at next animation frame. Key "window"
  // refers to the document scroll; numeric keys are tracked node IDs.
  private pendingScroll: Map<number | "window", { x: number; y: number }> = new Map();

  private inputRafScheduled = false;
  // Latest value-per-input collected within the current animation frame.
  // Coalesced so a fast typist produces one record per RAF rather than
  // one per keystroke (matching how mouse.move is throttled).
  private pendingInput: Map<number, string> = new Map();

  private viewportTimer: ReturnType<typeof setTimeout> | null = null;
  private lastViewport: ViewportState | null = null;

  private mediaListeners = new WeakMap<HTMLMediaElement, (ev: Event) => void>();
  private mediaTimeLast = new WeakMap<HTMLMediaElement, number>();
  // Strong ref to currently tracked media elements so we can iterate and
  // remove their listeners when the trial ends. Cleared on detach.
  private mediaTrackedElements = new Set<HTMLMediaElement>();

  // Strong ref to canvas elements within the current trial's display
  // subtree. Used to drive deferred snapshotting after gestures and at
  // trial end. Per-canvas throttle/dedupe state is held alongside.
  private canvasTrackedElements = new Set<HTMLCanvasElement>();
  private canvasLastSnapshot = new WeakMap<HTMLCanvasElement, string>();
  private canvasLastSnapshotTime = new WeakMap<HTMLCanvasElement, number>();
  private canvasSnapshotScheduled = false;

  // Reference to whatever `Math.random` was immediately before the recorder
  // started. Restored verbatim on stop so opting into recording does not
  // permanently alter `Math.random`, even if we auto-seeded.
  private originalMathRandom: () => number = Math.random;
  private mathRandomPatched = false;

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

  start(displayElement: HTMLElement) {
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
    this.mouseRafScheduled = false;
    this.scrollRafScheduled = false;
    this.pendingScroll.clear();
    this.inputRafScheduled = false;
    this.pendingInput.clear();

    this.patchMathRandom();
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
    this.unpatchMathRandom();
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
    this.currentTrial.initial_dom = this.serializeNode(this.displayElement);
    this.attachTrialListeners();
    this.scanForMediaElements(this.displayElement);
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
    this.bind(window, "resize", this.scheduleViewportRead);
    if (window.visualViewport) {
      this.bind(window.visualViewport, "resize", this.scheduleViewportRead);
      this.bind(window.visualViewport, "scroll", this.scheduleViewportRead);
    }
    this.bind(window, "focus", () => this.pushFocus("focus"));
    this.bind(window, "blur", () => this.pushFocus("blur"));
    this.bind(document, "fullscreenchange", () => {
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

    this.bind(el, "mousemove", this.handleMouseMove);
    this.bind(el, "mousedown", this.handleMouseButton("mouse.down"));
    this.bind(el, "mouseup", this.handleMouseButton("mouse.up"));
    this.bind(el, "click", this.handleMouseButton("mouse.click"));
    this.bind(el, "touchstart", this.handleTouch("touch.start"), { passive: true });
    this.bind(el, "touchmove", this.handleTouch("touch.move"), { passive: true });
    this.bind(el, "touchend", this.handleTouch("touch.end"), { passive: true });
    // Keyboard and clipboard events are listened at document scope in the
    // capture phase: they may be dispatched on any element (including
    // descendants of the body), and capture-phase listening ensures we see
    // them before any user-attached handler can call stopPropagation.
    this.bind(document, "keydown", this.handleKey("key.down"), true);
    this.bind(document, "keyup", this.handleKey("key.up"), true);
    this.bind(document, "copy", this.handleClipboard("clipboard.copy"), true);
    this.bind(document, "cut", this.handleClipboard("clipboard.cut"), true);
    this.bind(document, "paste", this.handleClipboard("clipboard.paste"), true);
    // Scroll events do not bubble, so capture-phase listening at document
    // scope catches scroll on any descendant element. Window scrolling is
    // handled by the same listener via a Document target check.
    this.bind(document, "scroll", this.handleScroll, true);
    // Form-state events. `input` covers text fields, textareas, and
    // sliders (fires on every value change). `change` covers checkboxes,
    // radios, and selects (fires on commit). Capture phase at document
    // scope so nothing in user code can stopPropagation past us.
    this.bind(document, "input", this.handleInputEvent, true);
    this.bind(document, "change", this.handleChangeEvent, true);
  }

  private detachTrialListeners() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    this.detachMediaListeners();
    this.canvasTrackedElements.clear();
    this.canvasSnapshotScheduled = false;
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
    if (node instanceof HTMLCanvasElement && this.canvasTrackedElements.has(node)) {
      // jsPsych core clears the display element via `innerHTML = ""`
      // immediately after each trial, before `onTrialFinish` fires. Take
      // a final snapshot here so the canvas's last pixel state is in the
      // recording instead of being silently dropped on removal.
      this.snapshotCanvas(node, this.t(), true);
      this.canvasTrackedElements.delete(node);
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

  private handleMouseMove = (ev: Event) => {
    const e = ev as MouseEvent;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.mouseDirty = true;
    if (!this.mouseRafScheduled) {
      this.mouseRafScheduled = true;
      requestAnimationFrame(() => {
        this.mouseRafScheduled = false;
        this.flushPendingMouse();
      });
    }
  };

  private flushPendingMouse() {
    if (!this.mouseDirty) return;
    this.mouseDirty = false;
    this.pushEvent({
      type: "mouse.move",
      t: this.t(),
      x: this.lastMouseX,
      y: this.lastMouseY,
    });
  }

  private handleScroll = (ev: Event) => {
    const target = ev.target;
    if (target === document || target === document.documentElement || target === document.body) {
      this.pendingScroll.set("window", {
        x: window.scrollX,
        y: window.scrollY,
      });
    } else if (target instanceof Element) {
      const id = this.nodeIds.get(target);
      if (id === undefined) return;
      this.pendingScroll.set(id, { x: target.scrollLeft, y: target.scrollTop });
    } else {
      return;
    }
    if (!this.scrollRafScheduled) {
      this.scrollRafScheduled = true;
      requestAnimationFrame(() => {
        this.scrollRafScheduled = false;
        this.flushPendingScroll();
      });
    }
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
    if (!this.inputRafScheduled) {
      this.inputRafScheduled = true;
      requestAnimationFrame(() => {
        this.inputRafScheduled = false;
        this.flushPendingInput();
      });
    }
  };

  private flushPendingInput() {
    if (this.pendingInput.size === 0) return;
    const t = this.t();
    for (const [node, value] of this.pendingInput) {
      this.pushEvent({ type: "input.value", t, node, value });
    }
    this.pendingInput.clear();
  }

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

  private flushPendingScroll() {
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
  }

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
      if (type === "mouse.up") this.scheduleCanvasSnapshot();
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
      if (type === "touch.end") this.scheduleCanvasSnapshot();
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
    media.addEventListener("play", handler);
    media.addEventListener("pause", handler);
    media.addEventListener("ended", handler);
    media.addEventListener("seeked", handler);
    media.addEventListener("timeupdate", handler);
    this.mediaTrackedElements.add(media);
    this.mediaListeners.set(media, handler);
  }

  private detachMediaListeners() {
    for (const media of this.mediaTrackedElements) {
      const handler = this.mediaListeners.get(media);
      if (!handler) continue;
      media.removeEventListener("play", handler);
      media.removeEventListener("pause", handler);
      media.removeEventListener("ended", handler);
      media.removeEventListener("seeked", handler);
      media.removeEventListener("timeupdate", handler);
      this.mediaListeners.delete(media);
    }
    this.mediaTrackedElements.clear();
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
    this.canvasTrackedElements.add(canvas);
  }

  // Defers actual snapshotting to the next animation frame so we wait
  // until the page has had a chance to paint the post-gesture state
  // (otherwise `toDataURL` could return the canvas as it was *before*
  // the up event's listeners ran). Coalesced via a single scheduled flag
  // so a flurry of mouseups doesn't queue redundant work.
  private scheduleCanvasSnapshot() {
    if (this.canvasSnapshotScheduled) return;
    if (this.canvasTrackedElements.size === 0) return;
    this.canvasSnapshotScheduled = true;
    requestAnimationFrame(() => {
      this.canvasSnapshotScheduled = false;
      this.captureCanvasSnapshots(false);
    });
  }

  // Throttles to at most one snapshot per canvas per
  // `CANVAS_SNAPSHOT_MIN_INTERVAL_MS`, and dedupes by data URL so a
  // canvas whose pixels did not actually change does not produce noise.
  // `force` bypasses the throttle for trial-end captures so the final
  // state of every canvas is always recorded.
  private captureCanvasSnapshots(force: boolean) {
    if (this.canvasTrackedElements.size === 0) return;
    const now = this.t();
    for (const canvas of this.canvasTrackedElements) {
      this.snapshotCanvas(canvas, now, force);
    }
  }

  // Pushes a `canvas.snapshot` event for one canvas, applying the
  // per-canvas throttle (unless `force`) and skipping when the data URL
  // is unchanged from the last snapshot. Pulled out of the loop above so
  // it can also be called from `releaseSubtree` to capture the final
  // pixel state at the moment a canvas is removed from the trial DOM —
  // jsPsych core clears the display element via `innerHTML = ""` before
  // `onTrialFinish` runs, so a trial-end-only flush would miss it.
  private snapshotCanvas(canvas: HTMLCanvasElement, t: number, force: boolean) {
    const id = this.nodeIds.get(canvas);
    if (id === undefined) return;
    if (!force) {
      const last = this.canvasLastSnapshotTime.get(canvas) ?? -Infinity;
      if (t - last < CANVAS_SNAPSHOT_MIN_INTERVAL_MS) return;
    }
    try {
      const dataUrl = canvas.toDataURL();
      if (this.canvasLastSnapshot.get(canvas) === dataUrl) return;
      this.canvasLastSnapshot.set(canvas, dataUrl);
      this.canvasLastSnapshotTime.set(canvas, t);
      this.pushEvent({ type: "canvas.snapshot", t, node: id, data_url: dataUrl });
    } catch {
      // toDataURL throws SecurityError on tainted canvases (canvases
      // that drew cross-origin images without CORS headers). Skip and
      // never break the experiment.
    }
  }

  // -------- RNG --------

  private isNativeMathRandom(fn: typeof Math.random) {
    // Native built-ins stringify with the [native code] sentinel; any
    // user-installed PRNG (e.g. via jsPsych.randomization.setSeed) will
    // serialize as JS source instead.
    return /\{\s*\[native code\]\s*\}/.test(Function.prototype.toString.call(fn));
  }

  private patchMathRandom() {
    if (this.mathRandomPatched) return;
    // Capture the *true* pre-recording Math.random before any potential
    // auto-seeding so `stop()` can restore exactly what was there.
    this.originalMathRandom = Math.random;

    // Only auto-seed when Math.random is the native function; if the user
    // already installed a seeded PRNG, leave it alone.
    if (this.recording.rng.seed === null && this.isNativeMathRandom(this.originalMathRandom)) {
      this.recording.rng.seed = randomization.setSeed();
    }

    const upstream = Math.random.bind(Math);
    Math.random = () => {
      const v = upstream();
      // Captured at session scope: includes calls during pre-trial
      // parameter evaluation, post-trial gaps, and the experimenter's
      // `on_finish` — none of which are bracketed by a current trial.
      this.recording.rng_calls.push({ t: this.t(), fn: "Math.random", args: [], result: v });
      return v;
    };
    this.mathRandomPatched = true;
    this.recording.rng.math_random_patched = true;
  }

  private unpatchMathRandom() {
    if (!this.mathRandomPatched) return;
    Math.random = this.originalMathRandom;
    this.mathRandomPatched = false;
  }

  // -------- helpers --------

  private bind(
    target: EventTarget,
    type: string,
    handler: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean
  ) {
    target.addEventListener(type, handler, options);
    // Trial-scoped binds happen while `mutationObserver` is set (i.e. inside
    // `attachTrialListeners`); session-scoped binds happen when it is not.
    const trial = this.mutationObserver !== null;
    this.boundHandlers.push({ target, type, handler, options, trial });
  }

  private pushEvent(ev: RecordedEvent) {
    if (this.currentTrial) this.currentTrial.events.push(ev);
  }

  private t(): number {
    return performance.now() - this.startPerf;
  }
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
