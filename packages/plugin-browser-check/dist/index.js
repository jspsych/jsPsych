import { detect } from 'detect-browser';
import { ParameterType } from 'jspsych';

var version = "2.1.0";

const info = {
  name: "browser-check",
  version,
  parameters: {
    /**
     * The list of browser features to record. The default value includes all of the available options.
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
        "microphone"
      ]
    },
    /**
     * Any features listed here will be skipped, even if they appear in `features`. Use this when you want to run most of the defaults.
     */
    skip_features: {
      type: ParameterType.STRING,
      array: true,
      default: []
    },
    /**
     * The number of frames to sample when measuring the display refresh rate (`"vsync_rate"`).
     * Increasing the number will potenially improve the stability of the estimate at the cost of
     * increasing the amount of time the plugin takes during this test. On most devices, 60 frames takes
     * about 1 second to measure.
     */
    vsync_frame_count: {
      type: ParameterType.INT,
      default: 60
    },
    /**
     * Whether to allow the participant to resize the browser window if the window is smaller than `minimum_width`
     * and/or `minimum_height`. If `false`, then the `minimum_width` and `minimum_height` parameters are ignored
     * and you can validate the size in the `inclusion_function`.
     */
    allow_window_resize: {
      type: ParameterType.BOOL,
      default: true
    },
    /**
     * If `allow_window_resize` is `true`, then this is the minimum width of the window (in pixels)
     * that must be met before continuing.
     */
    minimum_width: {
      type: ParameterType.INT,
      default: 0
    },
    /**
     * If `allow_window_resize` is `true`, then this is the minimum height of the window (in pixels) that
     * must be met before continuing.
     */
    minimum_height: {
      type: ParameterType.INT,
      default: 0
    },
    /**
     * The message that will be displayed during the interactive resize when `allow_window_resize` is `true`
     * and the window is too small. If the message contains HTML elements with the special IDs `browser-check-min-width`,
     * `browser-check-min-height`, `browser-check-actual-height`, and/or `browser-check-actual-width`, then the
     * contents of those elements will be dynamically updated to reflect the `minimum_width`, `minimum_height` and
     * measured width and height of the browser.
     * The default message is:
     * `<p>Your browser window is too small to complete this experiment. Please maximize the size of your browser window. If your browser window is already maximized, you will not be able to complete this experiment.</p>
     * <p>The minimum window width is <span id="browser-check-min-width"></span> px.</p>
     * <p>Your current window width is <span id="browser-check-actual-width"></span> px.</p>
     * <p>The minimum window height is <span id="browser-check-min-height"></span> px.</p>
     * <p>Your current window height is <span id="browser-check-actual-height"></span> px.</p>`.
     */
    window_resize_message: {
      type: ParameterType.HTML_STRING,
      default: `<p>Your browser window is too small to complete this experiment. Please maximize the size of your browser window. 
        If your browser window is already maximized, you will not be able to complete this experiment.</p>
        <p>The minimum window width is <span id="browser-check-min-width"></span> px.</p>
        <p>Your current window width is <span id="browser-check-actual-width"></span> px.</p>
        <p>The minimum window height is <span id="browser-check-min-height"></span> px.</p>
        <p>Your current window height is <span id="browser-check-actual-height"></span> px.</p>`
    },
    /**
     * During the interactive resize, a button with this text will be displayed below the
     * `window_resize_message` for the participant to click if the window cannot meet the
     * minimum size needed. When the button is clicked, the experiment will end and
     * `exclusion_message` will be displayed.
     */
    resize_fail_button_text: {
      type: ParameterType.STRING,
      default: "I cannot make the window any larger"
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
      }
    },
    /**
     * A function that returns the message to display if `inclusion_function` evaluates to `false` or if the participant
     * clicks on the resize fail button during the interactive resize. In order to allow customization of the message,
     * the first argument to the function will be an object containing key value pairs with the measured features of the
     * browser. The keys will be the same as those listed in `features`. See example below.
     */
    exclusion_message: {
      type: ParameterType.FUNCTION,
      default: () => {
        return `<p>Your browser does not meet the requirements to participate in this experiment.</p>`;
      }
    }
  },
  data: {
    /** The width of the browser window in pixels. If interactive resizing happens, this is the width *after* resizing. */
    width: {
      type: ParameterType.INT
    },
    /** The height of the browser window in pixels. If interactive resizing happens, this is the height *after* resizing.*/
    height: {
      type: ParameterType.INT
    },
    /** The browser used. */
    browser: {
      type: ParameterType.STRING
    },
    /** The version of the browser used. */
    browser_version: {
      type: ParameterType.STRING
    },
    /** The operating system used. */
    os: {
      type: ParameterType.STRING
    },
    /** Whether the browser is a mobile device. */
    mobile: {
      type: ParameterType.BOOL
    },
    /** Whether the browser supports the WebAudio API. */
    webaudio: {
      type: ParameterType.BOOL
    },
    /** Whether the browser supports the Fullscreen API. */
    fullscreen: {
      type: ParameterType.BOOL
    },
    /** An estimate of the refresh rate of the screen, in frames per second. */
    vsync_rate: {
      type: ParameterType.FLOAT
    },
    /** Whether there is a webcam device available. Note that the participant still must grant permission to access the device before it can be used. */
    webcam: {
      type: ParameterType.BOOL
    },
    /** Whether there is an audio input device available. Note that the participant still must grant permission to access the device before it can be used. */
    microphone: {
      type: ParameterType.BOOL
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class BrowserCheckPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
    this.end_flag = false;
  }
  static {
    this.info = info;
  }
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  trial(display_element, trial) {
    this.t = trial;
    const featureCheckFunctionsMap = this.create_feature_fn_map(trial);
    const features_to_check = trial.features.filter((x) => !trial.skip_features.includes(x));
    this.run_trial(featureCheckFunctionsMap, features_to_check);
  }
  async run_trial(fnMap, features) {
    const feature_data = await this.measure_features(fnMap, features);
    const include = await this.inclusion_check(this.t.inclusion_function, feature_data);
    if (include) {
      this.end_trial(feature_data);
    } else {
      this.end_experiment(feature_data);
    }
  }
  create_feature_fn_map(trial) {
    return new Map(
      Object.entries({
        width: () => {
          return window.innerWidth;
        },
        height: () => {
          return window.innerHeight;
        },
        webaudio: () => {
          if (window.AudioContext || // @ts-ignore because prefixed not in document type
          window.webkitAudioContext || // @ts-ignore because prefixed not in document type
          window.mozAudioContext || // @ts-ignore because prefixed not in document type
          window.oAudioContext || // @ts-ignore because prefixed not in document type
          window.msAudioContext) {
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
          if (document.exitFullscreen || // @ts-ignore because prefixed not in document type
          document.webkitExitFullscreen || // @ts-ignore because prefixed not in document type
          document.msExitFullscreen) {
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
              const frame_rate = 1e3 / (sum / deltas.length);
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
        }
      })
    );
  }
  async measure_features(fnMap, features_to_check) {
    const feature_data = /* @__PURE__ */ new Map();
    const feature_checks = [];
    for (const feature of features_to_check) {
      feature_checks.push(Promise.resolve(fnMap.get(feature)()));
    }
    const results = await Promise.allSettled(feature_checks);
    for (let i = 0; i < features_to_check.length; i++) {
      if (results[i].status === "fulfilled") {
        feature_data.set(features_to_check[i], results[i].value);
      } else {
        feature_data.set(features_to_check[i], null);
      }
    }
    return feature_data;
  }
  async inclusion_check(fn, data) {
    await this.check_allow_resize(data);
    if (this.end_flag) {
      return false;
    }
    return fn(Object.fromEntries(data));
  }
  async check_allow_resize(feature_data) {
    const display_element = this.jsPsych.getDisplayElement();
    const w = feature_data.get("width");
    const h = feature_data.get("height");
    if (this.t.allow_window_resize && (w || h) && (this.t.minimum_width > 0 || this.t.minimum_height > 0)) {
      display_element.innerHTML = this.t.window_resize_message + `<p><button id="browser-check-max-size-btn" class="jspsych-btn">${this.t.resize_fail_button_text}</button></p>`;
      display_element.querySelector("#browser-check-max-size-btn").addEventListener("click", () => {
        display_element.innerHTML = "";
        this.end_flag = true;
      });
      const min_width_el = display_element.querySelector("#browser-check-min-width");
      const min_height_el = display_element.querySelector("#browser-check-min-height");
      const actual_height_el = display_element.querySelector("#browser-check-actual-height");
      const actual_width_el = display_element.querySelector("#browser-check-actual-width");
      while (!this.end_flag && (window.innerWidth < this.t.minimum_width || window.innerHeight < this.t.minimum_height)) {
        if (min_width_el) {
          min_width_el.innerHTML = this.t.minimum_width.toString();
        }
        if (min_height_el) {
          min_height_el.innerHTML = this.t.minimum_height.toString();
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
  }
  end_trial(feature_data) {
    const trial_data = { ...Object.fromEntries(feature_data) };
    this.jsPsych.finishTrial(trial_data);
  }
  end_experiment(feature_data) {
    this.jsPsych.getDisplayElement().innerHTML = "";
    const trial_data = { ...Object.fromEntries(feature_data) };
    this.jsPsych.abortExperiment(this.t.exclusion_message(trial_data), trial_data);
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
  async create_simulation_data(trial, simulation_options) {
    const featureCheckFunctionsMap = this.create_feature_fn_map(trial);
    const features_to_check = trial.features.filter((x) => !trial.skip_features.includes(x));
    const feature_data = await this.measure_features(
      featureCheckFunctionsMap,
      features_to_check.filter((x) => x !== "vsync_rate")
    );
    if (features_to_check.includes("vsync_rate")) {
      feature_data.set("vsync_rate", 60);
    }
    const default_data = Object.fromEntries(feature_data);
    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
    return data;
  }
  simulate_data_only(trial, simulation_options) {
    this.create_simulation_data(trial, simulation_options).then((data) => {
      if (trial.allow_window_resize) {
        if (data.width < trial.minimum_width) {
          data.width = trial.minimum_width;
        }
        if (data.height < trial.minimum_height) {
          data.height = trial.minimum_height;
        }
      }
      if (trial.inclusion_function(data)) {
        this.jsPsych.finishTrial(data);
      } else {
        this.jsPsych.abortExperiment(trial.exclusion_message(data), data);
      }
    });
  }
  simulate_visual(trial, simulation_options, load_callback) {
    this.t = trial;
    load_callback();
    this.create_simulation_data(trial, simulation_options).then((data) => {
      const feature_data = new Map(Object.entries(data));
      setTimeout(() => {
        const btn = document.querySelector("#browser-check-max-size-btn");
        if (btn) {
          this.jsPsych.pluginAPI.clickTarget(btn);
        }
      }, 3e3);
      this.inclusion_check(this.t.inclusion_function, feature_data).then((include) => {
        if (include) {
          this.end_trial(feature_data);
        } else {
          this.end_experiment(feature_data);
        }
      });
    });
  }
}

export { BrowserCheckPlugin as default };
//# sourceMappingURL=index.js.map
