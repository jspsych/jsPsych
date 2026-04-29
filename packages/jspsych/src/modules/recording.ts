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
  rng: { seed: string | number | null; math_random_patched: boolean };
  display_element_id: string;
  trials: TrialRecording[];
  viewport_changes: ViewportChange[];
  ended_at_perf: number | null;
  end_reason: "finished" | "aborted" | "unload" | null;
}

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
  trial_params: JsonValue;
  stimulus_source: string | null;
  rng_state_at_start: JsonValue;
  initial_dom: DomNode | null;
  events: RecordedEvent[];
  rng_calls: RngCall[];
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
  | ScrollRecord;

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
    };

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

export interface SessionRecorderOptions {
  jspsychVersion: string;
}

export class SessionRecorder {
  private recording: SessionRecording;
  private displayElement: HTMLElement | null = null;

  private startPerf = 0;
  private currentTrial: TrialRecording | null = null;

  private nodeIds = new WeakMap<Node, number>();
  private idToNode = new Map<number, Node>();
  private nextNodeId = 1;

  private mutationObserver: MutationObserver | null = null;

  private mouseRafScheduled = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private mouseDirty = false;

  private scrollRafScheduled = false;
  // Pending scroll state to flush at next animation frame. Key "window"
  // refers to the document scroll; numeric keys are tracked node IDs.
  private pendingScroll: Map<number | "window", { x: number; y: number }> = new Map();

  private viewportTimer: ReturnType<typeof setTimeout> | null = null;
  private lastViewport: ViewportState | null = null;

  private mediaListeners = new WeakMap<HTMLMediaElement, (ev: Event) => void>();
  private mediaTimeLast = new WeakMap<HTMLMediaElement, number>();

  private originalMathRandom: () => number = Math.random.bind(Math);
  private mathRandomPatched = false;

  private boundHandlers: Array<{
    target: EventTarget;
    type: string;
    handler: EventListenerOrEventListenerObject;
    options?: AddEventListenerOptions | boolean;
  }> = [];

  constructor(options: SessionRecorderOptions) {
    this.recording = {
      schema_version: SCHEMA_VERSION,
      jspsych_version: options.jspsychVersion,
      recording_started_at: "",
      recording_started_at_perf: 0,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      viewport: { w: 0, h: 0, dpr: 1, scale: 1, offset_x: 0, offset_y: 0 },
      rng: { seed: null, math_random_patched: false },
      display_element_id: "",
      trials: [],
      viewport_changes: [],
      ended_at_perf: null,
      end_reason: null,
    };
  }

  // -------- lifecycle --------

  start(displayElement: HTMLElement) {
    this.displayElement = displayElement;
    this.startPerf = performance.now();
    this.recording.recording_started_at = new Date().toISOString();
    this.recording.recording_started_at_perf = this.startPerf;
    this.recording.display_element_id = displayElement.id || "";
    this.recording.viewport = readViewport();
    this.lastViewport = { ...this.recording.viewport };

    this.patchMathRandom();
    this.attachSessionListeners();
  }

  stop(reason: "finished" | "aborted" | "unload" = "finished") {
    if (this.recording.end_reason) return;
    this.detachTrialListeners();
    this.detachSessionListeners();
    this.unpatchMathRandom();
    this.recording.ended_at_perf = this.t();
    this.recording.end_reason = reason;
  }

  getRecording(): SessionRecording {
    return this.recording;
  }

  // -------- per-trial hooks --------

  onTrialStart(info: {
    trial_index: number;
    plugin: string;
    trial_params: unknown;
    stimulus_source: string | null;
  }) {
    this.currentTrial = {
      trial_index: info.trial_index,
      t_start: this.t(),
      t_dom_ready: null,
      t_end: null,
      plugin: info.plugin,
      trial_params: serializeJson(info.trial_params),
      stimulus_source: info.stimulus_source,
      // Per-trial RNG state snapshot is omitted in v1; the call log in
      // `rng_calls` is sufficient to deterministically replay a trial.
      rng_state_at_start: null,
      initial_dom: null,
      events: [],
      rng_calls: [],
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
  }

  onTrialFinish(trialData: unknown) {
    if (!this.currentTrial) return;
    this.flushPendingMouse();
    this.flushPendingScroll();
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
  }

  private detachSessionListeners() {
    if (this.viewportTimer) {
      clearTimeout(this.viewportTimer);
      this.viewportTimer = null;
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
  }

  private detachTrialListeners() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    // Trial-scoped handlers are recorded in boundHandlers alongside session
    // ones; we tear down all and re-attach session listeners on next start.
    // Simpler: detach only the trial-scoped ones tagged via __trial flag.
    const remaining: typeof this.boundHandlers = [];
    for (const b of this.boundHandlers) {
      if ((b as any).__trial) {
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
    const id = this.nodeIds.get(node);
    if (id !== undefined) {
      this.nodeIds.delete(node);
      this.idToNode.delete(id);
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

  private assignId(node: Node): number {
    let id = this.nodeIds.get(node);
    if (id === undefined) {
      id = this.nextNodeId++;
      this.nodeIds.set(node, id);
      this.idToNode.set(id, node);
    }
    return id;
  }

  private resetNodeIds() {
    this.nodeIds = new WeakMap();
    this.idToNode = new Map();
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
    this.mediaListeners.set(media, handler);
  }

  // -------- RNG --------

  private patchMathRandom() {
    if (this.mathRandomPatched) return;
    if (this.recording.rng.seed === null) {
      this.recording.rng.seed = randomization.setSeed();
    }
    this.originalMathRandom = Math.random.bind(Math);
    const orig = this.originalMathRandom;
    const recordCall = (result: number) => {
      const target = this.currentTrial;
      if (!target) return;
      target.rng_calls.push({ t: this.t(), fn: "Math.random", args: [], result });
    };
    Math.random = () => {
      const v = orig();
      recordCall(v);
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
    const entry = { target, type, handler, options };
    if (this.mutationObserver) (entry as any).__trial = true;
    this.boundHandlers.push(entry);
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
 * JSON-safe serialization that preserves function source via a sentinel so
 * trial parameters that contain stimulus functions (e.g. canvas plugins)
 * survive the round trip.
 */
export function serializeJson(value: unknown, seen = new WeakSet<object>()): JsonValue {
  if (value === null || value === undefined) return null;
  const t = typeof value;
  if (t === "boolean" || t === "string") return value as JsonValue;
  if (t === "number") return Number.isFinite(value as number) ? (value as number) : null;
  if (t === "function") return { __fn__: (value as Function).toString() };
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

/**
 * Pulls a stimulus function's source for plugins (e.g. canvas-style) where
 * the visual is generated by user code rather than markup.
 */
export function extractStimulusSource(trialObject: unknown): string | null {
  if (!trialObject || typeof trialObject !== "object") return null;
  const stim = (trialObject as Record<string, unknown>).stimulus;
  if (typeof stim === "function") return (stim as Function).toString();
  return null;
}
