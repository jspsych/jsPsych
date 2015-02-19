/**
 * jspsych plugin for categorization trials with feedback
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 **/

(function($) {
	jsPsych.categorize = (function() {

		var plugin = {};

		plugin.create = function(params) {

			params = jsPsych.pluginAPI.enforceArray(params, ['choices', 'stimuli', 'key_answer', 'text_answer', 'data']);

			var trials = [];
			for (var i = 0; i < params.stimuli.length; i++) {
				trials.push({});
				trials[i].a_path = params.stimuli[i];
				trials[i].key_answer = params.key_answer[i];
				trials[i].text_answer = (typeof params.text_answer === 'undefined') ? "" : params.text_answer[i];
				trials[i].choices = params.choices;
				trials[i].correct_text = (typeof params.correct_text === 'undefined') ? "<p class='feedback'>Correct</p>" : params.correct_text;
				trials[i].incorrect_text = (typeof params.incorrect_text === 'undefined') ? "<p class='feedback'>Incorrect</p>" : params.incorrect_text;
				// timing params
				trials[i].timing_stim = params.timing_stim || -1; // default is to show image until response
				trials[i].timing_feedback_duration = params.timing_feedback_duration || 2000;
				// optional params
				trials[i].show_stim_with_feedback = (typeof params.show_stim_with_feedback === 'undefined') ? true : params.show_stim_with_feedback;
				trials[i].is_html = (typeof params.is_html === 'undefined') ? false : params.is_html;
				trials[i].force_correct_button_press = (typeof params.force_correct_button_press === 'undefined') ? false : params.force_correct_button_press;
				trials[i].prompt = (typeof params.prompt === 'undefined') ? '' : params.prompt;
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

			if (!trial.is_html) {
				// add image to display
				display_element.append($('<img>', {
					"src": trial.a_path,
					"class": 'jspsych-categorize-stimulus',
					"id": 'jspsych-categorize-stimulus'
				}));
			} else {
				display_element.append($('<div>', {
					"id": 'jspsych-categorize-stimulus',
					"class": 'jspsych-categorize-stimulus',
					"html": trial.a_path
				}));
			}

			// hide image after time if the timing parameter is set
			if (trial.timing_stim > 0) {
				setTimeoutHandlers.push(setTimeout(function() {
					$('#jspsych-categorize-stimulus').css('visibility', 'hidden');
				}, trial.timing_stim));
			}

			// if prompt is set, show prompt
			if (trial.prompt !== "") {
				display_element.append(trial.prompt);
			}

			// create response function
			var after_response = function(info) {

				// kill any remaining setTimeout handlers
				for (var i = 0; i < setTimeoutHandlers.length; i++) {
					clearTimeout(setTimeoutHandlers[i]);
				}

				var correct = false;
				if (trial.key_answer == info.key) {
					correct = true;
				}

				// save data
				var trial_data = {
					"rt": info.rt,
					"correct": correct,
					"stimulus": trial.a_path,
					"key_press": info.key
				};

				jsPsych.data.write($.extend({}, trial_data, trial.data));

				display_element.html('');

				doFeedback(correct);
			}

			jsPsych.pluginAPI.getKeyboardResponse(after_response, trial.choices, 'date', false);



			function doFeedback(correct) {
				// show image during feedback if flag is set
				if (trial.show_stim_with_feedback) {
					if (!trial.is_html) {
						// add image to display
						display_element.append($('<img>', {
							"src": trial.a_path,
							"class": 'jspsych-categorize-stimulus',
							"id": 'jspsych-categorize-stimulus'
						}));
					} else {
						display_element.append($('<div>', {
							"id": 'jspsych-categorize-stimulus',
							"class": 'jspsych-categorize-stimulus',
							"html": trial.a_path
						}));
					}
				}

				// substitute answer in feedback string.
				var atext = "";
				if (correct) {
					atext = trial.correct_text.replace("%ANS%", trial.text_answer);
				} else {
					atext = trial.incorrect_text.replace("%ANS%", trial.text_answer);
				}

				// show the feedback
				display_element.append(atext);

				// check if force correct button press is set
				if (trial.force_correct_button_press && correct === false) {

					var after_forced_response = function(info) {
						endTrial();
					}

					jsPsych.pluginAPI.getKeyboardResponse(after_forced_response, trial.key_answer, 'date', false);

				} else {
					setTimeout(function() {
						endTrial();
					}, trial.timing_feedback_duration);
				}

			}

			function endTrial() {
				display_element.html("");
				if (trial.timing_post_trial > 0) {
					setTimeout(function() {
						jsPsych.finishTrial();
					}, trial.timing_post_trial);
				} else {
					jsPsych.finishTrial();
				}
			}

		};

		return plugin;
	})();
})(jQuery);
