import { JsPsych, JsPsychPlugin, TrialType, parameterType } from "jspsych";

const info = <const>{
  name: "reconstruction",
  parameters: {
    stim_function: {
      type: parameterType.FUNCTION,
      pretty_name: "Stimulus function",
      default: undefined,
      description:
        "A function with a single parameter that returns an HTML-formatted string representing the stimulus.",
    },
    starting_value: {
      type: parameterType.FLOAT,
      pretty_name: "Starting value",
      default: 0.5,
      description: "The starting value of the stimulus parameter.",
    },
    step_size: {
      type: parameterType.FLOAT,
      pretty_name: "Step size",
      default: 0.05,
      description:
        "The change in the stimulus parameter caused by pressing one of the modification keys.",
    },
    key_increase: {
      type: parameterType.KEY,
      pretty_name: "Key increase",
      default: "h",
      description: "The key to press for increasing the parameter value.",
    },
    key_decrease: {
      type: parameterType.KEY,
      pretty_name: "Key decrease",
      default: "g",
      description: "The key to press for decreasing the parameter value.",
    },
    button_label: {
      type: parameterType.STRING,
      pretty_name: "Button label",
      default: "Continue",
      description: "The text that appears on the button to finish the trial.",
    }
  }
};

type Info = typeof info;

/**
 * jspsych-reconstruction
 * a jspsych plugin for a reconstruction task where the subject recreates
 * a stimulus from memory
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */
class ReconstructionPlugin implements JsPsychPlugin<Info> {
  info = info;

  constructor(private jsPsych: JsPsych) {};

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // current param level
    var param = trial.starting_value;

    // set-up key listeners
    var after_response = function (info) {
      //console.log('fire');

      var key_i = trial.key_increase;
      var key_d = trial.key_decrease;

      // get new param value
      if (this.jsPsych.pluginAPI.compareKeys(info.key, key_i)) {
        param = param + trial.step_size;
      } else if (this.jsPsych.pluginAPI.compareKeys(info.key, key_d)) {
        param = param - trial.step_size;
      }
      param = Math.max(Math.min(1, param), 0);

      // refresh the display
      draw(param);
    };

    // listen for responses
    var key_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: [trial.key_increase, trial.key_decrease],
      rt_method: "performance",
      persist: true,
      allow_held_key: true,
    });
    // draw first iteration
    draw(param);

    function draw(param) {
      //console.log(param);

      display_element.innerHTML =
        '<div id="jspsych-reconstruction-stim-container">' + trial.stim_function(param) + "</div>";

      // add submit button
      display_element.innerHTML +=
        '<button id="jspsych-reconstruction-next" class="jspsych-btn jspsych-reconstruction">' +
        trial.button_label +
        "</button>";

      display_element
        .querySelector("#jspsych-reconstruction-next")
        .addEventListener("click", endTrial);
    }

    function endTrial() {
      // measure response time
      var endTime = performance.now();
      var response_time = endTime - startTime;

      // clear keyboard response
      this.jsPsych.pluginAPI.cancelKeyboardResponse(key_listener);

      // save data
      var trial_data = {
        rt: response_time,
        final_value: param,
        start_value: trial.starting_value,
      };

      display_element.innerHTML = "";

      // next trial
      this.jsPsych.finishTrial(trial_data);
    }

    var startTime = performance.now();
  }
}

export default ReconstructionPlugin;
