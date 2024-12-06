import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "call-function",
  version: version,
  parameters: {
    /** The function to call. */
    func: {
      type: ParameterType.FUNCTION,
      default: undefined,
    },
    /** Set to true if `func` is an asynchoronous function. If this is true, then the first argument passed to `func`
     * will be a callback that you should call when the async operation is complete. You can pass data to the callback.
     * See example below.
     */
    async: {
      type: ParameterType.BOOL,
      default: false,
    },
  },
  data: {
    /** The return value of the called function. */
    value: {
      type: ParameterType.COMPLEX,
      default: undefined,
    },
  },
  // prettier-ignore
  citations: '__CITATIONS__',
};

type Info = typeof info;

/**
 * This plugin executes a specified function. This allows the experimenter to run arbitrary code at any point during the experiment.
 *
 * The function cannot take any arguments. If arguments are needed, then an anonymous function should be used to wrap the function call (see examples below).
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/call-function/ call-function plugin documentation on jspsych.org}
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
