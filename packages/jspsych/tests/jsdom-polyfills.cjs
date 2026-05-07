// jsdom does not expose the Web Streams APIs or the
// TextEncoder/TextDecoder pair, even though Node 18+ provides both.
// Without this shim, code that uses `new CompressionStream()` etc.
// cannot run under `testEnvironment: "jsdom"`, which would force the
// recorder's compressed-recording path into browser-only territory and
// leave it untested. We import the Node implementations and assign
// them onto `globalThis` so test code sees the same surface a real
// browser would.
const { TextEncoder, TextDecoder } = require("util");
const {
  CompressionStream,
  DecompressionStream,
  ReadableStream,
  WritableStream,
  TransformStream,
} = require("stream/web");
const { Blob } = require("buffer");

Object.assign(globalThis, {
  TextEncoder,
  TextDecoder,
  CompressionStream,
  DecompressionStream,
  ReadableStream,
  WritableStream,
  TransformStream,
  // jsdom's Blob is missing `.arrayBuffer()`, `.text()`, and `.stream()`
  // (they were added in much newer Web spec revisions). Node's
  // `node:buffer.Blob` implements the full Web API, so use it instead.
  Blob,
});
