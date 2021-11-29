import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "call-function",
  parameters: {
    /** Function to call */
    func: {
      type: ParameterType.FUNCTION,
      pretty_name: "Function",
      default: undefined,
    },
    /** Is the function call asynchronous? */
    async: {
      type: ParameterType.BOOL,
      pretty_name: "Asynchronous",
      default: false,
    },
  },
};

type Info = typeof info;

/**
 * **call-function**
 *
 * jsPsych plugin for calling an arbitrary function during a jsPsych experiment
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-call-function/ call-function plugin documentation on jspsych.org}
 */
class CallFunctionPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    //trial.post_trial_gap = 0;  // TO DO: TS error: number not assignable to type any[]. I don't think this param should be an array..?
    let return_val;

    const end_trial = () => {
      const trial_data = {
        value: return_val,
      };

      this.jsPsych.finishTrial(trial_data);
    };

    if (trial.async) {
      const done = (data) => {
        return_val = data;
        end_trial();
      };
      trial.func(done);
    } else {
      return_val = trial.func();
      end_trial();
    }
  }

  // no explicit simulate() mode for this plugin because it would just do
  // the same thing as the regular plugin
}

export default CallFunctionPlugin;
