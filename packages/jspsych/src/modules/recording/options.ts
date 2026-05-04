/**
 * Options for `initJsPsych({ record_session })`. Pass `true` for the
 * defaults, `false` to disable, or this object to tune what gets
 * captured. Each `capture_*` flag defaults to `true`; setting one to
 * `false` skips both the listeners and the corresponding event types in
 * the recording.
 */
export interface RecordSessionOptions {
  /** Capture form input values (text, textarea, checkbox/radio, select).
   *  Defaults true. Set false for surveys whose responses must not be
   *  retained verbatim. */
  capture_inputs?: boolean;
  /** Capture canvas pixel snapshots. Defaults true. Set false when
   *  experiments use large/animated canvases and the pixel readback
   *  would dominate recording size or perturb timing. */
  capture_canvas?: boolean;
  /** Capture every `Math.random()` output to `rng_calls`. Defaults true.
   *  Set false when reproducibility isn't needed and the RNG is called
   *  millions of times (e.g. shuffling a large array per trial). */
  capture_random?: boolean;
  /** Hard cap on total recorded events across all categories
   *  (per-trial events + rng_calls + viewport_changes + stylesheet_events).
   *  When exceeded, recording stops with `end_reason: "memory_limit"`.
   *  Defaults to no limit. */
  max_events?: number;
}

export interface ResolvedRecordSessionOptions {
  capture_inputs: boolean;
  capture_canvas: boolean;
  capture_random: boolean;
  max_events: number;
}

/**
 * Normalizes the user-facing `record_session` value into either `null`
 * (disabled) or a fully-defaulted options object. Exported for callers
 * (e.g. `JsPsych`) that need to decide whether to construct a recorder.
 */
export function resolveRecordSessionOptions(
  raw: boolean | RecordSessionOptions | undefined
): ResolvedRecordSessionOptions | null {
  if (!raw) return null;
  const obj = raw === true ? {} : raw;
  return {
    capture_inputs: obj.capture_inputs ?? true,
    capture_canvas: obj.capture_canvas ?? true,
    capture_random: obj.capture_random ?? true,
    max_events: obj.max_events ?? Infinity,
  };
}
