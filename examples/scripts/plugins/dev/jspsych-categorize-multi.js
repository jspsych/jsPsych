// timing parameters: [length to show feedback, intertrial gap, optional length to display target]
// if optional length to display target is missing, then target is displayed until subject responds.

//TODO 
// option to keep stim on screen during feedback
// way to provide corrective feedback

(function( $ ) {
	jsPsych.categorize_multi = (function(){
	
		var plugin = {};
	
		plugin.create = function(params) {
			cf_stims = params["stimuli"];
			trials = new Array(cf_stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "categorize_multi";
				trials[i]["a_path"] = cf_stims[i];
				trials[i]["choices"] = params["choices"];
				trials[i]["answer_idx"] = params["answer_idx"][i];
				trials[i]["text_answer"] = params["text_answer"][i];
				trials[i]["correct_text"] = params["correct_text"];
				trials[i]["incorrect_text"] = params["incorrect_text"];
				trials[i]["show_stim_feedback"] = params["show_stim_feedback"] || true;
				// timing params
				trials[i]["timing_length_of_feedback"] = params["timing_length_of_feedback"] || 2000;
				// opt params
				if(params["prompt"] != undefined){
					trials[i]["prompt"] = params["prompt"];
				}
				if(params["data"]!=undefined){
					trials[i]["data"] = params["data"][i];
				}
			}
			return trials;
		}
		
		// to save correct_answers between iterations of trial method...
		var correct_answers = [];
		
		plugin.trial = function(display_element, block, trial, part)
		{
			switch(part){
				case 1:
					// show image
					display_element.append($('<img>', {
						"src": trial.a_path,
						"class": 'cm'
					}));
					
					// hide image if the timing param is set.
					if(trial.timing_show_image > 0)
					{
						setTimeout(function(){
							$('.cm').css('visibility', 'hidden');
						}, trial.timing_show_image);
					}
					
					// show prompt
					display_element.append(trial.prompt);
					
					
					// start recording for RT
					startTime = (new Date()).getTime();
					
					// display button choices
					// for each SET of choices
					for(var i = 0; i<trial.choices.length; i++)
					{
						// add a DIV
						display_element.append($('<div>', {
							"id": "cm_"+i
						}));
						// for each INDIVIDUAL choice
						for(var j = 0; j < trial.choices[i].length; j++)
						{
							// add a RADIO button
							$('#cm_'+i).append($('<input>', {
								"type": "radio",
								"name": "category_"+i,
								"value": trial.choices[i][j],
								"id": "cat_"+i+"_"+j								
							}));
							
							$('#cm_'+i).append('<label>'+trial.choices[i][j]+'</label>');
							
						}
					}
					
					// add a button to hit when done.
					display_element.append($('<button>', {
						"type": "button",
						"value": "done",
						"name": "Next",
						"id": "nextBtn",
						"html": "Submit Answer"
					}));
					
					// add response function to the button.
					$('#nextBtn').click(function(){
							
						var correct_overall = true;
						var string_answers = "";
						correct_answers = [];
						
						for(var i=0; i<trial.answer_idx.length; i++)
						{
							var corr_choice = trial.answer_idx[i];
							if($('#cat_'+i+'_'+corr_choice).is(':checked'))
							{
								correct_answers.push(true);
								string_answers = string_answers + "1";
							} else {
								correct_answers.push(false);
								correct_overall = false;
								string_answers = string_answers + "0";
							}
						}
						
						// measure RT
						endTime = (new Date()).getTime();
						rt = (endTime-startTime);
						
						// save data
						var trial_data = {"rt": rt, "correct": correct_overall, "a_path": trial.a_path, "cat_answers": string_answers}
						block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
						
						// clear everything
						display_element.html('');
						
						plugin.trial(display_element, block, trial, part + 1);
						
					});
					break;
				case 2:
					// show image
					display_element.append($('<img>', {
						"src": trial.a_path,
						"class": 'cm'
					}));
					
					// show prompt
					display_element.append(trial.prompt);
					
					// give feedback
					var atext = "";
					for(var i=0; i<correct_answers.length; i++)
					{
						// add a DIV
						display_element.append($('<div>', {
							"id": "cm_"+i
						}));
						
						var text_to_add = "";
						if(correct_answers[i])
						{
							text_to_add = trial.correct_text.replace("&ANS&", trial.text_answer[i]);
							$('#cm_'+i).addClass('correct');
						} else {
							text_to_add = trial.incorrect_text.replace("&ANS&", trial.text_answer[i]);
							$('#cm_'+i).addClass('incorrect');
						}
						
						
						
						$('#cm_'+i).append(text_to_add);
					}
					setTimeout(function(){plugin.trial(display_element, block, trial, part + 1);}, trial.timing_length_of_feedback); // fix timing?
					break;
				case 3:
					display_element.html('');
					setTimeout(function(){block.next()},1000);
					break;
			}
		}
		
		return plugin;
	})();
})(jQuery);
	