import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "canvas-button-response",
  parameters: {
    /** The drawing function to apply to the canvas. Should take the canvas object as argument. */
    stimulus: {
      type: ParameterType.FUNCTION,
      pretty_name: "Stimulus",
      default: undefined,
    },
    /** Array containing the label(s) for the button(s). */
    choices: {
      type: ParameterType.STRING,
      pretty_name: "Choices",
      default: undefined,
      array: true,
    },
    /**
     * A function that, given a choice and its index, returns the HTML string of that choice's
     * button.
     */
    button_html: {
      type: ParameterType.FUNCTION,
      pretty_name: "Button HTML",
      default: function (choice: string, choice_index: number) {
        return `<button class="jspsych-btn">${choice}</button>`;
      },
    },
    /** Any content here will be displayed under the button. */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null,
    },
    /** How long to hide the stimulus. */
    stimulus_duration: {
      type: ParameterType.INT,
      pretty_name: "Stimulus duration",
      default: null,
    },
    /** How long to show the trial. */
    trial_duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: null,
    },
    /** The CSS layout for the buttons. Options: 'flex' or 'grid'. */
    button_layout: {
      type: ParameterType.STRING,
      pretty_name: "Button layout",
      default: "grid",
    },
    /** The number of grid rows when `button_layout` is "grid".
     * Setting to `null` will infer the number of rows based on the
     * number of columns and buttons.
     */
    grid_rows: {
      type: ParameterType.INT,
      pretty_name: "Grid rows",
      default: 1,
    },
    /** The number of grid columns when `button_layout` is "grid".
     * Setting to `null` (default value) will infer the number of columns
     * based on the number of rows and buttons. */
    grid_columns: {
      type: ParameterType.INT,
      pretty_name: "Grid columns",
      default: null,
    },
    /** If true, then trial will end when user responds. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true,
    },
    /** Array containing the height (first value) and width (second value) of the canvas element. */
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
 * **canvas-button-response**
 *
 * jsPsych plugin for displaying a canvas stimulus and getting a button response
 *
 * @author Chris Jungerius (modified from Josh de Leeuw)
 * @see {@link https://www.jspsych.org/plugins/jspsych-canvas-button-response/ canvas-button-response plugin documentation on jspsych.org}
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
    stimulusElement.appendChild(canvasElement);

    display_element.appendChild(stimulusElement);

    // Display buttons
    const buttonGroupElement = document.createElement("div");
    buttonGroupElement.id = "jspsych-html-button-response-btngroup";
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
