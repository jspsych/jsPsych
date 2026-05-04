import type { JsonValue } from "./types";

export const SCHEMA_VERSION = 1;
export const VIEWPORT_DEBOUNCE_MS = 100;
export const MEDIA_TIME_THROTTLE_MS = 250;

// Hoisted to avoid allocating a fresh empty array on every Math.random
// call; the rng_calls log can grow into the millions for a long
// randomization-heavy session.
export const RNG_NO_ARGS: JsonValue[] = [];

// Events listened on `<video>` / `<audio>` while a trial is active.
// Listed once so attach/detach iterate the same set without drift.
export const MEDIA_EVENTS = ["play", "pause", "ended", "seeked", "timeupdate"] as const;

// Per-canvas minimum gap between gesture-driven snapshots. Bounds the
// `toDataURL` cost for users who rapidly click/release; trial-end
// captures bypass this so the final state always lands.
export const CANVAS_SNAPSHOT_MIN_INTERVAL_MS = 250;

// When the changed bounding box covers more than this fraction of the
// canvas, fall back to a full snapshot. Cropping a near-full region
// pays the `getImageData` + `drawImage` + `toDataURL` cost of a full
// snapshot anyway, so the partial-snapshot bookkeeping is wasted.
export const CANVAS_FULL_SNAPSHOT_AREA_FRACTION = 0.8;

// Per-canvas minimum gap between draw-triggered animation snapshots.
// Distinct from `CANVAS_SNAPSHOT_MIN_INTERVAL_MS`, which throttles the
// gesture-driven path. ~15 Hz is enough fidelity for replaying typical
// canvas animations without producing 60 PNGs/sec for a continuously-
// repainting stimulus.
export const CANVAS_ANIMATION_MIN_INTERVAL_MS = 66;

// Pixel-mutating methods on `CanvasRenderingContext2D`. Path-state
// methods (`beginPath`, `moveTo`, `lineTo`, …) are intentionally
// omitted: they don't change pixels until `fill` or `stroke` is called.
export const CANVAS_DRAW_METHODS = [
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
export interface CanvasState {
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
