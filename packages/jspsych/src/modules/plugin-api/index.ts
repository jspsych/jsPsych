import autoBind from "auto-bind";

import { JsPsych } from "../../JsPsych";
import { HardwareAPI } from "./HardwareAPI";
import { KeyboardListenerAPI } from "./KeyboardListenerAPI";
import { MediaAPI } from "./MediaAPI";
import { SimulationAPI } from "./SimulationAPI";
import { TimeoutAPI } from "./TimeoutAPI";

export function createJointPluginAPIObject(jsPsych: JsPsych) {
  const settings = jsPsych.getInitSettings();
  const keyboardListenerAPI = autoBind(
    new KeyboardListenerAPI(
      jsPsych.getDisplayContainerElement,
      settings.case_sensitive_responses,
      settings.minimum_valid_rt
    )
  );
  const timeoutAPI = autoBind(new TimeoutAPI());
  const mediaAPI = autoBind(new MediaAPI(settings.use_webaudio, jsPsych.webaudio_context));
  const hardwareAPI = autoBind(new HardwareAPI());
  const simulationAPI = autoBind(
    new SimulationAPI(jsPsych.getDisplayContainerElement, timeoutAPI.setTimeout)
  );
  return Object.assign(
    {},
    ...[keyboardListenerAPI, timeoutAPI, mediaAPI, hardwareAPI, simulationAPI]
  ) as KeyboardListenerAPI & TimeoutAPI & MediaAPI & HardwareAPI & SimulationAPI;
}

export type PluginAPI = ReturnType<typeof createJointPluginAPIObject>;
