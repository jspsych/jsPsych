jsPsych.extensions['webgazer'] = (function () {

  var extension = {};

  // private state for the extension
  // extension authors can define public functions to interact
  // with the state. recommend not exposing state directly
  // so that state manipulations are checked.
  var state = {};

  // required, will be called at jsPsych.init
  // should return a Promise
  extension.initialize = function (params) {
    return new Promise(function(resolve, reject){
      if (typeof params.webgazer === 'undefined') {
        if (window.webgazer) {
          state.webgazer = window.webgazer;
        } else {
          reject(new Error('webgazer extension failed to initialize. webgazer.js not loaded. Load webgazer.js before calling jsPsych.init()'));
        }
      } else {
        state.webgazer = params.webgazer;
      }

      if (typeof params.round_predictions === 'undefined'){
        state.round_predictions = true;
      } else {
        state.round_predictions = params.round_predictions;
      }
  
      // sets up event handler for webgazer data
      state.webgazer.setGazeListener(handleGazeDataUpdate);
  
      // starts webgazer, and once it initializes we stop mouseCalibration and
      // pause webgazer data.
      state.webgazer.begin().then(function () {
        extension.stopMouseCalibration();
        extension.pause();
        resolve();
      })
  
      // hide video by default
      extension.hideVideo();
  
      // hide predictions by default
      extension.hidePredictions();
    })
  }

  // required, will be called when the trial starts (before trial loads)
  extension.on_start = function (params) {
    state.currentTrialData = [];
    state.currentTrialTargets = [];
  }

  // required will be called when the trial loads
  extension.on_load = function (params) {

    // set current trial start time
    state.currentTrialStart = performance.now();

    // resume data collection
    state.webgazer.resume();

    // set internal flag
    state.activeTrial = true;

    // record bounding box of any elements in params.targets
    if(typeof params !== 'undefined'){
      if(typeof params.targets !== 'undefined'){
        for(var i=0; i<params.targets.length; i++){
          var target = document.querySelector(params.targets[i]);
          if(target !== null){
            var bounding_rect = target.getBoundingClientRect();
            state.currentTrialTargets.push({
              selector: params.targets[i],
              top: bounding_rect.top,
              bottom: bounding_rect.bottom,
              left: bounding_rect.left,
              right: bounding_rect.right
            })
          }
        }
      }
    }
  }

  // required, will be called when jsPsych.finishTrial() is called
  // must return data object to be merged into data.
  extension.on_finish = function (params) {
    // pause the eye tracker
    state.webgazer.pause();

    // set internal flag
    state.activeTrial = false;

    // send back the gazeData
    return {
      webgazer_data: state.currentTrialData,
      webgazer_targets: state.currentTrialTargets
    }
  }

  extension.faceDetected = function () {
    return state.webgazer.getTracker().predictionReady;
  }

  extension.showPredictions = function () {
    state.webgazer.showPredictionPoints(true);
  }

  extension.hidePredictions = function () {
    state.webgazer.showPredictionPoints(false);
  }

  extension.showVideo = function () {
    state.webgazer.showVideo(true);
    state.webgazer.showFaceOverlay(true);
    state.webgazer.showFaceFeedbackBox(true);
  }

  extension.hideVideo = function () {
    state.webgazer.showVideo(false);
    state.webgazer.showFaceOverlay(false);
    state.webgazer.showFaceFeedbackBox(false);
  }

  extension.resume = function () {
    state.webgazer.resume();
  }

  extension.pause = function () {
    state.webgazer.pause();
  }

  extension.stopMouseCalibration = function () {
    state.webgazer.removeMouseEventListeners()
  }

  extension.startMouseCalibration = function () {
    state.webgazer.addMouseEventListeners()
  }

  extension.calibratePoint = function (x, y) {
    state.webgazer.recordScreenPosition(x, y, 'click');
  }

  extension.setRegressionType = function (regression_type) {
    var valid_regression_models = ['ridge', 'weigthedRidge', 'threadedRidge'];
    if (valid_regression_models.includes(regression_type)) {
      state.webgazer.setRegression(regression_type)
    } else {
      console.warn('Invalid regression_type parameter for webgazer.setRegressionType. Valid options are ridge, weightedRidge, and threadedRidge.')
    }
  }

  extension.getCurrentPrediction = async function () {
    var prediction = await state.webgazer.getCurrentPrediction();
    if(state.round_predictions){
      prediction.x = Math.round(prediction.x);
      prediction.y = Math.round(prediction.y);
    }
    return prediction;
  }

  // extension.addGazeDataUpdateListener(listener){
  //   state.webgazer.setGazeListener(listener);
  // }

  function handleGazeDataUpdate(gazeData, elapsedTime) {
    if (gazeData !== null && state.activeTrial) {
      var d = {
        x: state.round_predictions ? Math.round(gazeData.x) : gazeData.x,
        y: state.round_predictions ? Math.round(gazeData.y) : gazeData.y,
        t: Math.round(performance.now() - state.currentTrialStart)
      }
      state.currentTrialData.push(d); // add data to current trial's data
    }

  }

  return extension;

})();

