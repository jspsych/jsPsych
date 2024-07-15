import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "image-button-response",
  version: version,
  parameters: {
    /** The path of the image file to be displayed. */
    stimulus: {
      type: ParameterType.IMAGE,
      default: undefined,
    },
    /** Set the height of the image in pixels. If left null (no value specified), then the image will display at its natural height. */
    stimulus_height: {
      type: ParameterType.INT,
      default: null,
    },
    /** Set the width of the image in pixels. If left null (no value specified), then the image will display at its natural width. */
    stimulus_width: {
      type: ParameterType.INT,
      default: null,
    },
    /** If setting *only* the width or *only* the height and this parameter is true, then the other dimension will be
     * scaled to maintain the image's aspect ratio.  */
    maintain_aspect_ratio: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** Labels for the buttons. Each different string in the array will generate a different button. */
    choices: {
      type: ParameterType.STRING,
      default: undefined,
      array: true,
    },
    /**
     * ``(choice: string, choice_index: number)=>`<button class="jspsych-btn">${choice}</button>``; | A function that
     * generates the HTML for each button in the `choices` array. The function gets the string and index of the item in
     * the `choices` array and should return valid HTML. If you want to use different markup for each button, you can do
     * that by using a conditional on either parameter. The default parameter returns a button element with the text
     * label of the choice.
     */
    button_html: {
      type: ParameterType.FUNCTION,
      default: function (choice: string, choice_index: number) {
        return `<button class="jspsych-btn">${choice}</button>`;
      },
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that
     * it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** How long to show the stimulus for in milliseconds. If the value is null, then the stimulus will be shown until
     * the participant makes a response. */
    stimulus_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant
     * fails to make a response before this timer is reached, the participant's response will be recorded as null for the
     * trial and the trial will end. If the value of this parameter is null, the trial will wait for a response indefinitely. */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** Setting to `'grid'` will make the container element have the CSS property `display: grid` and enable the use of
     * `grid_rows` and `grid_columns`. Setting to `'flex'` will make the container element have the CSS property
     * `display: flex`. You can customize how the buttons are laid out by adding inline CSS in the `button_html` parameter.  */
    button_layout: {
      type: ParameterType.STRING,
      default: "grid",
    },
    /**
     * The number of rows in the button grid. Only applicable when `button_layout` is set to `'grid'`. If null, the
     *  number of rows will be determined automatically based on the number of buttons and the number of columns.
     */
    grid_rows: {
      type: ParameterType.INT,
      default: 1,
    },
    /**
     * The number of columns in the button grid. Only applicable when `button_layout` is set to `'grid'`. If null, the
     * number of columns will be determined automatically based on the number of buttons and the number of rows.
     */
    grid_columns: {
      type: ParameterType.INT,
      default: null,
    },
    /** If true, then the trial will end whenever the participant makes a response (assuming they make their response
     * before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until
     * the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to
     * view a stimulus for a fixed amount of time, even if they respond before the time is complete. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * If true, the image will be drawn onto a canvas element. This prevents a blank screen (white flash) between consecutive image trials in some browsers, like Firefox and Edge.
     * If false, the image will be shown via an img element, as in previous versions of jsPsych. If the stimulus is an **animated gif**, you must set this parameter to false, because the canvas rendering method will only present static images.
     */
    render_on_canvas: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** How long the button will delay enabling in milliseconds. */
    enable_button_after: {
      type: ParameterType.INT,
      default: 0,
    },
  },
  data: {
    /** The path of the image that was displayed. */
    stimulus: {
      type: ParameterType.STRING,
    },
    /** Indicates which button the participant pressed. The first button in the `choices` array is 0, the second is 1, and so on.  */
    response: {
      type: ParameterType.INT,
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
    rt: {
      type: ParameterType.INT,
    },
  },
};

type Info = typeof info;

/**
 * This plugin displays an image and records responses generated with a button click. The stimulus can be displayed until
 * a response is given, or for a pre-determined amount of time. The trial can be ended automatically if the participant
 * has failed to respond within a fixed length of time. The button itself can be customized using HTML formatting.
 *
 * Image files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md). However, if you
 * are using timeline variables or another dynamic method to specify the image stimulus, you will need to
 * [manually preload](../overview/media-preloading.md#manual-preloading) the images.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/image-button-response/ image-button-response plugin documentation on jspsych.org}
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
    buttonGroupElement.id = "jspsych-image-button-response-btngroup";
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
      // gather the data to store for the trial
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
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

    function enable_buttons() {
      var btns = document.querySelectorAll(".jspsych-image-button-response-button button");
      for (var i = 0; i < btns.length; i++) {
        btns[i].removeAttribute("disabled");
      }
    }

    function disable_buttons() {
      var btns = document.querySelectorAll(".jspsych-image-button-response-button button");
      for (var i = 0; i < btns.length; i++) {
        btns[i].setAttribute("disabled", "disabled");
      }
    }

    // set timer of button delay
    if (trial.enable_button_after > 0) {
      disable_buttons();
      this.jsPsych.pluginAPI.setTimeout(() => {
        enable_buttons();
      }, trial.enable_button_after);
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
      rt:
        this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true) +
        trial.enable_button_after,
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
