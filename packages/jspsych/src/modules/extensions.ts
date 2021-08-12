export interface JsPsychExtensionParameters {
  [key: string]: any;
}

export interface JsPsychExtensionData {
  [key: string]: any;
}

export interface JsPsychExtensionInfo {
  name: string;
}

export interface JsPsychExtension {

  /**
    * Called once at the start of the experiment to initialize the extension
    */
  initialize(params?: JsPsychExtensionParameters): Promise<void>;
  /**
    * Called at the start of a trial, prior to invoking the plugin's trial method.
    */
  on_start(params?: JsPsychExtensionParameters): void;
  /**
    * Called during a trial, after the plugin makes initial changes to the DOM.
    */
  on_load(params?: JsPsychExtensionParameters): void;
  /**
    * Called at the end of the trial.
    * @returns Data to append to the trial's data object.
    */
  on_finish(params?: JsPsychExtensionParameters): JsPsychExtensionData;
}