jsPsych.extensions['webgazer'] = (function () {

  var extension = {};

  // private state for the extension
  // extension authors can define public functions to interact
  // with the state. recommend not exposing state directly
  // so that state manipulations are checked.
  var state = {};

  // required, will be called at jsPsych.init
  extension.initialize = function (params) {
    if(typeof params.webgazer === 'undefined'){
      if(window.webgazer){
        state.webgazer = window.webgazer;
      } else {
        console.error('WebGazer library not detected. Load webgazer.js before initializing experiment.');
      }
    } else {
      state.webgazer = params.webgazer;
    }

    // sets up event handler for webgazer data
    state.webgazer.setGazeListener(handleGazeDataUpdate);

    // hide video by default
    state.webgazer.showVideo(false);

    // hide predictions by default
    state.webgazer.showPredictionPoints(false);

    // starts webgazer
    state.webgazer.begin();

    // immediately pauses data gathering
    state.webgazer.pause();
  }

  // required, will be called when the trial starts (before trial loads)
  extension.on_start = function () {
    state.currentTrialData = [];
  }

  // required will be called when the trial loads
  extension.on_load = function() {

    // set current trial start time
    state.currentTrialStart = performance.now();

    // resume data collection
    state.webgazer.resume();

  }

  // required, will be called when jsPsych.finishTrial() is called
  // must return data object to be merged into data.
  extension.on_finish = function () {
    return {
      gazeData: JSON.stringify(state.currentTrialData);
    }
  }

  function handleGazeDataUpdate(gazeData, elapsedTime){
    gazeData.t = performance.now() - state.currentTrialStart; // add a timestamp to the x,y coords

    state.currentTrialData.push(gazeData); // add data to current trial's data
  }

  return extension;

})();

