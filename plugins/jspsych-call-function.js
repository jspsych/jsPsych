/** 
 * Josh de Leeuw
 * Updated October 2013

	This plugin gives the user the ability to execute an arbitrary function
	during an experiment.
	
	Params:
		"type" is "call_function"
		"func" is the function that will be called
		"args" is an array of arguments to pass to the function. (optional)
	
	Data:
		The return value of the function will be stored in the data.
**/

(function($) {
    jsPsych['call-function'] = (function() {

        var plugin = {};

        plugin.create = function(params) {
            var trials = new Array(1);
            trials[0] = {
                "type": "call-function",
                "func": params.func,
                "args": params.args || [],
                "data": (typeof params.data === 'undefined') ? {} : params.data
            };
            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {
            var return_val = trial.func.apply({}, [trial.args]);
            if (typeof return_val !== 'undefined') {
                block.writeData($.extend({},{
                    trial_type: "call-function",
                    trial_index: block.trial_idx,
                    value: return_val
                },trial.data));
            }

            block.next();
        };

        return plugin;
    })();
})(jQuery);