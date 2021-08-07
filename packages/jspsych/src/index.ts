import { JsPsych } from "./JsPsych";

// temporary patch for Safari
if (
  typeof window !== "undefined" &&
  window.hasOwnProperty("webkitAudioContext") &&
  !window.hasOwnProperty("AudioContext")
) {
  // @ts-expect-error
  window.AudioContext = webkitAudioContext;
}
// end patch

// The following function provides a uniform interface to initialize jsPsych, no matter whether a
// browser supports ES6 classes or not (and whether the ES6 build or the Babel build is used).
/**
 * Creates a new JsPsych instance using the provided options.
 *
 * @param options The options to pass to the JsPsych constructor
 * @returns A new JsPsych instance
 */
export function initJsPsych(options?) {
  return new JsPsych(options);
}

export { JsPsych } from "./JsPsych";
export { JsPsychPlugin, PluginInfo, TrialType } from "./modules/plugins";
export { parameterType } from "./modules/plugins";
export { JsPsychExtension, JsPsychExtensionParameters } from "./modules/extensions";
