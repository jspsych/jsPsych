jsPsych.extensions['test'] = (function () {

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
        resolve();
      });      
    }
  
    // required, will be called when the trial starts (before trial loads)
    extension.on_start = function (params) {

    }
  
    // required will be called when the trial loads
    extension.on_load = function (params) {
  
    }
  
    // required, will be called when jsPsych.finishTrial() is called
    // must return data object to be merged into data.
    extension.on_finish = function (params) {
      // send back data
      return {
        extension_data: true
      }
    }
  
    return extension;
  
  })();
  
  