// Multiple `JsPsych` instances can run with `record_session: true`
// concurrently. The previous implementation patched
// `CanvasRenderingContext2D.prototype` and `Math.random` per-recorder,
// which meant the second recorder's "original" was actually the first
// recorder's wrapper; restoring on stop in interleaved order left the
// process with stale wrappers reinstalled on the prototype. The
// helpers below install each global patch exactly once (refcounted by
// the set of active recorders) so registration/unregistration order
// is irrelevant.

import * as randomization from "../randomization";
import { CANVAS_DRAW_METHODS } from "./constants";

// Just the recorder methods this module needs to call. Avoids a cycle
// with `SessionRecorder.ts`; the concrete class structurally satisfies
// this.
interface RecorderHooks {
  notifyCanvasDraw(canvas: HTMLCanvasElement): void;
  recordRngCall(value: number): void;
}

// ---------------------------------------------------------------------------
// Canvas: 2d-context draw methods + getContext type-tracking
// ---------------------------------------------------------------------------

const activeCanvasRecorders: Set<RecorderHooks> = new Set();
let canvasMethodOriginals: Map<string, Function> | null = null;
// Per-canvas committed context type, learned by wrapping
// `HTMLCanvasElement.prototype.getContext`. The recorder consults
// this map to decide whether `getContext("2d")` is safe to call —
// see `getReadable2dContext` for the rationale.
const committedContextTypes: WeakMap<HTMLCanvasElement, string> = new WeakMap();
let getContextOriginal: HTMLCanvasElement["getContext"] | null = null;

export function registerCanvasRecorder(recorder: RecorderHooks) {
  if (activeCanvasRecorders.has(recorder)) return;
  installCanvasGlobalPatches();
  activeCanvasRecorders.add(recorder);
}

export function unregisterCanvasRecorder(recorder: RecorderHooks) {
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

// Returns the canvas's 2d rendering context if user code has already
// committed one, otherwise null. Calling `getContext("2d")` on a fresh
// canvas would permanently lock it to 2D and break any subsequent
// `getContext("webgl")` call from a plugin, so we only touch canvases
// whose committed type was learned via the `getContext` wrapper above.
// Canvases of unknown or non-2d type fall through to full `toDataURL`
// snapshots in `snapshotCanvas`.
export function getReadable2dContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  if (committedContextTypes.get(canvas) !== "2d") return null;
  try {
    const ctx = canvas.getContext("2d");
    return ctx ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Math.random
// ---------------------------------------------------------------------------

const activeMathRandomRecorders: Set<RecorderHooks> = new Set();
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
export function registerMathRandomRecorder(recorder: RecorderHooks): string | null {
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

export function unregisterMathRandomRecorder(recorder: RecorderHooks) {
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
