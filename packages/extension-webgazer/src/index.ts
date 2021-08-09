import { JsPsych, JsPsychExtension, JsPsychExtensionParameters } from "jspsych";

// we have to add webgazer to the global window object because webgazer attaches itself to
// the window when it loads
declare global {
  interface Window { webgazer: any; }
}

interface InitializeParameters extends JsPsychExtensionParameters {
  round_predictions: boolean;
  auto_initialize: boolean;
  sampling_interval: number;
  webgazer: any;
}

interface OnStartParameters extends JsPsychExtensionParameters {
  targets: Array<string>;
}

class WebGazerExtension implements JsPsychExtension {

  constructor(private jsPsych: JsPsych) { }

  // private state for the extension
  // extension authors can define public functions to interact
  // with the state. recommend not exposing state directly
  // so that state manipulations are checked.
  private currentTrialData = [];
  private currentTrialTargets = {};
  private currentTrialSelectors:Array<string>;
  private domObserver:MutationObserver;
  private webgazer;
  private initialized:boolean = false;
  private currentTrialStart:number;
  private activeTrial:boolean = false;
  private sampling_interval:number;
  private round_predictions:boolean;
  private gazeInterval:number;
  private gazeUpdateCallbacks:Array<any>;
  private currentGaze:Object;

  // required, will be called at jsPsych.init
  // should return a Promise
  initialize({ round_predictions = true, auto_initialize = false, sampling_interval = 34, webgazer }: InitializeParameters): Promise<void> {

    // set initial state of the extension
    this.round_predictions = round_predictions;
    this.sampling_interval = sampling_interval;
    this.initialized = false;
    this.activeTrial = false;
    this.gazeUpdateCallbacks = [];
    this.domObserver = new MutationObserver(this.mutationObserverCallback);

    return new Promise((resolve, reject) => {
      if (typeof webgazer === 'undefined') {
        if (window.webgazer) {
          this.webgazer = window.webgazer;
        } else {
          reject(new Error('Webgazer extension failed to initialize. webgazer.js not loaded. Load webgazer.js before calling jsPsych.init()'));
        }
      } else {
        this.webgazer = webgazer;
      }

      // sets up event handler for webgazer data
      this.webgazer.setGazeListener(this.handleGazeDataUpdate);

      // default to threadedRidge regression
      // NEVER MIND... kalman filter is too useful.
      //state.webgazer.workerScriptURL = 'js/webgazer/ridgeWorker.mjs';
      //state.webgazer.setRegression('threadedRidge');
      //state.webgazer.applyKalmanFilter(false); // kalman filter doesn't seem to work yet with threadedridge.

      
      // hide video by default
      this.hideVideo();

      // hide predictions by default
      this.hidePredictions();

      if (auto_initialize) {
        // starts webgazer, and once it initializes we stop mouseCalibration and
        // pause webgazer data.
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
    })
  }

  // required, will be called when the trial starts (before trial loads)
  on_start(params: OnStartParameters): void {
    this.currentTrialData = [];
    this.currentTrialTargets = {};
    this.currentTrialSelectors = params.targets;

    this.domObserver.observe(this.jsPsych.getDisplayElement(), { childList: true })
  }

  // required will be called when the trial loads
  on_load() {

    // set current trial start time
    this.currentTrialStart = performance.now();

    // resume data collection
    // state.webgazer.resume();

    this.startSampleInterval();

    // set internal flag
    this.activeTrial = true;
  }

  // required, will be called when jsPsych.finishTrial() is called
  // must return data object to be merged into data.
  on_finish() {

    // pause the eye tracker
    this.stopSampleInterval();

    // stop watching the DOM
    this.domObserver.disconnect();

    // state.webgazer.pause();

    // set internal flag
    this.activeTrial = false;

    // send back the gazeData
    return {
      webgazer_data: this.currentTrialData,
      webgazer_targets: this.currentTrialTargets
    }
  }

  start() {

    return new Promise<void>(function (resolve, reject) {
      if (typeof this.webgazer == 'undefined') {
        const error = 'Failed to start webgazer. Things to check: Is webgazer.js loaded? Is the webgazer extension included in jsPsych.init?'
        console.error(error)
        reject(error)
      }
      this.webgazer.begin().then(function () {
        this.initialized = true;
        this.stopMouseCalibration();
        this.pause();
        resolve();
      }).catch(function (error) {
        console.error(error);
        reject(error);
      });
    });
  }

  startSampleInterval(interval: number = this.sampling_interval) {
    this.gazeInterval = setInterval(() => {
      this.webgazer.getCurrentPrediction().then(this.handleGazeDataUpdate);
    }, interval);
    // repeat the call here so that we get one immediate execution. above will not
    // start until state.sampling_interval is reached the first time.
    this.webgazer.getCurrentPrediction().then(this.handleGazeDataUpdate);
  }

  stopSampleInterval() {
    clearInterval(this.gazeInterval);
  }

  isInitialized() {
    return this.initialized;
  }

  faceDetected() {
    return this.webgazer.getTracker().predictionReady;
  }

  showPredictions() {
    this.webgazer.showPredictionPoints(true);
  }

  hidePredictions() {
    this.webgazer.showPredictionPoints(false);
  }

  showVideo() {
    this.webgazer.showVideo(true);
    this.webgazer.showFaceOverlay(true);
    this.webgazer.showFaceFeedbackBox(true);
  }

  hideVideo() {
    this.webgazer.showVideo(false);
    this.webgazer.showFaceOverlay(false);
    this.webgazer.showFaceFeedbackBox(false);
  }

  resume() {
    this.webgazer.resume();
  }

  pause() {
    this.webgazer.pause();
    // sometimes gaze dot will show and freeze after pause?
    if (document.querySelector('#webgazerGazeDot')) {
      document.querySelector<HTMLElement>('#webgazerGazeDot').style.display = 'none';
    }
  }

  resetCalibration() {
    this.webgazer.clearData();
  }

  stopMouseCalibration() {
    this.webgazer.removeMouseEventListeners()
  }

  startMouseCalibration() {
    this.webgazer.addMouseEventListeners()
  }

  calibratePoint(x: number, y: number) {
    this.webgazer.recordScreenPosition(x, y, 'click');
  }

  setRegressionType = (regression_type) => {
    var valid_regression_models = ['ridge', 'weightedRidge', 'threadedRidge'];
    if (valid_regression_models.includes(regression_type)) {
      this.webgazer.setRegression(regression_type)
    } else {
      console.warn('Invalid regression_type parameter for webgazer.setRegressionType. Valid options are ridge, weightedRidge, and threadedRidge.')
    }
  }

  getCurrentPrediction() {
    return this.webgazer.getCurrentPrediction();
  }

  onGazeUpdate(callback) {
    this.gazeUpdateCallbacks.push(callback);
    return () => {
      this.gazeUpdateCallbacks = this.gazeUpdateCallbacks.filter((item) => {
        return item !== callback;
      });
    }
  }

  private handleGazeDataUpdate(gazeData, elapsedTime) {
    if (gazeData !== null) {
      var d = {
        x: this.round_predictions ? Math.round(gazeData.x) : gazeData.x,
        y: this.round_predictions ? Math.round(gazeData.y) : gazeData.y,
        t: gazeData.t
      }
      if (this.activeTrial) {
        //console.log(`handleUpdate: t = ${Math.round(gazeData.t)}, now = ${Math.round(performance.now())}`);
        d.t = Math.round(gazeData.t - this.currentTrialStart)
        this.currentTrialData.push(d); // add data to current trial's data
      }
      this.currentGaze = d;
      for (var i = 0; i < this.gazeUpdateCallbacks.length; i++) {
        this.gazeUpdateCallbacks[i](d);
      }
    } else {
      this.currentGaze = null;
    }
  }

  private mutationObserverCallback(mutationsList, observer) {
    for (const selector of this.currentTrialSelectors) {
      if (!this.currentTrialTargets[selector]) {
        if (this.jsPsych.getDisplayElement().querySelector(selector)) {
          var coords = this.jsPsych.getDisplayElement().querySelector(selector).getBoundingClientRect();
          this.currentTrialTargets[selector] = coords;
        }
      }
    }
  }

}

export default WebGazerExtension;
