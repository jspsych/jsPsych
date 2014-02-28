(function( $ ) {
	jsPsych.xab_touch = (function(){
	
		var plugin = {};
	
		plugin.create = function(params) {
			//xab_stims = shuffle(xab_stims);
			xab_stims = params["stimuli"];
			trials = new Array(xab_stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "xab_touch";
				trials[i]["a_path"] = xab_stims[i][0];
				trials[i]["b_path"] = xab_stims[i][1];
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
						"class": 'xab_touch'
					}));
					setTimeout(function(){plugin.trial(display_element, block, trial, part + 1);}, trial.timing[0]);
					break;
				case 2:
					p2_time = (new Date()).getTime();
					$('.xab_touch').remove();
					setTimeout(function(){plugin.trial(display_element, block, trial, part + 1);}, trial.timing[1]);
					break;
				case 3:
					p3_time = (new Date()).getTime();
					startTime = (new Date()).getTime();
					var images = [trial.a_path, trial.b_path];
					var target_left = (Math.floor(Math.random()*2)==0); // binary true/false choice
					if(!target_left){
						images = [trial.b_path, trial.a_path];
					}
					//$.fn.jsPsych.showImages(display_element, images, 'xab');
					
					var correct=false;
					
					display_element.append($('<img>', {
						"src": images[0],
						"class": 'xab_touch',
						"id": "left_img"
					}));
					$("#left_img").click(function() {
						if(target_left) { correct = true; }
						
						endTime = (new Date()).getTime();
						rt = (endTime-startTime);
						stim1_time = (p2_time-p1_time);
						isi_time = (p3_time-p2_time);
						var trial_data = {"rt": rt, "correct": correct, "a_path": trial.a_path, "b_path": trial.b_path, "stim1_time": stim1_time, "isi_time":isi_time}
						block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
						$('.xab_touch').remove();
						setTimeout(function(){block.next();}, trial.timing[2]);
					});
					
					display_element.append($('<img>', {
						"src": images[1],
						"class": 'xab_touch',
						"id": "right_img"
					}));
					$("#right_img").click(function() {
						if(!target_left) { correct = true; }
						
						endTime = (new Date()).getTime();
						rt = (endTime-startTime);
						stim1_time = (p2_time-p1_time);
						isi_time = (p3_time-p2_time);
						var trial_data = {"rt": rt, "correct": correct, "a_path": trial.a_path, "b_path": trial.b_path, "stim1_time": stim1_time, "isi_time":isi_time}
						block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
						$('.xab_touch').remove();
						setTimeout(function(){block.next();}, trial.timing[2]);
					});
					
					//TODO: CHECK IF IMAGE SHOULD DISAPPEAR
					//based on timings
					break;
			}
		}
		
		return plugin;
	})();
})(jQuery);