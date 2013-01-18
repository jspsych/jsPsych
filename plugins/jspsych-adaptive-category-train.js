/* jspsych-adaptive-category-train.js
 *	Josh de Leeuw, Nov. 2012
 *
 *	Train subjects on a category task adaptively.
 *	Stimuli are presented in blocks, and after a particular stimulus has been identified correctly in X
 * 	consecutive blocks, it is removed from the training list. Training ends after all stimuli have been
 *	correctly identified in X consecutive blocks.
 *
 */
 
(function($) {
	jsPsych.adaptive_category_train = (function() {
	
		var plugin = {};
		
		plugin.create = function(params) {
			trials = []; // everything is a single trial, since it is unknown how many presentations it will take.
			
			trials[0] = {};
			trials[0].type = "adaptive_category_train";
			trials[0].items = params["items"]; // array of all the stimuli to learn
			trials[0].correct_key = params["correct_key"]; // array of all the correct key responses
			trials[0].text_answer = params["text_answer"]; // the labels of the category members
			trials[0].choices = params["choices"]; // valid key responses
			trials[0].correct_text = params["correct_text"]; // feedback text for correct answers.
			trials[0].incorrect_text = params["incorrect_text"]; // feedback text for incorrect answers
			trials[0].consecutive_correct_min = params["consecutive_correct_min"]; // how many times they have to get the correct answer in a row for a stim.
			trials[0].min_percent_correct = params["min_percent_correct"] || 60; // percent correct needed to have adaptive training kick in
			trials[0].min_items_per_block = params["min_items_per_block"] || 5; // when remaining items is less than this #, completed items are added back in.
			trials[0].stop_training_criteria = params["stop_training_criteria"] || -1; // after this number of rounds below min_percent_correct, stop training. -1 = continue indefinitely.
			// timing
			trials[0].timing_display_feedback = params["timing_display_feedback"] || 1500; // default 1000ms
			trials[0].timing_post_trial = params["timing_post_trial"] || 1000; // default 1000ms between trials.
			// display progress ?
			trials[0].show_progress = params["show_progress"] || true;
			
			// optional parameters
			if(params["data"]!=undefined){
				trials[0].data = params["data"];
			}
			if(params["prompt"]!=undefined){
				trials[0].prompt = params["prompt"];
			}
		
			return trials;
		}
		
		plugin.trial = function(display_element, block, trial, part)
		{
			// create a tally for each item
			var all_items = [];
			for(var i=0; i<trial.items.length; i++)
			{
				all_items.push({
					"a_path": trial.items[i], 
					"consecutive_correct_responses": 0,
					"correct_key": trial.correct_key[i],
					"text_answer": trial.text_answer[i],
					"choices":trial.choices,
					"correct_text": trial.correct_text,
					"incorrect_text": trial.incorrect_text,
					"min_percent_correct": trial.min_percent_correct,
					"timing_post_trial": trial.timing_post_trial,
					"timing_display_feedback": trial.timing_display_feedback,
					"prompt": trial.prompt,
					"complete": false
				});
			};
			
			// create the training controller
			var controller = new TrainingControl(all_items, trial.consecutive_correct_min, trial.min_items_per_block, 
												trial.min_percent_correct, display_element, block, trial.show_progress, trial.timing_post_trial,
												trial.stop_training_criteria);
			controller.next_round(); // when this finishes, block.next() is called.
		}
			
		function TrainingControl(items, min_correct, min_per_block, min_percent_correct, display_element, block, show_progress, timing_post_trial, stop_criteria){
			
			this.total_items = items.length;
			this.remaining_items = items;
			this.timing_post_trial = timing_post_trial;
			this.complete_items = [];
			this.curr_block = 0;
			this.blocks_under_thresh = 0;
			
			this.next_round = function() {
				
				if(stop_criteria > -1 && this.blocks_under_thresh >=stop_criteria)
				{
					// end training due to failure to learn
					
					block.next();
				} else {
					if(this.remaining_items.length > 0)
					{
						if(this.remaining_items.length < min_per_block) 
						{
							shuffle(this.complete_items);
							for( var i = 0; this.remaining_items.length < min_per_block; i++) 
							{
								this.remaining_items.push(this.complete_items[i]);
							}
						}
						// present remaining items in random order
						shuffle(this.remaining_items);
						var iterator = new TrialIterator(display_element, this.remaining_items, this, block, this.curr_block);
						this.curr_block++;
						var updated_trials = iterator.next(); // when this finishes, all trials are complete.
						// updated_trials will have the updated consecutive correct responses
					
					} else {
						// end training
						block.next();
					}
				}
			}
			
			this.round_complete = function(trials)
			{
				// check items for threshold and remove items where consecutive responses has been reached
				var cont_trials = [];
				
				this.remaining_items = trials;
				var score_denominator = this.remaining_items.length;
				var score_numerator = 0;
				
				
				for(var i=0; i<this.remaining_items.length; i++)
				{
					if(this.remaining_items[i].consecutive_correct_responses > 0)
					{
						score_numerator++;
					}
				}
				
				var percent_correct = Math.round((score_numerator / score_denominator)*100);
				
				if(percent_correct < min_percent_correct){
					this.blocks_under_thresh++;
				} else {
					this.blocks_under_thresh = 0;
				}
				
				for(var i=0; i<this.remaining_items.length; i++)
				{
					if(this.remaining_items[i].complete == false)
					{
						if(this.remaining_items[i].consecutive_correct_responses < min_correct)
						{
							cont_trials.push(this.remaining_items[i]);
						} else {
							if(percent_correct>=min_percent_correct){
								// newly completed item
								this.remaining_items[i].complete = true;
								this.complete_items.push(this.remaining_items[i]);
							} else {
								cont_trials.push(this.remaining_items[i]);
							}
						}
					}
				}
				
				this.remaining_items = cont_trials;
				
				var remaining_objects = this.remaining_items.length;
				var completed_objects = this.total_items - remaining_objects;
				
				
				if(show_progress)
				{
					this.display_progress(completed_objects, remaining_objects, score_numerator, score_denominator);
				} else {
					// call next round
					this.next_round();
				}
			}
			
			this.display_progress = function(completed_objects, remaining_objects, score_numerator, score_denominator, blocks_under_criteria)
			{
				var completed = '';
				
				var percent_correct = Math.round((score_numerator / score_denominator)*100);
				
				if(percent_correct < min_percent_correct)
				{
					completed = '<p>You need to categorize at least '+min_percent_correct+'% of the items correctly in each round in order to make progress in training.</p>'
					if(stop_criteria > -1) {
						var remaining_blocks = stop_criteria - this.blocks_under_thresh;
						if(remaining_blocks >= 1){
							completed += '<p>If you continue to have an accuracy below '+min_percent_correct+'% for '+remaining_blocks+' more round(s) of training, then training will stop and you will not be eligible for the bonus payment.</p>'
						} else {
							completed += '<p>Training will now stop because your accuracy was below '+min_percent_correct+'% for '+stop_criteria+' consecutive rounds.</p>'
						}
					}
					
				} else {
					if(remaining_objects == 0)
					{
						completed = '<p>Congratulations! You have completed training.</p>';
					} 
					else if(completed_objects > 0)
					{
						completed = '<p>You have correctly categorized '+completed_objects+' item(s) in '+min_correct+' consecutive rounds. You need to correctly categorize '+remaining_objects+
						' more item(s) in '+min_correct+' consecutive rounds to complete training. Items that you have correctly identified in '+min_correct+' consecutive rounds will not be shown as frequently.</p>';
					} 
					else 
					{
						completed = '<p>Good job! You need to categorize an item correctly in '+min_correct+' consecutive rounds to finish training for that item. Once you have finished training for all items the next part of the experiment will begin.</p>';
					}
				}
				
				display_element.html(
					'<div id="adaptive_category_progress"><p>You correctly categorized '+percent_correct+'% of the items in that round.</p>'+completed+'<p>Press ENTER to continue.</p></div>'
				);
				
				var controller = this;
				
				var key_listener = function(e) {
					if(e.which=='13') 
					{			
						$(document).unbind('keyup',key_listener); // remove the response function, so that it doesn't get triggered again.
						display_element.html(''); // clear the display
						setTimeout(function(){controller.next_round();}, this.timing_post_trial); // call block.next() to advance the experiment after a delay.
					}
				}
				$(document).keyup(key_listener);				
			}
		}
		
		function TrialIterator(display_element, trials, controller, block, block_idx){	
			this.trials = trials;
			this.curr_trial = 0;
			this.curr_block = block_idx;
			
			this.next = function() {
				if(this.curr_trial >= this.trials.length)
				{
					// call function in the controller
					controller.round_complete(trials);
				} else {
					this.do_trial(this.trials[this.curr_trial], this.curr_trial, this.curr_block);
				}
			}
			
			this.do_trial = function(trial, t_idx, b_idx)
			{
				// do the trial!
				
				// show the image
				display_element.append($('<img>', {
						"src": trial.a_path,
						"class": 'cf'
					}));
					
				display_element.append(trial.prompt);
				
				startTime = (new Date()).getTime();
				
				// get response
				var resp_func = function(e) {
					var flag = false;
					var correct = false;
					if(e.which==trial.correct_key) // correct category
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
						// get response time
						endTime = (new Date()).getTime();
						rt = (endTime-startTime);
						
						// update the consecutive correct responses
						if(correct){
							trial.consecutive_correct_responses++;
						} else {
							trial.consecutive_correct_responses = 0;
						}
						
						
						// store data
						var trial_data = {"block": b_idx, "trial_idx": t_idx, "rt": rt, "correct": correct, "a_path": trial.a_path, "key_press": e.which, "trial_type":"adaptive_train"}
						if(trial.data!="undefined"){
							block.data.push($.extend({},trial_data,trial.data));
						} else {
							block.data.push(trial_data);
						}
						$(document).unbind('keyup',resp_func);
						display_element.html('');
						show_feedback(correct, e.data.iterator_object);
					}
				}
				
				$(document).keyup({"iterator_object":this},resp_func);
				
				// provide feedback
				function show_feedback(is_correct, iterator_object){
					
					display_element.append($('<img>', {
						"src": trial.a_path,
						"class": 'cf'
					}));
					
					// give feedback
					var atext = "";
					if(is_correct)
					{
						atext = trial.correct_text.replace("&ANS&", trial.text_answer);
					} else {
						atext = trial.incorrect_text.replace("&ANS&", trial.text_answer);
					}
					display_element.append(atext);
					setTimeout(function(){finish_trial(iterator_object);}, trial.timing_display_feedback);		
				}
				
				function finish_trial(iterator_object){
					display_element.html('');
					
					setTimeout(function(){
						iterator_object.curr_trial++;
						iterator_object.next();
					}, trial.timing_post_trial);	
				}
			}
		}
		
		function shuffle(array) {
			var tmp, current, top = array.length;

			if(top) while(--top) {
				current = Math.floor(Math.random() * (top + 1));
				tmp = array[current];
				array[current] = array[top];
				array[top] = tmp;
			}
			
			return array;
		}
		
		return plugin;
	})();
})(jQuery);
