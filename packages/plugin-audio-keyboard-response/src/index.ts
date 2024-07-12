import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "audio-keyboard-response",
  version: version,
  parameters: {
    /** The audio file to be played. */
    stimulus: {
      type: ParameterType.AUDIO,
      default: undefined,
    },
    /** This array contains the key(s) that the participant is allowed to press in order to respond to the stimulus.
     * Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) -
     * see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)
     * and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/)
     * for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"`
     * means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed.
     */
    choices: {
      type: ParameterType.KEYS,
      default: "ALL_KEYS",
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that
     * it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).
     */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null,
    },
    /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the
     * participant fails to make a response before this timer is reached, the participant's response will be
     * recorded as null for the trial and the trial will end. If the value of this parameter is null, then the
     * trial will wait for a response indefinitely.
     */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** If true, then the trial will end whenever the participant makes a response (assuming they make their
     * response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will
     * continue until the value for `trial_duration` is reached. You can use set this parameter to `false` to
     * force the participant to listen to the stimulus for a fixed amount of time, even if they respond before the time is complete
     */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** If true, then the trial will end as soon as the audio file finishes playing. */
    trial_ends_after_audio: {
      type: ParameterType.BOOL,
      pretty_name: "Trial ends after audio",
      default: false,
    },
    /** If true, then responses are allowed while the audio is playing. If false, then the audio must finish
     * playing before a keyboard response is accepted. Once the audio has played all the way through, a valid
     * keyboard response is allowed (including while the audio is being re-played via on-screen playback controls).
     */
    response_allowed_while_playing: {
      type: ParameterType.BOOL,
      default: true,
    },
  },
  data: {
    /** Indicates which key the participant pressed. If no key was pressed before the trial ended, then the value will be `null`. */
    response: {
      type: ParameterType.STRING,
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus
     * first began playing until the participant made a key response. If no key was pressed before the trial ended, then the
     * value will be `null`.
     */
    rt: {
      type: ParameterType.INT,
    },
    /** Path to the audio file that played during the trial. */
    stimulus: {
      type: ParameterType.STRING,
    },
  },
};

type Info = typeof info;

/**
 * This plugin plays audio files and records responses generated with the keyboard.
 *
 * If the browser supports it, audio files are played using the WebAudio API. This allows for reasonably precise timing of the
 * playback. The timing of responses generated is measured against the WebAudio specific clock, improving the measurement of
 * response times. If the browser does not support the WebAudio API, then the audio file is played with HTML5 audio.
 *
 * Audio files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md). However, if you are using
 * timeline variables or another dynamic method to specify the audio stimulus, then you will need to [manually preload](../overview/media-preloading.md#manual-preloading) the audio.
 *
 * The trial can end when the participant responds, when the audio file has finished playing, or if the participant has
 * failed to respond within a fixed length of time. You can also prevent a keyboard response from being recorded before
 * the audio has finished playing.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/audio-keyboard-response/ audio-keyboard-response plugin documentation on jspsych.org}
 */
class AudioKeyboardResponsePlugin implements JsPsychPlugin<Info> {
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
      key: null,
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

      // show prompt if there is one
      if (trial.prompt !== null) {
        display_element.innerHTML = trial.prompt;
      }

      // start audio
      if (context !== null) {
        startTime = context.currentTime;
        this.audio.start(startTime);
      } else {
        this.audio.play();
      }

      // start keyboard listener when trial starts or sound ends
      if (trial.response_allowed_while_playing) {
        setup_keyboard_listener();
      } else if (!trial.trial_ends_after_audio) {
        this.audio.addEventListener("ended", setup_keyboard_listener);
      }

      // end trial if time limit is set
      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          end_trial();
        }, trial.trial_duration);
      }

      on_load();
    };

    // function to end trial when it is time
    const end_trial = () => {
      // stop the audio file if it is playing
      // remove end event listeners if they exist
      if (context !== null) {
        this.audio.stop();
      } else {
        this.audio.pause();
      }

      this.audio.removeEventListener("ended", end_trial);
      this.audio.removeEventListener("ended", setup_keyboard_listener);

      // kill keyboard listeners
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();

      // gather the data to store for the trial
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        response: response.key,
      };

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);

      trial_complete();
    };

    // function to handle responses by the subject
    function after_response(info) {
      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    }

    const setup_keyboard_listener = () => {
      // start the response listener
      if (context !== null) {
        this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: "audio",
          persist: false,
          allow_held_key: false,
          audio_context: context,
          audio_context_start_time: startTime,
        });
      } else {
        this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: "performance",
          persist: false,
          allow_held_key: false,
        });
      }
    };

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

  private simulate_data_only(trial: TrialType<Info>, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);

    this.jsPsych.finishTrial(data);
  }

  private simulate_visual(trial: TrialType<Info>, simulation_options, load_callback: () => void) {
    const data = this.create_simulation_data(trial, simulation_options);

    const display_element = this.jsPsych.getDisplayElement();

    const respond = () => {
      if (data.rt !== null) {
        this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
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

  private create_simulation_data(trial: TrialType<Info>, simulation_options) {
    const default_data = {
      stimulus: trial.stimulus,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      response: this.jsPsych.pluginAPI.getValidKey(trial.choices),
    };

    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);

    this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);

    return data;
  }
}

export default AudioKeyboardResponsePlugin;
