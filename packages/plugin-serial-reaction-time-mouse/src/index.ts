import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "serial-reaction-time-mouse",
  version: version,
  parameters: {
    /** This array represents the grid of boxes shown on the screen. Each inner array represents a single row. The entries in the inner arrays represent the columns. If an entry is `1` then a square will be drawn at that location on the grid. If an entry is `0` then the corresponding location on the grid will be empty. Thus, by mixing `1`s and `0`s it is possible to create many different grid-based arrangements. */
    grid: {
      type: ParameterType.BOOL, // TO DO: BOOL doesn't seem like the right type here. INT? Also, is this always a nested array?
      array: true,
      default: [[1, 1, 1, 1]],
    },
    /** The location of the target. The array should be the [row, column] of the target. */
    target: {
      type: ParameterType.INT,
      array: true,
      default: undefined,
    },
    /** The width and height in pixels of each square in the grid. */
    grid_square_size: {
      type: ParameterType.INT,
      default: 100,
    },
    /** The color of the target square. */
    target_color: {
      type: ParameterType.STRING,
      default: "#999",
    },
    /** If true, the trial ends after a key press. Feedback is displayed if `show_response_feedback` is true. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** The number of milliseconds to display the grid *before* the target changes color. */
    pre_target_duration: {
      type: ParameterType.INT,
      default: 0,
    },
    /** How long to show the trial */
    /** The maximum length of time of the trial, not including feedback. */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** If a positive number, the target will progressively change color at the start of the trial, with the transition lasting this many milliseconds. */
    fade_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** If true, then user can make nontarget response. */
    allow_nontarget_responses: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which keys to press). */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
      no_function: false,
    },
  },
  data: {
    /** The representation of the grid. This will be encoded as a JSON string when data is saved using
     * the `.json()` or `.csv()` functions.  */
    grid: {
      type: ParameterType.COMPLEX,
      array: true,
    },
    /** The representation of the target location on the grid. This will be encoded
     * as a JSON string when data is saved using the `.json()` or `.csv()` functions */
    target: {
      type: ParameterType.COMPLEX,
      array: true,
    },
    /** The `[row, column]` response location on the grid. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
    response: {
      type: ParameterType.INT,
      array: true,
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the second stimulus first appears on the screen until the participant's response. */
    rt: {
      type: ParameterType.INT,
    },
    /** `true` if the participant's response matched the target.  */
    correct: {
      type: ParameterType.BOOL,
    },
  },
};

type Info = typeof info;

/**
 * The serial reaction time mouse plugin implements a generalized version of the SRT
 * task [(Nissen & Bullmer, 1987)](https://doi.org/10.1016%2F0010-0285%2887%2990002-8).
 * Squares are displayed in a grid-based system on the screen, and one square changes color.
 * The participant must click on the square that changes color.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/serial-reaction-time-mouse/ serial-reaction-time-mouse plugin documentation on jspsych.org}
 */
class SerialReactionTimeMousePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var startTime = -1;
    var response = {
      rt: null,
      row: null,
      column: null,
    };

    const showTarget = () => {
      var resp_targets;
      if (!trial.allow_nontarget_responses) {
        resp_targets = [
          display_element.querySelector(
            "#jspsych-serial-reaction-time-stimulus-cell-" + trial.target[0] + "-" + trial.target[1]
          ),
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
            var info = <any>{};
            info.row = e.currentTarget.getAttribute("data-row");
            info.column = e.currentTarget.getAttribute("data-column");
            info.rt = Math.round(performance.now() - startTime);
            after_response(info);
          }
        });
      }

      startTime = performance.now();

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

      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(endTrial, trial.trial_duration);
      }
    };

    // display stimulus
    var stimulus = this.stimulus(trial.grid, trial.grid_square_size);
    display_element.innerHTML = stimulus;

    if (trial.pre_target_duration <= 0) {
      showTarget();
    } else {
      this.jsPsych.pluginAPI.setTimeout(showTarget, trial.pre_target_duration);
    }

    //show prompt if there is one
    if (trial.prompt !== null) {
      display_element.insertAdjacentHTML("beforeend", trial.prompt);
    }

    const endTrial = () => {
      // gather the data to store for the trial
      var trial_data = {
        rt: response.rt,
        grid: trial.grid,
        target: trial.target,
        response: [parseInt(response.row, 10), parseInt(response.column, 10)],
        correct: response.row == trial.target[0] && response.column == trial.target[1],
      };

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    function after_response(info: { rt: string; row: number; column: number }) {
      // only record first response
      response = response.rt == null ? info : response;

      if (trial.response_ends_trial) {
        endTrial();
      }
    }
  }

  stimulus(grid, square_size: number, target?: number[], target_color?: string, labels?) {
    var stimulus =
      "<div id='jspsych-serial-reaction-time-stimulus' style='margin:auto; display: table; table-layout: fixed; border-spacing:" +
      square_size / 4 +
      "px'>";
    for (var i = 0; i < grid.length; i++) {
      stimulus +=
        "<div class='jspsych-serial-reaction-time-stimulus-row' style='display:table-row;'>";
      for (var j = 0; j < grid[i].length; j++) {
        var classname = "jspsych-serial-reaction-time-stimulus-cell";

        stimulus +=
          "<div class='" +
          classname +
          "' id='jspsych-serial-reaction-time-stimulus-cell-" +
          i +
          "-" +
          j +
          "' " +
          "data-row=" +
          i +
          " data-column=" +
          j +
          " " +
          "style='width:" +
          square_size +
          "px; height:" +
          square_size +
          "px; display:table-cell; vertical-align:middle; text-align: center; cursor: pointer; font-size:" +
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
    let response = this.jsPsych.utils.deepCopy(trial.target);
    if (trial.allow_nontarget_responses && this.jsPsych.randomization.sampleBernoulli(0.8) !== 1) {
      while (response[0] == trial.target[0] && response[1] == trial.target[1]) {
        response[0] == this.jsPsych.randomization.randomInt(0, trial.grid.length);
        //@ts-ignore array typing is not quite right
        response[1] == this.jsPsych.randomization.randomInt(0, trial.grid[response[0]].length);
      }
    }

    const default_data = {
      grid: trial.grid,
      target: trial.target,
      response: response,
      rt:
        trial.pre_target_duration +
        this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      correct: response[0] == trial.target[0] && response[1] == trial.target[1],
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
      const target = display_element.querySelector(
        `.jspsych-serial-reaction-time-stimulus-cell[data-row="${data.response[0]}"][data-column="${data.response[1]}"]`
      );
      this.jsPsych.pluginAPI.clickTarget(target, data.rt);
    }
  }
}

export default SerialReactionTimeMousePlugin;
