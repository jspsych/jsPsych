/* jsPsych plugin for showing animations
 * Josh de Leeuw
 * updated March 2013
 * 
 * shows a sequence of images at a fixed frame rate.
 * no data is collected from the subject, but it does record the path of the first image
 * in each sequence, and allows for optional data tagging as well.
 *
 */


(function( $ ) {
	jsPsych.animation = (function(){
	
		var plugin = {};
	
		plugin.create = function(params) {
			stims = params["stimuli"];
			trials = new Array(stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "animation";
				trials[i]["stims"] = stims[i];
				trials[i]["frame_time"] = params["frame_time"];
				trials[i]["repetitions"] = params["repetitions"] || 1;
				trials[i]["timing_post_trial"] = params["timing_post_trial"];
				if(params["prompt"] != undefined){
					trials[i]["prompt"] = params["prompt"][i];
				}
				if(params["data"] != undefined) {
					trials[i]["data"] = params["data"][i];
				} else {
					trials[i]["data"] = {};
				}
			}
			return trials;
		}

		plugin.trial = function(display_element, block, trial, part)
		{
			var animate_frame = -1;
			var reps = 0;
			switch(part)
			{
				case 1:
					animate_interval = setInterval(function(){
						showImage = true;
						display_element.html(""); // clear everything
						animate_frame++;
						if(animate_frame == trial.stims.length)
						{
							animate_frame = 0;
							reps++;
							if(reps >= trial.repetitions)
							{
								plugin.trial(display_element, block, trial, part + 1);
								clearInterval(animate_interval);
								showImage = false;
							}
						}
						if(showImage){
							display_element.append($('<img>', {
								"src": trial.stims[animate_frame],
								"class": 'animate'
							}));
							if(trial.prompt != undefined) { display_element.append(trial.prompt); }
						}
					}, trial.frame_time);
					break;
				case 2:
					block.data[block.trial_idx] = $.extend({}, {"trial_type": "animation", "trial_index": block.trial_idx, "a_path": trial.stims[0]}, trial.data);
					setTimeout(function(){ block.next(); }, trial.timing_post_trial);
					break;
			}			
		}
		
		return plugin;
	})();
})(jQuery);