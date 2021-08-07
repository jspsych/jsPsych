export interface JsPsychExtensionParameters {
  [key: string]: any;
}

export interface JsPsychExtensionData {
  [key: string]: any;
}

export interface JsPsychExtension {
  initialize(params?: JsPsychExtensionParameters): Promise<void>;
  on_start(params?: JsPsychExtensionParameters): void;
  on_load(params?: JsPsychExtensionParameters): void;
  on_finish(params?: JsPsychExtensionParameters): JsPsychExtensionData;
}