/*
 * Example plugin template
 */

jsPsych.plugins["PLUGIN-NAME"] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    // set default values for parameters
    trial.parameter = trial.parameter || 'default value';

    // data saving
    var trial_data = {
      parameter_name: 'parameter value'
    };

    // end trial
    jsPsych.finishTrial(trial_data);
  };

  return plugin;
})();
