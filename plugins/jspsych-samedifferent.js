(function( $ ) {
	jsPsych.samedifferent = (function(){

		var plugin = {};
		
		plugin.create = function(params) {
			sd_stims = params["stimuli"];
			trials = new Array(sd_stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "samedifferent";
				trials[i]["a_path"] = sd_stims[i][0];
				trials[i]["b_path"] = sd_stims[i][1];
				trials[i]["answer"] = params["answer"][i];
				trials[i]["same_key"] = params["same_key"] || 81; // default is 'q'
				trials[i]["different_key"] = params["different_key"] || 80; // default is 'p'
				// timing parameters
				trials[i]["timing_first_stim"] = params["timing_first_stim"] || 1000;
				trials[i]["timing_second_stim"] = params["timing_second_stim"] || 1000; // if -1, then second stim is shown until response.
				trials[i]["timing_gap"] = params["timing_gap"] || 500;
				trials[i]["timing_post_trial"] = params["timing_post_trial"] || 1000;
				// optional parameters				
				if(params["prompt"] != undefined){
					trials[i]["prompt"] = params["prompt"];
				}
				if(params["data"]!=undefined){
					trials[i]["data"] = params["data"][i];
				}
			}
			return trials;
		}
		
		var sd_trial_complete = false;

		plugin.trial = function(display_element, block, trial, part)
		{
			switch(part){
				case 1:
					sd_trial_complete = false;
					// show image
					display_element.append($('<img>', {
						"src": trial.a_path,
						"class": 'sd'
					}));
					setTimeout(function(){plugin.trial(display_element, block, trial, part + 1);}, trial.timing_first_stim);
					break;
				case 2:
					$('.sd').remove();
					setTimeout(function(){plugin.trial(display_element, block, trial, part + 1);}, trial.timing_gap);
					break;
				case 3:
	
					display_element.append($('<img>', {
						"src": trial.b_path,
						"class": 'sd',
						"id":'jspsych_sd_second_image'
					}));
					
					if(trial.timing_second_stim > 0){
						setTimeout(function(){
							if(!sd_trial_complete) {
								$("#jspsych_sd_second_image").css('visibility', 'hidden');
							}
						}, trial.timing_second_stim);
					}
					
					startTime = (new Date()).getTime();
					
					
					if(trial.timing[3]!=undefined){
						setTimeout(function(){plugin.trial(display_element, block, trial, part + 1);}, trial.timing[3]);
					} else {
						plugin.trial(display_element, block, trial, part + 1);
					}
					
					var resp_func = function(e) {
						var flag = false;
						var correct = false;
						if(e.which== trial.same_key) // 'p' key -- same
						{
							flag = true;
							if(trial.answer == "same") { correct = true; }
						} else if(e.which== trial.different_key) // 'q' key -- different
						{
							flag = true;
							if(trial.answer == "different"){ correct = true; }
						}
						if(flag)
						{
							endTime = (new Date()).getTime();
							rt = (endTime-startTime);
							
							var trial_data = {"trial_type": "samedifferent", "rt": rt, "correct": correct, "a_path": trial.a_path, "b_path": trial.b_path, "key_press": e.which}
							block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
							$(document).unbind('keyup',resp_func);
							$('.sd').remove();
							display_element.html('');
							setTimeout(function(){block.next();}, trial.timing_post_trial);
						}
					}
					$(document).keyup(resp_func);
					break;
			}
		}
		
		return plugin;
	})();
}) (jQuery);
	