/** 
 * jspsych-call-function
 * plugin for calling an arbitrary function during a jspsych experiment
 * Josh de Leeuw
 * 
 * documentation: https://github.com/jodeleeuw/jsPsych/wiki/jspsych-call-function
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
            
            jsPsych.data.write($.extend({},{
                value: return_val
            },trial.data));
            

            jsPsych.finishTrial();
        };

        return plugin;
    })();
})(jQuery);
