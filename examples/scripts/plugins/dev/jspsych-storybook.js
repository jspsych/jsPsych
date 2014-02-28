(function( $ ) {
	jsPsych.storybook = (function(){
	
		var plugin = {};
	
		plugin.create = function(params) {
			stims = params["stimuli"];
			trials = new Array(stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "storybook";
				trials[i]["a_path"] = stims[i];
				trials[i]["click_num"] = params["click_num"];
				trials[i]["timing"] = params["timing"];
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
					p1_time = (new Date()).getTime();
					display_element.append($('<img>', {
						"src": trial.a_path,
						"class": 'storybook'
					}));
					
					var click_count = 0;
					var click_locations = [];
					var click_times = [];
					
					var touchfunction = function(e) {
					
						e.originalEvent.preventDefault();
					
						var rt = (new Date()).getTime() - p1_time;
						var x = e.originalEvent.touches[0].pageX;
						var y = e.originalEvent.touches[0].pageY;
						
						click_count = click_count + 1;
						
						console.log("click event "+x+" "+y+". click count "+click_count+". click num "+trial.click_num);
						
						//save location
						click_locations.push([x,y]);
						click_times.push(rt);
						
						//save response time
						if(click_count == trial.click_num)
						{
							var click_loc_data = {"click_locations": click_locations};
							var click_time_data = {"click_times": click_times};
							var img = {"img": trial.a_path };
							// save data
							block.data[block.trial_idx] = $.extend({}, img, click_loc_data, click_time_data, trial.data);
						
							plugin.trial(display_element, block, trial, part + 1);
						}
					};
					
					$('.storybook').click(function(){ void(0); })
					
					//$('.storybook').mousedown(function(e){ touchfunction(e);});
					$('.storybook').bind("touchstart", function(e){touchfunction(e);});
					
					break;
				case 2:
					$('.storybook').remove();
					
					setTimeout(function(){block.next();}, trial.timing[0]);
					break;
			}
		}
		
		return plugin;
	})();
})(jQuery);