import { detect } from "detect-browser";
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
        "width",
        "height",
        "webaudio",
        "browser",
        "browser_version",
        "mobile",
        "os",
        "fullscreen",
        "vsync_rate",
      ],
    },
    /**
     * Any features listed here will be skipped, even if they appear in `features`. Useful for
     * when you want to run most of the defaults.
     */
    skip_features: {
      type: ParameterType.STRING,
      array: true,
      default: [],
    },
    /**
     * The number of animation frames to sample when calculating vsync_rate
     */
    vsync_frame_count: {
      type: ParameterType.INT,
      default: 60,
    },
    /**
     * If `true`, show a message when window size is too small to allow the user
     * to adjust if their screen allows for it.
     */
    allow_window_resize: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * List of inclusion criteria
     */
    inclusion_function: {
      type: ParameterType.FUNCTION,
      default: () => {
        return true;
      },
    },
    /**
     * The message to display if `inclusion_function` returns `false`
     */
    exclusion_message: {
      type: ParameterType.HTML_STRING,
      default: `<p>You shall not pass.</p>`,
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

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const featureCheckFunctionsMap = new Map<string, () => any>(
      Object.entries({
        width: () => {
          return window.innerWidth;
        },
        height: () => {
          return window.innerHeight;
        },
        webaudio: () => {
          return (
            window.AudioContext ||
            // @ts-ignore because prefixed not in document type
            window.webkitAudioContext ||
            // @ts-ignore because prefixed not in document type
            window.mozAudioContext ||
            // @ts-ignore because prefixed not in document type
            window.oAudioContext ||
            // @ts-ignore because prefixed not in document type
            window.msAudioContext
          );
        },
        browser: () => {
          return detect().name;
        },
        browser_version: () => {
          return detect().version;
        },
        mobile: () => {
          return /Mobi/i.test(window.navigator.userAgent);
        },
        os: () => {
          return detect().os;
        },
        fullscreen: () => {
          return (
            document.exitFullscreen ||
            // @ts-ignore because prefixed not in document type
            document.webkitExitFullscreen ||
            // @ts-ignore because prefixed not in document type
            document.msExitFullscreen
          );
        },
        vsync_rate: () => {
          return new Promise((resolve) => {
            let t0 = performance.now();
            let deltas = [];
            let framesToRun = trial.vsync_frame_count;
            const finish = () => {
              let sum = 0;
              for (const v of deltas) {
                sum += v;
              }
              resolve(1000.0 / (sum / deltas.length));
            };
            const nextFrame = () => {
              let t1 = performance.now();
              deltas.push(t1 - t0);
              t0 = t1;
              framesToRun--;
              if (framesToRun > 0) {
                requestAnimationFrame(nextFrame);
              } else {
                finish();
              }
            };
            const start = () => {
              t0 = performance.now();
              requestAnimationFrame(nextFrame);
            };
            requestAnimationFrame(start);
          });
        },
      })
    );

    const feature_data = new Map<string, any>();
    const feature_checks: Promise<void>[] = [];
    const features_to_check = trial.features.filter((x) => !trial.skip_features.includes(x));

    for (const feature of features_to_check) {
      // this allows for feature check functions to be sync or async
      feature_checks.push(Promise.resolve(featureCheckFunctionsMap.get(feature)()));
    }

    Promise.allSettled(feature_checks).then((results) => {
      for (let i = 0; i < features_to_check.length; i++) {
        if (results[i].status === "fulfilled") {
          // @ts-expect-error because .value isn't recognized for some reason
          feature_data.set(features_to_check[i], results[i].value);
        } else {
          feature_data.set(features_to_check[i], null);
        }
      }
      inclusion_check();
    });

    var inclusion_check = () => {
      if (trial.inclusion_function(Object.fromEntries(feature_data))) {
        end_trial();
      } else {
        end_experiment();
      }
    };

    var end_trial = () => {
      const trial_data = { ...Object.fromEntries(feature_data) };

      this.jsPsych.finishTrial(trial_data);
    };

    var end_experiment = () => {
      const trial_data = { ...Object.fromEntries(feature_data) };

      this.jsPsych.endExperiment(trial.exclusion_message, trial_data);
    };
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
