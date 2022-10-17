import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "html-slider-response",
  parameters: {
    /** The HTML string to be displayed */
    stimulus: {
      type: ParameterType.HTML_STRING,
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
    /** If true, allows the participant to use the keyboard to adjust or pan the slider, and to use the enter key to submit a response. */
    enable_keys: {
      type: ParameterType.BOOL,
      pretty_name: "Enable keys",
      default: false,
    },
    /** The keys that the participant can use to adjust the slider by one step. */
    keys_adjust: {
      type: ParameterType.KEYS,
      pretty_name: "Keys adjust",
      default: ['ArrowLeft', 'ArrowRight'],
    },
    /** The keys that the participant can use to pan the slider. Each key's corresponding value is evenly spaced from one another, with the first value and last value being at `min` and `max` respectively. */
    keys_panning: {
      type: ParameterType.KEYS,
      pretty_name: "Keys panning",
      default: ['1', '2', '3', '4', '5'],
    },
    /** Any content here will be displayed below the slider. */
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
  },
};

type Info = typeof info;

/**
 * **html-slider-response**
 *
 * jsPsych plugin for showing an HTML stimulus and collecting a slider response
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-html-slider-response/ html-slider-response plugin documentation on jspsych.org}
 */
class HtmlSliderResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) { }

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    /** Half of the thumb width value from jspsych.css, used to adjust the label positions */
    var half_thumb_width = 7.5;

    var response = {
      rt: null,
      response: null,
    };

    var html = '<div id="jspsych-html-slider-response-wrapper" style="margin: 100px 0px;">';
    html += '<div id="jspsych-html-slider-response-stimulus">' + trial.stimulus + "</div>";
    html +=
      '<div class="jspsych-html-slider-response-container" style="position:relative; margin: 0 auto 3em auto; ';
    if (trial.slider_width !== null) {
      html += "width:" + trial.slider_width + "px;";
    } else {
      html += "width:auto;";
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
      '" id="jspsych-html-slider-response-response"></input>';
    html += "<div>";
    for (var j = 0; j < trial.labels.length; j++) {
      var label_width_perc = 100 / (trial.labels.length - 1);
      var percent_of_range = j * (100 / (trial.labels.length - 1));
      var percent_dist_from_center = ((percent_of_range - 50) / 50) * 100;
      var offset = (percent_dist_from_center * half_thumb_width) / 100;
      html +=
        '<div style="border: 1px solid transparent; display: inline-block; position: absolute; ' +
        "left:calc(" +
        percent_of_range +
        "% - (" +
        label_width_perc +
        "% / 2) - " +
        offset +
        "px); text-align: center; width: " +
        label_width_perc +
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
      '<button id="jspsych-html-slider-response-next" class="jspsych-btn" ' +
      (trial.require_movement ? "disabled" : "") +
      ">" +
      trial.button_label +
      "</button>";

    display_element.innerHTML = html;

    const changeValue = (e: KeyboardEvent) => {
      let input = display_element.querySelector<HTMLInputElement>("#jspsych-html-slider-response-response");
      switch (e.key) {
        case trial.keys_adjust[0]:
          input.stepDown();
          return;
        case trial.keys_adjust[1]:
          input.stepUp();
          return;
      }
      if (trial.keys_panning.includes(e.key)) {
        const panConst = (trial.max - trial.min) / (trial.keys_panning.length - 1);
        input.value = String(trial.min + panConst * trial.keys_panning.indexOf(e.key));
      }
    }

    if (trial.enable_keys) {
      document.body.addEventListener("keydown", changeValue);
    }

    const enable_button = () => {
      display_element.querySelector<HTMLInputElement>(
        "#jspsych-html-slider-response-next"
      ).disabled = false;
    };

    const key_enable_button = (e: KeyboardEvent) => {
      if (trial.keys_adjust.includes(e.key) || trial.keys_panning.includes(e.key)) {
        enable_button();
      }
    }

    if (trial.require_movement) {
      ['mousedown', 'touchstart', 'change'].forEach((type) => {
        display_element.addEventListener(type, enable_button);
      });

      // prevent unnecessary events from being formed
      if (trial.enable_keys) {
        document.body.addEventListener("keydown", key_enable_button);
      }
    }

    const end_trial = () => {
      this.jsPsych.pluginAPI.clearAllTimeouts();

      // save data
      var trialdata = {
        rt: response.rt,
        stimulus: trial.stimulus,
        slider_start: trial.slider_start,
        response: response.response,
      };

      if (trial.enable_keys) {
        document.body.removeEventListener("keydown", changeValue);
        document.body.removeEventListener("keydown", key_enable_button);
      }
      display_element.innerHTML = "";

      // next trial
      this.jsPsych.finishTrial(trialdata);
    };

    const gatherData = () => {
      // measure response time
      var endTime = performance.now();
      response.rt = Math.round(endTime - startTime);
      response.response = display_element.querySelector<HTMLInputElement>(
        "#jspsych-html-slider-response-response"
      ).valueAsNumber;

      if (trial.response_ends_trial) {
        end_trial();
      } else {
        display_element.querySelector<HTMLButtonElement>(
          "#jspsych-html-slider-response-next"
        ).disabled = true;
      }
    }

    display_element
      .querySelector("#jspsych-html-slider-response-next")
      .addEventListener("click", gatherData);

    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.querySelector<HTMLElement>(
          "#jspsych-html-slider-response-stimulus"
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
      stimulus: trial.stimulus,
      slider_start: trial.slider_start,
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

export default HtmlSliderResponsePlugin;
