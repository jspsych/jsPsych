'use strict';

var jspsych = require('jspsych');

var version = "2.1.0";

const info = {
  name: "categorize-image",
  version,
  parameters: {
    /** The path to the image file. */
    stimulus: {
      type: jspsych.ParameterType.IMAGE,
      default: void 0
    },
    /** The key character indicating the correct response. */
    key_answer: {
      type: jspsych.ParameterType.KEY,
      default: void 0
    },
    /** This array contains the key(s) that the participant is allowed to press in order to respond to the stimulus. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/) for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"` means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed. */
    choices: {
      type: jspsych.ParameterType.KEYS,
      default: "ALL_KEYS"
    },
    /** A label that is associated with the correct answer. Used in conjunction with the `correct_text` and `incorrect_text` parameters.*/
    text_answer: {
      type: jspsych.ParameterType.HTML_STRING,
      default: null
    },
    /** String to show when the correct answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below).  */
    correct_text: {
      type: jspsych.ParameterType.HTML_STRING,
      default: "<p class='feedback'>Correct</p>"
    },
    /** String to show when the wrong answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below).  */
    incorrect_text: {
      type: jspsych.ParameterType.HTML_STRING,
      default: "<p class='feedback'>Wrong</p>"
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). */
    prompt: {
      type: jspsych.ParameterType.HTML_STRING,
      default: null
    },
    /** If set to true, then the participant must press the correct response key after feedback is given in order to advance to the next trial. */
    force_correct_button_press: {
      type: jspsych.ParameterType.BOOL,
      default: false
    },
    /** If set to true, then the stimulus will be shown during feedback. If false, then only the text feedback will display during feedback.*/
    show_stim_with_feedback: {
      type: jspsych.ParameterType.BOOL,
      default: true,
      no_function: false
    },
    /** If true, then category feedback will be displayed for an incorrect response after a timeout (trial_duration is exceeded). If false, then a timeout message will be shown. */
    show_feedback_on_timeout: {
      type: jspsych.ParameterType.BOOL,
      default: false
    },
    /** The message to show on a timeout non-response. */
    timeout_message: {
      type: jspsych.ParameterType.HTML_STRING,
      default: "<p>Please respond faster.</p>"
    },
    /** How long to show the stimulus for (milliseconds). If null, then the stimulus is shown until a response is given. */
    stimulus_duration: {
      type: jspsych.ParameterType.INT,
      default: null
    },
    /** The maximum time allowed for a response. If null, then the experiment will wait indefinitely for a response. */
    trial_duration: {
      type: jspsych.ParameterType.INT,
      default: null
    },
    /** How long to show the feedback for (milliseconds). */
    feedback_duration: {
      type: jspsych.ParameterType.INT,
      default: 2e3
    }
  },
  data: {
    /** Either the path to the image file or the string containing the HTML formatted content that the participant saw on this trial.*/
    stimulus: {
      type: jspsych.ParameterType.STRING
    },
    /** Indicates which key the participant pressed.  */
    response: {
      type: jspsych.ParameterType.STRING
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
    rt: {
      type: jspsych.ParameterType.INT
    },
    /** `true` if the participant got the correct answer, `false` otherwise. */
    correct: {
      type: jspsych.ParameterType.BOOL
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class CategorizeImagePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    display_element.innerHTML = '<img id="jspsych-categorize-image-stimulus" class="jspsych-categorize-image-stimulus" src="' + trial.stimulus + '"></img>';
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.querySelector(
          "#jspsych-categorize-image-stimulus"
        ).style.visibility = "hidden";
      }, trial.stimulus_duration);
    }
    if (trial.prompt !== null) {
      display_element.innerHTML += trial.prompt;
    }
    var trial_data = {};
    const after_response = (info2) => {
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
      var correct = false;
      if (this.jsPsych.pluginAPI.compareKeys(trial.key_answer, info2.key)) {
        correct = true;
      }
      trial_data = {
        rt: info2.rt,
        correct,
        stimulus: trial.stimulus,
        response: info2.key
      };
      var timeout = info2.rt == null;
      doFeedback(correct, timeout);
    };
    this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: "performance",
      persist: false,
      allow_held_key: false
    });
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        after_response({
          key: null,
          rt: null
        });
      }, trial.trial_duration);
    }
    const endTrial = () => {
      this.jsPsych.finishTrial(trial_data);
    };
    const doFeedback = (correct, timeout) => {
      if (timeout && !trial.show_feedback_on_timeout) {
        display_element.innerHTML += trial.timeout_message;
      } else {
        if (trial.show_stim_with_feedback) {
          display_element.innerHTML = '<img id="jspsych-categorize-image-stimulus" class="jspsych-categorize-image-stimulus" src="' + trial.stimulus + '"></img>';
        }
        var atext = "";
        if (correct) {
          atext = trial.correct_text.replace("%ANS%", trial.text_answer);
        } else {
          atext = trial.incorrect_text.replace("%ANS%", trial.text_answer);
        }
        display_element.innerHTML += atext;
      }
      if (trial.force_correct_button_press && correct === false && (timeout && trial.show_feedback_on_timeout || !timeout)) {
        var after_forced_response = (info2) => {
          endTrial();
        };
        this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_forced_response,
          valid_responses: [trial.key_answer],
          rt_method: "performance",
          persist: false,
          allow_held_key: false
        });
      } else {
        this.jsPsych.pluginAPI.setTimeout(endTrial, trial.feedback_duration);
      }
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
    const key = this.jsPsych.pluginAPI.getValidKey(trial.choices);
    const default_data = {
      stimulus: trial.stimulus,
      response: key,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      correct: key == trial.key_answer
    };
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
    if (data.rt !== null) {
      this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
    }
    if (trial.force_correct_button_press && !data.correct) {
      this.jsPsych.pluginAPI.pressKey(trial.key_answer, data.rt + trial.feedback_duration / 2);
    }
  }
}

module.exports = CategorizeImagePlugin;
//# sourceMappingURL=index.cjs.map
