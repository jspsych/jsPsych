/** July 2012. Josh de Leeuw

	This plugin gives the user the ability to execute an arbitrary function
	during an experiment. It can be used to save data in the middle of an
	experiment, for example.
	
	Params:
		"type" is "call_function"
		"func" is the function that will be called
		"args" is an array of arguments to pass to the function. (optional)
	
	Data:
		The return value of the function will be stored in the data.
**/

(function( $ ) {
	jsPsych.call_function = (function(){
	
		var plugin = {};
		
		plugin.create = function(params) {
			var trials = new Array(1);
			trials[0] = {
				"type": "call_function",
				"func": params["func"],
				"args": params["args"] || []
			}
			return trials;
		}
		
		plugin.trial = function($this, block, trial, part)
		{
			block.data[block.trial_idx] = trial.func.apply({}, trial.args);
			
			block.next();
		}
	
	
		return plugin;
	})();
})(jQuery);