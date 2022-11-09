const ts = require("typescript");
const { pathsToModuleNameMapper } = require("ts-jest");

/** @type { (dirname: string) => import('@jest/types').Config.InitialOptions } */
module.exports.makePackageConfig = (dirname) => {
  const packageJson = require(dirname + "/package.json");
  const packageBaseName = packageJson.name.replace("@jspsych/", "");

  // based on https://github.com/formium/tsdx/blob/462af2d002987f985695b98400e0344b8f2754b7/src/createRollupConfig.ts#L51-L57
  const tsCompilerOptions = ts.parseJsonConfigFileContent(
    ts.readConfigFile(dirname + "/tsconfig.json", ts.sys.readFile).config,
    ts.sys,
    dirname
  ).options;

  return {
    preset: "ts-jest",
    moduleNameMapper: pathsToModuleNameMapper(tsCompilerOptions.paths, { prefix: "<rootDir>/" }),
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
