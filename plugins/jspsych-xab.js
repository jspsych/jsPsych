/* 	jspsych-xab.js
 *	Josh de Leeuw
 *
 * 	This plugin runs a single XAB trial, where X is an image presented in isolation, and A and B are choices, with A or B being equal to X. 
 *	The subject's goal is to identify whether A or B is identical to X.
 */

(function( $ ) {
	jsPsych.xab = (function(){
	
		var plugin = {}

		plugin.create = function(params)
		{
			//xab_stims = shuffle(xab_stims);
			xab_stims = params["stimuli"];
			trials = new Array(xab_stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "xab";
				trials[i]["a_path"] = xab_stims[i][0];
				trials[i]["b_path"] = xab_stims[i][1];
				trials[i]["left_key"] = params["left_key"] || 81; // defaults to 'q'
				trials[i]["right_key"] = params["right_key"] || 80; // defaults to 'p'
				// timing parameters
				trials[i]["timing_x"] = params["timing_x"] || 1000; // defaults to 1000msec.
				trials[i]["timing_xab_gap"] = params["timing_xab_gap"] || 1000; // defaults to 1000msec.
				trials[i]["timing_ab"] = params["timing_ab"] || -1; // defaults to -1, meaning infinite time on AB. If a positive number is used, then AB will only be displayed for that length.
				trials[i]["timing_post_trial"] = params["timing_post_trial"] || 1000; // defaults to 1000msec.
				// optional parameters				
				if(params["prompt"]) {
					trials[i]["prompt"] = params["prompt"];
				}
				if(params["data"]){
					trials[i]["data"] = params["data"][i];
				} 
			}
			return trials;
		}
		
		var xab_trial_complete = false;

		plugin.trial = function(display_element, block, trial, part)
		{
			switch(part){
				case 1:
				
					xab_trial_complete = false;
					
					p1_time = (new Date()).getTime();
					display_element.append($('<img>', {
						"src": trial.a_path,
						"class": 'xab'
					}));
					setTimeout(function(){plugin.trial(display_element, block, trial, part + 1)}, trial.timing_x);
					break;
				case 2:
					p2_time = (new Date()).getTime();
					$('.xab').remove();
					setTimeout(function(){plugin.trial(display_element, block, trial, part + 1)}, trial.timing_xab_gap);
					break;
				case 3:
					p3_time = (new Date()).getTime();
					startTime = (new Date()).getTime();
					var images = [trial.a_path, trial.b_path];
					var target_left = (Math.floor(Math.random()*2)==0); // 50% chance target is on left.
					if(!target_left){
						images = [trial.b_path, trial.a_path];
					}
					
					// show the images
					display_element.append($('<img>', {
						"src": images[0],
						"class": 'xab'
					}));
					display_element.append($('<img>', {
						"src": images[1],
						"class": 'xab'
					}));
					
					if(trial.prompt)
					{
						display_element.append(trial.prompt);
					}
					
					if(trial.timing_ab > 0)
					{
						setTimeout(function(){
							if(!xab_trial_complete){
								$('.xab').css('visibility', 'hidden');
							}
						}, trial.timing_ab);
					}
					
					var resp_func = function(e) {
						var flag = false;
						var correct = false;
						if(e.which== trial.left_key) // 'q' key
						{
							flag = true;
							if(target_left) { correct = true; }
						} else if(e.which== trial.right_key) // 'p' key
						{
							flag = true;
							if(!target_left){ correct = true; }
						}
						if(flag)
						{
							endTime = (new Date()).getTime();
							rt = (endTime-startTime);
							stim1_time = (p2_time-p1_time);
							isi_time = (p3_time-p2_time);
							var trial_data = {"rt": rt, "correct": correct, "a_path": trial.a_path, "b_path": trial.b_path, "key_press": e.which, "stim1_time": stim1_time, "isi_time":isi_time}
							block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
							$(document).unbind('keyup',resp_func);
							display_element.html(''); // remove all
							xab_trial_complete = true;
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