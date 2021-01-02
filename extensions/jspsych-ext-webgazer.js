jsPsych.extensions['webgazer'] = (function () {

  var extension = {};

  // state object is meant to be mutable in whatever way
  // plugin authors desire. allows for things like a calibration
  // routine in eye tracking that alters extension state beyond
  // single trial
  extension.state = {};

  // required, will be called at jsPsych.init
  extension.initialize = function (params) {
    if(typeof params.webgazer === 'undefined'){
      if(window.webgazer){
        extension.state.webgazer = window.webgazer;
      } else {
        console.error('WebGazer library not detected. Load webgazer.js before initializing experiment.');
      }
    } else {
      extension.state.webgazer = params.webgazer;
    }
    
    // starts webgazer
    extension.state.webgazer.begin();

    // immediately pauses data gathering
    extension.state.webgazer.pause();
  }

  // required, will be called when the trial starts (before trial loads)
  extension.on_start = function () {

  }

  // required will be called when the trial loads
  extension.on_load = function() {

  }

  // required, will be called when jsPsych.finishTrial() is called
  // must return data object to be merged into data.
  extension.on_finish = function () {

  }

  return extension;

})();

