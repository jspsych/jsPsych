// __rollup-babel-import-regenerator-runtime__

import { JsPsych } from "./JsPsych";
import { MigrationError } from "./migration";

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
  const jsPsych = new JsPsych(options);

  // Handle invocations of non-existent v6 methods with migration errors
  const migrationMessages = {
    init: "`jsPsych.init()` was replaced by `initJsPsych()` in jsPsych v7.",

    ALL_KEYS: 'jsPsych.ALL_KEYS was replaced by the "ALL_KEYS" string in jsPsych v7.',
    NO_KEYS: 'jsPsych.NO_KEYS was replaced by the "NO_KEYS" string in jsPsych v7.',

    // Getter functions that were renamed
    currentTimelineNodeID:
      "`currentTimelineNodeID()` was renamed to `getCurrentTimelineNodeID()` in jsPsych v7.",
    progress: "`progress()` was renamed to `getProgress()` in jsPsych v7.",
    startTime: "`startTime()` was renamed to `getStartTime()` in jsPsych v7.",
    totalTime: "`totalTime()` was renamed to `getTotalTime()` in jsPsych v7.",
    currentTrial: "`currentTrial()` was renamed to `getCurrentTrial()` in jsPsych v7.",
    initSettings: "`initSettings()` was renamed to `getInitSettings()` in jsPsych v7.",
    allTimelineVariables:
      "`allTimelineVariables()` was renamed to `getAllTimelineVariables()` in jsPsych v7.",
  };

  Object.defineProperties(
    jsPsych,
    Object.fromEntries(
      Object.entries(migrationMessages).map(([key, message]) => [
        key,
        {
          get() {
            throw new MigrationError(message);
          },
        },
      ])
    )
  );

  return jsPsych;
}

export { JsPsych } from "./JsPsych";
export {
  JsPsychPlugin,
  PluginInfo,
  TrialType,
  ParameterType,
  universalPluginParameters,
  UniversalPluginParameters,
} from "./modules/plugins";
export { JsPsychExtension, JsPsychExtensionInfo } from "./modules/extensions";
