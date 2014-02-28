(function( $ ) {
	jsPsych.ballistic_match = (function(){
	
		var plugin = {};
	
		plugin.create = function(params) {
			stims = params["stimuli"];
			trials = new Array(stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "ballistic_match";
				trials[i]["target_idx"] = params["target_idx"][i];
				trials[i]["start_idx"] = params["start_idx"][i];
				trials[i]["stimuli"] = params["stimuli"][i];
				trials[i]["timing"] = params["timing"];
				trials[i]["key_dec"] = params["key_dec"];
				trials[i]["key_inc"] = params["key_inc"];
				trials[i]["animate_frame_time"] = params["animate_frame_time"] || 100;
				if(params["prompt"] != undefined){
					trials[i]["prompt"] = params["prompt"];
				}
				if(params["data"]!=undefined){
					trials[i]["data"] = params["data"][i];
				}
			}
			return trials;
		}
		

		var change = 0; // which direction they indicated the stim should move.
		var start_time;
		var end_time; 
		
		plugin.trial = function(display_element, block, trial, part)
		{
			switch(part){
				case 1:
					// starting new trial
					start_time = (new Date()).getTime();
					change = 0;
						
					// show manipulate image
					display_element.append($('<img>', {
						"src": trial.stimuli[trial.start_idx],
						"class": 'bm_img',
						"id": 'bm_manipulate'
					}));
						
					// show target image
					display_element.append($('<img>', {
						"src": trial.stimuli[trial.target_idx],
						"class": 'bm_img',
						"id": 'bm_target'
					}));
					
					if(trial.prompt)
					{
						display_element.append(trial.prompt);
					}
					
					// categorize the image.
					
					var resp_func = function(e) {
						var valid_response = false;
						if(e.which == trial.key_dec)
						{
							change = -1;
							valid_response = true;
						} else if (e.which == trial.key_inc)
						{
							change = 1;
							valid_response = true;
						}
						
						if(valid_response){
							end_time = (new Date()).getTime();
							plugin.trial(display_element,block,trial,part+1);
							$(document).unbind('keyup', resp_func);
						}
					}
					
					$(document).keyup(resp_func);
					break;
				case 2:
					// clear everything
					display_element.html('');
					setTimeout(function(){plugin.trial(display_element, block, trial, part + 1);}, trial.timing[1]);
					break;
				case 3:
					// draw trajectory
					draw_trajectory(display_element,
									trial.stimuli[trial.target_idx], 
									trial.stimuli[trial.start_idx], 
									trial.target_idx/(trial.stimuli.length-1),
									trial.start_idx/(trial.stimuli.length-1));
					
					display_element.append($('<div>',{
						"id":"bm_feedback",
						}));
					
					if(change>0) {
						$("#bm_feedback").html('<p>You said increase.</p>');
					} else {
						$("#bm_feedback").html('<p>You said decrease.</p>');
					}
					
					setTimeout(function(){plugin.trial(display_element, block, trial, part + 1);}, trial.timing[1]*3);
					break;
				case 4:
					var curr_loc = trial.start_idx
					animate_interval = setInterval(function(){
		
						// clear everything
						display_element.html('');
						// draw trajectory
						draw_trajectory(display_element,
										trial.stimuli[trial.target_idx], 
										trial.stimuli[curr_loc], 
										trial.target_idx/(trial.stimuli.length-1),
										curr_loc/(trial.stimuli.length-1));
						
						curr_loc += change;
						
						
						if(curr_loc - change == trial.target_idx || curr_loc < 0 || curr_loc == trial.stimuli.length)
						{
							clearInterval(animate_interval);
							var correct = false;
							if(change > 0 && trial.start_idx < trial.target_idx) { correct = true; }
							if(change < 0 && trial.start_idx > trial.target_idx) { correct = true; }
							
							display_element.append($('<div>',{
								"id":"bm_feedback",
							}));
							if(correct){
								$("#bm_feedback").html('<p>Correct!</p>');
							} else {
								$("#bm_feedback").html('<p>Wrong.</p>');
							}
							setTimeout(function(){plugin.trial(display_element, block, trial, part + 1);}, trial.timing[1]*3);
						}
					}, trial.animate_frame_time);				
					break;
				case 5:
					display_element.html(''); 
					var correct = false;
					if(change > 0 && trial.start_idx < trial.target_idx) { correct = true; }
					if(change < 0 && trial.start_idx > trial.target_idx) { correct = true; }
					
					var trial_data = {"start_idx":trial.start_idx, "target_idx": trial.target_idx, "correct": correct, "rt": (end_time-start_time)};
					block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
					
					setTimeout(function(){block.next();}, trial.timing[0]);
					break;
			}
		}
		
		function draw_trajectory(display_element,target_img, moving_img, target_loc_percent, moving_loc_percent)
		{
			display_element.append($('<div>', {
				"id": "message_holder"}));
			$("#message_holder").append($('<p id="left">Less Chemical X</p>'));
			$("#message_holder").append($('<p id="right">More Chemical X</p>'));
			
			$("#message_holder").append($('<img>',{
				"src":"img/400arrow.gif",
				"id":"arrow"
				}));
			// display the images on the trajectory							
			display_element.append($('<div>',{
				"id": "bm_trajectory",
				"css": {
					"position":"relative"
				}
			}));
			
			$("#bm_trajectory").append($('<img>',{
				"src":target_img,
				"id": "bm_target",
				"css": {
					"position":"absolute",
				}
			}));
			
			var image_width = parseInt($("#bm_target").css('width'));
			var image_height = parseInt($("#bm_target").css('height'));
			var container_width = parseInt($("#bm_trajectory").css('width'));
			var target_left = (container_width - image_width) * target_loc_percent;
			var moving_left = (container_width - image_width) * moving_loc_percent;
						
			$("#bm_target").css('left', target_left);
			$("#bm_target").css('top', image_height);
			
			$("#bm_trajectory").append($('<img>',{
				"src":moving_img,
				"id": "bm_moving",
				"css": {
					"position":"absolute",
					"left": moving_left,
					"top": 0
				}
			}));
			
			$("#bm_trajectory").append($(
				'<div>',
				{
					"id": "target_flag",
					"css": {
						"position":"absolute",
						"left": target_left+(image_width/2)-40,
						"bottom": "-10px",
						"background-color": "#cccccc",
						"border": "1px solid #999999",
						"width": 80,
						"height": 20
						
					}
				}
			));
			
			$("#target_flag").html('<p>TARGET</p>');
		}
		
		return plugin;
	})();
})(jQuery);