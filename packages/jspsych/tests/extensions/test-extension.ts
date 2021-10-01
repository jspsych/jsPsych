import { JsPsych, JsPsychExtension } from "../../src";

class TestExtension implements JsPsychExtension {
  static info = {
    name: "test",
  };

  constructor(private jsPsych: JsPsych) {}

  // required, will be called at initJsPsych
  // should return a Promise
  initialize(params) {
    return new Promise<void>((resolve, reject) => {
      resolve();
    });
  }

  // required, will be called when the trial starts (before trial loads)
  on_start(params) {}

  // required will be called when the trial loads
  on_load(params) {}

  // required, will be called when jsPsych.finishTrial() is called
  // must return data object to be merged into data.
  on_finish(params) {
    // send back data
    return {
      extension_data: true,
    };
  }
}

export default TestExtension;
