'use strict';

var jspsych = require('jspsych');

var version = "2.1.0";

const info = {
  name: "call-function",
  version,
  parameters: {
    /** The function to call. */
    func: {
      type: jspsych.ParameterType.FUNCTION,
      default: void 0
    },
    /** Set to true if `func` is an asynchoronous function. If this is true, then the first argument passed to `func`
     * will be a callback that you should call when the async operation is complete. You can pass data to the callback.
     * See example below.
     */
    async: {
      type: jspsych.ParameterType.BOOL,
      default: false
    }
  },
  data: {
    /** The return value of the called function. */
    value: {
      type: jspsych.ParameterType.COMPLEX,
      default: void 0
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class CallFunctionPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    let return_val;
    const end_trial = () => {
      const trial_data = {
        value: return_val
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

module.exports = CallFunctionPlugin;
//# sourceMappingURL=index.cjs.map
