// timing parameters: [length to show feedback, intertrial gap, optional length to display target]
// if optional length to display target is missing, then target is displayed until subject responds.

//TODO 
// option to keep stim on screen during feedback
// way to provide corrective feedback

(function( $ ) {
	jsPsych.categorize_feedback = (function(){
	
		var plugin = {};
	
		plugin.create = function(params) {
			cf_stims = params["stimuli"];
			trials = new Array(cf_stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "categorize_feedback";
				trials[i]["a_path"] = cf_stims[i];
				trials[i]["timing"] = params["timing"];
				trials[i]["key_answer"] = params["key_answer"][i];
				trials[i]["text_answer"] = params["text_answer"][i];
				trials[i]["choices"] = params["choices"];
				trials[i]["correct_text"] = params["correct_text"];
				trials[i]["incorrect_text"] = params["incorrect_text"];
				trials[i]["show_stim_feedback"] = params["show_stim_feedback"];
				if(params["prompt"] != undefined){
					trials[i]["prompt"] = params["prompt"];
				}
				if(params["data"]!=undefined){
					trials[i]["data"] = params["data"][i];
				}
			}
			return trials;
		}

		plugin.trial = function($this, block, trial, part)
		{
			switch(part){
				case 1:
					p1_time = (new Date()).getTime();
					$this.append($('<img>', {
						"src": trial.a_path,
						"class": 'cf'
					}));
					if(trial.timing[2]!=undefined){
						setTimeout(function(){plugin.trial($this, block, trial, part + 1);}, trial.timing[2]);
					} else {
						//show prompt here
						$this.append(trial.prompt);
						plugin.trial($this, block, trial, part + 1);
					}
					break;
				case 2:
					p2_time = (new Date()).getTime();
					if(trial.timing[2]!=undefined){
						$('.cf').remove();
						$this.append(trial.prompt);
					}
					startTime = (new Date()).getTime();
					var resp_func = function(e) {
						var flag = false;
						var correct = false;
						if(e.which==trial.key_answer) // correct category
						{
							flag = true;
							correct = true;
						} 
						else
						{
							// check if the key is any of the options, or if it is an accidental keystroke
							for(var i=0;i<trial.choices.length;i++)
							{
								if(e.which==trial.choices[i])
								{ 
									flag = true;
									correct = false;
								}
							}
						}
						if(flag)
						{
							endTime = (new Date()).getTime();
							rt = (endTime-startTime);
							stim1_time = (p2_time-p1_time);
							var trial_data = {"rt": rt, "correct": correct, "a_path": trial.a_path, "key_press": e.which, "stim1_time": stim1_time}
							block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
							$(document).unbind('keyup',resp_func);
							$this.html('');
							plugin.trial($this, block, trial, part + 1);
						}
					}
					$(document).keyup(resp_func);
					break;
				case 3:
					if(trial.show_stim_feedback)
					{
						$this.append($('<img>', {
							"src": trial.a_path,
							"class": 'cf'
						}));
					}
					// give feedback
					var atext = "";
					if(block.data[block.trial_idx]["correct"])
					{
						atext = trial.correct_text.replace("&ANS&", trial.text_answer);
					} else {
						atext = trial.incorrect_text.replace("&ANS&", trial.text_answer);
					}
					$this.append(atext);
					setTimeout(function(){plugin.trial($this, block, trial, part + 1);}, trial.timing[0]);
					break;
				case 4:
					$this.html("");
					setTimeout(function(){block.next();}, trial.timing[1]);
					break;
			}
		}
		
		return plugin;
	})();
})(jQuery);
	