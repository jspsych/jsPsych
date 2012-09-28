/* jspsych-similarity.js
 * Josh de Leeuw
 * 
 * This plugin create a trial where two images are shown sequentially, and the subject rates their similarity using a slider controlled with the mouse.
 *
 */

(function( $ ) {
	jsPsych.similarity = (function(){
	
		var plugin = {};
	
		plugin.create = function(params) {
			sim_stims = params["stimuli"];
			trials = new Array(sim_stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "similarity";
				trials[i]["a_path"] = sim_stims[i][0];
				trials[i]["b_path"] = sim_stims[i][1];
				trials[i]["timing_first_image"] = params["timing_first_image"] || 1000; // default 1000ms
				trials[i]["timing_second_image"] = params["timing_second_image"] || -1; // -1 = inf time; positive numbers = msec to display second image.
				trials[i]["timing_image_gap"] = params["timing_image_gap"] || 1000; // default 1000ms
				trials[i]["timing_post_trial"] = params["timing_post_trial"] || 1000; // default 1000ms
				trials[i]["label_low"] = params["label_low"] || "Not at all similar";
				trials[i]["label_high"] = params["label_high"] || "Identical";
				if(params["data"]!=undefined){
					trials[i]["data"] = params["data"][i];
				}
			}
			return trials;
		}
		
		var sim_trial_complete = false;

		plugin.trial = function($this, block, trial, part)
		{
			switch(part){
				case 1:
					sim_trial_complete = false;
					// show the images
					$this.append($('<img>', {
						"src": trial.a_path,
						"class": 'sim'
					}));
					
					setTimeout(function(){plugin.trial($this, block, trial, part + 1)}, trial.timing_first_image);
					break;
					
				case 2:
				
					$('.sim').remove();
					
					setTimeout(function(){plugin.trial($this, block, trial, part + 1)}, trial.timing_image_gap);
					break;
				case 3:
				
					$this.append($('<img>', {
						"src": trial.b_path,
						"class": 'sim',
						"id": 'jspsych_sim_second_image'
					}));
					
					if(trial.timing_second_image > 0)
					{
						setTimeout(function(){
							if(!sim_trial_complete) {
								$("#jspsych_sim_second_image").css('visibility', 'hidden');
							}
						}, trial.timing_second_image);
					}

					// create slider
					$this.append($('<div>', { "id": 'slider', "class": 'sim' }));
					$("#slider").slider(
						{
							value:50,
							min:0,
							max:100,
							step:1,
						});
					
					
					// create labels for slider
					$this.append($('<div>', {"id": 'slider_labels', "class": 'sim'}));
					
					$('#slider_labels').append($('<p class="slider_left sim">'+trial.label_low+'</p>'));
					$('#slider_labels').append($('<p class="slider_right sim">'+trial.label_high+'</p>'));
						
					//  create button
					$this.append($('<button>', {'id':'next','class':'sim'}));
					$("#next").html('Next');
					$("#next").click(function(){
						sim_trial_complete = true;
						plugin.trial($this,block,trial,part+1);
					});
					break;
				case 4:
					// get data
					var score = $("#slider").slider("value");
					block.data[block.trial_idx] = $.extend({},{"sim_score": score, "a_path": trial.a_path, "b_path": trial.b_path},trial.data);
					// goto next trial in block
					$('.sim').remove();
					setTimeout(function(){block.next();}, trial.timing_post_trial);
					break;
			}
		}
		
		return plugin;
	})();
})(jQuery);