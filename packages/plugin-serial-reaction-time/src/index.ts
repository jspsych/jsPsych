import { JsPsych, JsPsychPlugin, TrialType, parameterType } from "jspsych";

const info = <const>{
  name: "serial-reaction-time",
  parameters: {
    /* This array represents the grid of boxes shown on the screen. */
    grid: {
      type: parameterType.BOOL,
      pretty_name: "Grid",
      array: true,
      default: [[1, 1, 1, 1]]
    },
    /* The location of the target. The array should be the [row, column] of the target. */
    target: {
      type: parameterType.INT,
      pretty_name: "Target",
      array: true,
      default: undefined
    },
    /* Each entry in this array is the key that should be pressed for that corresponding location in the grid. */
    choices: {
      type: parameterType.KEY,
      pretty_name: "Choices",
      array: true,
      default: [["3", "5", "7", "9"]]
    },
    /* The width and height in pixels of each square in the grid. */
    grid_square_size: {
      type: parameterType.INT,
      pretty_name: "Grid square size",
      default: 100
    },
    /* The color of the target square. */
    target_color: {
      type: parameterType.STRING,
      pretty_name: "Target color",
      default: "#999"
    },
    /* If true, trial ends when user makes a response */
    response_ends_trial: {
      type: parameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true
    },
    /* The number of milliseconds to display the grid before the target changes color. */
    pre_target_duration: {
      type: parameterType.INT,
      pretty_name: "Pre-target duration",
      default: 0
    },
    /* How long to show the trial. */
    trial_duration: {
      type: parameterType.INT,
      pretty_name: "Trial duration",
      default: null
    },
    /* If true, show feedback indicating where the user responded and whether it was correct. */
    show_response_feedback: {
      type: parameterType.BOOL,
      pretty_name: "Show response feedback",
      default: false
    },
    /* The length of time in milliseconds to show the feedback. */
    feedback_duration: {
      type: parameterType.INT,
      pretty_name: "Feedback duration",
      default: 200
    },
    /* If a positive number, the target will progressively change color at the start of the trial, with the transition lasting this many milliseconds. */
    fade_duration: {
      type: parameterType.INT,
      pretty_name: "Fade duration",
      default: null
    },
    /* Any content here will be displayed below the stimulus. */
    prompt: {
      type: parameterType.STRING,
      pretty_name: "Prompt",
      default: null,
      no_function: false
    }
  }
};

type Info = typeof info;

/**
 * jspsych-serial-reaction-time
 * Josh de Leeuw
 *
 * plugin for running a serial reaction time task
 *
 * documentation: docs.jspsych.org
 *
 **/
class SerialReactionTimePlugin implements JsPsychPlugin<Info> {
  info = info;

  constructor(private jsPsych: JsPsych) {};

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // create a flattened version of the choices array
    var flat_choices = this.jsPsych.utils.flatten(trial.choices);
    while (flat_choices.indexOf("") > -1) {
      flat_choices.splice(flat_choices.indexOf(""), 1);
    }

    // display stimulus
    var stimulus = this.stimulus(trial.grid, trial.grid_square_size);
    display_element.innerHTML = stimulus;

    if (trial.pre_target_duration <= 0) {
      showTarget();
    } else {
      this.jsPsych.pluginAPI.setTimeout(function () {
        showTarget();
      }, trial.pre_target_duration);
    }

    //show prompt if there is one
    if (trial.prompt !== null) {
      display_element.innerHTML += trial.prompt;
    }

    var keyboardListener = {};

    var response = <any>{
      rt: null,
      key: false,
      correct: false,
    };

