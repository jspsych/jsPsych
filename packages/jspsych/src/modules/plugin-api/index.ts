import autoBind from "auto-bind";

import { JsPsych } from "../../JsPsych";
import { HardwareAPI } from "./HardwareAPI";
import { KeyboardListenerAPI } from "./KeyboardListenerAPI";
import { MediaAPI } from "./MediaAPI";
import { TimeoutAPI } from "./TimeoutAPI";

export function createJointPluginAPIObject(jsPsych: JsPsych) {
  const settings = jsPsych.initSettings();
  return Object.assign(
    {},
    ...[
      new KeyboardListenerAPI(settings.case_sensitive_responses, settings.minimum_valid_rt),
      new TimeoutAPI(),
      new MediaAPI(settings.use_webaudio, jsPsych.webaudio_context),
      new HardwareAPI(),
    ].map((object) => autoBind(object))
  ) as KeyboardListenerAPI & TimeoutAPI & MediaAPI & HardwareAPI;
}

export type PluginAPI = ReturnType<typeof createJointPluginAPIObject>;
