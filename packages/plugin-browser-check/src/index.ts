import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "browser-check",
  parameters: {
    /**
     * List of features to check and record in the data
     */
    features: {
      type: ParameterType.STRING,
      array: true,
      default: [
        "window_width",
        "window_height",
        "webaudio",
        "browser",
        "browser_version",
        "mobile",
        "os",
        "fullscreen",
      ],
    },
    /**
     * List of inclusion criteria
     */
    inclusion_criteria: {
      type: ParameterType.COMPLEX,
      default: [],
    },
  },
};

type Info = typeof info;

/**
 * **browser-check**
 *
 * jsPsych plugin for checking features of the browser and validating against a set of inclusion criteria.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-browser-check/ browser-check plugin documentation on jspsych.org}
 */
class BrowserCheckPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  private featureCheckFunctionsMap = new Map<string, () => any>(
    Object.entries({
      window_width: () => {
        return window.innerWidth;
      },
      window_height: () => {
        return window.innerHeight;
      },
      webaudio: () => {
        // @ts-ignore
        return (
          window.AudioContext ||
          window.webkitAudioContext ||
          window.mozAudioContext ||
          window.oAudioContext ||
          window.msAudioContext
        );
      },
      browser: () => {
        return "TODO";
      },
      browser_version: () => {
        return "TODO";
      },
      mobile: () => {
        return "TODO";
      },
      os: () => {
        return "TODO";
      },
      fullscreen: () => {
        return "TODO";
      },
    })
  );

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const feature_data = new Map<string, any>();
    for (const feature of trial.features) {
      feature_data.set(feature, this.featureCheckFunctionsMap.get(feature)());
    }

    const trial_data = { ...Object.fromEntries(feature_data) };

    this.jsPsych.finishTrial(trial_data);
  }

  // MINIMUM SIZE
  // if (exclusions.min_width || exclusions.min_height) {
  //   const mw = exclusions.min_width || 0;
  //   const mh = exclusions.min_height || 0;

  //   if (window.innerWidth < mw || window.innerHeight < mh) {
  //     this.getDisplayElement().innerHTML =
  //       "<p>Your browser window is too small to complete this experiment. " +
  //       "Please maximize the size of your browser window. If your browser window is already maximized, " +
  //       "you will not be able to complete this experiment.</p>" +
  //       "<p>The minimum width is " +
  //       mw +
  //       "px. Your current width is " +
  //       window.innerWidth +
  //       "px.</p>" +
  //       "<p>The minimum height is " +
  //       mh +
  //       "px. Your current height is " +
  //       window.innerHeight +
  //       "px.</p>";

  //     // Wait for window size to increase
  //     while (window.innerWidth < mw || window.innerHeight < mh) {
  //       await delay(100);
  //     }

  //     this.getDisplayElement().innerHTML = "";
  //   }
  // }

  // // WEB AUDIO API
  // if (typeof exclusions.audio !== "undefined" && exclusions.audio) {
  //   if (!window.hasOwnProperty("AudioContext") && !window.hasOwnProperty("webkitAudioContext")) {
  //     this.getDisplayElement().innerHTML =
  //       "<p>Your browser does not support the WebAudio API, which means that you will not " +
  //       "be able to complete the experiment.</p><p>Browsers that support the WebAudio API include " +
  //       "Chrome, Firefox, Safari, and Edge.</p>";
  //     throw new Error();
  //   }
  // }
}

export default BrowserCheckPlugin;
