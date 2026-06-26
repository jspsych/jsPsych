import autoBind from 'auto-bind';
import { ParameterType } from 'jspsych';

var version = "2.1.1";

const info = {
  name: "audio-keyboard-response",
  version,
  parameters: {
    /** The audio file to be played. */
    stimulus: {
      type: ParameterType.AUDIO,
      default: void 0
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
      default: "ALL_KEYS"
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that
     * it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).
     */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null
    },
    /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the
     * participant fails to make a response before this timer is reached, the participant's response will be
     * recorded as null for the trial and the trial will end. If the value of this parameter is null, then the
     * trial will wait for a response indefinitely.
     */
    trial_duration: {
      type: ParameterType.INT,
      default: null
    },
    /** If true, then the trial will end whenever the participant makes a response (assuming they make their
     * response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will
     * continue until the value for `trial_duration` is reached. You can use set this parameter to `false` to
     * force the participant to listen to the stimulus for a fixed amount of time, even if they respond before the time is complete
     */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: true
    },
    /** If true, then the trial will end as soon as the audio file finishes playing. */
    trial_ends_after_audio: {
      type: ParameterType.BOOL,
      pretty_name: "Trial ends after audio",
      default: false
    },
    /** If true, then responses are allowed while the audio is playing. If false, then the audio must finish
     * playing before a keyboard response is accepted. Once the audio has played all the way through, a valid
     * keyboard response is allowed (including while the audio is being re-played via on-screen playback controls).
     */
    response_allowed_while_playing: {
      type: ParameterType.BOOL,
      default: true
    }
  },
  data: {
    /** Indicates which key the participant pressed. If no key was pressed before the trial ended, then the value will be `null`. */
    response: {
      type: ParameterType.STRING
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus
     * first began playing until the participant made a key response. If no key was pressed before the trial ended, then the
     * value will be `null`.
     */
    rt: {
      type: ParameterType.INT
    },
    /** Path to the audio file that played during the trial. */
    stimulus: {
      type: ParameterType.STRING
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class AudioKeyboardResponsePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
    this.response = { rt: null, key: null };
    autoBind(this);
  }
  static {
    this.info = info;
  }
  trial(display_element, trial, on_load) {
    return new Promise(async (resolve) => {
      this.finish = resolve;
      this.params = trial;
      this.display = display_element;
      this.audio = await this.jsPsych.pluginAPI.getAudioPlayer(trial.stimulus);
      if (trial.trial_ends_after_audio) {
        this.audio.addEventListener("ended", this.end_trial);
      }
      if (trial.prompt !== null) {
        display_element.innerHTML = trial.prompt;
      }
      this.startTime = this.jsPsych.pluginAPI.audioContext()?.currentTime;
      if (trial.response_allowed_while_playing) {
        this.setup_keyboard_listener();
      } else if (!trial.trial_ends_after_audio) {
        this.audio.addEventListener("ended", this.setup_keyboard_listener);
      }
      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          this.end_trial();
        }, trial.trial_duration);
      }
      on_load();
      this.audio.play();
    });
  }
  end_trial() {
    this.jsPsych.pluginAPI.clearAllTimeouts();
    this.audio.removeEventListener("ended", this.end_trial);
    this.audio.removeEventListener("ended", this.setup_keyboard_listener);
    this.audio.stop();
    this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
    var trial_data = {
      rt: this.response.rt,
      response: this.response.key,
      stimulus: this.params.stimulus
    };
    this.display.innerHTML = "";
    this.finish(trial_data);
  }
  after_response(info2) {
    this.response = info2;
    if (this.params.response_ends_trial) {
      this.end_trial();
    }
  }
  setup_keyboard_listener() {
    if (this.jsPsych.pluginAPI.useWebaudio) {
      this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: this.after_response,
        valid_responses: this.params.choices,
        rt_method: "audio",
        persist: false,
        allow_held_key: false,
        audio_context: this.jsPsych.pluginAPI.audioContext(),
        audio_context_start_time: this.startTime
      });
    } else {
      this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: this.after_response,
        valid_responses: this.params.choices,
        rt_method: "performance",
        persist: false,
        allow_held_key: false
      });
    }
  }
  async simulate(trial, simulation_mode, simulation_options, load_callback) {
    if (simulation_mode == "data-only") {
      load_callback();
      return this.simulate_data_only(trial, simulation_options);
    }
    if (simulation_mode == "visual") {
      return this.simulate_visual(trial, simulation_options, load_callback);
    }
  }
  simulate_data_only(trial, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);
    return data;
  }
  async simulate_visual(trial, simulation_options, load_callback) {
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
  create_simulation_data(trial, simulation_options) {
    const default_data = {
      stimulus: trial.stimulus,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      response: this.jsPsych.pluginAPI.getValidKey(trial.choices)
    };
    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
    this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
    return data;
  }
}

export { AudioKeyboardResponsePlugin as default };
//# sourceMappingURL=index.js.map
