import autoBind from "auto-bind";
import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { AudioPlayerInterface } from "../../jspsych/src/modules/plugin-api/AudioPlayer";

const info = <const>{
  name: "audio-keyboard-response",
  parameters: {
    /** The audio file to be played. */
    stimulus: {
      type: ParameterType.AUDIO,
      pretty_name: "Stimulus",
      default: undefined,
    },
    /** Array containing the key(s) the subject is allowed to press to respond to the stimulus. */
    choices: {
      type: ParameterType.KEYS,
      pretty_name: "Choices",
      default: "ALL_KEYS",
    },
    /** Any content here will be displayed below the stimulus. */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null,
    },
    /** The maximum duration to wait for a response. */
    trial_duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: null,
    },
    /** If true, the trial will end when user makes a response. */
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
 * **audio-keyboard-response**
 *
 * jsPsych plugin for playing an audio file and getting a keyboard response
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-audio-keyboard-response/ audio-keyboard-response plugin documentation on jspsych.org}
 */
class AudioKeyboardResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;
  private audio: AudioPlayerInterface;
  private params: TrialType<Info>;
  private display: HTMLElement;
  private response: { rt: number; key: string } = { rt: null, key: null };
  private startTime: number;
  private finish: ({}: { rt: number; response: string; stimulus: string }) => void;

  constructor(private jsPsych: JsPsych) {
    autoBind(this);
  }

  trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void) {
    return new Promise(async (resolve) => {
      this.finish = resolve;
      this.params = trial;
      this.display = display_element;
      // load audio file
      this.audio = await this.jsPsych.pluginAPI.getAudioPlayer(trial.stimulus);

      // set up end event if trial needs it
      if (trial.trial_ends_after_audio) {
        this.audio.addEventListener("ended", this.end_trial);
      }

      // show prompt if there is one
      if (trial.prompt !== null) {
        display_element.innerHTML = trial.prompt;
      }

      // start playing audio here to record time
      // use this for offsetting RT measurement in
      // setup_keyboard_listener
      this.startTime = this.jsPsych.pluginAPI.audioContext()?.currentTime;

      // start keyboard listener when trial starts or sound ends
      if (trial.response_allowed_while_playing) {
        this.setup_keyboard_listener();
      } else if (!trial.trial_ends_after_audio) {
        this.audio.addEventListener("ended", this.setup_keyboard_listener);
      }

      // end trial if time limit is set
      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          this.end_trial();
        }, trial.trial_duration);
      }

      // call trial on_load method because we are done with all loading setup
      on_load();

      this.audio.play();
    });
  }

  private end_trial() {
    // kill any remaining setTimeout handlers
    this.jsPsych.pluginAPI.clearAllTimeouts();

    // stop the audio file if it is playing
    this.audio.stop();

    // remove end event listeners if they exist
    this.audio.removeEventListener("ended", this.end_trial);
    this.audio.removeEventListener("ended", this.setup_keyboard_listener);

    // kill keyboard listeners
    this.jsPsych.pluginAPI.cancelAllKeyboardResponses();

    // gather the data to store for the trial
    var trial_data = {
      rt: this.response.rt,
      response: this.response.key,
      stimulus: this.params.stimulus,
    };

    // clear the display
    this.display.innerHTML = "";

    // move on to the next trial
    this.finish(trial_data);
  }

  private after_response(info: { key: string; rt: number }) {
    this.response = info;
    if (this.params.response_ends_trial) {
      this.end_trial();
    }
  }

  private setup_keyboard_listener() {
    // start the response listener
    if (this.jsPsych.pluginAPI.useWebaudio) {
      this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: this.after_response,
        valid_responses: this.params.choices,
        rt_method: "audio",
        persist: false,
        allow_held_key: false,
        audio_context: this.jsPsych.pluginAPI.audioContext(),
        audio_context_start_time: this.startTime,
      });
    } else {
      this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: this.after_response,
        valid_responses: this.params.choices,
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
    }
  }

  async simulate(
    trial: TrialType<Info>,
    simulation_mode,
    simulation_options: any,
    load_callback: () => void
  ) {
    if (simulation_mode == "data-only") {
      load_callback();
      return this.simulate_data_only(trial, simulation_options);
    }
    if (simulation_mode == "visual") {
      return this.simulate_visual(trial, simulation_options, load_callback);
    }
  }

  private simulate_data_only(trial: TrialType<Info>, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);

    return data;
  }

  private async simulate_visual(
    trial: TrialType<Info>,
    simulation_options,
    load_callback: () => void
  ) {
    const data = this.create_simulation_data(trial, simulation_options);

    const display_element = this.jsPsych.getDisplayElement();

    const respond = () => {
      if (data.rt !== null) {
        this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
      }
    };

    const result = await this.trial(display_element, trial, () => {
      load_callback();
      if (!trial.response_allowed_while_playing) {
        this.audio.addEventListener("ended", respond);
      } else {
        respond();
      }
    });

    return result;
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
