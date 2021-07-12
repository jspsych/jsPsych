import { makeRollupConfig } from "@jspsych/config/rollup.mjs";

export default makeRollupConfig({
  exports: "named",
  name: "jsPsychModule",
  footer: "var initJsPsych = jsPsychModule.initJsPsych;",
});
