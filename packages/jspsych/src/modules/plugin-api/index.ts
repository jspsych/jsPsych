import autoBind from "auto-bind";

import { JsPsych } from "../../JsPsych";
import { HardwareAPI } from "./HardwareAPI";
import { KeyboardListenerAPI } from "./KeyboardListenerAPI";
import { MediaAPI } from "./MediaAPI";
import { SimulationAPI } from "./SimulationAPI";
import { TimeoutAPI } from "./TimeoutAPI";

export function createJointPluginAPIObject(jsPsych: JsPsych) {
  const settings = jsPsych.getInitSettings();
  return Object.assign(
    {},
    ...[
      new KeyboardListenerAPI(
        jsPsych.getDisplayContainerElement,
        settings.case_sensitive_responses,
        settings.minimum_valid_rt
      ),
      new TimeoutAPI(),
      new MediaAPI(settings.use_webaudio, jsPsych.webaudio_context),
      new HardwareAPI(),
      new SimulationAPI(),
    ].map((object) => autoBind(object))
  ) as KeyboardListenerAPI & TimeoutAPI & MediaAPI & HardwareAPI & SimulationAPI;
}

export type PluginAPI = ReturnType<typeof createJointPluginAPIObject>;
