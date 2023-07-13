import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "fullscreen",
  parameters: {
    /** If true, experiment will enter fullscreen mode. If false, the browser will exit fullscreen mode. */
    fullscreen_mode: {
      type: ParameterType.BOOL,
      pretty_name: "Fullscreen mode",
      default: true,
      array: false,
    },
    /** HTML content to display above the button to enter fullscreen mode */
    message: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Message",
      default:
        "<p>The experiment will switch to full screen mode when you press the button below</p>",
      array: false,
    },
    /** The text that appears on the button to enter fullscreen */
    button_label: {
      type: ParameterType.STRING,
      pretty_name: "Button label",
      default: "Continue",
      array: false,
    },
    /** The length of time to delay after entering fullscreen mode before ending the trial. */
    delay_after: {
      type: ParameterType.INT,
      pretty_name: "Delay after",
      default: 1000,
      array: false,
    },
  },
};

type Info = typeof info;

/**
 * **fullscreen**
 *
 * jsPsych plugin for toggling fullscreen mode in the browser
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-fullscreen/ fullscreen plugin documentation on jspsych.org}
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
