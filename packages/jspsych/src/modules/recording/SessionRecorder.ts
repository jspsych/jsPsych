import {
  CANVAS_ANIMATION_MIN_INTERVAL_MS,
  CANVAS_FULL_SNAPSHOT_AREA_FRACTION,
  CANVAS_SNAPSHOT_MIN_INTERVAL_MS,
  CanvasState,
  MEDIA_EVENTS,
  MEDIA_TIME_THROTTLE_MS,
  RNG_NO_ARGS,
  SCHEMA_VERSION,
  VIEWPORT_DEBOUNCE_MS,
} from "./constants";
import {
  getReadable2dContext,
  registerCanvasRecorder,
  registerMathRandomRecorder,
  unregisterCanvasRecorder,
  unregisterMathRandomRecorder,
} from "./global-patches";
import {
  computeDiffBbox,
  cropCanvasToDataURL,
  readMedia,
  readSheetText,
  readViewport,
  serializeJson,
} from "./helpers";
import type { ResolvedRecordSessionOptions } from "./options";
import type {
  ClipboardRecord,
  DomNode,
  ElementNode,
  FocusRecord,
  MediaRecord,
  RecordedEvent,
  SessionRecording,
  StylesheetSnapshot,
  TrialRecording,
  ViewportState,
} from "./types";

export interface SessionRecorderOptions {
  jspsychVersion: string;
  recordOptions: ResolvedRecordSessionOptions;
}

export class SessionRecorder {
  private readonly jspsychVersion: string;
  private readonly opts: ResolvedRecordSessionOptions;
  // Total events recorded across all categories (per-trial events,
  // rng_calls, viewport_changes, stylesheet_events). Compared against
  // `opts.max_events` to enforce the heap bound.
  private totalEventCount = 0;
  private stopRequested = false;
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
  // structure.
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
    this.opts = options.recordOptions;
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
    this.totalEventCount = 0;
    this.stopRequested = false;

    if (this.opts.capture_random) {
      const seed = registerMathRandomRecorder(this);
      if (seed !== null) this.recording.rng.seed = seed;
      this.recording.rng.math_random_patched = true;
    }
    if (this.opts.capture_canvas) registerCanvasRecorder(this);
    this.attachSessionListeners();
  }

  stop(reason: "finished" | "aborted" | "unload" | "memory_limit" = "finished") {
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
    // Registers each canvas and schedules an initial baseline snapshot
    // so synchronously-drawn stimuli (canvas-button-response,
    // canvas-keyboard-response, …) are captured before any interaction.
    if (this.opts.capture_canvas) this.scanForCanvasElements(this.displayElement);
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
        if (this.checkEventBudget()) {
          this.recording.viewport_changes.push({ t: this.t(), ...v });
        }
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
    // scope so nothing in user code can stopPropagation past us. Gated
    // by `capture_inputs` for surveys whose values must not be recorded.
    if (this.opts.capture_inputs) {
      this.bindTrial(document, "input", this.handleInputEvent, true);
      this.bindTrial(document, "change", this.handleChangeEvent, true);
    }
  }

  private detachTrialListeners() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    this.detachMediaListeners();
    // Strong refs drop here; explicit deletion happens in `releaseSubtree`
    // for canvases removed mid-trial.
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
            if (this.opts.capture_canvas) {
              if (added instanceof HTMLCanvasElement) this.trackCanvasElement(added);
              else if (added instanceof Element) this.scanForCanvasElements(added);
            }
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
            if (this.checkEventBudget()) {
              this.recording.stylesheet_events.push({ type: "stylesheet.remove", t, id });
            }
          }
          for (const added of Array.from(r.addedNodes)) {
            if (!(added instanceof HTMLStyleElement) && !(added instanceof HTMLLinkElement)) {
              continue;
            }
            if (this.styleNodeIds.has(added)) continue;
            const snap = this.snapshotStylesheetElement(added as HTMLElement);
            if (snap && this.checkEventBudget()) {
              this.recording.stylesheet_events.push({ type: "stylesheet.add", t, sheet: snap });
            }
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
      if (!this.checkEventBudget()) break;
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
    if (!this.checkEventBudget()) return;
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
    if (!this.currentTrial) return;
    if (!this.checkEventBudget()) return;
    this.currentTrial.events.push(ev);
  }

  // Increments the session-wide event counter and triggers a memory-
  // limit shutdown when the cap is exceeded. Returns false if the
  // caller should drop the event. Defers the actual `stop()` to a
  // microtask so any in-flight synchronous batch (mutation observer
  // burst, etc.) can complete cleanly.
  private checkEventBudget(): boolean {
    if (this.totalEventCount >= this.opts.max_events) {
      if (!this.stopRequested) {
        this.stopRequested = true;
        queueMicrotask(() => this.stop("memory_limit"));
      }
      return false;
    }
    this.totalEventCount++;
    return true;
  }

  private t(): number {
    return performance.now() - this.startPerf;
  }
}
