/**
 * jspsych-call-function
 * plugin for calling an arbitrary function during a jspsych experiment
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 **/

(function($) {
  jsPsych['call-function'] = (function() {

    var plugin = {};

    plugin.create = function(params) {
      var trials = new Array(1);
      trials[0] = {
        "func": params.func
      };
      return trials;
    };

    plugin.trial = function(display_element, trial) {
      var return_val = trial.func();

      jsPsych.data.write({
        value: return_val
      });


      jsPsych.finishTrial();
    };

    return plugin;
  })();
})(jQuery);
