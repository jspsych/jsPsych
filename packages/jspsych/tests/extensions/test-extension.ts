import { JsPsych, JsPsychExtension } from "../../src";

export class TestExtension implements JsPsychExtension {
  static info = {
    name: "test",
    version: "0.0.1",
    data: {},
  };

  constructor(private jsPsych: JsPsych) {}

  // required, will be called at initJsPsych
  // should return a Promise
  initialize = jest.fn().mockResolvedValue(undefined);

  // required, will be called when the trial starts (before trial loads)
  on_start = jest.fn();

  // required will be called when the trial loads
  on_load = jest.fn();

  // required, will be called when jsPsych.finishTrial() is called
  // must return data object to be merged into data.
  on_finish = jest.fn().mockReturnValue({ extension_data: true });
}
