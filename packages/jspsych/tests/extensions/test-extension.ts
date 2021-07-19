const extension = <any>{};

// private state for the extension
// extension authors can define public functions to interact
// with the state. recommend not exposing state directly
// so that state manipulations are checked.
var state = {};

// required, will be called at jsPsych.init
// should return a Promise
extension.initialize = (params) => {
  return new Promise<void>((resolve, reject) => {
    resolve();
  });
};

// required, will be called when the trial starts (before trial loads)
extension.on_start = (params) => {};

// required will be called when the trial loads
extension.on_load = (params) => {};

// required, will be called when jsPsych.finishTrial() is called
// must return data object to be merged into data.
extension.on_finish = (params) => {
  // send back data
  return {
    extension_data: true,
  };
};

export default extension;
