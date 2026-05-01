'use strict';

var jspsych = require('jspsych');

var version = "2.1.0";

const info = {
  name: "same-different-image",
  version,
  parameters: {
    /** A pair of stimuli, represented as an array with two entries,
     * one for each stimulus. The stimulus is a path to an image file.
     * Stimuli will be shown in the order that they are defined in the array. */
    stimuli: {
      type: jspsych.ParameterType.IMAGE,
      default: void 0,
      array: true
    },
    /** Either `'same'` or `'different'`. */
    answer: {
      type: jspsych.ParameterType.SELECT,
      options: ["same", "different"],
      default: void 0
    },
    /** The key that subjects should press to indicate that the two stimuli are the same. */
    same_key: {
      type: jspsych.ParameterType.KEY,
      default: "q"
    },
    /** The key that subjects should press to indicate that the two stimuli are different. */
    different_key: {
      type: jspsych.ParameterType.KEY,
      default: "p"
    },
    /** How long to show the first stimulus for in milliseconds. If the value of this parameter is null then the stimulus will be shown until the participant presses any key. */
    first_stim_duration: {
      type: jspsych.ParameterType.INT,
      default: 1e3
    },
    /** How long to show a blank screen in between the two stimuli */
    gap_duration: {
      type: jspsych.ParameterType.INT,
      default: 500
    },
    /** How long to show the second stimulus for in milliseconds. If null, then the stimulus will remain on the screen until a valid response is made. */
    second_stim_duration: {
      type: jspsych.ParameterType.INT,
      default: 1e3
    },
    /** This string can contain HTML markup. Any content here will be displayed
     * below the stimulus. The intention is that it can be used to provide a
     * reminder about the action the participant is supposed to take
     * (e.g., which key to press). */
    prompt: {
      type: jspsych.ParameterType.HTML_STRING,
      default: null
    }
  },
  data: {
    /** An array of length 2 containing the paths to the image files that the participant saw for each trial.
     * This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
    stimulus: {
      type: jspsych.ParameterType.STRING,
      array: true
    },
    /** Indicates which key the participant pressed.  */
    response: {
      type: jspsych.ParameterType.STRING
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the second stimulus first appears on the screen until the participant's response. */
    rt: {
      type: jspsych.ParameterType.INT
    },
    /** `true` if the participant's response matched the `answer` for this trial. */
    correct: {
      type: jspsych.ParameterType.BOOL
    },
    /** The correct answer to the trial, either `'same'` or `'different'`. */
    answer: {
      type: jspsych.ParameterType.STRING
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class SameDifferentImagePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    const showBlankScreen = () => {
      display_element.innerHTML = "";
      this.jsPsych.pluginAPI.setTimeout(showSecondStim, trial.gap_duration);
    };
    display_element.innerHTML = '<img class="jspsych-same-different-stimulus" src="' + trial.stimuli[0] + '"></img>';
    var first_stim_info;
    if (trial.first_stim_duration > 0) {
      this.jsPsych.pluginAPI.setTimeout(showBlankScreen, trial.first_stim_duration);
    } else {
      const afterKeyboardResponse = (info2) => {
        first_stim_info = info2;
        showBlankScreen();
      };
      this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: afterKeyboardResponse,
        valid_responses: "ALL_KEYS",
        rt_method: "performance",
        persist: false,
        allow_held_key: false
      });
    }
    const showSecondStim = () => {
      var html = '<img class="jspsych-same-different-stimulus" src="' + trial.stimuli[1] + '"></img>';
      if (trial.prompt !== null) {
        html += trial.prompt;
      }
      display_element.innerHTML = html;
      if (trial.second_stim_duration > 0) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          display_element.querySelector(
            ".jspsych-same-different-stimulus"
          ).style.visibility = "hidden";
        }, trial.second_stim_duration);
      }
      const after_response = (info2) => {
        var correct = false;
        var skey = trial.same_key;
        var dkey = trial.different_key;
        if (this.jsPsych.pluginAPI.compareKeys(info2.key, skey) && trial.answer == "same") {
          correct = true;
        }
        if (this.jsPsych.pluginAPI.compareKeys(info2.key, dkey) && trial.answer == "different") {
          correct = true;
        }
        var trial_data = {
          rt: info2.rt,
          answer: trial.answer,
          correct,
          stimulus: [trial.stimuli[0], trial.stimuli[1]],
          response: info2.key
        };
        if (first_stim_info) {
          trial_data["rt_stim1"] = first_stim_info.rt;
          trial_data["response_stim1"] = first_stim_info.key;
        }
        this.jsPsych.finishTrial(trial_data);
      };
      this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.same_key, trial.different_key],
        rt_method: "performance",
        persist: false,
        allow_held_key: false
      });
    };
  }
  simulate(trial, simulation_mode, simulation_options, load_callback) {
    if (simulation_mode == "data-only") {
      load_callback();
      this.simulate_data_only(trial, simulation_options);
    }
    if (simulation_mode == "visual") {
      this.simulate_visual(trial, simulation_options, load_callback);
    }
  }
  create_simulation_data(trial, simulation_options) {
    const key = this.jsPsych.pluginAPI.getValidKey([trial.same_key, trial.different_key]);
    const default_data = {
      stimuli: trial.stimuli,
      response: key,
      answer: trial.answer,
      correct: trial.answer == "same" ? key == trial.same_key : key == trial.different_key,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true)
    };
    if (trial.first_stim_duration == null) {
      default_data.rt_stim1 = this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true);
      default_data.response_stim1 = this.jsPsych.pluginAPI.getValidKey([
        trial.same_key,
        trial.different_key
      ]);
    }
    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
    this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
    return data;
  }
  simulate_data_only(trial, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);
    this.jsPsych.finishTrial(data);
  }
  simulate_visual(trial, simulation_options, load_callback) {
    const data = this.create_simulation_data(trial, simulation_options);
    const display_element = this.jsPsych.getDisplayElement();
    this.trial(display_element, trial);
    load_callback();
    if (trial.first_stim_duration == null) {
      this.jsPsych.pluginAPI.pressKey(data.response_stim1, data.rt_stim1);
    }
    this.jsPsych.pluginAPI.pressKey(
      data.response,
      trial.first_stim_duration + trial.gap_duration + data.rt
    );
  }
}

module.exports = SameDifferentImagePlugin;
//# sourceMappingURL=index.cjs.map
