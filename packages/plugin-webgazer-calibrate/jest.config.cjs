const { makePackageConfig } = require("@jspsych/config/jest");
const packageJson = require("./package.json");

module.exports = makePackageConfig(packageJson);
