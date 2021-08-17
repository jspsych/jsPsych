import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "iat-html",
  parameters: {
    /* The HTML string to be displayed. */
    stimulus: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Stimulus",
      default: undefined,
    },
    /* Key press that is associated with the left category label.*/
    left_category_key: {
      type: ParameterType.KEY,
      pretty_name: "Left category key",
      default: "e",
    },
    /* Key press that is associated with the right category label. */
    right_category_key: {
      type: ParameterType.KEY,
      pretty_name: "Right category key",
      default: "i",
    },
    /* The label that is associated with the stimulus. Aligned to the left side of page */
    left_category_label: {
      type: ParameterType.STRING,
      pretty_name: "Left category label",
      array: true,
      default: ["left"],
    },
    /* The label that is associated with the stimulus. Aligned to the right side of the page. */
    right_category_label: {
      type: ParameterType.STRING,
      pretty_name: "Right category label",
      array: true,
      default: ["right"],
    },
    /* The keys that allow the user to advance to the next trial if their key press was incorrect. */
    key_to_move_forward: {
      type: ParameterType.KEYS,
      pretty_name: "Key to move forward",
      array: true,
      default: "ALL_KEYS",
    },
    /* If true, then html when wrong will be displayed when user makes an incorrect key press. */
    display_feedback: {
      type: ParameterType.BOOL,
      pretty_name: "Display feedback",
      default: false,
    },
    /* The HTML to display when a user presses the wrong key. */
    html_when_wrong: {
      type: ParameterType.HTML_STRING,
      pretty_name: "HTML when wrong",
      default: '<span style="color: red; font-size: 80px">X</span>',
    },
    /* Instructions shown at the bottom of the page. */
    bottom_instructions: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Bottom instructions",
      default: "<p>If you press the wrong key, a red X will appear. Press any key to continue.</p>",
    },
    /* If true, in order to advance to the next trial after a wrong key press the user will be forced to press the correct key. */
    force_correct_key_press: {
      type: ParameterType.BOOL,
      pretty_name: "Force correct key press",
      default: false,
    },
    /* Stimulus will be associated with either "left" or "right". */
    stim_key_association: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Stimulus key association",
      options: ["left", "right"],
      default: undefined,
    },
    /* If true, trial will end when user makes a response. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true,
    },
    /* How long to show the trial. */
    trial_duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: null,
    },
  },
};

type Info = typeof info;

/**
 * jspsych-iat
 * Kristin Diep
 *
 * plugin for running an IAT (Implicit Association Test) with an HTML-formatted stimulus
 *
 * documentation: docs.jspsych.org
 *
 **/
class IatHtmlPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var html_str = "";

    html_str +=
      "<div style='position: absolute; height: 20%; width: 100%; margin-left: auto; margin-right: auto; top: 42%; left: 0; right: 0'><p id='jspsych-iat-stim'>" +
      trial.stimulus +
      "</p></div>";

    html_str += "<div id='trial_left_align' style='position: absolute; top: 18%; left: 20%'>";

    if (trial.left_category_label.length == 1) {
      html_str +=
        "<p>Press " +
        trial.left_category_key +
        " for:<br> " +
        trial.left_category_label[0].bold() +
        "</p></div>";
    } else {
      html_str +=
        "<p>Press " +
        trial.left_category_key +
        " for:<br> " +
        trial.left_category_label[0].bold() +
        "<br>" +
        "or<br>" +
        trial.left_category_label[1].bold() +
        "</p></div>";
    }

    html_str += "<div id='trial_right_align' style='position: absolute; top: 18%; right: 20%'>";

    if (trial.right_category_label.length == 1) {
      html_str +=
        "<p>Press " +
        trial.right_category_key +
        " for:<br> " +
        trial.right_category_label[0].bold() +
        "</p></div>";
    } else {
      html_str +=
        "<p>Press " +
        trial.right_category_key +
        " for:<br> " +
        trial.right_category_label[0].bold() +
        "<br>" +
        "or<br>" +
        trial.right_category_label[1].bold() +
        "</p></div>";
    }

    html_str +=
      "<div id='wrongImgID' style='position:relative; top: 300px; margin-left: auto; margin-right: auto; left: 0; right: 0'>";

    if (trial.display_feedback === true) {
      html_str +=
        "<div id='wrongImgContainer' style='visibility: hidden; position: absolute; top: -75px; margin-left: auto; margin-right: auto; left: 0; right: 0'><p>" +
        trial.html_when_wrong +
        "</p></div>";
      html_str += "<div>" + trial.bottom_instructions + "</div>";
    } else {
      html_str += "<div>" + trial.bottom_instructions + "</div>";
    }

    html_str += "</div>";

    display_element.innerHTML = html_str;

    // store response
    var response = {
      rt: null,
      key: null,
      correct: false,
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
        stimulus: trial.stimulus,
        response: response.key,
        correct: response.correct,
      };

      // clears the display
      display_element.innerHTML = "";

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    var leftKeyCode = trial.left_category_key;
    var rightKeyCode = trial.right_category_key;

    // function to handle responses by the subject
    const after_response = (info: { key: string; rt: number }) => {
      var wImg = document.getElementById("wrongImgContainer");
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector("#jspsych-iat-stim").className += " responded";

      // only record the first response
      if (response.key == null) {
        response.key = info.key;
        response.rt = info.rt;
      }

      if (trial.stim_key_association == "right") {
        if (
          response.rt !== null &&
          this.jsPsych.pluginAPI.compareKeys(response.key, rightKeyCode)
        ) {
          response.correct = true;
          if (trial.response_ends_trial) {
            end_trial();
          }
        } else {
          response.correct = false;
          if (!trial.response_ends_trial && trial.display_feedback == true) {
            wImg.style.visibility = "visible";
          }
          if (trial.response_ends_trial && trial.display_feedback == true) {
            wImg.style.visibility = "visible";
            if (trial.force_correct_key_press) {
              var keyListener = this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: [trial.right_category_key],
              });
            } else {
              var keyListener = this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: trial.key_to_move_forward,
              });
            }
          } else if (trial.response_ends_trial && trial.display_feedback != true) {
            var keyListener = this.jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: end_trial,
              valid_responses: ["ALL_KEYS"],
            });
          } else if (!trial.response_ends_trial && trial.display_feedback != true) {
          }
        }
      } else if (trial.stim_key_association == "left") {
        if (response.rt !== null && this.jsPsych.pluginAPI.compareKeys(response.key, leftKeyCode)) {
          response.correct = true;
          if (trial.response_ends_trial) {
            end_trial();
          }
        } else {
          response.correct = false;
          if (!trial.response_ends_trial && trial.display_feedback == true) {
            wImg.style.visibility = "visible";
          }
          if (trial.response_ends_trial && trial.display_feedback == true) {
            wImg.style.visibility = "visible";
            if (trial.force_correct_key_press) {
              var keyListener = this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: [trial.left_category_key],
              });
            } else {
              var keyListener = this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: trial.key_to_move_forward,
              });
            }
          } else if (trial.response_ends_trial && trial.display_feedback != true) {
            var keyListener = this.jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: end_trial,
              valid_responses: ["ALL_KEYS"],
            });
          } else if (!trial.response_ends_trial && trial.display_feedback != true) {
          }
        }
      }
    };

    // start the response listener
    if (trial.left_category_key != "NO_KEYS" && trial.right_category_key != "NO_KEYS") {
      // TO DO: what to use here? "nokeys"?
      var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.left_category_key, trial.right_category_key],
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null && trial.response_ends_trial != true) {
      this.jsPsych.pluginAPI.setTimeout(function () {
        end_trial();
      }, trial.trial_duration);
    }
  }
}

export default IatHtmlPlugin;
