/**
 * jspsych-ext-mousetracking
 * 
 * A jspsych extension for tracking participant's mouse cursor 
 *
 * Gustavo Juantorena  [ https://github.com/GEJ1 ]
 * 
 * based on webgazer extension by Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.extensions['mousetracking'] = (function () {

  var extension = {};

  // private state for the extension
  // extension authors can define public functions to interact
  // with the state. recommend not exposing state directly
  // so that state manipulations are checked.

  var state = {};

  extension.initialize = function (params) {

    return new Promise(function (resolve, reject) {

      state.domObserver = new MutationObserver(mutationObserverCallback);

      if (params.auto_initialize) {
        state.mousetracking.begin().then(function () {
          state.initialized = true;
          resolve();
        }).catch(function (error) {
          console.error(error);
          reject(error);
        });
      } else {
        resolve();
      }
    })
    
  }

  // required, will be called when the trial starts (before trial loads)
  extension.on_start = function (params) {
    state.currentTrialData = [];
    state.currentTrialTargets = {};
    state.currentTrialSelectors = params.targets;

    state.domObserver.observe(jsPsych.getDisplayElement(), {childList: true})
  }

  // required will be called when the trial loads
  extension.on_load = function (params) {

    // set current trial start time
    state.currentTrialStart = performance.now();

    // start data collection
    window.addEventListener('mousemove', (e) => {
      
      var x = e.x
      var y = e.y
      //timer for cursor

      let startTime_cursor = Math.round(performance.now());

      // time during mouse sampling
      let t = Math.round(startTime_cursor - state.currentTrialStart);
      state.currentTrialData.push({x, y, t})
    })

  }
  
  extension.on_finish = function (params) {

    // stop watching the DOM
    state.domObserver.disconnect();

    // send back the mouseData
    return {
      mousetracking_data: state.currentTrialData,
      mousetracking_targets: state.currentTrialTargets
    }
  }

  function mutationObserverCallback(mutationsList, observer){
    for(const selector of state.currentTrialSelectors){
      if(!state.currentTrialTargets[selector]){
        if(jsPsych.getDisplayElement().querySelector(selector)){
          var coords = jsPsych.getDisplayElement().querySelector(selector).getBoundingClientRect();
          state.currentTrialTargets[selector] = coords;
        }
      }
    }
  }

  return extension;

})();
