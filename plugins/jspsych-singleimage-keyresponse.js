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
				// timing parameters
				trials[i]["timing_stim"] = params["timing_stim"]; // if undefined, then show indefinitely
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

		var sikr_trial_complete = false;
		plugin.trial = function($this, block, trial, part)
		{
			switch(part){
				case 1:
					sikr_trial_complete = false;
					
					startTime = (new Date()).getTime();
					$this.append($('<img>', {
						"src": trial.a_path,
						"id": 'sikr_img'
					}));
					
					//show prompt here
					if(trial.prompt != undefined){
						$this.append(trial.prompt);
					}
			
					// hide image if timing is set
					if(trial.timing_stim != undefined){
						setTimeout(function(){
							if(!sikr_trial_complete){
								$('#sikr_img').css('visibility','hidden');
							}
						}, trial.timing_stim);
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
						
							var trial_data = {"rt": rt, "a_path": trial.a_path, "key_press": e.which}
							block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
							$(document).unbind('keyup',resp_func);
							$this.html('');
							sikr_trial_complete = true;
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
	