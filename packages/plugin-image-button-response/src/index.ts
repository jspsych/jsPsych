import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "image-button-response",
  parameters: {
    /** The image to be displayed */
    stimulus: {
      type: ParameterType.IMAGE,
      pretty_name: "Stimulus",
      default: undefined,
    },
    /** Set the image height in pixels */
    stimulus_height: {
      type: ParameterType.INT,
      pretty_name: "Image height",
      default: null,
    },
    /** Set the image width in pixels */
    stimulus_width: {
      type: ParameterType.INT,
      pretty_name: "Image width",
      default: null,
    },
    /** Maintain the aspect ratio after setting width or height */
    maintain_aspect_ratio: {
      type: ParameterType.BOOL,
      pretty_name: "Maintain aspect ratio",
      default: true,
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
    /** How long to show the stimulus. */
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
    /**
     * If true, the image will be drawn onto a canvas element (prevents blank screen between consecutive images in some browsers).
     * If false, the image will be shown via an img element.
     */
    render_on_canvas: {
      type: ParameterType.BOOL,
      pretty_name: "Render on canvas",
      default: true,
    },
  },
};

type Info = typeof info;

/**
 * **image-button-response**
 *
 * jsPsych plugin for displaying an image stimulus and getting a button response
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-image-button-response/ image-button-response plugin documentation on jspsych.org}
 */
class ImageButtonResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const calculateImageDimensions = (image: HTMLImageElement): [number, number] => {
      let width: number, height: number;
      // calculate image height and width - this can only be done after image loads because it uses
      // the image's naturalWidth/naturalHeight properties
      if (trial.stimulus_height !== null) {
        height = trial.stimulus_height;
        if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
          width = image.naturalWidth * (trial.stimulus_height / image.naturalHeight);
        }
      } else {
        height = image.naturalHeight;
      }
      if (trial.stimulus_width !== null) {
        width = trial.stimulus_width;
        if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
          height = image.naturalHeight * (trial.stimulus_width / image.naturalWidth);
        }
      } else if (!(trial.stimulus_height !== null && trial.maintain_aspect_ratio)) {
        // if stimulus width is null, only use the image's natural width if the width value wasn't set
        // in the if statement above, based on a specified height and maintain_aspect_ratio = true
        width = image.naturalWidth;
      }

      return [width, height];
    };

    display_element.innerHTML = "";
    let stimulusElement: HTMLCanvasElement | HTMLImageElement;
    let canvas: HTMLCanvasElement;

    const image = trial.render_on_canvas ? new Image() : document.createElement("img");

    if (trial.render_on_canvas) {
      canvas = document.createElement("canvas");
      canvas.style.margin = "0";
      canvas.style.padding = "0";
      stimulusElement = canvas;
    } else {
      stimulusElement = image;
    }

    const drawImage = () => {
      const [width, height] = calculateImageDimensions(image);
      if (trial.render_on_canvas) {
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(image, 0, 0, width, height);
      } else {
        image.style.width = `${width}px`;
        image.style.height = `${height}px`;
      }
    };

    let hasImageBeenDrawn = false;

    // if image wasn't preloaded, then it will need to be drawn whenever it finishes loading
    image.onload = () => {
      if (!hasImageBeenDrawn) {
        drawImage();
      }
    };

    image.src = trial.stimulus;
    if (image.complete && image.naturalWidth !== 0) {
      // if image has loaded then draw it now (don't rely on img onload function to draw image
      // when image is in the cache, because that causes a delay in the image presentation)
      drawImage();
      hasImageBeenDrawn = true;
    }

    stimulusElement.id = "jspsych-image-button-response-stimulus";
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

    // start timing
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
        stimulus: trial.stimulus,
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
    } else if (trial.response_ends_trial === false) {
      console.warn(
        "The experiment may be deadlocked. Try setting a trial duration or set response_ends_trial to true."
      );
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
      stimulus: trial.stimulus,
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
          `#jspsych-image-button-response-btngroup [data-choice="${data.response}"]`
        ),
        data.rt
      );
    }
  }
}

export default ImageButtonResponsePlugin;
