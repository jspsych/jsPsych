export interface JsPsychExtensionInfo {
  name: string;
}

export interface JsPsychExtension {
  /**
   * Called once at the start of the experiment to initialize the extension
   */
  initialize(params?: Record<string, any>): Promise<void>;
  /**
   * Called at the start of a trial, prior to invoking the plugin's trial method.
   */
  on_start(params?: Record<string, any>): void;
  /**
   * Called during a trial, after the plugin makes initial changes to the DOM.
   */
  on_load(params?: Record<string, any>): void;
  /**
   * Called at the end of the trial.
   * @returns Data to append to the trial's data object.
   */
  on_finish(params?: Record<string, any>): Record<string, any> | Promise<Record<string, any>>;
}
