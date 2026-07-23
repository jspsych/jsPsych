import autoBind from "auto-bind";

import { JsPsych } from "../../JsPsych";
import { KeyboardListenerAPI } from "./KeyboardListenerAPI";
import { MediaAPI } from "./MediaAPI";
import { SimulationAPI } from "./SimulationAPI";
import { TimeoutAPI } from "./TimeoutAPI";

export function createJointPluginAPIObject(jsPsych: JsPsych) {
  const settings = jsPsych.getInitSettings();
  const keyboardListenerAPI = new KeyboardListenerAPI(
    jsPsych.getDisplayContainerElement,
    settings.case_sensitive_responses,
    settings.minimum_valid_rt
  );
  const timeoutAPI = new TimeoutAPI();
  const mediaAPI = new MediaAPI(settings.use_webaudio);
  const simulationAPI = new SimulationAPI(
    jsPsych.getDisplayContainerElement,
    timeoutAPI.setTimeout.bind(timeoutAPI)
  );
  return Object.assign(
    {},
    ...[keyboardListenerAPI, timeoutAPI, mediaAPI, simulationAPI].map((object) => autoBind(object))
  ) as KeyboardListenerAPI & TimeoutAPI & MediaAPI & SimulationAPI;
}

export type PluginAPI = ReturnType<typeof createJointPluginAPIObject>;
