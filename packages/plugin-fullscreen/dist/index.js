import { ParameterType } from 'jspsych';

var version = "2.1.0";

const info = {
  name: "fullscreen",
  version,
  parameters: {
    /** A value of `true` causes the experiment to enter fullscreen mode. A value of `false` causes the browser to exit fullscreen mode. */
    fullscreen_mode: {
      type: ParameterType.BOOL,
      default: true,
      array: false
    },
    /** `<p>The experiment will switch to full screen mode when you press the button below</p>` | The HTML content to display above the button to enter fullscreen mode. */
    message: {
      type: ParameterType.HTML_STRING,
      default: "<p>The experiment will switch to full screen mode when you press the button below</p>",
      array: false
    },
    /** The text that appears on the button to enter fullscreen mode. */
    button_label: {
      type: ParameterType.STRING,
      default: "Continue",
      array: false
    },
    /** The length of time to delay after entering fullscreen mode before ending the trial. This can be useful because entering fullscreen is jarring and most browsers display some kind of message that the browser has entered fullscreen mode. */
    delay_after: {
      type: ParameterType.INT,
      default: 1e3,
      array: false
    }
  },
  data: {
    /** true if the browser supports fullscreen mode (i.e., is not Safari) */
    success: {
      type: ParameterType.BOOL,
      default: null,
      description: "True if the user entered fullscreen mode, false if not."
    },
    /** Response time to click the button that launches fullscreen mode */
    rt: {
      type: ParameterType.INT,
      default: null,
      description: "Time in milliseconds until the user entered fullscreen mode."
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class FullscreenPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
    this.rt = null;
    this.start_time = 0;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    var keyboardNotAllowed = typeof Element !== "undefined" && "ALLOW_KEYBOARD_INPUT" in Element;
    if (keyboardNotAllowed) {
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
  showDisplay(display_element, trial) {
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
  endTrial(display_element, success, trial) {
    display_element.innerHTML = "";
    this.jsPsych.pluginAPI.setTimeout(() => {
      var trial_data = {
        success,
        rt: this.rt
      };
      this.jsPsych.finishTrial(trial_data);
    }, trial.delay_after);
  }
  enterFullScreen() {
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
  exitFullScreen() {
    if (document.fullscreenElement || document["mozFullScreenElement"] || document["webkitFullscreenElement"]) {
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
    const rt = this.jsPsych.randomization.sampleExGaussian(1e3, 100, 1 / 200, true);
    const default_data = {
      success: true,
      rt
    };
    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
    return data;
  }
  simulate_data_only(trial, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);
    this.jsPsych.finishTrial(data);
  }
  simulate_visual(trial, simulation_options, load_callback) {
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

export { FullscreenPlugin as default };
//# sourceMappingURL=index.js.map
