import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "canvas-slider-response",
  version: version,
  parameters: {
    /** The function to draw on the canvas. This function automatically takes a canvas element as its only argument, e.g. `function(c) {...}` or `function drawStim(c) {...}`, where `c` refers to the canvas element. Note that the stimulus function will still generally need to set the correct context itself, using a line like `let ctx = c.getContext("2d")`. */
    stimulus: {
      type: ParameterType.FUNCTION,
      default: undefined,
    },
    /** Sets the minimum value of the slider. */
    min: {
      type: ParameterType.INT,
      default: 0,
    },
    /** Sets the maximum value of the slider */
    max: {
      type: ParameterType.INT,
      default: 100,
    },
    /** Sets the starting value of the slider */
    slider_start: {
      type: ParameterType.INT,
      default: 50,
    },
    /** Sets the step of the slider. This is the smallest amount by which the slider can change. */
    step: {
      type: ParameterType.INT,
      default: 1,
    },
    /** Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the other two will be at 33% and 67% of the slider width. */
    labels: {
      type: ParameterType.HTML_STRING,
      default: [],
      array: true,
    },
    /** Set the width of the slider in pixels. If left null, then the width will be equal to the widest element in the display. */
    slider_width: {
      type: ParameterType.INT,
      default: null,
    },
    /** Label of the button to end the trial. */
    button_label: {
      type: ParameterType.STRING,
      default: "Continue",
      array: false,
    },
    /** If true, the participant must click the slider before clicking the continue button. */
    require_movement: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., what question to answer). */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends. */
    stimulus_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely. */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can use this parameter to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete.  */
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
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
    rt: {
      type: ParameterType.INT,
    },
    /** Indicates which key the participant pressed. */
    response: {
      type: ParameterType.STRING,
    },
  },
};

type Info = typeof info;

/**
 * This plugin can be used to draw a stimulus on a [HTML canvas element](https://www.w3schools.com/html/html5_canvas.asp) and collect a response within a range of values, which is made by dragging a slider. The canvas stimulus can be useful for displaying dynamic, parametrically-defined graphics, and for controlling the positioning of multiple graphical elements (shapes, text, images). The stimulus can be displayed until a response is given, or for a pre-determined amount of time. The trial can be ended automatically if the participant has failed to respond within a fixed length of time.
 *
 * @author Chris Jungerius (modified from Josh de Leeuw)
 * @see {@link https://www.jspsych.org/latest/plugins/canvas-slider-response/ canvas-slider-response plugin documentation on jspsych.org}
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
    c.style.display = "block";
    trial.stimulus(c);

    var response = {
      rt: null,
      response: null,
    };

    const end_trial = () => {
      // save data
      var trialdata = {
        rt: response.rt,
        response: response.response,
        slider_start: trial.slider_start,
      };

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
