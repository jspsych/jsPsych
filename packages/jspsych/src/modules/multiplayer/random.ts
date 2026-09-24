/**
 * Randomness that every participant in a group agrees on without sending
 * anything. Each value is a pure function of the session's seed, the method
 * that asked for it, and a key the caller names, so it doesn't matter how many
 * calls each participant makes, in what order, or whether they reloaded.
 *
 * Only 32-bit integer operations and one exact division are used, so every
 * browser computes the same values. Changing the hash, the generator, or how
 * a method consumes it changes the values every existing seed produces, which
 * is a breaking change.
 */

/** cyrb128: hash a string into four 32-bit words to seed sfc32. */
function cyrb128(str: string): [number, number, number, number] {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4;
  h2 ^= h1;
  h3 ^= h1;
  h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

/** sfc32: a small, fast generator returning floats in [0, 1). */
function sfc32(a: number, b: number, c: number, d: number): () => number {
  return () => {
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

/** Outputs discarded after seeding, so similar seeds don't start out similar. */
const WARM_UP = 15;

function assertKey(key: unknown): asserts key is string {
  if (typeof key !== "string" || key === "") {
    throw new TypeError(
      "MultiplayerAPI: random values need a non-empty string key that names what they are for."
    );
  }
}

function assertArray(array: unknown): asserts array is readonly unknown[] {
  if (!Array.isArray(array)) {
    throw new TypeError("MultiplayerAPI: expected an array.");
  }
}

/** Random values shared by every participant who uses the same seed. */
export class SharedRandom {
  constructor(private readonly seed: string) {}

  /**
   * A fresh generator for one call. The method name is part of the hash so
   * that, for example, random("x") and shuffle("x", ...) aren't correlated.
   */
  private generator(method: string, key: string): () => number {
    // A JSON array keeps "a|b" + "c" and "a" + "b|c" apart
    const next = sfc32(...cyrb128(JSON.stringify([this.seed, method, key])));
    for (let i = 0; i < WARM_UP; i++) {
      next();
    }
    return next;
  }

  /** A float in [0, 1). */
  random(key: string): number {
    assertKey(key);
    return this.generator("random", key)();
  }

  /** An integer from `lower` to `upper`, inclusive. */
  randomInt(key: string, lower: number, upper: number): number {
    assertKey(key);
    if (!Number.isSafeInteger(lower) || !Number.isSafeInteger(upper)) {
      throw new TypeError("MultiplayerAPI: randomInt() bounds must be integers.");
    }
    if (upper < lower) {
      throw new RangeError("MultiplayerAPI: randomInt() upper bound must be at least the lower.");
    }
    return lower + Math.floor(this.generator("randomInt", key)() * (upper - lower + 1));
  }

  /** A shuffled copy of `array`. The array itself is left unchanged. */
  shuffle<T>(key: string, array: readonly T[]): T[] {
    assertKey(key);
    assertArray(array);
    const next = this.generator("shuffle", key);
    const result = [...array];
    // Fisher-Yates
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /** `size` items drawn from `array` without replacement, in random order. */
  sample<T>(key: string, array: readonly T[], size: number): T[] {
    assertKey(key);
    assertArray(array);
    if (!Number.isSafeInteger(size) || size < 0 || size > array.length) {
      throw new RangeError(
        "MultiplayerAPI: sample() size must be an integer from 0 to the array's length."
      );
    }
    const next = this.generator("sample", key);
    const result = [...array];
    // Fisher-Yates, stopped once the first `size` places are filled
    for (let i = 0; i < size; i++) {
      const j = i + Math.floor(next() * (result.length - i));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result.slice(0, size);
  }
}
