'use strict';

var jspsych = require('jspsych');

var version = "2.1.0";

const info = {
  name: "serial-reaction-time",
  version,
  parameters: {
    /** This array represents the grid of boxes shown on the screen. Each inner array represents a single row. The entries in the inner arrays represent the columns. If an entry is `1` then a square will be drawn at that location on the grid. If an entry is `0` then the corresponding location on the grid will be empty. Thus, by mixing `1`s and `0`s it is possible to create many different grid-based arrangements. */
    grid: {
      type: jspsych.ParameterType.BOOL,
      // TO DO: BOOL doesn't seem like the right type here. INT? Also, is this always a nested array?
      array: true,
      default: [[1, 1, 1, 1]]
    },
    /** The location of the target. The array should be the [row, column] of the target. */
    target: {
      type: jspsych.ParameterType.INT,
      array: true,
      default: void 0
    },
    /** The dimensions of this array must match the dimensions of `grid`. Each entry in this array is the key that should be pressed for that corresponding location in the grid. Entries can be left blank if there is no key associated with that location of the grid.  */
    choices: {
      type: jspsych.ParameterType.KEYS,
      // TO DO: always a nested array, so I think ParameterType.KEYS and array: true is ok here?
      array: true,
      default: [["3", "5", "7", "9"]]
    },
    /** The width and height in pixels of each square in the grid. */
    grid_square_size: {
      type: jspsych.ParameterType.INT,
      default: 100
    },
    /** The color of the target square. */
    target_color: {
      type: jspsych.ParameterType.STRING,
      default: "#999"
    },
    /** If true, the trial ends after a key press. Feedback is displayed if `show_response_feedback` is true. */
    response_ends_trial: {
      type: jspsych.ParameterType.BOOL,
      default: true
    },
    /** The number of milliseconds to display the grid *before* the target changes color. */
    pre_target_duration: {
      type: jspsych.ParameterType.INT,
      default: 0
    },
    /** The maximum length of time of the trial, not including feedback. */
    trial_duration: {
      type: jspsych.ParameterType.INT,
      default: null
    },
    /** If true, show feedback indicating where the user responded and whether it was correct. */
    show_response_feedback: {
      type: jspsych.ParameterType.BOOL,
      default: false
    },
    /** The length of time in milliseconds to show the feedback. */
    feedback_duration: {
      type: jspsych.ParameterType.INT,
      default: 200
    },
    /** If a positive number, the target will progressively change color at the start of the trial, with the transition lasting this many milliseconds. */
    fade_duration: {
      type: jspsych.ParameterType.INT,
      default: null
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which keys to press). */
    prompt: {
      type: jspsych.ParameterType.HTML_STRING,
      default: null,
      no_function: false
    }
  },
  data: {
    /** The representation of the grid. This will be encoded as a JSON string when data is saved using
     * the `.json()` or `.csv()` functions.  */
    grid: {
      type: jspsych.ParameterType.COMPLEX,
      array: true
    },
    /** The representation of the target location on the grid. This will be encoded
     * as a JSON string when data is saved using the `.json()` or `.csv()` functions */
    target: {
      type: jspsych.ParameterType.COMPLEX,
      array: true
    },
    /** Indicates which key the participant pressed. */
    response: {
      type: jspsych.ParameterType.STRING,
      array: true
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the second stimulus first appears on the screen until the participant's response. */
    rt: {
      type: jspsych.ParameterType.INT
    },
    /** `true` if the participant's response matched the target.  */
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
class SerialReactionTimePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
    this.stimulus = function(grid, square_size, target, target_color, labels) {
      var stimulus = "<div id='jspsych-serial-reaction-time-stimulus' style='margin:auto; display: table; table-layout: fixed; border-spacing:" + square_size / 4 + "px'>";
      for (var i = 0; i < grid.length; i++) {
        stimulus += "<div class='jspsych-serial-reaction-time-stimulus-row' style='display:table-row;'>";
        for (var j = 0; j < grid[i].length; j++) {
          stimulus += "<div class='jspsych-serial-reaction-time-stimulus-cell' id='jspsych-serial-reaction-time-stimulus-cell-" + i + "-" + j + "' style='width:" + square_size + "px; height:" + square_size + "px; display:table-cell; vertical-align:middle; text-align: center; font-size:" + square_size / 2 + "px;";
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
    };
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    var flat_choices = trial.choices.flat();
    while (flat_choices.indexOf("") > -1) {
      flat_choices.splice(flat_choices.indexOf(""), 1);
    }
    var keyboardListener;
    var response = {
      rt: null,
      key: false,
      correct: false
    };
    const endTrial = () => {
      this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      var trial_data = {
        rt: response.rt,
        response: response.key,
        correct: response.correct,
        grid: trial.grid,
        target: trial.target
      };
      this.jsPsych.finishTrial(trial_data);
    };
    const showFeedback = () => {
      if (response.rt == null || trial.show_response_feedback == false) {
        endTrial();
      } else {
        var color = response.correct ? "#0f0" : "#f00";
        display_element.querySelector(
          "#jspsych-serial-reaction-time-stimulus-cell-" + response.responseLoc[0] + "-" + response.responseLoc[1]
        ).style.transition = "";
        display_element.querySelector(
          "#jspsych-serial-reaction-time-stimulus-cell-" + response.responseLoc[0] + "-" + response.responseLoc[1]
        ).style.backgroundColor = color;
        this.jsPsych.pluginAPI.setTimeout(endTrial, trial.feedback_duration);
      }
    };
    const after_response = (info2) => {
      response = response.rt == null ? info2 : response;
      var responseLoc = [];
      for (var i = 0; i < trial.choices.length; i++) {
        for (var j = 0; j < trial.choices[i].length; j++) {
          var t = trial.choices[i][j];
          if (this.jsPsych.pluginAPI.compareKeys(info2.key, t)) {
            responseLoc = [i, j];
            break;
          }
        }
      }
      response.responseLoc = responseLoc;
      response.correct = JSON.stringify(responseLoc) == JSON.stringify(trial.target);
      if (trial.response_ends_trial) {
        if (trial.show_response_feedback) {
          showFeedback();
        } else {
          endTrial();
        }
      }
    };
    const showTarget = () => {
      if (trial.fade_duration == null) {
        display_element.querySelector(
          "#jspsych-serial-reaction-time-stimulus-cell-" + trial.target[0] + "-" + trial.target[1]
        ).style.backgroundColor = trial.target_color;
      } else {
        display_element.querySelector(
          "#jspsych-serial-reaction-time-stimulus-cell-" + trial.target[0] + "-" + trial.target[1]
        ).style.transition = "background-color " + trial.fade_duration;
        display_element.querySelector(
          "#jspsych-serial-reaction-time-stimulus-cell-" + trial.target[0] + "-" + trial.target[1]
        ).style.backgroundColor = trial.target_color;
      }
      keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: flat_choices,
        allow_held_key: false
      });
      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(showFeedback, trial.trial_duration);
      }
    };
    var stimulus = this.stimulus(trial.grid, trial.grid_square_size);
    display_element.innerHTML = stimulus;
    if (trial.pre_target_duration <= 0) {
      showTarget();
    } else {
      this.jsPsych.pluginAPI.setTimeout(showTarget, trial.pre_target_duration);
    }
    if (trial.prompt !== null) {
      display_element.innerHTML += trial.prompt;
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
    let key;
    if (this.jsPsych.randomization.sampleBernoulli(0.8) == 1) {
      key = trial.choices[trial.target[0]][trial.target[1]];
    } else {
      key = this.jsPsych.pluginAPI.getValidKey(trial.choices);
      while (key == trial.choices[trial.target[0]][trial.target[1]]) {
        key = this.jsPsych.pluginAPI.getValidKey(trial.choices);
      }
    }
    const default_data = {
      grid: trial.grid,
      target: trial.target,
      response: key,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      correct: key == trial.choices[trial.target[0]][trial.target[1]]
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
  }
}

module.exports = SerialReactionTimePlugin;
//# sourceMappingURL=index.cjs.map
