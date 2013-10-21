// Josh de Leeuw
// Nov. 2012

// This plugin is for presenting two images in sequence and collecting a key response.

(function( $ ) {
	jsPsych.twoimage_keyresponse = (function(){
	
		var plugin = {};
	
		plugin.create = function(params) {
			var stims = params["stimuli"];
			trials = new Array(stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "twoimage_keyresponse";
				trials[i]["a_path"] = stims[i][0];
				trials[i]["b_path"] = stims[i][1];
				trials[i]["choices"] = params["choices"];
				// timing parameters
				trials[i]["timing_first_stim"] = params["timing_first_stim"] || 1000; 
				trials[i]["timing_gap"] = params["timing_gap"] || 500;
				trials[i]["timing_second_stim"] = params["timing_second_stim"]; // if undefined, then show indefinitely
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

		var tikr_trial_complete = false;
		plugin.trial = function(display_element, block, trial, part)
		{
			switch(part){
				case 1:
					tikr_trial_complete = false;
					
					display_element.append($('<img>', {
						"src": trial.a_path,
						"id": 'tikr_a_img'
					}));
				
					setTimeout(function(){plugin.trial(display_element, block, trial, part + 1)}, trial.timing_first_stim);
					break;
					
				case 2: 
					$('#tikr_a_img').remove();
					setTimeout(function(){plugin.trial(display_element, block, trial, part + 1)}, trial.timing_gap);
					break;
					
				case 3:
					startTime = (new Date()).getTime();
					
					display_element.append($('<img>', {
						"src": trial.b_path,
						"id": 'tikr_b_img'
					}));
					
					//show prompt here
					if(trial.prompt != undefined){
						display_element.append(trial.prompt);
					}
			
					// hide image if timing is set
					if(trial.timing_second_stim != undefined){
						setTimeout(function(){
							if(!tikr_trial_complete){
								$('#tikr_b_img').css('visibility','hidden');
							}
						}, trial.timing_second_stim);
					}
		
					var resp_func = function(e) {
						var flag = false;
						// check if the key is any of the options, or if it is an accidental keystroke
						for(var i=0;i<trial.choices.length;i++)
						{
							if(e.which==trial.choices[i])
							{ 
								flag = true;
							}
						}
						if(flag)
						{
							endTime = (new Date()).getTime();
							rt = (endTime-startTime);
						
							var trial_data = {"trial_type":"twoimage_keyresponse", "rt": rt, "a_path": trial.a_path, "b_path": trial.b_path, "key_press": e.which}
							block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
							$(document).unbind('keyup',resp_func);
							display_element.html('');
							tikr_trial_complete = true;
							setTimeout(function(){block.next();}, trial.timing_post_trial);
						}
					}
					$(document).keyup(resp_func);
					break;
			}
		}
		
		return plugin;
	})();
})(jQuery);
	