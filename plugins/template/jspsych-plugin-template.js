/*
 * Example plugin template
 */

jsPsych.plugins["PLUGIN-NAME"] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    // set default values for parameters
    trial.parameter = trial.parameter || 'default value';

    // allow variables as functions
    // this allows any trial variable to be specified as a function
    // that will be evaluated when the trial runs. this allows users
    // to dynamically adjust the contents of a trial as a result
    // of other trials, among other uses. you can leave this out,
    // but in general it should be included
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // data saving
    var trial_data = {
      parameter_name: 'parameter value'
    };

    // end trial
    jsPsych.finishTrial(trial_data);
  };

  return plugin;
})();
