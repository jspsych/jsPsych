import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "categorize-image",
  parameters: {
    stimulus: {
      type: ParameterType.IMAGE,
      pretty_name: "Stimulus",
      default: undefined,
      description: "The image content to be displayed."
    },
    key_answer: {
      type: ParameterType.KEY,
      pretty_name: "Key answer",
      default: undefined,
      description: "The key to indicate the correct response.",
    },
    choices: {
      type: ParameterType.KEYS,
      pretty_name: "Choices",
      default: "ALL_KEYS",
      array: true,
      description: "The keys the subject is allowed to press to respond to the stimulus.",
    },
    text_answer: {
      type: ParameterType.STRING,
      pretty_name: "Text answer",
      default: null,
      description: "Label that is associated with the correct answer.",
    },
    correct_text: {
      type: ParameterType.STRING,
      pretty_name: "Correct text",
      default: "<p class='feedback'>Correct</p>",
      description: "String to show when correct answer is given.",
    },
    incorrect_text: {
      type: ParameterType.STRING,
      pretty_name: "Incorrect text",
      default: "<p class='feedback'>Incorrect</p>",
      description: "String to show when incorrect answer is given.",
    },
    prompt: {
      type: ParameterType.STRING,
      pretty_name: "Prompt",
      default: null,
      description: "Any content here will be displayed below the stimulus.",
    },
    force_correct_button_press: {
      type: ParameterType.BOOL,
      pretty_name: "Force correct button press",
      default: false,
      description:
        "If set to true, then the subject must press the correct response key after feedback in order to advance to next trial.",
    },
    show_stim_with_feedback: {
      type: ParameterType.BOOL,
      default: true,
      no_function: false,
      description: "",
    },
    show_feedback_on_timeout: {
      type: ParameterType.BOOL,
      pretty_name: "Show feedback on timeout",
      default: false,
      description:
        "If true, stimulus will be shown during feedback. If false, only the text feedback will be displayed during feedback.",
    },
    timeout_message: {
      type: ParameterType.STRING,
      pretty_name: "Timeout message",
      default: "<p>Please respond faster.</p>",
      description: "The message displayed on a timeout non-response.",
    },
    stimulus_duration: {
      type: ParameterType.INT,
      pretty_name: "Stimulus duration",
      default: null,
      description: "How long to hide stimulus.",
    },
    trial_duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: null,
      description: "How long to show trial",
    },
    feedback_duration: {
      type: ParameterType.INT,
      pretty_name: "Feedback duration",
      default: 2000,
      description: "How long to show feedback.",
    },
  },
};

type Info = typeof info;

/**
 * jspsych plugin for categorization trials with feedback
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 **/
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
      this.jsPsych.pluginAPI.setTimeout(function () {
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
      this.jsPsych.pluginAPI.setTimeout(function () {
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
        var after_forced_response = function (info) {
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
        this.jsPsych.pluginAPI.setTimeout(function () {
          endTrial();
        }, trial.feedback_duration);
      }
    };
  }
}

export default CategorizeImagePlugin;
