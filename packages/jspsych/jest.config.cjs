const baseConfig = require("@jspsych/config/jest").makePackageConfig(__dirname);

module.exports = {
  ...baseConfig,
  // Polyfill Web Streams / Fetch / TextEncoder onto the jsdom global so
  // code that uses `CompressionStream`, `Response`, etc. (e.g. the
  // session recording's compressed-output path) is testable here.
  setupFiles: [...(baseConfig.setupFiles ?? []), require.resolve("./tests/jsdom-polyfills.cjs")],
};
