import autoBind from "auto-bind";
import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { AudioPlayerInterface } from "../../jspsych/src/modules/plugin-api/AudioPlayer";
import { version } from "../package.json";

const info = <const>{
  name: "audio-slider-response",
  version: version,
  parameters: {
    /** Audio file to be played. */
    stimulus: {
      type: ParameterType.AUDIO,
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
    /** Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the
     * slider. Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the
     * other two will be at 33% and 67% of the slider width.
     */
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
    /** If true, the participant must move the slider before clicking the continue button. */
    require_movement: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is
     * that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).
     */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** How long to wait for the participant to make a response before ending the trial in milliseconds. If
     * the participant fails to make a response before this timer is reached, the participant's response will be
     * recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial
     * will wait for a response indefinitely.
     */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** If true, then the trial will end whenever the participant makes a response (assuming they make their response
     * before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the
     * value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to listen to
     * the stimulus for a fixed amount of time, even if they respond before the time is complete.
     */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** If true, then the trial will end as soon as the audio file finishes playing. */
    trial_ends_after_audio: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** If true, then responses are allowed while the audio is playing. If false, then the audio must finish playing before
     * the slider is enabled and the trial can end via the next button click. Once the audio has played all the way through,
     * the slider is enabled and a response is allowed (including while the audio is being re-played via on-screen playback controls).
     */
    response_allowed_while_playing: {
      type: ParameterType.BOOL,
      default: true,
    },
  },
  data: {
    /** The numeric value of the slider. */
    response: {
      type: ParameterType.INT,
    },
    /** The time in milliseconds for the participant to make a response. The time is measured from when the stimulus first
     * began playing until the participant's response.
     */
    rt: {
      type: ParameterType.INT,
    },
    /** The path of the audio file that was played. */
    stimulus: {
      type: ParameterType.STRING,
    },
    /** The starting value of the slider. */
    slider_start: {
      type: ParameterType.INT,
    },
  },
};

type Info = typeof info;

/**
 * This plugin plays an audio file and allows the participant to respond by dragging a slider.
 *
 * If the browser supports it, audio files are played using the WebAudio API. This allows for reasonably precise timing of the
 * playback. The timing of responses generated is measured against the WebAudio specific clock, improving the measurement of
 * response times. If the browser does not support the WebAudio API, then the audio file is played with HTML5 audio.
 *
 * Audio files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md). However, if you are using
 * timeline variables or another dynamic method to specify the audio stimulus, then you will need
 * to [manually preload](../overview/media-preloading.md#manual-preloading) the audio.
 *
 * The trial can end when the participant responds, or if the participant has failed to respond within a fixed length of time. You can also prevent the slider response from being made before the audio has finished playing.
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/audio-slider-response/ audio-slider-response plugin documentation on jspsych.org}
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

    //record start time
    this.startTime = performance.now();
    // record webaudio context start time
    if (this.context !== null) {
      this.startTime = this.context.currentTime;
    }

    // start audio
    this.audio.play();

    // end trial if trial_duration is set
    if (this.params.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        this.end_trial();
      }, this.params.trial_duration);
    }
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
