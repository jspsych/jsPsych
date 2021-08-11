import { JsPsych, JsPsychPlugin, TrialType, parameterType } from "jspsych";

const info = <const>{
  name: "canvas-keyboard-response",
  parameters: {
    /* The drawing function to apply to the canvas. Should take the canvas object as argument. */
    stimulus: {
      type: parameterType.FUNCTION,
      pretty_name: "Stimulus",
      default: undefined
    },
    /* The keys the subject is allowed to press to respond to the stimulus. */
    choices: {
      type: parameterType.KEY,
      array: true,
      pretty_name: "Choices",
      default: "allkeys"
    },
    /* Any content here will be displayed below the stimulus. */
    prompt: {
      type: parameterType.STRING,
      pretty_name: "Prompt",
      default: null
    },
    /* How long to hide the stimulus. */
    stimulus_duration: {
      type: parameterType.INT,
      pretty_name: "Stimulus duration",
      default: null
    },
    /* How long to show trial before it ends. */
    trial_duration: {
      type: parameterType.INT,
      pretty_name: "Trial duration",
      default: null
    },
    /* If true, trial will end when subject makes a response. */
    response_ends_trial: {
      type: parameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true
    },
    /* Array containing the height (first value) and width (second value) of the canvas element. */
    canvas_size: {
      type: parameterType.INT,
      array: true,
      pretty_name: "Canvas size",
      default: [500, 500]
    }
  }
};

type Info = typeof info;

/**
 * jspsych-canvas-keyboard-response
 * Chris Jungerius (modified from Josh de Leeuw)
 *
 * a jsPsych plugin for displaying a canvas stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/
class CanvasKeyboardResponsePlugin implements JsPsychPlugin<Info> {
  info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var new_html =
      '<div id="jspsych-canvas-keyboard-response-stimulus">' +
      '<canvas id="jspsych-canvas-stimulus" height="' +
      trial.canvas_size[0] +
      '" width="' +
      trial.canvas_size[1] +
      '"></canvas>' +
      "</div>";
    // add prompt
    if (trial.prompt !== null) {
      new_html += trial.prompt;
    }

    // draw
    display_element.innerHTML = new_html;
    let c = document.getElementById("jspsych-canvas-stimulus");
    trial.stimulus(c);
    // store response
    var response = {
      rt: null,
      key: null,
    };

    // function to end trial when it is time
    const end_trial = () => {
      // kill any remaining setTimeout handlers
      this.jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== "undefined") {
        this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        rt: response.rt,
        response: response.key,
      };

      // clear the display
      display_element.innerHTML = "";

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function (info) {
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector("#jspsych-canvas-keyboard-response-stimulus").className +=
        " responded";

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    // @ts-ignore TODO jsPsych.NO_KEYS is not an array, but `array: true` is set for the parameter.
    // How should we handle this?
    if (trial.choices != this.jsPsych.NO_KEYS) {
      var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
    }

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(function () {
        display_element.querySelector<HTMLElement>("#jspsych-canvas-keyboard-response-stimulus").style.visibility =
          "hidden";
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(function () {
        end_trial();
      }, trial.trial_duration);
    }
  };
}

export default CanvasKeyboardResponsePlugin;
