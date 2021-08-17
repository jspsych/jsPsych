import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "canvas-button-response",
  parameters: {
    /* The drawing function to apply to the canvas. Should take the canvas object as argument. */
    stimulus: {
      type: ParameterType.FUNCTION,
      pretty_name: "Stimulus",
      default: undefined,
    },
    /* The labels for the buttons */
    choices: {
      type: ParameterType.STRING,
      pretty_name: "Choices",
      default: undefined,
      array: true,
    },
    /* The html of the button. Can create own style. */
    button_html: {
      type: ParameterType.STRING,
      pretty_name: "Button HTML",
      default: '<button class="jspsych-btn">%choice%</button>',
      array: true,
    },
    /* Any content here will be displayed under the button. */
    prompt: {
      type: ParameterType.STRING,
      pretty_name: "Prompt",
      default: null,
    },
    /* How long to hide the stimulus. */
    stimulus_duration: {
      type: ParameterType.INT,
      pretty_name: "Stimulus duration",
      default: null,
    },
    /* How long to show the trial. */
    trial_duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: null,
    },
    /* The vertical margin of the button. */
    margin_vertical: {
      type: ParameterType.STRING,
      pretty_name: "Margin vertical",
      default: "0px",
    },
    /* The horizontal margin of the button. */
    margin_horizontal: {
      type: ParameterType.STRING,
      pretty_name: "Margin horizontal",
      default: "8px",
    },
    /* If true, then trial will end when user responds. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true,
    },
    /* Array containing the height (first value) and width (second value) of the canvas element. */
    canvas_size: {
      type: ParameterType.INT,
      array: true,
      pretty_name: "Canvas size",
      default: [500, 500],
    },
  },
};

type Info = typeof info;

/**
 * jspsych-canvas-button-response
 * Chris Jungerius (modified from Josh de Leeuw)
 *
 * a jsPsych plugin for displaying a canvas stimulus and getting a button response
 *
 * documentation: docs.jspsych.org
 *
 **/
class CanvasButtonResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // create canvas
    var html =
      '<div id="jspsych-canvas-button-response-stimulus">' +
      '<canvas id="jspsych-canvas-stimulus" height="' +
      trial.canvas_size[0] +
      '" width="' +
      trial.canvas_size[1] +
      '"></canvas>' +
      "</div>";

    //display buttons
    var buttons = [];
    if (Array.isArray(trial.button_html)) {
      if (trial.button_html.length == trial.choices.length) {
        buttons = trial.button_html;
      } else {
        console.error(
          "Error in canvas-button-response plugin. The length of the button_html array does not equal the length of the choices array"
        );
      }
    } else {
      for (var i = 0; i < trial.choices.length; i++) {
        buttons.push(trial.button_html);
      }
    }
    html += '<div id="jspsych-canvas-button-response-btngroup">';
    for (var i = 0; i < trial.choices.length; i++) {
      var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
      html +=
        '<div class="jspsych-canvas-button-response-button" style="display: inline-block; margin:' +
        trial.margin_vertical +
        " " +
        trial.margin_horizontal +
        '" id="jspsych-canvas-button-response-button-' +
        i +
        '" data-choice="' +
        i +
        '">' +
        str +
        "</div>";
    }
    html += "</div>";

    //show prompt if there is one
    if (trial.prompt !== null) {
      html += trial.prompt;
    }
    display_element.innerHTML = html;

    //draw
    let c = document.getElementById("jspsych-canvas-stimulus");
    trial.stimulus(c);

    // start time
    var start_time = performance.now();

    // add event listeners to buttons
    for (var i = 0; i < trial.choices.length; i++) {
      display_element
        .querySelector<HTMLButtonElement>("#jspsych-canvas-button-response-button-" + i)
        .addEventListener("click", function (e: MouseEvent) {
          var choice = e.currentTarget as Element;
          choice.getAttribute("data-choice"); // don't use dataset for jsdom compatibility
          after_response(choice);
        });
    }

    // store response
    var response = {
      rt: null,
      button: null,
    };

    // function to end trial when it is time
    const end_trial = () => {
      // kill any remaining setTimeout handlers
      this.jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        rt: response.rt,
        response: response.button,
      };

      // clear the display
      display_element.innerHTML = "";

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    function after_response(choice) {
      // measure rt
      var end_time = performance.now();
      var rt = end_time - start_time;
      response.button = parseInt(choice);
      response.rt = rt;

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector("#jspsych-canvas-button-response-stimulus").className +=
        " responded";

      // disable all the buttons after a response
      var btns = document.querySelectorAll(".jspsych-canvas-button-response-button button");
      for (var i = 0; i < btns.length; i++) {
        //btns[i].removeEventListener('click');
        btns[i].setAttribute("disabled", "disabled");
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    }

    // hide image if timing is set
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(function () {
        display_element.querySelector<HTMLElement>(
          "#jspsych-canvas-button-response-stimulus"
        ).style.visibility = "hidden";
      }, trial.stimulus_duration);
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(function () {
        end_trial();
      }, trial.trial_duration);
    }
  }
}

export default CanvasButtonResponsePlugin;
