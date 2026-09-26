var jsPsychSerialReactionTimeMouse = (function (jspsych) {
  'use strict';

  var version = "2.2.0";

  const info = {
    name: "serial-reaction-time-mouse",
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
      /** If true, the trial ends after a click. Feedback is displayed if `show_response_feedback` is true. */
      response_ends_trial: {
        type: jspsych.ParameterType.BOOL,
        default: true
      },
      /** The number of milliseconds to display the grid *before* the target changes color. */
      pre_target_duration: {
        type: jspsych.ParameterType.INT,
        default: 0
      },
      /** How long to show the trial */
      /** The maximum length of time of the trial, not including feedback. */
      trial_duration: {
        type: jspsych.ParameterType.INT,
        default: null
      },
      /** If true, show feedback indicating where the participant clicked and whether it was correct. */
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
      /** If true, then user can make nontarget response. */
      allow_nontarget_responses: {
        type: jspsych.ParameterType.BOOL,
        default: false
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
      /** The `[row, column]` response location on the grid. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
      response: {
        type: jspsych.ParameterType.INT,
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
  class SerialReactionTimeMousePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    static {
      this.info = info;
    }
    trial(display_element, trial) {
      var startTime = -1;
      var response = {
        rt: null,
        row: null,
        column: null,
        correct: false
      };
      const endTrial = () => {
        var trial_data = {
          rt: response.rt,
          grid: trial.grid,
          target: trial.target,
          response: [parseInt(response.row, 10), parseInt(response.column, 10)],
          correct: response.correct
        };
        this.jsPsych.finishTrial(trial_data);
      };
      const showFeedback = () => {
        if (response.rt == null || trial.show_response_feedback == false) {
          endTrial();
        } else {
          var color = response.correct ? "#0f0" : "#f00";
          var cell = display_element.querySelector(
            "#jspsych-serial-reaction-time-stimulus-cell-" + response.row + "-" + response.column
          );
          cell.style.transition = "";
          cell.style.backgroundColor = color;
          this.jsPsych.pluginAPI.setTimeout(endTrial, trial.feedback_duration);
        }
      };
      const after_response = (info2) => {
        if (response.rt == null) {
          response.rt = info2.rt;
          response.row = info2.row;
          response.column = info2.column;
          response.correct = parseInt(info2.row, 10) == trial.target[0] && parseInt(info2.column, 10) == trial.target[1];
        }
        if (trial.response_ends_trial) {
          if (trial.show_response_feedback) {
            showFeedback();
          } else {
            endTrial();
          }
        }
      };
      const showTarget = () => {
        var resp_targets;
        if (!trial.allow_nontarget_responses) {
          resp_targets = [
            display_element.querySelector(
              "#jspsych-serial-reaction-time-stimulus-cell-" + trial.target[0] + "-" + trial.target[1]
            )
          ];
        } else {
          resp_targets = display_element.querySelectorAll(
            ".jspsych-serial-reaction-time-stimulus-cell"
          );
        }
        for (var i = 0; i < resp_targets.length; i++) {
          resp_targets[i].addEventListener("mousedown", (e) => {
            if (startTime == -1) {
              return;
            } else {
              var info2 = {};
              info2.row = e.currentTarget.getAttribute("data-row");
              info2.column = e.currentTarget.getAttribute("data-column");
              info2.rt = Math.round(performance.now() - startTime);
              after_response(info2);
            }
          });
        }
        startTime = performance.now();
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
        display_element.insertAdjacentHTML("beforeend", trial.prompt);
      }
    }
    stimulus(grid, square_size, target, target_color, labels) {
      var stimulus = "<div id='jspsych-serial-reaction-time-stimulus' style='margin:auto; display: table; table-layout: fixed; border-spacing:" + square_size / 4 + "px'>";
      for (var i = 0; i < grid.length; i++) {
        stimulus += "<div class='jspsych-serial-reaction-time-stimulus-row' style='display:table-row;'>";
        for (var j = 0; j < grid[i].length; j++) {
          var classname = "jspsych-serial-reaction-time-stimulus-cell";
          stimulus += "<div class='" + classname + "' id='jspsych-serial-reaction-time-stimulus-cell-" + i + "-" + j + "' data-row=" + i + " data-column=" + j + " style='width:" + square_size + "px; height:" + square_size + "px; display:table-cell; vertical-align:middle; text-align: center; cursor: pointer; font-size:" + square_size / 2 + "px;";
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
      let response = this.jsPsych.utils.deepCopy(trial.target);
      if (trial.allow_nontarget_responses && this.jsPsych.randomization.sampleBernoulli(0.8) !== 1) {
        while (response[0] == trial.target[0] && response[1] == trial.target[1]) {
          response[0] == this.jsPsych.randomization.randomInt(0, trial.grid.length);
          response[1] == this.jsPsych.randomization.randomInt(0, trial.grid[response[0]].length);
        }
      }
      const default_data = {
        grid: trial.grid,
        target: trial.target,
        response,
        rt: trial.pre_target_duration + this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
        correct: response[0] == trial.target[0] && response[1] == trial.target[1]
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
        const target = display_element.querySelector(
          `.jspsych-serial-reaction-time-stimulus-cell[data-row="${data.response[0]}"][data-column="${data.response[1]}"]`
        );
        this.jsPsych.pluginAPI.clickTarget(target, data.rt);
      }
    }
  }

  return SerialReactionTimeMousePlugin;

})(jsPsychModule);
//# sourceMappingURL=https://unpkg.com/@jspsych/plugin-serial-reaction-time-mouse@2.2.0/dist/index.browser.js.map
