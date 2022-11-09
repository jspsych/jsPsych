import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "canvas-slider-response",
  parameters: {
    /** The drawing function to apply to the canvas. Should take the canvas object as argument. */
    stimulus: {
      type: ParameterType.FUNCTION,
      pretty_name: "Stimulus",
      default: undefined,
    },
    /** Sets the minimum value of the slider. */
    min: {
      type: ParameterType.INT,
      pretty_name: "Min slider",
      default: 0,
    },
    /** Sets the maximum value of the slider */
    max: {
      type: ParameterType.INT,
      pretty_name: "Max slider",
      default: 100,
    },
    /** Sets the starting value of the slider */
    slider_start: {
      type: ParameterType.INT,
      pretty_name: "Slider starting value",
      default: 50,
    },
    /** Sets the step of the slider */
    step: {
      type: ParameterType.INT,
      pretty_name: "Step",
      default: 1,
    },
    /** Array containing the labels for the slider. Labels will be displayed at equidistant locations along the slider. */
    labels: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Labels",
      default: [],
      array: true,
    },
    /** Width of the slider in pixels. */
    slider_width: {
      type: ParameterType.INT,
      pretty_name: "Slider width",
      default: null,
    },
    /** Label of the button to advance. */
    button_label: {
      type: ParameterType.STRING,
      pretty_name: "Button label",
      default: "Continue",
      array: false,
    },
    /** If true, the participant will have to move the slider before continuing. */
    require_movement: {
      type: ParameterType.BOOL,
      pretty_name: "Require movement",
      default: false,
    },
    /** Any content here will be displayed below the slider */
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
    /** If true, trial will end when user makes a response. */
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
 * **canvas-slider-response**
 *
 * jsPsych plugin for displaying a canvas stimulus and getting a slider response
 *
 * @author Chris Jungerius (modified from Josh de Leeuw)
 * @see {@link https://www.jspsych.org/plugins/jspsych-canvas-slider-response/ canvas-slider-response plugin documentation on jspsych.org}
 */
class CanvasSliderResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var html = '<div id="jspsych-canvas-slider-response-wrapper" style="margin: 100px 0px;">';
    html +=
      '<div id="jspsych-canvas-slider-response-stimulus">' +
      '<canvas id="jspsych-canvas-stimulus" height="' +
      trial.canvas_size[0] +
      '" width="' +
      trial.canvas_size[1] +
      '"></canvas>' +
      "</div>";
    html +=
      '<div class="jspsych-canvas-slider-response-container" style="position:relative; margin: 0 auto 3em auto; width:';
    if (trial.slider_width !== null) {
      html += trial.slider_width + "px;";
    } else {
      html += trial.canvas_size[1] + "px;";
    }
    html += '">';
    html +=
      '<input type="range" class="jspsych-slider" value="' +
      trial.slider_start +
      '" min="' +
      trial.min +
      '" max="' +
      trial.max +
      '" step="' +
      trial.step +
      '" style="width: 100%;" id="jspsych-canvas-slider-response-response"></input>';
    html += "<div>";
    for (var j = 0; j < trial.labels.length; j++) {
      var width = 100 / (trial.labels.length - 1);
      var left_offset = j * (100 / (trial.labels.length - 1)) - width / 2;
      html +=
        '<div style="display: inline-block; position: absolute; left:' +
        left_offset +
        "%; text-align: center; width: " +
        width +
        '%;">';
      html += '<span style="text-align: center; font-size: 80%;">' + trial.labels[j] + "</span>";
      html += "</div>";
    }
    html += "</div>";
    html += "</div>";
    html += "</div>";

    if (trial.prompt !== null) {
      html += trial.prompt;
    }

    // add submit button
    html +=
      '<button id="jspsych-canvas-slider-response-next" class="jspsych-btn" ' +
      (trial.require_movement ? "disabled" : "") +
      ">" +
      trial.button_label +
      "</button>";

    display_element.innerHTML = html;

    // draw
    let c = document.getElementById("jspsych-canvas-stimulus");
    trial.stimulus(c);

    var response = {
      rt: null,
      response: null,
    };

    const end_trial = () => {
      this.jsPsych.pluginAPI.clearAllTimeouts();

      // save data
      var trialdata = {
        rt: response.rt,
        response: response.response,
        slider_start: trial.slider_start,
      };

      display_element.innerHTML = "";

      // next trial
      this.jsPsych.finishTrial(trialdata);
    };

    if (trial.require_movement) {
      const enable_button = () => {
        display_element.querySelector<HTMLInputElement>(
          "#jspsych-canvas-slider-response-next"
        ).disabled = false;
      };

      display_element
        .querySelector("#jspsych-canvas-slider-response-response")
        .addEventListener("mousedown", enable_button);

      display_element
        .querySelector("#jspsych-canvas-slider-response-response")
        .addEventListener("touchstart", enable_button);

      display_element
        .querySelector("#jspsych-canvas-slider-response-response")
        .addEventListener("change", enable_button);
    }

    display_element
      .querySelector("#jspsych-canvas-slider-response-next")
      .addEventListener("click", () => {
        // measure response time
        var endTime = performance.now();
        response.rt = Math.round(endTime - startTime);
        response.response = display_element.querySelector<HTMLInputElement>(
          "#jspsych-canvas-slider-response-response"
        ).valueAsNumber;

        if (trial.response_ends_trial) {
          end_trial();
        } else {
          display_element.querySelector<HTMLInputElement>(
            "#jspsych-canvas-slider-response-next"
          ).disabled = true;
        }
      });

    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.querySelector<HTMLElement>(
          "#jspsych-canvas-slider-response-stimulus"
        ).style.visibility = "hidden";
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
    }

    var startTime = performance.now();
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
      response: this.jsPsych.randomization.randomInt(trial.min, trial.max),
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
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
      const el = display_element.querySelector<HTMLInputElement>("input[type='range']");

      setTimeout(() => {
        this.jsPsych.pluginAPI.clickTarget(el);
        el.valueAsNumber = data.response;
      }, data.rt / 2);

      this.jsPsych.pluginAPI.clickTarget(display_element.querySelector("button"), data.rt);
    }
  }
}

export default CanvasSliderResponsePlugin;
