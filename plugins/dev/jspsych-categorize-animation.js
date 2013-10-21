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
				trials[i]["allow_response_before_complete"] = params["allow_response_before_complete"] || false;
				trials[i]["reps"] = params["reps"] || -1; // default of -1, which allows indefinitely
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
			var animate_frame = -1;
			var reps = 0;
			
			var showAnimation = true;
	
			var responded = false;
			var timeoutSet = false;
			
			switch(part)
			{
				case 1:
					var startTime = (new Date()).getTime();
					
					// show animation
					animate_interval = setInterval(function(){
						display_element.html(""); // clear everything
						animate_frame++;
						if(animate_frame == trial.stims.length)
						{
							animate_frame = 0;
							reps++;
							// check if reps complete //
							if(trial.reps != -1 && reps >= trial.reps) {
								// done with animation
								showAnimation = false;
							}
						}
						
						if( showAnimation ) {
							display_element.append($('<img>', {
								"src": trial.stims[animate_frame],
								"class": 'animate'
							}));
						}
						
						if(!responded && trial.allow_response_before_complete) {
							// in here if the user can respond before the animation is done
							if(trial.prompt != undefined) { display_element.append(trial.prompt); }
						} else if(!responded) {
							// in here if the user has to wait to respond until animation is done.
							// if this is the case, don't show the prompt until the animation is over.
							if( !showAnimation )
							{
								if(trial.prompt != undefined) { display_element.append(trial.prompt); }
							}
						} else {
							// user has responded if we get here.
							
							// show feedback
							var feedback_text = "";
							if(block.data[block.trial_idx]["correct"])
							{
								feedback_text = trial.correct_text.replace("&ANS&", trial.text_answer);
							} else {
								feedback_text = trial.incorrect_text.replace("&ANS&", trial.text_answer);
							}
							display_element.append(feedback_text);
							
							// set timeout to clear feedback
							if(!timeoutSet)
							{
								timeoutSet = true;
								setTimeout(function(){plugin.trial(display_element, block, trial, part + 1);}, trial.timing[0]);
							}
						}
							
						
					}, trial.frame_time);
					
					// attach response function
					
					var resp_func = function(e) {
					
						if(!trial.allow_response_before_complete && showAnimation)
						{
							return false;
						}
					
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
					display_element.html(''); // clear everything
					setTimeout(function(){ block.next(); }, trial.timing[1]);
					break;
			}			
		}
		
		return plugin;
	})();
})(jQuery);