    function showTarget() {
      if (trial.fade_duration == null) {
        display_element.querySelector<HTMLElement>(
          "#jspsych-serial-reaction-time-stimulus-cell-" + trial.target[0] + "-" + trial.target[1]
        ).style.backgroundColor = trial.target_color;
      } else {
        display_element.querySelector<HTMLElement>(
          "#jspsych-serial-reaction-time-stimulus-cell-" + trial.target[0] + "-" + trial.target[1]
        ).style.transition = "background-color " + trial.fade_duration;
        display_element.querySelector<HTMLElement>(
          "#jspsych-serial-reaction-time-stimulus-cell-" + trial.target[0] + "-" + trial.target[1]
        ).style.backgroundColor = trial.target_color;
      }

      keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: flat_choices,
        allow_held_key: false,
      });

      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(showFeedback, trial.trial_duration);
      }
    }

    function showFeedback() {
      if (response.rt == null || trial.show_response_feedback == false) {
        endTrial();
      } else {
        var color = response.correct ? "#0f0" : "#f00";
        display_element.querySelector<HTMLElement>(
          "#jspsych-serial-reaction-time-stimulus-cell-" +
            response.responseLoc[0] +
            "-" +
            response.responseLoc[1]
        ).style.transition = "";
        display_element.querySelector<HTMLElement>(
          "#jspsych-serial-reaction-time-stimulus-cell-" +
            response.responseLoc[0] +
            "-" +
            response.responseLoc[1]
        ).style.backgroundColor = color;
        this.jsPsych.pluginAPI.setTimeout(endTrial, trial.feedback_duration);
      }
    }

    function endTrial() {
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
        correct: response.correct,
        grid: trial.grid,
        target: trial.target,
      };

      // clear the display
      display_element.innerHTML = "";

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    }

    // function to handle responses by the subject
    function after_response(info) {
      // only record first response
      response = response.rt == null ? info : response;

      // check if the response is correct
      var responseLoc = [];
      for (var i = 0; i < trial.choices.length; i++) {
        for (var j = 0; j < trial.choices[i].length; j++) {
          var t = trial.choices[i][j];
          if (this.jsPsych.pluginAPI.compareKeys(info.key, t)) {
            responseLoc = [i, j];
            break;
          }
        }
      }
      response.responseLoc = responseLoc;
      response.correct = JSON.stringify(responseLoc) == JSON.stringify(trial.target);

      if (trial.response_ends_trial) {
        if (trial.show_response_feedback) {
          // @ts-ignore How was this supposed to work?
          showFeedback(response.correct);
        } else {
          endTrial();
        }
      }
    }
  }

  stimulus = function (grid, square_size: number, target?: number[], target_color?: string, labels?) {  // TO DO: types for nested arrays of numbers/strings?
    var stimulus =
      "<div id='jspsych-serial-reaction-time-stimulus' style='margin:auto; display: table; table-layout: fixed; border-spacing:" +
      square_size / 4 +
      "px'>";
    for (var i = 0; i < grid.length; i++) {
      stimulus +=
        "<div class='jspsych-serial-reaction-time-stimulus-row' style='display:table-row;'>";
      for (var j = 0; j < grid[i].length; j++) {
        stimulus +=
          "<div class='jspsych-serial-reaction-time-stimulus-cell' id='jspsych-serial-reaction-time-stimulus-cell-" +
          i +
          "-" +
          j +
          "' " +
          "style='width:" +
          square_size +
          "px; height:" +
          square_size +
          "px; display:table-cell; vertical-align:middle; text-align: center; font-size:" +
          square_size / 2 +
          "px;";
        if (grid[i][j] == 1) {
          stimulus += "border: 2px solid black;";
        }
        if (typeof target !== "undefined" && target[0] == i && target[1] == j) {
          stimulus += "background-color: " + target_color + ";";
        }
        stimulus += "'>";
        if (typeof labels !== "undefined" && labels[i][j] !== false) {
          stimulus += labels[i][j];
        }
        stimulus += "</div>";
      }
      stimulus += "</div>";
    }
    stimulus += "</div>";

    return stimulus;
  }
}

export default SerialReactionTimePlugin;
