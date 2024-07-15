import autoBind from "auto-bind";
import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { AudioPlayerInterface } from "../../jspsych/src/modules/plugin-api/AudioPlayer";

const info = <const>{
  name: "audio-slider-response",
  parameters: {
    /** The audio file to be played. */
    stimulus: {
      type: ParameterType.AUDIO,
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
    /** Any content here will be displayed below the slider. */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
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
    /** If true, then the trial will end as soon as the audio file finishes playing. */
    trial_ends_after_audio: {
      type: ParameterType.BOOL,
      pretty_name: "Trial ends after audio",
      default: false,
    },
    /** If true, then responses are allowed while the audio is playing. If false, then the audio must finish playing before a response is accepted. */
    response_allowed_while_playing: {
      type: ParameterType.BOOL,
      pretty_name: "Response allowed while playing",
      default: true,
    },
  },
};

type Info = typeof info;

/**
 * **audio-slider-response**
 *
 * jsPsych plugin for playing audio and getting a slider response
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-audio-slider-response/ audio-slider-response plugin documentation on jspsych.org}
 */
class AudioSliderResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;
  private audio: AudioPlayerInterface;
  private context: AudioContext;
  private params: TrialType<Info>;
  private display: HTMLElement;
  private response: { rt: number; response: number } = { rt: null, response: null };
  private startTime: number;
  private half_thumb_width: number;
  private trial_complete: (trial_data: {
    rt: number;
    slider_start: number;
    response: number;
  }) => void;

  constructor(private jsPsych: JsPsych) {
    autoBind(this);
  }

  async trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void) {
    // record webaudio context start time
    this.startTime;
    this.params = trial;
    this.display = display_element;
    // for storing data related to response
    this.response;
    // half of the thumb width value from jspsych.css, used to adjust the label positions
    this.half_thumb_width = 7.5;
    // hold the .resolve() function from the Promise that ends the trial
    this.trial_complete;

    // setup stimulus
    this.context = this.jsPsych.pluginAPI.audioContext();

    // load audio file
    this.audio = await this.jsPsych.pluginAPI.getAudioPlayer(trial.stimulus);

    this.setupTrial();

    on_load();

    return new Promise((resolve) => {
      this.trial_complete = resolve;
      console.log("PROMISE");
    });
  }

  // to enable slider after audio ends
  private enable_slider() {
    document.querySelector<HTMLInputElement>("#jspsych-audio-slider-response-response").disabled =
      false;
    if (!this.params.require_movement) {
      document.querySelector<HTMLButtonElement>("#jspsych-audio-slider-response-next").disabled =
        false;
    }
  }

  private setupTrial = () => {
    console.log("SETUP TRIAL");
    // set up end event if trial needs it
    if (this.params.trial_ends_after_audio) {
      this.audio.addEventListener("ended", this.end_trial);
    }

    // enable slider after audio ends if necessary
    if (!this.params.response_allowed_while_playing && !this.params.trial_ends_after_audio) {
      this.audio.addEventListener("ended", this.enable_slider);
    }

    var html = '<div id="jspsych-audio-slider-response-wrapper" style="margin: 100px 0px;">';
    html +=
      '<div class="jspsych-audio-slider-response-container" style="position:relative; margin: 0 auto 3em auto; width:';
    if (this.params.slider_width !== null) {
      html += this.params.slider_width + "px;";
    } else {
      html += "auto;";
    }
    html += '">';
    html +=
      '<input type="range" class="jspsych-slider" value="' +
      this.params.slider_start +
      '" min="' +
      this.params.min +
      '" max="' +
      this.params.max +
      '" step="' +
      this.params.step +
      '" id="jspsych-audio-slider-response-response"';
    if (!this.params.response_allowed_while_playing) {
      html += " disabled";
    }
    html += "></input><div>";
    for (var j = 0; j < this.params.labels.length; j++) {
      var label_width_perc = 100 / (this.params.labels.length - 1);
      var percent_of_range = j * (100 / (this.params.labels.length - 1));
      var percent_dist_from_center = ((percent_of_range - 50) / 50) * 100;
      var offset = (percent_dist_from_center * this.half_thumb_width) / 100;
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
      html +=
        '<span style="text-align: center; font-size: 80%;">' + this.params.labels[j] + "</span>";
      html += "</div>";
    }
    html += "</div>";
    html += "</div>";
    html += "</div>";

    if (this.params.prompt !== null) {
      html += this.params.prompt;
    }

    // add submit button
    var next_disabled_attribute = "";
    if (this.params.require_movement || !this.params.response_allowed_while_playing) {
      next_disabled_attribute = "disabled";
    }
    html +=
      '<button id="jspsych-audio-slider-response-next" class="jspsych-btn" ' +
      next_disabled_attribute +
      ">" +
      this.params.button_label +
      "</button>";

    this.display.innerHTML = html;

    console.log("iinner", this.display.innerHTML);

    this.response = {
      rt: null,
      response: null,
    };

    if (!this.params.response_allowed_while_playing) {
      this.display.querySelector<HTMLInputElement>(
        "#jspsych-audio-slider-response-response"
      ).disabled = true;
      this.display.querySelector<HTMLInputElement>("#jspsych-audio-slider-response-next").disabled =
        true;
    }

    if (this.params.require_movement) {
      const enable_button = () => {
        this.display.querySelector<HTMLInputElement>(
          "#jspsych-audio-slider-response-next"
        ).disabled = false;
      };

      this.display
        .querySelector("#jspsych-audio-slider-response-response")
        .addEventListener("mousedown", enable_button);

      this.display
        .querySelector("#jspsych-audio-slider-response-response")
        .addEventListener("touchstart", enable_button);

      this.display
        .querySelector("#jspsych-audio-slider-response-response")
        .addEventListener("change", enable_button);
    }

    this.display
      .querySelector("#jspsych-audio-slider-response-next")
      .addEventListener("click", () => {
        // measure response time
        var endTime = performance.now();
        var rt = Math.round(endTime - this.startTime);
        if (this.context !== null) {
          endTime = this.context.currentTime;
          rt = Math.round((endTime - this.startTime) * 1000);
        }
        this.response.rt = rt;
        this.response.response = this.display.querySelector<HTMLInputElement>(
          "#jspsych-audio-slider-response-response"
        ).valueAsNumber;

        if (this.params.response_ends_trial) {
          this.end_trial();
        } else {
          this.display.querySelector<HTMLInputElement>(
            "#jspsych-audio-slider-response-next"
          ).disabled = true;
        }
      });

    this.startTime = performance.now();

    // start audio
    this.audio.play();

    // end trial if trial_duration is set
    if (this.params.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        this.end_trial();
      }, this.params.trial_duration);
    }

    console.log("END SETUP TRIAL");
  };

  private end_trial = () => {
    // kill any remaining setTimeout handlers
    this.jsPsych.pluginAPI.clearAllTimeouts();

    // stop the audio file if it is playing
    this.audio.stop();

    // remove end event listeners if they exist
    this.audio.removeEventListener("ended", this.end_trial);
    this.audio.removeEventListener("ended", this.enable_slider);

    // save data
    var trialdata = {
      rt: this.response.rt,
      stimulus: this.params.stimulus,
      slider_start: this.params.slider_start,
      response: this.response.response,
    };

    this.display.innerHTML = "";

    // next trial
    this.trial_complete(trialdata);
  };

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

    const respond = () => {
      if (data.rt !== null) {
        const el = display_element.querySelector<HTMLInputElement>("input[type='range']");

        setTimeout(() => {
          this.jsPsych.pluginAPI.clickTarget(el);
          el.valueAsNumber = data.response;
        }, data.rt / 2);

        this.jsPsych.pluginAPI.clickTarget(display_element.querySelector("button"), data.rt);
      }
    };

    this.trial(display_element, trial, () => {
      load_callback();

      if (!trial.response_allowed_while_playing) {
        this.audio.addEventListener("ended", respond);
      } else {
        respond();
      }
    });
  }
}

export default AudioSliderResponsePlugin;
