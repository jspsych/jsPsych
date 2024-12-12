import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "html-keyboard-response",
  version: version,
  parameters: {
    /**
     * The string to be displayed.
     */
    stimulus: {
      type: ParameterType.HTML_STRING,
      default: undefined,
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
      default: "ALL_KEYS",
    },
    /**
     * This string can contain HTML markup. Any content here will be displayed below the stimulus.
     * The intention is that it can be used to provide a reminder about the action the participant
     * is supposed to take (e.g., which key to press).
     */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /**
     * How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus
     * will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will
     * remain visible until the trial ends.
     */
    stimulus_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /**
     * How long to wait for the participant to make a response before ending the trial in milliseconds.
     * If the participant fails to make a response before this timer is reached, the participant's response
     * will be recorded as null for the trial and the trial will end. If the value of this parameter is null,
     * then the trial will wait for a response indefinitely.
     */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /**
     * If true, then the trial will end whenever the participant makes a response (assuming they make their
     * response before the cutoff specified by the trial_duration parameter). If false, then the trial will
     * continue until the value for trial_duration is reached. You can set this parameter to false to force
     * the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete.
     */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: true,
    },
  },
  data: {
    /** Indicates which key the participant pressed. */
    response: {
      type: ParameterType.STRING,
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
    rt: {
      type: ParameterType.INT,
    },
    /** The HTML content that was displayed on the screen. */
    stimulus: {
      type: ParameterType.STRING,
    },
  },
  // prettier-ignore
  citations: '__CITATIONS__',
};

type Info = typeof info;

/**
 * This plugin displays HTML content and records responses generated with the keyboard.
 * The stimulus can be displayed until a response is given, or for a pre-determined amount of time.
 * The trial can be ended automatically if the participant has failed to respond within a fixed length of time.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/html-keyboard-response/ html-keyboard-response plugin documentation on jspsych.org}
 */
class HtmlKeyboardResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;
  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var new_html = '<div id="jspsych-html-keyboard-response-stimulus">' + trial.stimulus + "</div>";

    // add prompt
    if (trial.prompt !== null) {
      new_html += trial.prompt;
    }

    // draw
    display_element.innerHTML = new_html;

    // store response
    var response = {
      rt: null,
      key: null,
    };

    // function to end trial when it is time
    const end_trial = () => {
      // kill keyboard listeners
      if (typeof keyboardListener !== "undefined") {
        this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        response: response.key,
      };

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = (info) => {
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector("#jspsych-html-keyboard-response-stimulus").className +=
        " responded";

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (trial.choices != "NO_KEYS") {
      var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
    }

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.querySelector<HTMLElement>(
          "#jspsych-html-keyboard-response-stimulus"
        ).style.visibility = "hidden";
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
    }
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
      response: this.jsPsych.pluginAPI.getValidKey(trial.choices),
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
      this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
    }
  }
}

export default HtmlKeyboardResponsePlugin;
