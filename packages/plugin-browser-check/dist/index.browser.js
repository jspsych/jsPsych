var jsPsychBrowserCheck = (function (jspsych) {
    'use strict';

    var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    var BrowserInfo = /** @class */ (function () {
        function BrowserInfo(name, version, os) {
            this.name = name;
            this.version = version;
            this.os = os;
            this.type = 'browser';
        }
        return BrowserInfo;
    }());
    var NodeInfo = /** @class */ (function () {
        function NodeInfo(version) {
            this.version = version;
            this.type = 'node';
            this.name = 'node';
            this.os = process.platform;
        }
        return NodeInfo;
    }());
    var SearchBotDeviceInfo = /** @class */ (function () {
        function SearchBotDeviceInfo(name, version, os, bot) {
            this.name = name;
            this.version = version;
            this.os = os;
            this.bot = bot;
            this.type = 'bot-device';
        }
        return SearchBotDeviceInfo;
    }());
    var BotInfo = /** @class */ (function () {
        function BotInfo() {
            this.type = 'bot';
            this.bot = true; // NOTE: deprecated test name instead
            this.name = 'bot';
            this.version = null;
            this.os = null;
        }
        return BotInfo;
    }());
    var ReactNativeInfo = /** @class */ (function () {
        function ReactNativeInfo() {
            this.type = 'react-native';
            this.name = 'react-native';
            this.version = null;
            this.os = null;
        }
        return ReactNativeInfo;
    }());
    // tslint:disable-next-line:max-line-length
    var SEARCHBOX_UA_REGEX = /alexa|bot|crawl(er|ing)|facebookexternalhit|feedburner|google web preview|nagios|postrank|pingdom|slurp|spider|yahoo!|yandex/;
    var SEARCHBOT_OS_REGEX = /(nuhk|curl|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask\ Jeeves\/Teoma|ia_archiver)/;
    var REQUIRED_VERSION_PARTS = 3;
    var userAgentRules = [
        ['aol', /AOLShield\/([0-9\._]+)/],
        ['edge', /Edge\/([0-9\._]+)/],
        ['edge-ios', /EdgiOS\/([0-9\._]+)/],
        ['yandexbrowser', /YaBrowser\/([0-9\._]+)/],
        ['kakaotalk', /KAKAOTALK\s([0-9\.]+)/],
        ['samsung', /SamsungBrowser\/([0-9\.]+)/],
        ['silk', /\bSilk\/([0-9._-]+)\b/],
        ['miui', /MiuiBrowser\/([0-9\.]+)$/],
        ['beaker', /BeakerBrowser\/([0-9\.]+)/],
        ['edge-chromium', /EdgA?\/([0-9\.]+)/],
        [
            'chromium-webview',
            /(?!Chrom.*OPR)wv\).*Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/,
        ],
        ['chrome', /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],
        ['phantomjs', /PhantomJS\/([0-9\.]+)(:?\s|$)/],
        ['crios', /CriOS\/([0-9\.]+)(:?\s|$)/],
        ['firefox', /Firefox\/([0-9\.]+)(?:\s|$)/],
        ['fxios', /FxiOS\/([0-9\.]+)/],
        ['opera-mini', /Opera Mini.*Version\/([0-9\.]+)/],
        ['opera', /Opera\/([0-9\.]+)(?:\s|$)/],
        ['opera', /OPR\/([0-9\.]+)(:?\s|$)/],
        ['pie', /^Microsoft Pocket Internet Explorer\/(\d+\.\d+)$/],
        ['pie', /^Mozilla\/\d\.\d+\s\(compatible;\s(?:MSP?IE|MSInternet Explorer) (\d+\.\d+);.*Windows CE.*\)$/],
        ['netfront', /^Mozilla\/\d\.\d+.*NetFront\/(\d.\d)/],
        ['ie', /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/],
        ['ie', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/],
        ['ie', /MSIE\s(7\.0)/],
        ['bb10', /BB10;\sTouch.*Version\/([0-9\.]+)/],
        ['android', /Android\s([0-9\.]+)/],
        ['ios', /Version\/([0-9\._]+).*Mobile.*Safari.*/],
        ['safari', /Version\/([0-9\._]+).*Safari/],
        ['facebook', /FB[AS]V\/([0-9\.]+)/],
        ['instagram', /Instagram\s([0-9\.]+)/],
        ['ios-webview', /AppleWebKit\/([0-9\.]+).*Mobile/],
        ['ios-webview', /AppleWebKit\/([0-9\.]+).*Gecko\)$/],
        ['curl', /^curl\/([0-9\.]+)$/],
        ['searchbot', SEARCHBOX_UA_REGEX],
    ];
    var operatingSystemRules = [
        ['iOS', /iP(hone|od|ad)/],
        ['Android OS', /Android/],
        ['BlackBerry OS', /BlackBerry|BB10/],
        ['Windows Mobile', /IEMobile/],
        ['Amazon OS', /Kindle/],
        ['Windows 3.11', /Win16/],
        ['Windows 95', /(Windows 95)|(Win95)|(Windows_95)/],
        ['Windows 98', /(Windows 98)|(Win98)/],
        ['Windows 2000', /(Windows NT 5.0)|(Windows 2000)/],
        ['Windows XP', /(Windows NT 5.1)|(Windows XP)/],
        ['Windows Server 2003', /(Windows NT 5.2)/],
        ['Windows Vista', /(Windows NT 6.0)/],
        ['Windows 7', /(Windows NT 6.1)/],
        ['Windows 8', /(Windows NT 6.2)/],
        ['Windows 8.1', /(Windows NT 6.3)/],
        ['Windows 10', /(Windows NT 10.0)/],
        ['Windows ME', /Windows ME/],
        ['Windows CE', /Windows CE|WinCE|Microsoft Pocket Internet Explorer/],
        ['Open BSD', /OpenBSD/],
        ['Sun OS', /SunOS/],
        ['Chrome OS', /CrOS/],
        ['Linux', /(Linux)|(X11)/],
        ['Mac OS', /(Mac_PowerPC)|(Macintosh)/],
        ['QNX', /QNX/],
        ['BeOS', /BeOS/],
        ['OS/2', /OS\/2/],
    ];
    function detect(userAgent) {
        if (typeof document === 'undefined' &&
            typeof navigator !== 'undefined' &&
            navigator.product === 'ReactNative') {
            return new ReactNativeInfo();
        }
        if (typeof navigator !== 'undefined') {
            return parseUserAgent(navigator.userAgent);
        }
        return getNodeVersion();
    }
    function matchUserAgent(ua) {
        // opted for using reduce here rather than Array#first with a regex.test call
        // this is primarily because using the reduce we only perform the regex
        // execution once rather than once for the test and for the exec again below
        // probably something that needs to be benchmarked though
        return (ua !== '' &&
            userAgentRules.reduce(function (matched, _a) {
                var browser = _a[0], regex = _a[1];
                if (matched) {
                    return matched;
                }
                var uaMatch = regex.exec(ua);
                return !!uaMatch && [browser, uaMatch];
            }, false));
    }
    function parseUserAgent(ua) {
        var matchedRule = matchUserAgent(ua);
        if (!matchedRule) {
            return null;
        }
        var name = matchedRule[0], match = matchedRule[1];
        if (name === 'searchbot') {
            return new BotInfo();
        }
        // Do not use RegExp for split operation as some browser do not support it (See: http://blog.stevenlevithan.com/archives/cross-browser-split)
        var versionParts = match[1] && match[1].split('.').join('_').split('_').slice(0, 3);
        if (versionParts) {
            if (versionParts.length < REQUIRED_VERSION_PARTS) {
                versionParts = __spreadArray(__spreadArray([], versionParts, true), createVersionParts(REQUIRED_VERSION_PARTS - versionParts.length), true);
            }
        }
        else {
            versionParts = [];
        }
        var version = versionParts.join('.');
        var os = detectOS(ua);
        var searchBotMatch = SEARCHBOT_OS_REGEX.exec(ua);
        if (searchBotMatch && searchBotMatch[1]) {
            return new SearchBotDeviceInfo(name, version, os, searchBotMatch[1]);
        }
        return new BrowserInfo(name, version, os);
    }
    function detectOS(ua) {
        for (var ii = 0, count = operatingSystemRules.length; ii < count; ii++) {
            var _a = operatingSystemRules[ii], os = _a[0], regex = _a[1];
            var match = regex.exec(ua);
            if (match) {
                return os;
            }
        }
        return null;
    }
    function getNodeVersion() {
        var isNode = typeof process !== 'undefined' && process.version;
        return isNode ? new NodeInfo(process.version.slice(1)) : null;
    }
    function createVersionParts(count) {
        var output = [];
        for (var ii = 0; ii < count; ii++) {
            output.push('0');
        }
        return output;
    }

    var version = "2.1.0";

    const info = {
      name: "browser-check",
      version,
      parameters: {
        /**
         * The list of browser features to record. The default value includes all of the available options.
         */
        features: {
          type: jspsych.ParameterType.STRING,
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
          type: jspsych.ParameterType.STRING,
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
          type: jspsych.ParameterType.INT,
          default: 60
        },
        /**
         * Whether to allow the participant to resize the browser window if the window is smaller than `minimum_width`
         * and/or `minimum_height`. If `false`, then the `minimum_width` and `minimum_height` parameters are ignored
         * and you can validate the size in the `inclusion_function`.
         */
        allow_window_resize: {
          type: jspsych.ParameterType.BOOL,
          default: true
        },
        /**
         * If `allow_window_resize` is `true`, then this is the minimum width of the window (in pixels)
         * that must be met before continuing.
         */
        minimum_width: {
          type: jspsych.ParameterType.INT,
          default: 0
        },
        /**
         * If `allow_window_resize` is `true`, then this is the minimum height of the window (in pixels) that
         * must be met before continuing.
         */
        minimum_height: {
          type: jspsych.ParameterType.INT,
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
          type: jspsych.ParameterType.HTML_STRING,
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
          type: jspsych.ParameterType.STRING,
          default: "I cannot make the window any larger"
        },
        /**
         * A function that evaluates to `true` if the browser meets all of the inclusion criteria
         * for the experiment, and `false` otherwise. The first argument to the function will be
         * an object containing key value pairs with the measured features of the browser. The
         * keys will be the same as those listed in `features`.
         */
        inclusion_function: {
          type: jspsych.ParameterType.FUNCTION,
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
          type: jspsych.ParameterType.FUNCTION,
          default: () => {
            return `<p>Your browser does not meet the requirements to participate in this experiment.</p>`;
          }
        }
      },
      data: {
        /** The width of the browser window in pixels. If interactive resizing happens, this is the width *after* resizing. */
        width: {
          type: jspsych.ParameterType.INT
        },
        /** The height of the browser window in pixels. If interactive resizing happens, this is the height *after* resizing.*/
        height: {
          type: jspsych.ParameterType.INT
        },
        /** The browser used. */
        browser: {
          type: jspsych.ParameterType.STRING
        },
        /** The version of the browser used. */
        browser_version: {
          type: jspsych.ParameterType.STRING
        },
        /** The operating system used. */
        os: {
          type: jspsych.ParameterType.STRING
        },
        /** Whether the browser is a mobile device. */
        mobile: {
          type: jspsych.ParameterType.BOOL
        },
        /** Whether the browser supports the WebAudio API. */
        webaudio: {
          type: jspsych.ParameterType.BOOL
        },
        /** Whether the browser supports the Fullscreen API. */
        fullscreen: {
          type: jspsych.ParameterType.BOOL
        },
        /** An estimate of the refresh rate of the screen, in frames per second. */
        vsync_rate: {
          type: jspsych.ParameterType.FLOAT
        },
        /** Whether there is a webcam device available. Note that the participant still must grant permission to access the device before it can be used. */
        webcam: {
          type: jspsych.ParameterType.BOOL
        },
        /** Whether there is an audio input device available. Note that the participant still must grant permission to access the device before it can be used. */
        microphone: {
          type: jspsych.ParameterType.BOOL
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

    return BrowserCheckPlugin;

})(jsPsychModule);
//# sourceMappingURL=https://unpkg.com/@jspsych/plugin-browser-check@2.1.0/dist/index.browser.js.map
