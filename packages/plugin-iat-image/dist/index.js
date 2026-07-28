import { ParameterType } from 'jspsych';

var version = "2.1.0";

const info = {
  name: "iat-image",
  version,
  parameters: {
    /** The stimulus to display. The path to an image. */
    stimulus: {
      type: ParameterType.IMAGE,
      default: void 0
    },
    /** Key press that is associated with the `left_category_label`. */
    left_category_key: {
      type: ParameterType.KEY,
      default: "e"
    },
    /** Key press that is associated with the `right_category_label`. */
    right_category_key: {
      type: ParameterType.KEY,
      default: "i"
    },
    /** An array that contains the words/labels associated with a certain stimulus. The labels are aligned to the left
     * side of the page. */
    left_category_label: {
      type: ParameterType.STRING,
      array: true,
      default: ["left"]
    },
    /** An array that contains the words/labels associated with a certain stimulus. The labels are aligned to the right
     * side of the page. */
    right_category_label: {
      type: ParameterType.STRING,
      array: true,
      default: ["right"]
    },
    /** This array contains the characters the participant is allowed to press to move on to the next trial if their key
     * press was incorrect and feedback was displayed. Can also have 'other key' as an option which will only allow the
     * user to select the right key to move forward.  */
    key_to_move_forward: {
      type: ParameterType.KEYS,
      default: "ALL_KEYS"
    },
    /** If `true`, then `html_when_wrong` and `wrong_image_name` is required. If `false`, `trial_duration` is needed
     *  and trial will continue automatically. */
    display_feedback: {
      type: ParameterType.BOOL,
      default: false
    },
    /** The content to display when a user presses the wrong key. */
    html_when_wrong: {
      type: ParameterType.HTML_STRING,
      default: '<span style="color: red; font-size: 80px">X</span>'
    },
    /** Instructions about making a wrong key press and whether another key press is needed to continue. */
    bottom_instructions: {
      type: ParameterType.HTML_STRING,
      default: "<p>If you press the wrong key, a red X will appear. Press any key to continue.</p>"
    },
    /** If this is `true` and the user presses the wrong key then they have to press the other key to continue. An example
     * would be two keys 'e' and 'i'. If the key associated with the stimulus is 'e' and key 'i' was pressed, then
     * pressing 'e' is needed to continue the trial. When this is `true`, then parameter `key_to_move_forward`
     * is not used. If this is `true` and the user presses the wrong key then they have to press the other key to
     * continue. An example would be two keys 'e' and 'i'. If the key associated with the stimulus is 'e' and key
     * 'i' was pressed, then pressing 'e' is needed to continue the trial. When this is `true`, then parameter
     * `key_to_move_forward` is not used. */
    force_correct_key_press: {
      type: ParameterType.BOOL,
      default: false
    },
    /** Either 'left' or 'right'. This indicates whether the stimulus is associated with the key press and
     * category on the left or right side of the page (`left_category_key` or `right_category_key`). */
    stim_key_association: {
      type: ParameterType.SELECT,
      options: ["left", "right"],
      default: void 0
    },
    /** If true, then the trial will end whenever the participant makes a response (assuming they make their
     * response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will
     * continue until the value for `trial_duration` is reached. You can use this parameter to force the participant
     * to view a stimulus for a fixed amount of time, even if they respond before the time is complete. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: true
    },
    /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the
     * participant fails to make a response before this timer is reached, the participant's response will be
     * recorded as `null` for the trial and the trial will end. If the value of this parameter is `null`, then
     * the trial will wait for a response indefinitely. */
    trial_duration: {
      type: ParameterType.INT,
      default: null
    }
  },
  data: {
    /** The path to the image file that the participant saw on this trial. */
    stimulus: {
      type: ParameterType.STRING
    },
    /** Indicates which key the participant pressed. */
    response: {
      type: ParameterType.STRING
    },
    /** Boolean indicating whether the user's key press was correct or incorrect for the given stimulus. */
    correct: {
      type: ParameterType.BOOL
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response.  */
    rt: {
      type: ParameterType.INT
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class IatImagePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    var html_str = "";
    html_str += "<div style='position: absolute; height: 20%; width: 100%; margin-left: auto; margin-right: auto; top: 42%; left: 0; right: 0'><img src='" + trial.stimulus + "' id='jspsych-iat-stim'></img></div>";
    html_str += "<div id='trial_left_align' style='position: absolute; top: 18%; left: 20%'>";
    if (trial.left_category_label.length == 1) {
      html_str += "<p>Press " + trial.left_category_key + " for:<br> " + trial.left_category_label[0].bold() + "</p></div>";
    } else {
      html_str += "<p>Press " + trial.left_category_key + " for:<br> " + trial.left_category_label[0].bold() + "<br>or<br>" + trial.left_category_label[1].bold() + "</p></div>";
    }
    html_str += "<div id='trial_right_align' style='position: absolute; top: 18%; right: 20%'>";
    if (trial.right_category_label.length == 1) {
      html_str += "<p>Press " + trial.right_category_key + " for:<br> " + trial.right_category_label[0].bold() + "</p></div>";
    } else {
      html_str += "<p>Press " + trial.right_category_key + " for:<br> " + trial.right_category_label[0].bold() + "<br>or<br>" + trial.right_category_label[1].bold() + "</p></div>";
    }
    html_str += "<div id='wrongImgID' style='position:relative; top: 300px; margin-left: auto; margin-right: auto; left: 0; right: 0'>";
    if (trial.display_feedback === true) {
      html_str += "<div id='wrongImgContainer' style='visibility: hidden; position: absolute; top: -75px; margin-left: auto; margin-right: auto; left: 0; right: 0'><p>" + trial.html_when_wrong + "</p></div>";
      html_str += "<div>" + trial.bottom_instructions + "</div>";
    } else {
      html_str += "<div>" + trial.bottom_instructions + "</div>";
    }
    html_str += "</div>";
    display_element.innerHTML = html_str;
    var response = {
      rt: null,
      key: null,
      correct: false
    };
    const end_trial = () => {
      if (typeof keyboardListener !== "undefined") {
        this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        response: response.key,
        correct: response.correct
      };
      this.jsPsych.finishTrial(trial_data);
    };
    var leftKeyCode = trial.left_category_key;
    var rightKeyCode = trial.right_category_key;
    const after_response = (info2) => {
      var wImg = document.getElementById("wrongImgContainer");
      display_element.querySelector("#jspsych-iat-stim").className += " responded";
      if (response.key == null) {
        response.key = info2.key;
        response.rt = info2.rt;
      }
      if (trial.stim_key_association == "right") {
        if (response.rt !== null && this.jsPsych.pluginAPI.compareKeys(response.key, rightKeyCode)) {
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
              this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: [trial.right_category_key]
              });
            } else {
              this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: trial.key_to_move_forward
              });
            }
          } else if (trial.response_ends_trial && trial.display_feedback != true) {
            end_trial();
          } else if (!trial.response_ends_trial && trial.display_feedback != true) ;
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
              this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: [trial.left_category_key]
              });
            } else {
              this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: trial.key_to_move_forward
              });
            }
          } else if (trial.response_ends_trial && trial.display_feedback != true) {
            end_trial();
          } else if (!trial.response_ends_trial && trial.display_feedback != true) ;
        }
      }
    };
    if (trial.left_category_key != "NO_KEYS" && trial.right_category_key != "NO_KEYS") {
      var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.left_category_key, trial.right_category_key],
        rt_method: "performance",
        persist: false,
        allow_held_key: false
      });
    }
    if (trial.trial_duration !== null && trial.response_ends_trial != true) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        end_trial();
      }, trial.trial_duration);
    }
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
    const key = this.jsPsych.pluginAPI.getValidKey([
      trial.left_category_key,
      trial.right_category_key
    ]);
    const correct = trial.stim_key_association == "left" ? key == trial.left_category_key : key == trial.right_category_key;
    const default_data = {
      stimulus: trial.stimulus,
      response: key,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      correct
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
    if (data.response !== null) {
      this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
    }
    const cont_rt = data.rt == null ? trial.trial_duration : data.rt;
    if (trial.force_correct_key_press) {
      if (!data.correct) {
        this.jsPsych.pluginAPI.pressKey(
          trial.stim_key_association == "left" ? trial.left_category_key : trial.right_category_key,
          cont_rt + this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true)
        );
      }
    } else {
      this.jsPsych.pluginAPI.pressKey(
        this.jsPsych.pluginAPI.getValidKey(trial.key_to_move_forward),
        cont_rt + this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true)
      );
    }
  }
}

export { IatImagePlugin as default };
//# sourceMappingURL=index.js.map
