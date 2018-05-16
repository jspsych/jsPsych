/**
 * jspsych-call-function
 * plugin for calling an arbitrary function during a jspsych experiment
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins['call-function'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'call-function',
    description: '',
    parameters: {
      func: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: 'Function',
        default: undefined,
        description: 'Function to call'
      },
    }
  }

  plugin.trial = function(display_element, trial) {
    trial.post_trial_gap = 0;
    var return_val = trial.func();

    var trial_data = {
      value: return_val
    };

    jsPsych.finishTrial(trial_data);
  };

  return plugin;
})();
