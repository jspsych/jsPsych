import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "categorize-image",
  parameters: {
    /** The image content to be displayed. */
    stimulus: {
      type: ParameterType.IMAGE,
      pretty_name: "Stimulus",
      default: undefined,
    },
    /** The key to indicate the correct response. */
    key_answer: {
      type: ParameterType.KEY,
      pretty_name: "Key answer",
      default: undefined,
    },
    /** Array containing the key(s) the subject is allowed to press to respond to the stimulus. */
    choices: {
      type: ParameterType.KEYS,
      pretty_name: "Choices",
      default: "ALL_KEYS",
    },
    /** Label that is associated with the correct answer. */
    text_answer: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Text answer",
      default: null,
    },
    /** String to show when correct answer is given. */
    correct_text: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Correct text",
      default: "<p class='feedback'>Correct</p>",
    },
    /** String to show when incorrect answer is given. */
    incorrect_text: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Incorrect text",
      default: "<p class='feedback'>Wrong</p>",
    },
    /** Any content here will be displayed below the stimulus. */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null,
    },
    /** If set to true, then the subject must press the correct response key after feedback in order to advance to next trial. */
    force_correct_button_press: {
      type: ParameterType.BOOL,
      pretty_name: "Force correct button press",
      default: false,
    },
    /** Whether or not the stimulus should be shown on the feedback screen. */
    show_stim_with_feedback: {
      type: ParameterType.BOOL,
      default: true,
      no_function: false,
    },
    /** If true, stimulus will be shown during feedback. If false, only the text feedback will be displayed during feedback. */
    show_feedback_on_timeout: {
      type: ParameterType.BOOL,
      pretty_name: "Show feedback on timeout",
      default: false,
    },
    /** The message displayed on a timeout non-response. */
    timeout_message: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Timeout message",
      default: "<p>Please respond faster.</p>",
    },
    /** How long to show the stimulus. */
    stimulus_duration: {
      type: ParameterType.INT,
      pretty_name: "Stimulus duration",
      default: null,
    },
    /** How long to show the trial. */
    trial_duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: null,
    },
    /** How long to show the feedback. */
    feedback_duration: {
      type: ParameterType.INT,
      pretty_name: "Feedback duration",
      default: 2000,
    },
  },
};

type Info = typeof info;

/**
 * **categorize-image**
 *
 * jsPsych plugin for image categorization trials with feedback
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-categorize-image/ categorize-image plugin documentation on jspsych.org}
 */
class CategorizeImagePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    display_element.innerHTML =
      '<img id="jspsych-categorize-image-stimulus" class="jspsych-categorize-image-stimulus" src="' +
      trial.stimulus +
      '"></img>';

    // hide image after time if the timing parameter is set
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.querySelector<HTMLElement>(
          "#jspsych-categorize-image-stimulus"
        ).style.visibility = "hidden";
      }, trial.stimulus_duration);
    }

    // if prompt is set, show prompt
    if (trial.prompt !== null) {
      display_element.innerHTML += trial.prompt;
    }

    var trial_data = {};

    // create response function
    const after_response = (info: { key: string; rt: number }) => {
      // kill any remaining setTimeout handlers
      this.jsPsych.pluginAPI.clearAllTimeouts();

      // clear keyboard listener
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();

      var correct = false;
      if (this.jsPsych.pluginAPI.compareKeys(trial.key_answer, info.key)) {
        correct = true;
      }

      // save data
      trial_data = {
        rt: info.rt,
        correct: correct,
        stimulus: trial.stimulus,
        response: info.key,
      };

      display_element.innerHTML = "";

      var timeout = info.rt == null;
      doFeedback(correct, timeout);
    };

    this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: "performance",
      persist: false,
      allow_held_key: false,
    });

    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        after_response({
          key: null,
          rt: null,
        });
      }, trial.trial_duration);
    }

    const endTrial = () => {
      display_element.innerHTML = "";
      this.jsPsych.finishTrial(trial_data);
    };

    const doFeedback = (correct, timeout) => {
      if (timeout && !trial.show_feedback_on_timeout) {
        display_element.innerHTML += trial.timeout_message;
      } else {
        // show image during feedback if flag is set
        if (trial.show_stim_with_feedback) {
          display_element.innerHTML =
            '<img id="jspsych-categorize-image-stimulus" class="jspsych-categorize-image-stimulus" src="' +
            trial.stimulus +
            '"></img>';
        }

        // substitute answer in feedback string.
        var atext = "";
        if (correct) {
          atext = trial.correct_text.replace("%ANS%", trial.text_answer);
        } else {
          atext = trial.incorrect_text.replace("%ANS%", trial.text_answer);
        }

        // show the feedback
        display_element.innerHTML += atext;
      }
      // check if force correct button press is set
      if (
        trial.force_correct_button_press &&
        correct === false &&
        ((timeout && trial.show_feedback_on_timeout) || !timeout)
      ) {
        var after_forced_response = (info) => {
          endTrial();
        };

        this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_forced_response,
          valid_responses: [trial.key_answer],
          rt_method: "performance",
          persist: false,
          allow_held_key: false,
        });
      } else {
        this.jsPsych.pluginAPI.setTimeout(endTrial, trial.feedback_duration);
      }
    };
  }

  simulate(
    trial: TrialType<Info>,
    simulation_mode,
    simulation_options: any,
    load_callback: () => void
  ) {
    if (simulation_mode == "data-only") {
      load_callback();
      this.simulate_data_only(trial, simulation_options);
    }
    if (simulation_mode == "visual") {
      this.simulate_visual(trial, simulation_options, load_callback);
    }
  }

  private create_simulation_data(trial: TrialType<Info>, simulation_options) {
    const key = this.jsPsych.pluginAPI.getValidKey(trial.choices);

    const default_data = {
      stimulus: trial.stimulus,
      response: key,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      correct: key == trial.key_answer,
    };

    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);

    this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);

    return data;
  }

  private simulate_data_only(trial: TrialType<Info>, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);

    this.jsPsych.finishTrial(data);
  }

  private simulate_visual(trial: TrialType<Info>, simulation_options, load_callback: () => void) {
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

export default CategorizeImagePlugin;
