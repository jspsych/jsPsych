/**
 * jspsych-single-audio
 * Josh de Leeuw
 *
 * plugin for playing an audio file and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

(function($) {
	jsPsych["single-audio"] = (function() {

		var plugin = {};

		var context = new AudioContext();

		plugin.create = function(params) {

			//params = jsPsych.pluginAPI.enforceArray(params, ['stimuli', 'choices', 'data']);

			var trials = new Array(params.stimuli.length);

			for (var i = 0; i < trials.length; i++) {

				trials[i] = {};

				// load sound files
				var request = new XMLHttpRequest();
				request.open('GET',params.stimuli[i],true);
				request.responseType = 'arraybuffer';
				request.onload = function(){
					context.decodeAudioData(request.response, function(buffer){
						sndBuffer = buffer;
						loaded();
					}, function(){
						// on error
						console.error('Unable to load sound file. Check path and make sure that the script is running on the same server as the hosted sound file.');
					});
				}
				request.send();

				trials[i].audio_stim = params.stimuli[i];
				trials[i].choices = params.choices || [];
				// option to show image for fixed time interval, ignoring key responses
				//      true = image will keep displaying after response
				//      false = trial will immediately advance when response is recorded
				trials[i].continue_after_response = (typeof params.continue_after_response === 'undefined') ? true : params.continue_after_response;
				// timing parameters
				// trials[i].timing_stim = params.timing_stim || -1; // if -1, then show indefinitely
				trials[i].timing_response = params.timing_response || -1; // if -1, then wait for response forever
				trials[i].prompt = (typeof params.prompt === 'undefined') ? "" : params.prompt;
			}
			return trials;
		};

		plugin.trial = function(display_element, trial) {

			// if any trial variables are functions
			// this evaluates the function and replaces
			// it with the output of the function
			trial = jsPsych.pluginAPI.normalizeTrialVariables(trial);

			// this array holds handlers from setTimeout calls
			// that need to be cleared if the trial ends early
			var setTimeoutHandlers = [];

			// play stimulus
			var source = context.createBufferSource();
			source.buffer = trial.audio_stim;
			source.connect(context.destination);
			startTime = context.currentTime + 0.1;
			source.start(startTime);

			// show prompt if there is one
			if (trial.prompt !== "") {
				display_element.append(trial.prompt);
			}

			// store response
			var response = {rt: -1, key: -1};

			// function to end trial when it is time
			var end_trial = function() {

				// kill any remaining setTimeout handlers
				for (var i = 0; i < setTimeoutHandlers.length; i++) {
					clearTimeout(setTimeoutHandlers[i]);
				}

				// kill keyboard listeners
				jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);

				// gather the data to store for the trial
				var trial_data = {
					"rt": response.rt,
					"stimulus": trial.a_path,
					"key_press": response.key
				};

				jsPsych.data.write($.extend({}, trial_data, trial.data));

				// clear the display
				display_element.html('');

				// move on to the next trial
				if (trial.timing_post_trial > 0) {
					setTimeout(function() {
						jsPsych.finishTrial();
					}, trial.timing_post_trial);
				} else {
					jsPsych.finishTrial();
				}
			};

			// function to handle responses by the subject
			var after_response = function(info) {

				// only record the first response
				if(response.key == -1){
					response = info;
				}

				if (trial.continue_after_response) {
					end_trial();
				}
			};

			// start the response listener
			var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse(after_response, trial.choices);

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
