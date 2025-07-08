const path = require("path");
const makePackageConfig = require("@jspsych/config/jest").makePackageConfig;

const config = makePackageConfig(__dirname);

// Add setup file for mocking resizeObserver (required for SurveyJS)
config.setupFiles = [
  require.resolve("jest-canvas-mock"),
  path.resolve(__dirname, "jest.resizeObserverMock.js"),
];

module.exports = config;
