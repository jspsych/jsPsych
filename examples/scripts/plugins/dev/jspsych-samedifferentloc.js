// Josh de Leeuw
// Nov. 2012


(function( $ ) {
	jsPsych.samedifferentloc = (function(){

		var plugin = {};
		
		plugin.create = function(params) {
			var stims = params["stimuli"];
			trials = new Array(stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "samedifferentloc";
				trials[i]["a_path"] = sd_stims[i][0];
				trials[i]["b_path"] = sd_stims[i][1];
				trials[i]["mask_path"] = params["mask_path"];
				trials[i]["a_x_offset"] = params["a_x_offset"][i];
				trials[i]["a_y_offset"] = params["a_y_offset"][i];
				trials[i]["b_x_offset"] = params["b_x_offset"][i];
				trials[i]["b_y_offset"] = params["b_y_offset"][i];
				trials[i]["answer"] = params["answer"][i];
				trials[i]["same_key"] = params["same_key"] || 80;
				trials[i]["different_key"] = params["different_key"] || 81;
				// timing parameters
				trials[i]["timing_first_img"] = params["timing_first_img"] || 1500;
				trials[i]["timing_mask"] = params["timing_mask"] || 500;
				trials[i]["timing_second_img"] = params["timing_second_img"] || 1000;
				trials[i]["timing_fixation"] = params["timing_fixation"] || 3000;
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

		plugin.trial = function(display_element, block, trial, part)
		{
			switch(part){
				case 1:
					display_element.append($('<div>', {
						"id": 'sdl_img_container',
						"css": {
							"position": 'relative'
						}
					}));
				
					$("#sdl_img_container").append($('<img>', {
						"src": trial.a_path,
						"class": 'sdl',
						"css": {
							"position": 'absolute',
							"top": trial.a_y_offset,
							"left": trial.a_x_offset
						}
					}));
					setTimeout(function(){plugin.trial(display_element, block, trial, part + 1);}, trial.timing_first_img);
					break;
				case 2:
					$('.sd1').remove();
					$("#sdl_img_container").append($('<img>', {
						"src": trial.mask_path,
						"class": 'sdl'						
					}));
					setTimeout(function(){plugin.trial(display_element, block, trial, part + 1);}, trial.timing_mask);
					break;
				case 3:
					$('.sd1').remove();
					
					$("#sdl_img_container").append($('<img>', {
						"src": trial.b_path,
						"class": 'sdl',
						"css": {
							"position": 'absolute',
							"top": trial.b_y_offset,
							"left": trial.b_x_offset
						}
					}));
					
					setTimeout(function(){plugin.trial(display_element, block, trial, part + 1);}, trial.timing_second_img);
					break;
				case 4:
					$('.sd1').remove();
					
					$("#sdl_img_container").append($('<img>', {
						"src": trial.fixation_path,
						"class": 'sdl'						
					}));
					
					startTime = (new Date()).getTime();
					
					var correct = false;
					var response = false;
					
					var resp_func = function(e) {
						var flag = false;
						if(e.which==trial.same_key) 
						{
							flag = true;
							if(trial.answer == "same") { correct = true; }
						} else if(e.which==trial.different_key)
						{
							flag = true;
							if(trial.answer == "different"){ correct = true; }
						}
						if(flag)
						{
							endTime = (new Date()).getTime();
							rt = (endTime-startTime);
							$(document).unbind('keyup',resp_func);
							
							response = true;
						}
					}
					
					$(document).keyup(resp_func);
					
					var finish_func = function() {
						if(!response)
						{
							rt = -1;
						}
						var trial_data = {"rt": rt, "correct": correct, "a_path": trial.a_path, "b_path": trial.b_path, "key_press": e.which, 
							"a_x_loc": trial.a_x_offset,"a_y_loc": trial.a_y_offset,"b_x_loc": trial.b_x_offset, "b_y_loc": trial.b_y_offset };
						block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
						display_element.html('');
						block.next();
					}
					
					setTimeout(finish_func, trial.timing_fixation);
					break;
			}
		}
		
		return plugin;
	})();
}) (jQuery);
	