import { makeRollupConfig } from "@jspsych/config/rollup";

const config = makeRollupConfig("jsPsychSurvey");

// Override the `onwarn` property to silence the THIS_IS_UNDEFINED warning.
// This warning is caused the use of 'this' at the top level in survey-core, which Rollup rewrites for ESM safety.
// We don't want to hide this warning in all cases, but it's safe here because we know it's coming from survey-core, which already guards with typeof globalThis !== "undefined".
for (const cfg of config) {
  cfg.onwarn = (warning, warn) => {
    if (warning.code === "THIS_IS_UNDEFINED") return;
    warn(warning);
  };
}

export default config;
