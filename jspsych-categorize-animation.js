// jsPsych plugin for showing animations
// Josh de Leeuw

(function( $ ) {
	jsPsych.categorize_animation = (function(){
	
		var plugin = {};
	
		plugin.create = function(params) {
			stims = params["stimuli"];
			trials = new Array(stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "categorize_animation";
				trials[i]["stims"] = stims[i];
				trials[i]["frame_time"] = params["frame_time"];
				trials[i]["timing"] = params["timing"];
				trials[i]["key_answer"] = params["key_answer"][i];
				trials[i]["text_answer"] = params["text_answer"][i];
				trials[i]["choices"] = params["choices"];
				trials[i]["correct_text"] = params["correct_text"];
				trials[i]["incorrect_text"] = params["incorrect_text"];
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
			var animate_frame = -1;
			var reps = 0;
			var responded = false;
			var timeoutSet = false;
			switch(part)
			{
				case 1:
					var startTime = (new Date()).getTime();
					
					// show animation
					animate_interval = setInterval(function(){
						$this.html(""); // clear everything
						animate_frame++;
						if(animate_frame == trial.stims.length)
						{
							animate_frame = 0;
							reps++;
						}
						
						$this.append($('<img>', {
							"src": trial.stims[animate_frame],
							"class": 'animate'
						}));
						if(!responded) {
							if(trial.prompt != undefined) { $this.append(trial.prompt); }
						} else {
							// show feedback
							var atext = "";
							if(block.data[block.trial_idx]["correct"])
							{
								atext = trial.correct_text.replace("&ANS&", trial.text_answer);
							} else {
								atext = trial.incorrect_text.replace("&ANS&", trial.text_answer);
							}
							$this.append(atext);
							if(!timeoutSet)
							{
								timeoutSet = true;
								setTimeout(function(){plugin.trial($this, block, trial, part + 1);}, trial.timing[0]);
							}
						}
							
						
					}, trial.frame_time);
					
					// attach response function
					
					var resp_func = function(e) {
					
						var flag = false; // valid keystroke?
						var correct = false; // correct answer?
						
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
						if(flag) // if keystroke is one of the choices
						{							
							responded = true;
							endTime = (new Date()).getTime();
							rt = (endTime-startTime);
							
							var trial_data = {"rt": rt, "correct": correct, "key_press": e.which}
							block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
							$(document).unbind('keyup',resp_func);
						}
					}
					$(document).keyup(resp_func);
					break;
					
				case 2:
					clearInterval(animate_interval); // stop animation!
					$this.html(''); // clear everything
					setTimeout(function(){ block.next(); }, trial.timing[1]);
					break;
			}			
		}
		
		return plugin;
	})();
})(jQuery);