(function( $ ) {
	jsPsych.touch_freepick = (function(){
	
		var plugin = {};
	
		plugin.create = function(params) {
			stims = params["stims"];
			trials = new Array(stims.length);
			for(var i = 0; i < trials.length; i++)
			{
				trials[i] = {};
				trials[i]["type"] = "touch_freepick";
				trials[i]["stims"] = stims[i];
				trials[i]["answer_text"] = params["answer_text"][i] || "";
				trials[i]["timing"] = params["timing"];
				trials[i]["force_correct_pick"] = params["force_correct_pick"] || false;
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
					
					var order = [];
					for(var i=0;i<trial.stims.length;i++)
					{
						order.push(i);
					}
					
					order = shuffle(order);
					
					// add images
					for(var i=0;i<trial.stims.length;i++){
						display_element.append($('<img>', {
							"src": trial.stims[order[i]],
							"class": 'freepick',
							"id":'fp'+order[i]
						}));
					}
					
					// need to pick the right one!
					if(trial.force_correct_pick) {
						$("#fp0").click(
							function(){
							// clear everything
								display_element.html('');
								// add only target
								display_element.append($('<img>', {
									"src": trial.stims[0],
									"class": 'freepick',
									"id":'fp_answer'
								}));
								display_element.append($('<p class="answer">'+trial.answer_text+'</p>'));
								setTimeout(function(){plugin.trial(display_element,block,trial,part+1)}, trial.timing[0]);
							}
						);
					}
					
					break;
				case 2:
					display_element.html('');
					
					setTimeout(function(){block.next();}, trial.timing[1]);
					break;
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