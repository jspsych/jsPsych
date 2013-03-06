/* jspsych plugin for categorization trials with feedback
 * Josh de Leeuw
 * 
 * display an image and then give corrective feedback based on the subject's response
 *
 * updated March 2013
 */
(function( $ ) {
	jsPsych.categorize_feedback = (function(){
	
		var plugin = {};
	
		plugin.create = function(params) {
			trials = [];
			for(var i = 0; i < params["stimuli"].length; i++)
			{
				trials.push({});
				trials[i]["type"] = "categorize_feedback";
				trials[i]["a_path"] = params["stimuli"][i];
				trials[i]["key_answer"] = params["key_answer"][i];
				trials[i]["text_answer"] = params["text_answer"][i];
				trials[i]["choices"] = params["choices"];
				trials[i]["correct_text"] = params["correct_text"];
				trials[i]["incorrect_text"] = params["incorrect_text"];
				// timing params
				trials[i]["timing_image"] = params["timing_image"] || -1; // default is to show image until response
				trials[i]["timing_feedback_duration"] = params["timing_feedback_duration"] || 2000; 
				trials[i]["timing_post_trial"] = params["timing_post_trial"] || 1000;
				// optional params
				trials[i]["show_stim_with_feedback"] = params["show_stim_with_feedback"] || true;
				if(params["force_correct_button_press"] != undefined) {
					trials[i]["force_correct_button_press"] = params["force_correct_button_press"];
				} else {
					trials[i]["force_correct_button_press"] = false;
				}
				if(params["prompt"] != undefined){
					trials[i]["prompt"] = params["prompt"];
				}
				if(params["data"]!=undefined){
					trials[i]["data"] = params["data"][i];
				}
			}
			return trials;
		}

		var cf_trial_complete = false;
		
		plugin.trial = function(display_element, block, trial, part)
		{
			switch(part){
				case 1:
					// set finish flag
					cf_trial_complete = false;
					
					// add image to display
					display_element.append($('<img>', {
						"src": trial.a_path,
						"class": 'cf',
						"id": 'jspsych_cf_image'
					}));
					
					// hide image after time if the timing parameter is set
					if(trial.timing_image > 0)
					{
						setTimeout(function(){
							if(!cf_trial_complete) {
								$('#jspsych_cf_image').css('visibility', 'hidden');
							}
						}, trial.timing_image);
					}
					
					// if prompt is set, show prompt
					if(trial.prompt)
					{
						display_element.append(trial.prompt);
					}
					
					// start measuring RT
					startTime = (new Date()).getTime();
					
					// create response function
					var resp_func = function(e) {
						var flag = false;
						var correct = false;
						if(e.which==trial.key_answer) // correct category
						{
							flag = true;
							correct = true;
						} 
						else
						{
							// check if the key is any of the options, or if it is an accidental keystroke
							for(var i=0;i<trial.choices.length;i++)
							{
								if(e.which==trial.choices[i])
								{ 
									flag = true;
									correct = false;
								}
							}
						}
						if(flag)
						{
							cf_trial_complete = true;
							
							// measure response time
							endTime = (new Date()).getTime();
							rt = (endTime-startTime);
							
							// save data
							var trial_data = {"trial_type": "categorize_feedback", "trial_index": block.trial_idx, "rt": rt, "correct": correct, "a_path": trial.a_path, "key_press": e.which}
							block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
							
							// clear function
							$(document).unbind('keyup',resp_func);
							display_element.html('');
							plugin.trial(display_element, block, trial, part + 1);
						}
					}
					
					// add event listener
					$(document).keyup(resp_func);
					break;
					
				case 2:
					// show image during feedback if flag is set
					if(trial.show_stim_with_feedback)
					{
						display_element.append($('<img>', {
							"src": trial.a_path,
							"class": 'cf'
						}));
					}
					
					// substitute answer in feedback string.
					var atext = "";
					if(block.data[block.trial_idx]["correct"])
					{
						atext = trial.correct_text.replace("&ANS&", trial.text_answer);
					} else {
						atext = trial.incorrect_text.replace("&ANS&", trial.text_answer);
					}
					
					// show the feedback
					display_element.append(atext);
					
					// check if force correct button press is set
					if(trial.force_correct_button_press && block.data[block.trial_idx].correct == false)
					{
						var resp_func_corr_key = function(e) {
							if(e.which==trial.key_answer) // correct category
							{
								$(document).unbind('keyup',resp_func_corr_key);
								plugin.trial(display_element, block, trial, part + 1);
							}
						}
						$(document).keyup(resp_func_corr_key);
					} else {
						setTimeout(function(){plugin.trial(display_element, block, trial, part + 1);}, trial.timing_feedback_duration);
					}
					break;
				case 3:
					display_element.html("");
					setTimeout(function(){block.next();}, trial.timing_post_trial);
					break;
			}
		}
		
		return plugin;
	})();
})(jQuery);
	