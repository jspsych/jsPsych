import { ParameterType } from 'jspsych';

var version = "2.1.0";

const info = {
  name: "html-keyboard-response",
  version,
  parameters: {
    /**
     * The string to be displayed.
     */
    stimulus: {
      type: ParameterType.HTML_STRING,
      default: void 0
    },
    /**
     * This array contains the key(s) that the participant is allowed to press in order to respond
     * to the stimulus. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values this page}
     * and
     * {@link https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/ this page (event.key column)}
     * for more examples. Any key presses that are not listed in the
     * array will be ignored. The default value of `"ALL_KEYS"` means that all keys will be accepted as valid responses.
     * Specifying `"NO_KEYS"` will mean that no responses are allowed.
     */
    choices: {
      type: ParameterType.KEYS,
      default: "ALL_KEYS"
    },
    /**
     * This string can contain HTML markup. Any content here will be displayed below the stimulus.
     * The intention is that it can be used to provide a reminder about the action the participant
     * is supposed to take (e.g., which key to press).
     */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null
    },
    /**
     * How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus
     * will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will
     * remain visible until the trial ends.
     */
    stimulus_duration: {
      type: ParameterType.INT,
      default: null
    },
    /**
     * How long to wait for the participant to make a response before ending the trial in milliseconds.
     * If the participant fails to make a response before this timer is reached, the participant's response
     * will be recorded as null for the trial and the trial will end. If the value of this parameter is null,
     * then the trial will wait for a response indefinitely.
     */
    trial_duration: {
      type: ParameterType.INT,
      default: null
    },
    /**
     * If true, then the trial will end whenever the participant makes a response (assuming they make their
     * response before the cutoff specified by the trial_duration parameter). If false, then the trial will
     * continue until the value for trial_duration is reached. You can set this parameter to false to force
     * the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete.
     */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: true
    }
  },
  data: {
    /** Indicates which key the participant pressed. */
    response: {
      type: ParameterType.STRING
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
    rt: {
      type: ParameterType.INT
    },
    /** The HTML content that was displayed on the screen. */
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
class HtmlKeyboardResponsePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    var new_html = '<div id="jspsych-html-keyboard-response-stimulus">' + trial.stimulus + "</div>";
    if (trial.prompt !== null) {
      new_html += trial.prompt;
    }
    display_element.innerHTML = new_html;
    var response = {
      rt: null,
      key: null
    };
    const end_trial = () => {
      if (typeof keyboardListener !== "undefined") {
        this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        response: response.key
      };
      this.jsPsych.finishTrial(trial_data);
    };
    var after_response = (info2) => {
      display_element.querySelector("#jspsych-html-keyboard-response-stimulus").className += " responded";
      if (response.key == null) {
        response = info2;
      }
      if (trial.response_ends_trial) {
        end_trial();
      }
    };
    if (trial.choices != "NO_KEYS") {
      var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: "performance",
        persist: false,
        allow_held_key: false
      });
    }
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.querySelector(
          "#jspsych-html-keyboard-response-stimulus"
        ).style.visibility = "hidden";
      }, trial.stimulus_duration);
    }
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
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
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      response: this.jsPsych.pluginAPI.getValidKey(trial.choices)
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
      this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
    }
  }
}

export { HtmlKeyboardResponsePlugin as default };
//# sourceMappingURL=index.js.map
