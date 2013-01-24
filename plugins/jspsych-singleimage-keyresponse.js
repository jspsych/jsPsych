// Josh de Leeuw
// Nov. 2012

// This plugin is for presenting a single image and collecting a key response.
// It can be used for categorizing images (without feedback), collecting yes/no responses, etc...

(function( $ ) {
	jsPsych.singleimage_keyresponse = (function(){
	
		var plugin = {};
	
		plugin.create = function(params) {
			var stims = params["stimuli"];
			trials = new Array(stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "singleimage_keyresponse";
				trials[i]["a_path"] = stims[i];
				trials[i]["choices"] = params["choices"];
				// option to show image for fixed time interval, ignoring key responses
				// 		true = image will keep displaying after response
				// 		false = trial will immediately advance when response is recorded
				trials[i]["continue_after_response"] = params["continue_after_response"] || true;
				// timing parameters
				trials[i]["timing_stim"] = params["timing_stim"] || -1; // if -1, then show indefinitely
				trials[i]["timing_response"] = params["timing_response"] || -1; // if -1, then wait for response forever
				trials[i]["timing_post_trial"] = params["timing_post_trial"] || 1000;
				// optional parameters
				if(params["prompt"] != undefined){
					trials[i]["prompt"] = params["prompt"];
				}
				if(params["data"]!=undefined){
					trials[i]["data"] = params["data"][i];
				} else {
					trials[i]["data"] = undefined;
				}
			}
			return trials;
		}

		var sikr_trial_complete = false;
		
		plugin.trial = function(display_element, block, trial, part)
		{
			switch(part){
				case 1:
					key_press = -1;
					sikr_trial_complete = false;
					
					startTime = (new Date()).getTime();
					display_element.append($('<img>', {
						"src": trial.a_path,
						"id": 'sikr_img'
					}));
					
					//show prompt here
					if(trial.prompt != undefined){
						display_element.append(trial.prompt);
					}
					
					var cont_function = function(){
						endTime = (new Date()).getTime();
						rt = (endTime-startTime);
						sikr_trial_complete = true;
						plugin.trial(display_element, block, trial, part+1);
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
							key_press = e.which;
							
							// after a valid response, the image will have the CSS class 'responded'
							// which can be used to provide visual feedback that a response was recorded
							$("#sikr_img").addClass('responded');
							
							if(trial.continue_after_response){	
								// response triggers the next trial in this case.
								// if hide_image_after_response is true, then next
								// trial should be triggered by timeout function below.
								cont_function();
							}
						}
					}
					
					$(document).keyup(resp_func);
			
					// hide image if timing is set
					if(trial.timing_stim > 0){
						setTimeout(function(){
							if(!sikr_trial_complete){
								$('#sikr_img').css('visibility','hidden');
							}
						}, trial.timing_stim);
					}
					
					// end trial if time limit is set
					if(trial.timing_response > 0)
					{
						setTimeout(function(){
							if(!sikr_trial_complete){
								cont_function();
							}
						}, trial.timing_response);
					}
					
					break;
				case 2:
					var trial_data = {"trial_type": "singleimage_keyresponse", "rt": rt, "a_path": trial.a_path, "key_press": key_press}
					block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
					$(document).unbind('keyup',resp_func);
					display_element.html('');
					setTimeout(function(){block.next();}, trial.timing_post_trial);
					break;
			}
		}
		
		return plugin;
	})();
})(jQuery);
	