module.exports.makePackageConfig = (packageJson) => {
  const packageBaseName = packageJson.name.replace("@jspsych/", "");

  return {
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
    displayName: {
      name: packageBaseName,
      color: packageBaseName === "jspsych" ? "white" : "cyanBright",
    },
  };
};
