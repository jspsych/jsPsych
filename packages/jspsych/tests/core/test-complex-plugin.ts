import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "test-complex-plugin",
  parameters: {
    blocks: {
      type: ParameterType.COMPLEX,
      array: true,
      default: [
        { x: 10, y: 10 },
        { x: 20, y: 20 },
        { x: 30, y: 30 },
      ],
      nested: {
        x: {
          type: ParameterType.INT,
          default: undefined,
        },
        y: {
          type: ParameterType.INT,
          default: undefined,
        },
      },
    },
  },
};

type Info = typeof info;

class TestComplexPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // save data
    var trialdata = {
      blocks: trial.blocks,
    };

    // next trial
    this.jsPsych.finishTrial(trialdata);
  }
}

export default TestComplexPlugin;
