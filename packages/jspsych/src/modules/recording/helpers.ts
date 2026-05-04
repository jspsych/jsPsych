import type { JsonValue, ViewportState } from "./types";

// Reads the `media` attribute, preferring the parsed value on the
// CSSStyleSheet (which normalizes whitespace/casing) and falling back to
// the raw attribute on the owning element.
export function readMedia(el: HTMLElement, sheet: CSSStyleSheet | null): string | null {
  const fromSheet = sheet?.media?.mediaText;
  if (fromSheet) return fromSheet;
  const attr = el.getAttribute("media");
  return attr && attr.length > 0 ? attr : null;
}

// Reads the resolved CSS rule text from a stylesheet. Returns null when
// `cssRules` is unreadable (cross-origin sheets without CORS access throw
// SecurityError) so callers can record only the href in that case.
export function readSheetText(sheet: CSSStyleSheet): string | null {
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
export function cropCanvasToDataURL(
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

export function readViewport(): ViewportState {
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
