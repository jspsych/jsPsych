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
        type: [jsPsych.plugins.parameterType.FUNCTION],
        default: undefined,
        no_function: false,
        description: ''
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // a rare case where we override the default experiment level
    // value of this parameter, since this plugin should be invisible
    // to the subject of the experiment
    trial.timing_post_trial = typeof trial.timing_post_trial == 'undefined' ? 0 : trial.timing_post_trial

    var return_val = trial.func();

    var trial_data = {
      value: return_val
    };

    jsPsych.finishTrial(trial_data);
  };

  return plugin;
})();
