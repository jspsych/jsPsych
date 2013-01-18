(function( $ ) {
	jsPsych.free_sort = (function(){

		var plugin = {};
		
		plugin.create = function(params) {
			stims = params["stimuli"];
			trials = new Array(stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {
					"type": "free_sort",
					"images": stims[i], // array of images to display
					"stim_height": params.stim_height,
					"stim_width": params.stim_width,
					"timing": params.timing,
					"prompt": params.prompt || undefined,
					"prompt_location": params.prompt_location || "above",
					"sort_area_width": params.sort_area_width || 800,
					"sort_area_height": params.sort_area_height || 800					
				}
				if(params.data) { 
					trials[i].data = params.data[i] || params.data;
				}
			}
			return trials;
		}

		plugin.trial = function(display_element, block, trial, part)
		{
			switch(part){
				case 1:
					start_time = (new Date()).getTime();
					
					// check if there is a prompt and if it is shown above
					if(trial.prompt && trial.prompt_location == "above")
					{
						display_element.append(trial.prompt);
					}
					
					display_element.append($('<div>', {
						"id": "sort_arena",
						"class": "sort",
						"css": {
							"position": "relative",
							"width": trial.sort_area_width,
							"height": trial.sort_area_height
						}
					}));
					
					// check if prompt exists and if it is shown below
					if(trial.prompt && trial.prompt_location == "below")
					{
						display_element.append(trial.prompt);
					}
					
					// store initial location data
					var init_locations = [];
					
					for(var i=0; i<trial.images.length; i++)
					{
						var coords = random_coordinate(trial.sort_area_width-trial.stim_width, trial.sort_area_height-trial.stim_height);
						
						$("#sort_arena").append($('<img>',
						{
							"src": trial.images[i],
							"class": "draggable_stim sort",
							"css": {
								"position": "absolute",
								"top": coords.y,
								"left": coords.x
							}
						}));
						
						init_locations.push({"src": trial.images[i], "x": coords.x, "y": coords.y});
					}
					
					var moves = [];
					
					$('.draggable_stim').draggable({
						containment: "#sort_arena",
						scroll: false,
						stack: ".draggable_stim",
						stop: function(event, ui){
							moves.push({"src": event.target.src.split("/").slice(-1)[0], "x":ui.position.left, "y": ui.position.top});
						}
					});
					
					display_element.append($('<button>', {
						"id": "done_btn",
						"class": "sort",
						"html": "Done",
						"click": function(){
							// gather data
							// get final position of all objects
							var final_locations = [];
							$('.draggable_stim').each(function(){
								final_locations.push({"src": $(this).attr('src'), "x": $(this).css('left'), "y": $(this).css('top')});
							});
							
							block.data[block.trial_idx] = $.extend({}, {"init_locations": JSON.stringify(init_locations), "moves": JSON.stringify(moves), "final_locations": JSON.stringify(final_locations)}, trial.data);
							
							// advance to next part
							plugin.trial(display_element, block, trial, part + 1);
						}
					}));
					break;
				case 2:
					p2_time = (new Date()).getTime();
					$('.sort').remove();
					setTimeout(function(){block.next();}, trial.timing[0]);
					break;
			}
		}
		
		// helper functions
		
		function random_coordinate(max_width, max_height)
		{
			var rnd_x = Math.floor(Math.random()*(max_width-1))
			
			var rnd_y = Math.floor(Math.random()*(max_height-1));
			
			return {x: rnd_x, y: rnd_y};
		}
		
		return plugin;
	})();
}) (jQuery);
	