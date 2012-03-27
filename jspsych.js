// jspsych.js - a jQuery plugin for running psychology experiments
(function( $ ) {
	$.fn.jsPsych = function(options) {
		// build main options list before element iteration
		var opts = $.extend({}, $.fn.jsPsych.defaults, options);
		// exp structure
		var exp_blocks = [];
		var curr_block = 0;
		// execute experiment
		return this.each(function() {
			$this = $(this);
			
			// take the experiment structure and dynamically create a set of blocks
			exp_blocks = new Array(opts["experiment_structure"].length);
			
			for(var i = exp_blocks.length-1; i>=0; i--)
			{
				var trials = "undefined";
				
				for(var j = 0; j < opts["plugins"].length; j++)
				{
					if(opts["experiment_structure"][i]["type"] == opts["plugins"][j]["type"])
					{
						trials = opts["plugins"][j]["createFunc"].call(null, opts["experiment_structure"][i]);
					}
				}
				
				exp_blocks[i] = createBlock(trials);
				
			}

			// run the first block
			exp_blocks[0].next();
		});
		//
		// private functions //
		//
		function nextBlock()
		{
			curr_block += 1;
			if(curr_block == exp_blocks.length)
			{
				finishExperiment();
			} else {
				exp_blocks[curr_block].next();
			}
		}
		
		function createBlock(trial_list)
		{
			var block = {
				trial_idx: -1,
			
				trials: trial_list,
				
				data: [],
				
				next: function() {
					this.trial_idx = this.trial_idx+1;
				
					curr_trial = trial_list[this.trial_idx];
					
					if ( typeof curr_trial == "undefined"){
						return this.done();
					}
					
					do_trial(this, curr_trial);
				},
				
				done: nextBlock
			}
			
			return block;
		}
		
		function finishExperiment()
		{
			var all_data = [];
			for(var i=0;i<exp_blocks.length;i++)
			{
				all_data[i] = exp_blocks[i].data;
			}
			
			opts["finish"].apply((new Object()), [all_data]); 
		}
		
		function do_trial(block, trial)
		{
			for(var j = 0; j < opts["plugins"].length; j++)
			{
				if(trial.type == opts["plugins"][j]["type"])
				{
					opts["plugins"][j]["trialFunc"].call(this, $this, block, trial, 1);
				}
			}
		}
	};
	//
	// default parameters // 
	//
	$.fn.jsPsych.defaults = {
		// overall experiment parameters
		experiment_structure: [],
		plugins: [
				{"type": "sim",  "createFunc": similarity_create, "trialFunc": similarity_trial},
				{"type": "sd",   "createFunc": sd_create,         "trialFunc": sd_trial},
				{"type": "text", "createFunc": text_create,       "trialFunc": text_trial},
				{"type": "xab",  "createFunc": xab_create,        "trialFunc": xab_trial}]
	};
	//
	// useful helper functions for multiple plugins //
	//
	$.fn.jsPsych.showImage = function($this, img_path, img_class)
	{
		var the_img = document.createElement('img');
		the_img.setAttribute('src', img_path);
		the_img.setAttribute('class',img_class);
		$this.append(the_img);
	}

	$.fn.jsPsych.showImages = function($this, img_list, img_class)
	{
		for(img in img_list)
		{
			$.fn.jsPsych.showImage($this, img_list[img], img_class);
		}
	}
	
}) (jQuery);



