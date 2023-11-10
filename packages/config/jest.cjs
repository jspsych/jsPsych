const hq = require("alias-hq");

/** @type { (dirname: string) => import('@jest/types').Config.InitialOptions } */
module.exports.makePackageConfig = (dirname) => {
  const packageJson = require(dirname + "/package.json");
  const packageBaseName = packageJson.name.replace("@jspsych/", "");

  return {
    transform: { "\\.(js|jsx|ts|tsx)$": "@sucrase/jest-plugin" },
    moduleNameMapper: hq.load(dirname + "/tsconfig.json").get("jest"),
    testEnvironment: "jsdom",
    testEnvironmentOptions: {
      fetchExternalResources: true,
      pretendToBeVisual: true,
      url: "http://localhost/",
    },
    displayName: {
      name: packageBaseName,
      color: packageBaseName === "jspsych" ? "white" : "cyanBright",
    },
  };
};
