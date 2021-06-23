module.exports = {
  resetModules: true,
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    fetchExternalResources: true,
    pretendToBeVisual: true,
  },
  testURL: "http://localhost/",
  transform: {
    "\\.js$": ["babel-jest", { configFile: "@jspsych/config/babel.test.config.js" }],
  },
};
