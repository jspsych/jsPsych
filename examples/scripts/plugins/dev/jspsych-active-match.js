(function( $ ) {
	jsPsych.active_match = (function(){
	
		var plugin = {};
	
		plugin.create = function(params) {
			stims = params["stimuli"];
			trials = new Array(stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "active_match";
				trials[i]["target_idx"] = params["target_idx"][i];
				trials[i]["start_idx"] = params["start_idx"][i];
				trials[i]["stimuli"] = params["stimuli"][i];
				trials[i]["timing"] = params["timing"];
				trials[i]["key_dec"] = params["key_dec"];
				trials[i]["key_inc"] = params["key_inc"];
				if(params["prompt"] != undefined){
					trials[i]["prompt"] = params["prompt"];
				}
				if(params["data"]!=undefined){
					trials[i]["data"] = params["data"][i];
				}
			}
			return trials;
		}
		
		// data to keep track of
		var responses = [];
		var last_response_time = 0;
		var start_time = 0;
		var direction_changes = 0;
		var last_response = -1;

		plugin.trial = function(display_element, block, trial, part)
		{
			switch(part){
				case 1:
					// reset response variables
					responses = [];
					last_response_time = 0;
					start_time = 0;
					direction_changes = 0;
					last_response = -1;
				
					// starting new trial
					start_time = (new Date()).getTime();
					last_response_time = start_time;
					
					current_idx = trial.start_idx;
					
					// show target image
					display_element.append($('<img>', {
						"src": trial.stimuli[trial.target_idx],
						"class": '',
						"id": 'am_target'
					}));
					
					// show manipulate image
					display_element.append($('<img>', {
						"src": trial.stimuli[trial.start_idx],
						"class": '',
						"id": 'am_manipulate'
					}));
					
					// append a div for showing messages
					display_element.append($('<div>', {
						"id": 'am_message_box'
					}));
					
					if(trial.prompt)
					{
						display_element.append(trial.prompt);
					}
					
					// add function on keypress to control manipulate image
					// 	pressing key_dec will move the index down
					// 	pressing key_inc will move the index up
					
					var resp_func = function(e) {
						var change = 0;
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
							var resp_time = (new Date()).getTime();
							var response = {"key": e.which, "rt": (resp_time-last_response_time)};
							responses.push(response);							
						
							if(e.which != last_response && last_response != -1)
							{
								direction_changes++;
							}
							
							last_response = e.which;
							last_response_time = resp_time;
							
							var next_idx = current_idx + change;
							if(next_idx < 0) {
								// can't do this
								if($('#am_message_box').children().length == 0)
								{
									$('#am_message_box').append("<p id='prompt'>Minimum value reached. Go the other direction.</p>");
								}
								next_idx = 0;
							} else if(next_idx == trial.stimuli.length) {
								// can't do this
								if($('#am_message_box').children().length == 0)
								{
									$('#am_message_box').append("<p id='prompt'>Maximum value reached. Go the other direction.</p>");
								}
								next_idx = current_idx;
							} else {
								// update current_idx
								current_idx = next_idx;
								
								$("#am_message_box").html('');
								
								// change the image
								$("#am_manipulate").attr("src",trial.stimuli[current_idx]);
							}
							
							if(current_idx == trial.target_idx)
							{
								// unbind response function to prevent further change
								$(document).unbind('keyup',resp_func);
								// match!
								plugin.trial(display_element, block, trial, part + 1);
										
							}
						}
					}
					
					$(document).keyup(resp_func);
					break;
					
				case 2:
					$("#am_target").addClass('matched');
					$("#am_manipulate").addClass('matched');
					
					var key_responses_string = "";
					var rt_responses_string = "";
					for(var i=0;i<responses.length; i++)
					{
						key_responses_string = key_responses_string + responses[i].key +",";
						rt_responses_string = rt_responses_string + responses[i].rt +",";
					}
					
					
					var trial_data = {"key_responses": key_responses_string, "rt_responses": rt_responses_string, "num_responses": responses.length, "direction_changes": direction_changes, "start_idx":trial.start_idx, "target_idx": trial.target_idx};
					block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
					
					setTimeout(function(){plugin.trial(display_element, block, trial, part + 1);}, trial.timing[1]);
					break;

				case 3:	
					display_element.html('');
					setTimeout(function(){block.next();}, trial.timing[0]);
					break;
			}
		}
		
		return plugin;
	})();
})(jQuery);