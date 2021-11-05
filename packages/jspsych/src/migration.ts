export class MigrationError extends Error {
  constructor(message = "The global `jsPsych` variable is no longer available in jsPsych v7.") {
    super(
      `${message} Please follow the migration guide at https://www.jspsych.org/7.0/support/migration-v7/ to update your experiment.`
    );
    this.name = "MigrationError";
  }
}

// Define a global jsPsych object to handle invocations on it with migration errors
(window as any).jsPsych = {
  get init() {
    throw new MigrationError("`jsPsych.init()` was replaced by `initJsPsych()` in jsPsych v7.");
  },

  get data() {
    throw new MigrationError();
  },
  get randomization() {
    throw new MigrationError();
  },
  get turk() {
    throw new MigrationError();
  },
  get pluginAPI() {
    throw new MigrationError();
  },

  get ALL_KEYS() {
    throw new MigrationError(
      'jsPsych.ALL_KEYS was replaced by the "ALL_KEYS" string in jsPsych v7.'
    );
  },
  get NO_KEYS() {
    throw new MigrationError('jsPsych.NO_KEYS was replaced by the "NO_KEYS" string in jsPsych v7.');
  },
};
