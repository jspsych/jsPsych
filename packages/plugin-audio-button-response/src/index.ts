import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "audio-button-response",
  parameters: {
    /** Path to audio file to be played. */
    stimulus: {
      type: ParameterType.AUDIO,
      pretty_name: "Stimulus",
      default: undefined,
    },

    /**
     * Labels for the buttons. Each different string in the array will generate a different button.
     */
    choices: {
      type: ParameterType.STRING,
      pretty_name: "Choices",
      default: undefined,
      array: true,
    },

    /**
     * A template of HTML for generating the button elements. You can override this to create
     * customized buttons of various kinds. The string `%choice%` will be changed to the
     * corresponding element of the `choices` array. You may also specify an array of strings, if
     * you need different HTML to render for each button. If you do specify an array, the `choices`
     * array and this array must have the same length. The HTML from position 0 in the `button_html`
     * array will be used to create the button for element 0 in the `choices` array, and so on.
     **/
    button_html: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Button HTML",
      default: '<button class="jspsych-btn">%choice%</button>',
      array: true,
    },

    /**
     * This string can contain HTML markup. Any content here will be displayed below the stimulus.
     * The intention is that it can be used to provide a reminder about the action the participant
     * is supposed to take (e.g., which key to press).
     */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null,
    },

    /**
     * How long to wait for the participant to make a response before ending the trial in
     * milliseconds. If the participant fails to make a response before this timer is reached, the
     * participant's response will be recorded as null for the trial and the trial will end. If the
     * value of this parameter is null, the trial will wait for a response indefinitely.
     */
    trial_duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: null,
    },

    /** Vertical margin of the button(s). */
    margin_vertical: {
      type: ParameterType.STRING,
      pretty_name: "Margin vertical",
      default: "0px",
    },

    /** Horizontal margin of the button(s). */
    margin_horizontal: {
      type: ParameterType.STRING,
      pretty_name: "Margin horizontal",
      default: "8px",
    },

    /**
     * If true, then the trial will end whenever the participant makes a response (assuming they
     * make their response before the cutoff specified by the `trial_duration` parameter). If false,
     * then the trial will continue until the value for `trial_duration` is reached. You can set
     * this parameter to `false` to force the participant to listen to the stimulus for a fixed
     * amount of time, even if they respond before the time is complete.
     */
    response_ends_trial: {
      type: ParameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true,
    },

    /**
     * If true, then the trial will end as soon as the audio file finishes playing.
     */
    trial_ends_after_audio: {
      type: ParameterType.BOOL,
      pretty_name: "Trial ends after audio",
      default: false,
    },

    /**
     * If true, then responses are allowed while the audio is playing. If false, then the audio must
     * finish playing before the button choices are enabled and a response is accepted. Once the
     * audio has played all the way through, the buttons are enabled and a response is allowed
     * (including while the audio is being re-played via on-screen playback controls).
     */
    response_allowed_while_playing: {
      type: ParameterType.BOOL,
      pretty_name: "Response allowed while playing",
      default: true,
    },
  },
};

type Info = typeof info;

/**
 * This plugin plays audio files and records responses generated with a button click.
 *
 * If the browser supports it, audio files are played using the WebAudio API. This allows for
 * reasonably precise timing of the playback. The timing of responses generated is measured against
 * the WebAudio specific clock, improving the measurement of response times. If the browser does not
 * support the WebAudio API, then the audio file is played with HTML5 audio.
 *
 * Audio files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md).
 * However, if you are using timeline variables or another dynamic method to specify the audio
 * stimulus, you will need to [manually preload](../overview/media-preloading.md#manual-preloading)
 * the audio.
 *
 * The trial can end when the participant responds, when the audio file has finished playing, or if
 * the participant has failed to respond within a fixed length of time. You can also prevent a
 * button response from being made before the audio has finished playing.
 *
 *
 * @author Kristin Diep
 * @see
   {@link https://www.jspsych.org/latest/plugins/jspsych-audio-button-response/}
 */
class AudioButtonResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;
  private audio;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void) {
    // hold the .resolve() function from the Promise that ends the trial
    let trial_complete;

    // setup stimulus
    var context = this.jsPsych.pluginAPI.audioContext();

    // store response
    var response = {
      rt: null,
      button: null,
    };

    // record webaudio context start time
    var startTime;

    // load audio file
    this.jsPsych.pluginAPI
      .getAudioBuffer(trial.stimulus)
      .then((buffer) => {
        if (context !== null) {
          this.audio = context.createBufferSource();
          this.audio.buffer = buffer;
          this.audio.connect(context.destination);
        } else {
          this.audio = buffer;
          this.audio.currentTime = 0;
        }
        setupTrial();
      })
      .catch((err) => {
        console.error(
          `Failed to load audio file "${trial.stimulus}". Try checking the file path. We recommend using the preload plugin to load audio files.`
        );
        console.error(err);
      });

    const setupTrial = () => {
      // set up end event if trial needs it
      if (trial.trial_ends_after_audio) {
        this.audio.addEventListener("ended", end_trial);
      }

      // enable buttons after audio ends if necessary
      if (!trial.response_allowed_while_playing && !trial.trial_ends_after_audio) {
        this.audio.addEventListener("ended", enable_buttons);
      }

      //display buttons
      var buttons = [];
      if (Array.isArray(trial.button_html)) {
        if (trial.button_html.length == trial.choices.length) {
          buttons = trial.button_html;
        } else {
          console.error(
            "Error in audio-button-response plugin. The length of the button_html array does not equal the length of the choices array"
          );
        }
      } else {
        for (var i = 0; i < trial.choices.length; i++) {
          buttons.push(trial.button_html);
        }
      }

      var html = '<div id="jspsych-audio-button-response-btngroup">';
      for (var i = 0; i < trial.choices.length; i++) {
        var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
        html +=
          '<div class="jspsych-audio-button-response-button" style="cursor: pointer; display: inline-block; margin:' +
          trial.margin_vertical +
          " " +
          trial.margin_horizontal +
          '" id="jspsych-audio-button-response-button-' +
          i +
          '" data-choice="' +
          i +
          '">' +
          str +
          "</div>";
      }
      html += "</div>";

      //show prompt if there is one
      if (trial.prompt !== null) {
        html += trial.prompt;
      }

      display_element.innerHTML = html;

      if (trial.response_allowed_while_playing) {
        enable_buttons();
      } else {
        disable_buttons();
      }

      // start time
      startTime = performance.now();

      // start audio
      if (context !== null) {
        startTime = context.currentTime;
        this.audio.start(startTime);
      } else {
        this.audio.play();
      }

      // end trial if time limit is set
      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          end_trial();
        }, trial.trial_duration);
      }

      on_load();
    };

    // function to handle responses by the subject
    function after_response(choice) {
      // measure rt
      var endTime = performance.now();
      var rt = Math.round(endTime - startTime);
      if (context !== null) {
        endTime = context.currentTime;
        rt = Math.round((endTime - startTime) * 1000);
      }
      response.button = parseInt(choice);
      response.rt = rt;

      // disable all the buttons after a response
      disable_buttons();

      if (trial.response_ends_trial) {
        end_trial();
      }
    }

    // function to end trial when it is time
    const end_trial = () => {
      // kill any remaining setTimeout handlers
      this.jsPsych.pluginAPI.clearAllTimeouts();

      // stop the audio file if it is playing
      // remove end event listeners if they exist
      if (context !== null) {
        this.audio.stop();
      } else {
        this.audio.pause();
      }

      this.audio.removeEventListener("ended", end_trial);
      this.audio.removeEventListener("ended", enable_buttons);

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

      trial_complete();
    };

    function button_response(e) {
      var choice = e.currentTarget.getAttribute("data-choice"); // don't use dataset for jsdom compatibility
      after_response(choice);
    }

    function disable_buttons() {
      var btns = document.querySelectorAll(".jspsych-audio-button-response-button");
      for (var i = 0; i < btns.length; i++) {
        var btn_el = btns[i].querySelector("button");
        if (btn_el) {
          btn_el.disabled = true;
        }
        btns[i].removeEventListener("click", button_response);
      }
    }

    function enable_buttons() {
      var btns = document.querySelectorAll(".jspsych-audio-button-response-button");
      for (var i = 0; i < btns.length; i++) {
        var btn_el = btns[i].querySelector("button");
        if (btn_el) {
          btn_el.disabled = false;
        }
        btns[i].addEventListener("click", button_response);
      }
    }

    return new Promise((resolve) => {
      trial_complete = resolve;
    });
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

    const respond = () => {
      if (data.rt !== null) {
        this.jsPsych.pluginAPI.clickTarget(
          display_element.querySelector(`div[data-choice="${data.response}"] button`),
          data.rt
        );
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

export default AudioButtonResponsePlugin;
