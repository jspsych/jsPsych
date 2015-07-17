/**
 * jspsych-button-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

(function($) {
	jsPsych["button-response"] = (function() {

		var plugin = {};

		plugin.create = function(params) {

			params = jsPsych.pluginAPI.enforceArray(params, ['stimuli', 'choices']);

			var trials = new Array(params.stimuli.length);
			for (var i = 0; i < trials.length; i++) {
				trials[i] = {};
				trials[i].a_path = params.stimuli[i];
				trials[i].choices = params.choices;
				trials[i].button_html = params.button_html || '<button>%choice%</button>';
				trials[i].response_ends_trial = (typeof params.response_ends_trial === 'undefined') ? true : params.response_ends_trial;
				// timing parameters
				trials[i].timing_stim = params.timing_stim || -1; // if -1, then show indefinitely
				trials[i].timing_response = params.timing_response || -1; // if -1, then wait for response forever
				// optional parameters
				trials[i].is_html = (typeof params.is_html === 'undefined') ? false : params.is_html;
				trials[i].prompt = (typeof params.prompt === 'undefined') ? "" : params.prompt;
			}
			return trials;
		};



		plugin.trial = function(display_element, trial) {

			// if any trial variables are functions
			// this evaluates the function and replaces
			// it with the output of the function
			trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

			// this array holds handlers from setTimeout calls
			// that need to be cleared if the trial ends early
			var setTimeoutHandlers = [];

			// display stimulus
			if (!trial.is_html) {
				display_element.append($('<img>', {
					src: trial.a_path,
					id: 'jspsych-button-response-stimulus'
				}));
			} else {
				display_element.append($('<div>', {
					html: trial.a_path,
					id: 'jspsych-button-response-stimulus'
				}));
			}

			//display buttons
			var buttons = [];
			if(Array.isArray(trial.button_html)){
				if(trial.button_html.length == trial.choices.length){
					buttons = trial.button_html;
				} else {
					console.error('Error in button-response plugin. The length of the button_html array does not equal the length of the choices array');
				}
			} else {
				for(var i=0;i < trial.choices.length; i++){
					buttons.push(trial.button_html);
				}
			}
			for(var i=0; i<trial.choices.length; i++){
				var str = trial.button_html[i].replace('%choice%', trial.choice[i]);
				display_element.append($(str, {
					id: 'jspsych-button-response-button-'+i,
					class: 'jspsych-button-response-button'
				}));
			}

			//show prompt if there is one
			if (trial.prompt !== "") {
				display_element.append(trial.prompt);
			}

			// store response
			var response = {rt: -1, button: -1};

			// function to end trial when it is time
			var end_trial = function() {

				// kill any remaining setTimeout handlers
				for (var i = 0; i < setTimeoutHandlers.length; i++) {
					clearTimeout(setTimeoutHandlers[i]);
				}

				// kill keyboard listeners
				if(typeof keyboardListener !== 'undefined'){
					jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
				}

				// gather the data to store for the trial
				var trial_data = {
					"rt": response.rt,
					"stimulus": trial.a_path,
					"key_press": response.key
				};

				jsPsych.data.write(trial_data);

				// clear the display
				display_element.html('');

				// move on to the next trial
				jsPsych.finishTrial();
			};

			// function to handle responses by the subject
			var after_response = function(info) {

				// after a valid response, the stimulus will have the CSS class 'responded'
				// which can be used to provide visual feedback that a response was recorded
				$("#jspsych-button-response-stimulus").addClass('responded');

				// only record the first response
				if(response.button == -1){
					response = info;
				}

				if (trial.response_ends_trial) {
					end_trial();
				}
			};

			// hide image if timing is set
			if (trial.timing_stim > 0) {
				var t1 = setTimeout(function() {
					$('#jspsych-button-response-stimulus').css('visibility', 'hidden');
				}, trial.timing_stim);
				setTimeoutHandlers.push(t1);
			}

			// end trial if time limit is set
			if (trial.timing_response > 0) {
				var t2 = setTimeout(function() {
					end_trial();
				}, trial.timing_response);
				setTimeoutHandlers.push(t2);
			}

		};

		return plugin;
	})();
})(jQuery);
