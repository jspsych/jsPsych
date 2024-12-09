import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "fullscreen",
  version: version,
  parameters: {
    /** A value of `true` causes the experiment to enter fullscreen mode. A value of `false` causes the browser to exit fullscreen mode. */
    fullscreen_mode: {
      type: ParameterType.BOOL,
      default: true,
      array: false,
    },
    /** `<p>The experiment will switch to full screen mode when you press the button below</p>` | The HTML content to display above the button to enter fullscreen mode. */
    message: {
      type: ParameterType.HTML_STRING,
      default:
        "<p>The experiment will switch to full screen mode when you press the button below</p>",
      array: false,
    },
    /** The text that appears on the button to enter fullscreen mode. */
    button_label: {
      type: ParameterType.STRING,
      default: "Continue",
      array: false,
    },
    /** The length of time to delay after entering fullscreen mode before ending the trial. This can be useful because entering fullscreen is jarring and most browsers display some kind of message that the browser has entered fullscreen mode. */
    delay_after: {
      type: ParameterType.INT,
      default: 1000,
      array: false,
    },
  },
  data: {
    /** true if the browser supports fullscreen mode (i.e., is not Safari) */
    success: {
      type: ParameterType.BOOL,
      default: null,
      description: "True if the user entered fullscreen mode, false if not.",
    },
    /** Response time to click the button that launches fullscreen mode */
    rt: {
      type: ParameterType.INT,
      default: null,
      description: "Time in milliseconds until the user entered fullscreen mode.",
    },
  },
  // prettier-ignore
  citations: '__CITATIONS__',
};

type Info = typeof info;

/**
 * The fullscreen plugin allows the experiment to enter or exit fullscreen mode. For security reasons, all browsers require that entry into fullscreen mode is triggered by a user action. To enter fullscreen mode, this plugin has the user click a button. Exiting fullscreen mode can be done without user input.
 *
 * !!! warning
 *     Safari does not support keyboard input when the browser is in fullscreen mode. Therefore, the function will not launch fullscreen mode on Safari. The experiment will ignore any trials using the fullscreen plugin in Safari.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/fullscreen/ fullscreen plugin documentation on jspsych.org}
 */
class FullscreenPlugin implements JsPsychPlugin<Info> {
  static info = info;
  private rt = null;
  private start_time = 0;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // check if keys are allowed in fullscreen mode
    var keyboardNotAllowed = typeof Element !== "undefined" && "ALLOW_KEYBOARD_INPUT" in Element;
    if (keyboardNotAllowed) {
      // This is Safari, and keyboard events will be disabled. Don't allow fullscreen here.
      // do something else?
      this.endTrial(display_element, false, trial);
    } else {
      if (trial.fullscreen_mode) {
        this.showDisplay(display_element, trial);
      } else {
        this.exitFullScreen();
        this.endTrial(display_element, true, trial);
      }
    }
  }

  private showDisplay(display_element, trial) {
    display_element.innerHTML = `
      ${trial.message}
      <button id="jspsych-fullscreen-btn" class="jspsych-btn">${trial.button_label}</button>
    `;
    display_element.querySelector("#jspsych-fullscreen-btn").addEventListener("click", () => {
      this.rt = Math.round(performance.now() - this.start_time);
      this.enterFullScreen();
      this.endTrial(display_element, true, trial);
    });
    this.start_time = performance.now();
  }

  private endTrial(display_element, success, trial) {
    display_element.innerHTML = "";

    this.jsPsych.pluginAPI.setTimeout(() => {
      var trial_data = {
        success: success,
        rt: this.rt,
      };

      this.jsPsych.finishTrial(trial_data);
    }, trial.delay_after);
  }

  private enterFullScreen() {
    var element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element["mozRequestFullScreen"]) {
      element["mozRequestFullScreen"]();
    } else if (element["webkitRequestFullscreen"]) {
      element["webkitRequestFullscreen"]();
    } else if (element["msRequestFullscreen"]) {
      element["msRequestFullscreen"]();
    }
  }

  private exitFullScreen() {
    if (
      document.fullscreenElement ||
      document["mozFullScreenElement"] ||
      document["webkitFullscreenElement"]
    ) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document["msExitFullscreen"]) {
        document["msExitFullscreen"]();
      } else if (document["mozCancelFullScreen"]) {
        document["mozCancelFullScreen"]();
      } else if (document["webkitExitFullscreen"]) {
        document["webkitExitFullscreen"]();
      }
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
    const rt = this.jsPsych.randomization.sampleExGaussian(1000, 100, 1 / 200, true);

    const default_data = {
      success: true,
      rt: rt,
    };

    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);

    return data;
  }

  private simulate_data_only(trial: TrialType<Info>, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);

    this.jsPsych.finishTrial(data);
  }

  private simulate_visual(trial: TrialType<Info>, simulation_options, load_callback: () => void) {
    const data = this.create_simulation_data(trial, simulation_options);

    const display_element = this.jsPsych.getDisplayElement();

    if (data.success === false) {
      this.endTrial(display_element, false, trial);
    } else {
      this.trial(display_element, trial);
      load_callback();
      this.jsPsych.pluginAPI.clickTarget(
        display_element.querySelector("#jspsych-fullscreen-btn"),
        data.rt
      );
    }
  }
}

export default FullscreenPlugin;
