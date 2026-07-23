'use strict';

var jspsych = require('jspsych');

var version = "1.2.0";

class WebGazerExtension {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
    // private state for the extension
    // extension authors can define public functions to interact
    // with the state. recommend not exposing state directly
    // so that state manipulations are checked.
    this.currentTrialData = [];
    this.currentTrialTargets = {};
    this.initialized = false;
    this.activeTrial = false;
    this.initialize = ({
      round_predictions = true,
      auto_initialize = false,
      sampling_interval = 34,
      webgazer
    }) => {
      this.round_predictions = round_predictions;
      this.sampling_interval = sampling_interval;
      this.gazeUpdateCallbacks = [];
      this.domObserver = new MutationObserver(this.mutationObserverCallback);
      return new Promise((resolve, reject) => {
        if (typeof webgazer === "undefined") {
          if (window.webgazer) {
            this.webgazer = window.webgazer;
          } else {
            reject(
              new Error(
                "Webgazer extension failed to initialize. webgazer.js not loaded. Load webgazer.js before calling initJsPsych()"
              )
            );
          }
        } else {
          this.webgazer = webgazer;
        }
        this.hideVideo();
        this.hidePredictions();
        if (auto_initialize) {
          this.webgazer.begin().then(() => {
            this.initialized = true;
            this.stopMouseCalibration();
            this.pause();
            resolve();
          }).catch((error) => {
            console.error(error);
            reject(error);
          });
        } else {
          resolve();
        }
      });
    };
    this.on_start = (params) => {
      this.currentTrialData = [];
      this.currentTrialTargets = {};
      this.currentTrialSelectors = params.targets;
      this.domObserver.observe(this.jsPsych.getDisplayElement(), { childList: true });
    };
    this.on_load = () => {
      this.currentTrialStart = performance.now();
      this.startSampleInterval();
      this.activeTrial = true;
    };
    this.on_finish = () => {
      this.stopSampleInterval();
      this.domObserver.disconnect();
      this.activeTrial = false;
      return {
        webgazer_data: this.currentTrialData,
        webgazer_targets: this.currentTrialTargets
      };
    };
    this.start = () => {
      return new Promise((resolve, reject) => {
        if (typeof this.webgazer == "undefined") {
          const error = "Failed to start webgazer. Things to check: Is webgazer.js loaded? Is the webgazer extension included in initJsPsych?";
          console.error(error);
          reject(error);
        }
        this.webgazer.begin().then(() => {
          this.initialized = true;
          this.stopMouseCalibration();
          this.pause();
          resolve();
        }).catch((error) => {
          console.error(error);
          reject(error);
        });
      });
    };
    this.startSampleInterval = (interval = this.sampling_interval) => {
      this.gazeInterval = setInterval(() => {
        this.webgazer.getCurrentPrediction().then(this.handleGazeDataUpdate);
      }, interval);
      this.webgazer.getCurrentPrediction().then(this.handleGazeDataUpdate);
    };
    this.stopSampleInterval = () => {
      clearInterval(this.gazeInterval);
    };
    this.isInitialized = () => {
      return this.initialized;
    };
    this.faceDetected = () => {
      return this.webgazer.getTracker().predictionReady;
    };
    this.showPredictions = () => {
      this.webgazer.showPredictionPoints(true);
    };
    this.hidePredictions = () => {
      this.webgazer.showPredictionPoints(false);
    };
    this.showVideo = () => {
      this.webgazer.showVideo(true);
      this.webgazer.showFaceOverlay(true);
      this.webgazer.showFaceFeedbackBox(true);
    };
    this.hideVideo = () => {
      this.webgazer.showVideo(false);
      this.webgazer.showFaceOverlay(false);
      this.webgazer.showFaceFeedbackBox(false);
    };
    this.resume = () => {
      this.webgazer.resume();
    };
    this.pause = () => {
      this.webgazer.pause();
      if (document.querySelector("#webgazerGazeDot")) {
        document.querySelector("#webgazerGazeDot").style.display = "none";
      }
    };
    this.resetCalibration = () => {
      this.webgazer.clearData();
    };
    this.stopMouseCalibration = () => {
      this.webgazer.removeMouseEventListeners();
    };
    this.startMouseCalibration = () => {
      this.webgazer.addMouseEventListeners();
    };
    this.calibratePoint = (x, y) => {
      this.webgazer.recordScreenPosition(x, y, "click");
    };
    this.setRegressionType = (regression_type) => {
      var valid_regression_models = ["ridge", "weightedRidge", "threadedRidge"];
      if (valid_regression_models.includes(regression_type)) {
        this.webgazer.setRegression(regression_type);
      } else {
        console.warn(
          "Invalid regression_type parameter for webgazer.setRegressionType. Valid options are ridge, weightedRidge, and threadedRidge."
        );
      }
    };
    this.getCurrentPrediction = () => {
      return this.webgazer.getCurrentPrediction();
    };
    this.onGazeUpdate = (callback) => {
      this.gazeUpdateCallbacks.push(callback);
      return () => {
        this.gazeUpdateCallbacks = this.gazeUpdateCallbacks.filter((item) => {
          return item !== callback;
        });
      };
    };
    this.handleGazeDataUpdate = (gazeData, elapsedTime) => {
      if (gazeData !== null) {
        var d = {
          x: this.round_predictions ? Math.round(gazeData.x) : gazeData.x,
          y: this.round_predictions ? Math.round(gazeData.y) : gazeData.y,
          t: gazeData.t
        };
        if (this.activeTrial) {
          d.t = Math.round(gazeData.t - this.currentTrialStart);
          this.currentTrialData.push(d);
        }
        this.currentGaze = d;
        for (var i = 0; i < this.gazeUpdateCallbacks.length; i++) {
          this.gazeUpdateCallbacks[i](d);
        }
      } else {
        this.currentGaze = null;
      }
    };
    this.mutationObserverCallback = (mutationsList, observer) => {
      for (const selector of this.currentTrialSelectors) {
        if (!this.currentTrialTargets[selector]) {
          if (this.jsPsych.getDisplayElement().querySelector(selector)) {
            var coords = this.jsPsych.getDisplayElement().querySelector(selector).getBoundingClientRect();
            this.currentTrialTargets[selector] = coords;
          }
        }
      }
    };
  }
  static {
    this.info = {
      name: "webgazer",
      version,
      data: {
        /** An array of objects containing gaze data for the trial. Each object has an `x`, a `y`, and a `t` property. The `x` and
         * `y` properties specify the gaze location in pixels and `t` specifies the time in milliseconds since the start of the trial.
         */
        webgazer_data: {
          type: jspsych.ParameterType.INT,
          array: true
        },
        /** An object contain the pixel coordinates of elements on the screen specified by the `.targets` parameter. Each key in this
         * object will be a `selector` property, containing the CSS selector string used to find the element. The object corresponding
         * to each key will contain `x` and `y` properties specifying the top-left corner of the object, `width` and `height` values,
         * plus `top`, `bottom`, `left`, and `right` parameters which specify the [bounding rectangle](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) of the element.
         */
        webgazer_targets: {
          type: jspsych.ParameterType.COMPLEX,
          nested: {
            x: {
              type: jspsych.ParameterType.INT
            },
            y: {
              type: jspsych.ParameterType.INT
            },
            width: {
              type: jspsych.ParameterType.INT
            },
            height: {
              type: jspsych.ParameterType.INT
            },
            top: {
              type: jspsych.ParameterType.INT
            },
            bottom: {
              type: jspsych.ParameterType.INT
            },
            left: {
              type: jspsych.ParameterType.INT
            },
            right: {
              type: jspsych.ParameterType.INT
            }
          }
        }
      },
      // prettier-ignore
      citations: {
        "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
        "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
      }
    };
  }
}

module.exports = WebGazerExtension;
//# sourceMappingURL=index.cjs.map
