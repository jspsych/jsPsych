/**
 * Josh de Leeuw
 * November 2013
 * 
 * This is a basic template for a jsPsych plugin. Use it to start creating your
 * own plugin. There is more information about how to create a plugin on the
 * jsPsych wiki (https://github.com/jodeleeuw/jsPsych/wiki/Create-a-Plugin).
 * 
 * 
 */
 
(function( $ ) {
	jsPsych["PLUGIN-NAME"] = (function(){

		var plugin = {};

		plugin.create = function(params) {
			var trials = new Array(NUMBER_OF_TRIALS);
			for(var i = 0; i < NUMBER_OF_TRIALS; i++)
			{
				trials[i] = {};
				trials[i].type = "PLUGIN-NAME";
                // other information needed for the trial method can be added here
                
                // supporting the generic data object with the following line
                // is always a good idea. it allows people to pass in the data
                // parameter, but if they don't it gracefully adds an empty object
                // in it's place.
                trials[i].data = (typeof params.data === 'undefined') ? {} : params.data[i];
			}
			return trials;
		};

		plugin.trial = function(display_element, block, trial, part) {
			// code for running the trial goes here
			
			// allow variables as functions
			// this allows any trial variable to be specified as a function
			// that will be evaluated when the trial runs. this allows users
			// to dynamically adjust the contents of a trial as a result
			// of other trials, among other uses. you can leave this out,
			// but in general it should be included
            trial = jsPsych.evaluateFunctionParameters(trial);
			
			// data saving
			// this is technically optional, but virtually every plugin will
			// need to do it. it is good practice to include the type and 
			// trial_index fields for all plugins.
			var trial_data = {
			    type: trial.type,
			    trial_index: block.trial_idx,
			    // other values to save go here
			};
			
			// this line merges together the trial_data object and the generic
			// data object (trial.data), and then stores them.
			block.writeData($.extend({}, trial_data, trial.data));
			
			// this method must be called at the end of the trial
			block.next();
		};

		return plugin;
	})();
}) (jQuery);