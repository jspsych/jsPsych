import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "canvas-button-response",
  version: version,
  parameters: {
    /**
     * The function to draw on the canvas. This function automatically takes a canvas element as its only argument,
     * e.g. `function(c) {...}`  or `function drawStim(c) {...}`, where `c` refers to the canvas element. Note that
     * the stimulus function will still generally need to set the correct context itself, using a line like
     * `let ctx = c.getContext("2d")`.
     */
    stimulus: {
      type: ParameterType.FUNCTION,
      default: undefined,
    },
    /** Labels for the buttons. Each different string in the array will generate a different button. */
    choices: {
      type: ParameterType.STRING,
      default: undefined,
      array: true,
    },
    /**
     * ``(choice: string, choice_index: number)=>`<button class="jspsych-btn">${choice}</button>``; | A
     * function that generates the HTML for each button in the `choices` array. The function gets the
     * string and index of the item in the `choices` array and should return valid HTML. If you want
     * to use different markup for each button, you can do that by using a conditional on either parameter.
     * The default parameter returns a button element with the text label of the choice.
     */
    button_html: {
      type: ParameterType.FUNCTION,
      default: function (choice: string, choice_index: number) {
        return `<button class="jspsych-btn">${choice}</button>`;
      },
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus.
     * The intention is that it can be used to provide a reminder about the action the participant is supposed
     * to take (e.g., what question to answer).
     */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be
     * set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until
     * the trial ends.
     */
    stimulus_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** How long to wait for the participant to make a response before ending the trial in milliseconds.
     * If the participant fails to make a response before this timer is reached, the participant's response
     * will be recorded as null for the trial and the trial will end. If the value of this parameter is null,
     * the trial will wait for a response indefinitely.
     */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** Setting to `'grid'` will make the container element have the CSS property `display: grid` and enable
     * the use of `grid_rows` and `grid_columns`. Setting to `'flex'` will make the container element have the
     * CSS property `display: flex`. You can customize how the buttons are laid out by adding inline CSS in
     * the `button_html` parameter.
     */
    button_layout: {
      type: ParameterType.STRING,
      default: "grid",
    },
    /**
     * The number of rows in the button grid. Only applicable when `button_layout` is set to `'grid'`.
     * If null, the number of rows will be determined automatically based on the number of buttons and the number of columns.
     */
    grid_rows: {
      type: ParameterType.INT,
      default: 1,
    },
    /**
     * The number of columns in the button grid. Only applicable when `button_layout` is set to `'grid'`.
     * If null, the number of columns will be determined automatically based on the number of buttons and the number of rows.
     */
    grid_columns: {
      type: ParameterType.INT,
      default: null,
    },
    /** If true, then the trial will end whenever the participant makes a response (assuming they make their response
     * before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until
     * the value for `trial_duration` is reached. You can use this parameter to force the participant to view a
     * stimulus for a fixed amount of time, even if they respond before the time is complete.
     */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** Array that defines the size of the canvas element in pixels. First value is height, second value is width. */
    canvas_size: {
      type: ParameterType.INT,
      array: true,
      default: [500, 500],
    },
  },
  data: {
    /** Indicates which button the participant pressed. The first button in the `choices` array is 0, the second is 1, and so on. */
    response: {
      type: ParameterType.INT,
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the
     * stimulus first appears on the screen until the participant's response.
     */
    rt: {
      type: ParameterType.INT,
    },
  },
};

type Info = typeof info;

/**
 * This plugin can be used to draw a stimulus on a [HTML canvas element](https://www.w3schools.com/html/html5_canvas.asp), and record
 * a button click response and response time. The canvas stimulus can be useful for displaying dynamic, parametrically-defined
 * graphics, and for controlling the positioning of multiple graphical elements (shapes, text, images). The stimulus can be
 * displayed until a response is given, or for a pre-determined amount of time. The trial can be ended automatically if the
 * participant has failed to respond within a fixed length of time. One or more button choices will be displayed under the canvas,
 * and the button style can be customized using HTML formatting.
 *
 * @author Chris Jungerius (modified from Josh de Leeuw)
 * @see {@link https://www.jspsych.org/latest/plugins/canvas-button-response/ canvas-button-response plugin documentation on jspsych.org}
 */
class CanvasButtonResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // Create canvas
    const stimulusElement = document.createElement("div");
    stimulusElement.id = "jspsych-canvas-button-response-stimulus";

    const canvasElement = document.createElement("canvas");
    canvasElement.id = "jspsych-canvas-stimulus";
    canvasElement.height = trial.canvas_size[0];
    canvasElement.width = trial.canvas_size[1];
    canvasElement.style.display = "block";
    stimulusElement.appendChild(canvasElement);

    display_element.appendChild(stimulusElement);

    // Display buttons
    const buttonGroupElement = document.createElement("div");
    buttonGroupElement.id = "jspsych-canvas-button-response-btngroup";
    if (trial.button_layout === "grid") {
      buttonGroupElement.classList.add("jspsych-btn-group-grid");
      if (trial.grid_rows === null && trial.grid_columns === null) {
        throw new Error(
          "You cannot set `grid_rows` to `null` without providing a value for `grid_columns`."
        );
      }
      const n_cols =
        trial.grid_columns === null
          ? Math.ceil(trial.choices.length / trial.grid_rows)
          : trial.grid_columns;
      const n_rows =
        trial.grid_rows === null
          ? Math.ceil(trial.choices.length / trial.grid_columns)
          : trial.grid_rows;
      buttonGroupElement.style.gridTemplateColumns = `repeat(${n_cols}, 1fr)`;
      buttonGroupElement.style.gridTemplateRows = `repeat(${n_rows}, 1fr)`;
    } else if (trial.button_layout === "flex") {
      buttonGroupElement.classList.add("jspsych-btn-group-flex");
    }

    for (const [choiceIndex, choice] of trial.choices.entries()) {
      buttonGroupElement.insertAdjacentHTML("beforeend", trial.button_html(choice, choiceIndex));
      const buttonElement = buttonGroupElement.lastChild as HTMLElement;
      buttonElement.dataset.choice = choiceIndex.toString();
      buttonElement.addEventListener("click", () => {
        after_response(choiceIndex);
      });
    }

    display_element.appendChild(buttonGroupElement);

    // Show prompt if there is one
    if (trial.prompt !== null) {
      display_element.insertAdjacentHTML("beforeend", trial.prompt);
    }

    //draw
    trial.stimulus(canvasElement);

    // start time
    var start_time = performance.now();

    // store response
    var response = {
      rt: null,
      button: null,
    };

    // function to end trial when it is time
    const end_trial = () => {
      // gather the data to store for the trial
      var trial_data = {
        rt: response.rt,
        response: response.button,
      };

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    function after_response(choice) {
      // measure rt
      var end_time = performance.now();
      var rt = Math.round(end_time - start_time);
      response.button = parseInt(choice);
      response.rt = rt;

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      stimulusElement.classList.add("responded");

      // disable all the buttons after a response
      for (const button of buttonGroupElement.children) {
        button.setAttribute("disabled", "disabled");
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    }

    // hide image if timing is set
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        stimulusElement.style.visibility = "hidden";
      }, trial.stimulus_duration);
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        end_trial();
      }, trial.trial_duration);
    }
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
    const default_data = {
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      response: this.jsPsych.randomization.randomInt(0, trial.choices.length - 1),
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
      this.jsPsych.pluginAPI.clickTarget(
        display_element.querySelector(
          `#jspsych-canvas-button-response-btngroup [data-choice="${data.response}"]`
        ),
        data.rt
      );
    }
  }
}

export default CanvasButtonResponsePlugin;
