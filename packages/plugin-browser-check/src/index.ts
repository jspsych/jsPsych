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
        "webcam",
        "microphone",
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
     * The number of animation frames to sample when calculating vsync_rate.
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
     * When `allow_window_resize` is `true`, this is the minimum width (px) that the window
     * needs to be before the experiment will continue.
     */
    minimum_width: {
      type: ParameterType.INT,
      default: 0,
    },
    /**
     * When `allow_window_resize` is `true`, this is the minimum height (px) that the window
     * needs to be before the experiment will continue.
     */
    minimum_height: {
      type: ParameterType.INT,
      default: 0,
    },
    /**
     * Message to display during interactive window resizing.
     */
    window_resize_message: {
      type: ParameterType.HTML_STRING,
      default: `<p>Your browser window is too small to complete this experiment. Please maximize the size of your browser window. 
        If your browser window is already maximized, you will not be able to complete this experiment.</p>
        <p>The minimum window width is <span id="browser-check-min-width"></span> px.</p>
        <p>Your current window width is <span id="browser-check-actual-width"></span> px.</p>
        <p>The minimum window height is <span id="browser-check-min-height"></span> px.</p>
        <p>Your current window height is <span id="browser-check-actual-height"></span> px.</p>`,
    },
    /**
     * During the interactive resize, a button with this text will be displayed below the
     * `window_resize_message` for the participant to click if the window cannot meet the
     * minimum size needed. When the button is clicked, the experiment will end and
     * `exclusion_message` will be displayed.
     */
    resize_fail_button_text: {
      type: ParameterType.STRING,
      default: "I cannot make the window any larger",
    },
    /**
     * A function that evaluates to `true` if the browser meets all of the inclusion criteria
     * for the experiment, and `false` otherwise. The first argument to the function will be
     * an object containing key value pairs with the measured features of the browser. The
     * keys will be the same as those listed in `features`.
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
      type: ParameterType.FUNCTION,
      default: () => {
        return `<p>Your browser does not meet the requirements to participate in this experiment.</p>`;
      },
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
  private end_flag = false;

  constructor(private jsPsych: JsPsych) {}

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

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
          if (
            window.AudioContext ||
            // @ts-ignore because prefixed not in document type
            window.webkitAudioContext ||
            // @ts-ignore because prefixed not in document type
            window.mozAudioContext ||
            // @ts-ignore because prefixed not in document type
            window.oAudioContext ||
            // @ts-ignore because prefixed not in document type
            window.msAudioContext
          ) {
            return true;
          } else {
            return false;
          }
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
          if (
            document.exitFullscreen ||
            // @ts-ignore because prefixed not in document type
            document.webkitExitFullscreen ||
            // @ts-ignore because prefixed not in document type
            document.msExitFullscreen
          ) {
            return true;
          } else {
            return false;
          }
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
              const frame_rate = 1000.0 / (sum / deltas.length);
              const frame_rate_two_sig_dig = Math.round(frame_rate * 100) / 100;
              resolve(frame_rate_two_sig_dig);
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
        webcam: () => {
          return new Promise((resolve, reject) => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
              resolve(false);
            }
            navigator.mediaDevices.enumerateDevices().then((devices) => {
              const webcams = devices.filter((d) => {
                return d.kind == "videoinput";
              });
              if (webcams.length > 0) {
                resolve(true);
              } else {
                resolve(false);
              }
            });
          });
        },
        microphone: () => {
          return new Promise((resolve, reject) => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
              resolve(false);
            }
            navigator.mediaDevices.enumerateDevices().then((devices) => {
              const microphones = devices.filter((d) => {
                return d.kind == "audioinput";
              });
              if (microphones.length > 0) {
                resolve(true);
              } else {
                resolve(false);
              }
            });
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

    const inclusion_check = async () => {
      await check_allow_resize();

      if (!this.end_flag && trial.inclusion_function(Object.fromEntries(feature_data))) {
        end_trial();
      } else {
        end_experiment();
      }
    };

    const check_allow_resize = async () => {
      const w = feature_data.get("width");
      const h = feature_data.get("height");

      if (
        trial.allow_window_resize &&
        (w || h) &&
        (trial.minimum_width > 0 || trial.minimum_height > 0)
      ) {
        display_element.innerHTML =
          trial.window_resize_message +
          `<p><button id="browser-check-max-size-btn" class="jspsych-btn">${trial.resize_fail_button_text}</button></p>`;

        display_element
          .querySelector("#browser-check-max-size-btn")
          .addEventListener("click", () => {
            display_element.innerHTML = "";
            this.end_flag = true;
          });

        const min_width_el = display_element.querySelector("#browser-check-min-width");
        const min_height_el = display_element.querySelector("#browser-check-min-height");
        const actual_height_el = display_element.querySelector("#browser-check-actual-height");
        const actual_width_el = display_element.querySelector("#browser-check-actual-width");

        while (
          !this.end_flag &&
          (window.innerWidth < trial.minimum_width || window.innerHeight < trial.minimum_height)
        ) {
          if (min_width_el) {
            min_width_el.innerHTML = trial.minimum_width.toString();
          }

          if (min_height_el) {
            min_height_el.innerHTML = trial.minimum_height.toString();
          }

          if (actual_height_el) {
            actual_height_el.innerHTML = window.innerHeight.toString();
          }

          if (actual_width_el) {
            actual_width_el.innerHTML = window.innerWidth.toString();
          }

          await this.delay(100);

          feature_data.set("width", window.innerWidth);
          feature_data.set("height", window.innerHeight);
        }
      }
    };

    const end_trial = () => {
      display_element.innerHTML = "";

      const trial_data = { ...Object.fromEntries(feature_data) };

      this.jsPsych.finishTrial(trial_data);
    };

    var end_experiment = () => {
      display_element.innerHTML = "";

      const trial_data = { ...Object.fromEntries(feature_data) };

      this.jsPsych.endExperiment(trial.exclusion_message(trial_data), trial_data);
    };
  }
}

export default BrowserCheckPlugin;
