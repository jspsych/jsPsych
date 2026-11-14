import { ParameterType } from 'jspsych';

var version = "2.2.0";

const info = {
  name: "image-button-response",
  version,
  parameters: {
    /** The path of the image file to be displayed. */
    stimulus: {
      type: ParameterType.IMAGE,
      default: void 0
    },
    /** Set the height of the image in pixels. If left null (no value specified), then the image will display at its natural height. */
    stimulus_height: {
      type: ParameterType.INT,
      default: null
    },
    /** Set the width of the image in pixels. If left null (no value specified), then the image will display at its natural width. */
    stimulus_width: {
      type: ParameterType.INT,
      default: null
    },
    /** If setting *only* the width or *only* the height and this parameter is true, then the other dimension will be
     * scaled to maintain the image's aspect ratio.  */
    maintain_aspect_ratio: {
      type: ParameterType.BOOL,
      default: true
    },
    /** Labels for the buttons. Each different string in the array will generate a different button. */
    choices: {
      type: ParameterType.STRING,
      default: void 0,
      array: true
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
      default: function(choice, choice_index) {
        return `<button class="jspsych-btn">${choice}</button>`;
      }
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that
     * it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null
    },
    /** How long to show the stimulus for in milliseconds. If the value is null, then the stimulus will be shown until
     * the participant makes a response. */
    stimulus_duration: {
      type: ParameterType.INT,
      default: null
    },
    /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant
     * fails to make a response before this timer is reached, the participant's response will be recorded as null for the
     * trial and the trial will end. If the value of this parameter is null, the trial will wait for a response indefinitely. */
    trial_duration: {
      type: ParameterType.INT,
      default: null
    },
    /** Setting to `'grid'` will make the container element have the CSS property `display: grid` and enable the use of
     * `grid_rows` and `grid_columns`. Setting to `'flex'` will make the container element have the CSS property
     * `display: flex`. You can customize how the buttons are laid out by adding inline CSS in the `button_html` parameter.  */
    button_layout: {
      type: ParameterType.STRING,
      default: "grid"
    },
    /**
     * The number of rows in the button grid. Only applicable when `button_layout` is set to `'grid'`. If null, the
     *  number of rows will be determined automatically based on the number of buttons and the number of columns.
     */
    grid_rows: {
      type: ParameterType.INT,
      default: 1
    },
    /**
     * The number of columns in the button grid. Only applicable when `button_layout` is set to `'grid'`. If null, the
     * number of columns will be determined automatically based on the number of buttons and the number of rows.
     */
    grid_columns: {
      type: ParameterType.INT,
      default: null
    },
    /** If true, then the trial will end whenever the participant makes a response (assuming they make their response
     * before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until
     * the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to
     * view a stimulus for a fixed amount of time, even if they respond before the time is complete. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: true
    },
    /**
     * If true, the image will be drawn onto a canvas element. This prevents a blank screen (white flash) between consecutive image trials in some browsers, like Firefox and Edge.
     * If false, the image will be shown via an img element, as in previous versions of jsPsych. If the stimulus is an **animated gif**, you must set this parameter to false, because the canvas rendering method will only present static images.
     */
    render_on_canvas: {
      type: ParameterType.BOOL,
      default: true
    },
    /** How long the button will delay enabling in milliseconds. */
    enable_button_after: {
      type: ParameterType.INT,
      default: 0
    }
  },
  data: {
    /** The path of the image that was displayed. */
    stimulus: {
      type: ParameterType.STRING
    },
    /** Indicates which button the participant pressed. The first button in the `choices` array is 0, the second is 1, and so on.  */
    response: {
      type: ParameterType.INT
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
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
class ImageButtonResponsePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    const calculateImageDimensions = (image2) => {
      let width, height;
      if (trial.stimulus_height !== null) {
        height = trial.stimulus_height;
        if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
          width = image2.naturalWidth * (trial.stimulus_height / image2.naturalHeight);
        }
      } else {
        height = image2.naturalHeight;
      }
      if (trial.stimulus_width !== null) {
        width = trial.stimulus_width;
        if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
          height = image2.naturalHeight * (trial.stimulus_width / image2.naturalWidth);
        }
      } else if (!(trial.stimulus_height !== null && trial.maintain_aspect_ratio)) {
        width = image2.naturalWidth;
      }
      return [width, height];
    };
    display_element.innerHTML = "";
    let stimulusElement;
    let canvas;
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
    image.onload = () => {
      if (!hasImageBeenDrawn) {
        drawImage();
      }
    };
    image.src = trial.stimulus;
    if (image.complete && image.naturalWidth !== 0) {
      drawImage();
      hasImageBeenDrawn = true;
    }
    stimulusElement.id = "jspsych-image-button-response-stimulus";
    display_element.appendChild(stimulusElement);
    const buttonGroupElement = document.createElement("div");
    buttonGroupElement.id = "jspsych-image-button-response-btngroup";
    if (trial.button_layout === "grid") {
      buttonGroupElement.classList.add("jspsych-btn-group-grid");
      if (trial.grid_rows === null && trial.grid_columns === null) {
        throw new Error(
          "You cannot set `grid_rows` to `null` without providing a value for `grid_columns`."
        );
      }
      const n_cols = trial.grid_columns === null ? Math.ceil(trial.choices.length / trial.grid_rows) : trial.grid_columns;
      const n_rows = trial.grid_rows === null ? Math.ceil(trial.choices.length / trial.grid_columns) : trial.grid_rows;
      buttonGroupElement.style.gridTemplateColumns = `repeat(${n_cols}, 1fr)`;
      buttonGroupElement.style.gridTemplateRows = `repeat(${n_rows}, 1fr)`;
    } else if (trial.button_layout === "flex") {
      buttonGroupElement.classList.add("jspsych-btn-group-flex");
    }
    for (const [choiceIndex, choice] of trial.choices.entries()) {
      buttonGroupElement.insertAdjacentHTML("beforeend", trial.button_html(choice, choiceIndex));
      const buttonElement = buttonGroupElement.lastChild;
      buttonElement.dataset.choice = choiceIndex.toString();
      buttonElement.addEventListener("click", () => {
        after_response(choiceIndex);
      });
    }
    display_element.appendChild(buttonGroupElement);
    if (trial.prompt !== null) {
      display_element.insertAdjacentHTML("beforeend", trial.prompt);
    }
    var start_time = performance.now();
    var response = {
      rt: null,
      button: null
    };
    const end_trial = () => {
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        response: response.button
      };
      this.jsPsych.finishTrial(trial_data);
    };
    function after_response(choice) {
      var end_time = performance.now();
      var rt = Math.round(end_time - start_time);
      response.button = parseInt(choice);
      response.rt = rt;
      stimulusElement.classList.add("responded");
      for (const button of buttonGroupElement.children) {
        button.setAttribute("disabled", "disabled");
      }
      if (trial.response_ends_trial) {
        end_trial();
      }
    }
    function enable_buttons() {
      var btns = document.querySelectorAll("#jspsych-image-button-response-btngroup button");
      for (var i = 0; i < btns.length; i++) {
        btns[i].removeAttribute("disabled");
      }
    }
    function disable_buttons() {
      var btns = document.querySelectorAll("#jspsych-image-button-response-btngroup button");
      for (var i = 0; i < btns.length; i++) {
        btns[i].setAttribute("disabled", "disabled");
      }
    }
    if (trial.enable_button_after > 0) {
      disable_buttons();
      this.jsPsych.pluginAPI.setTimeout(() => {
        enable_buttons();
      }, trial.enable_button_after);
    }
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        stimulusElement.style.visibility = "hidden";
      }, trial.stimulus_duration);
    }
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
    const default_data = {
      stimulus: trial.stimulus,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true) + trial.enable_button_after,
      response: this.jsPsych.randomization.randomInt(0, trial.choices.length - 1)
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
      this.jsPsych.pluginAPI.clickTarget(
        display_element.querySelector(
          `#jspsych-image-button-response-btngroup [data-choice="${data.response}"]`
        ),
        data.rt
      );
    }
  }
}

export { ImageButtonResponsePlugin as default };
//# sourceMappingURL=index.js.map
