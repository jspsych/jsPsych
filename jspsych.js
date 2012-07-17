// jspsych.js
// 
//	Josh de Leeuw and Drew Hendrickson
//	Percepts and Concepts Lab, Indiana University
//
(function( $ ) {
	jsPsych = (function() {
	
		//
		// public object
		//
		var core = {};
	
		//
		// private class variables
		//
	
		// options
		var opts = {};
		// exp structure
		var exp_blocks = [];
		// flow control
		var curr_block = 0;
		// everything loaded?
		var initialized = false;
		// target DOM element
		var DOM_target;
		
		//
		// public methods
		//
		
		core.init = function($this, options){
			// import options
			opts = $.extend({}, jsPsych.defaults, options);
			// set target
			DOM_target = $this;
			
			run();
		}
		
		// core.data returns all of the data objects for each block as an array
		// 		where core.data[0] = data object from block 0, etc...
		
		core.data = function(){
			var all_data = [];
			for(var i=0;i<exp_blocks.length;i++)
			{
				all_data[i] = exp_blocks[i].data;
			}
			return all_data;
		}
		
		// core.progress returns an object with the following properties
		// 		total_blocks: the number of total blocks in the experiment
		//		total_trials: the number of total trials in the experiment
		//		current_trial_global: the current trial number in global terms
		// 					i.e. if each block has 20 trials and the experiment is
		//					currently in block 2 trial 10, this has a value of 30.
		//		current_trial_local: the current trial number within the block.
		//		current_block: the current block number.
		
		core.progress = function(){
		
			var total_trials = 0;
			for(var i=0; i<exp_blocks.length; i++) { total_trials += exp_blocks[i].num_trials; }
			
			var current_trial_global = 0;
			for(var i=0; i<curr_block; i++) { current_trial_global += exp_blocks[i].num_trials; }
			current_trial_global += exp_blocks[curr_block].trial_idx;
		
			var obj = {
				"total_blocks": exp_blocks.length,
				"total_trials": total_trials,
				"current_trial_global": current_trial_global,
				"current_trial_local": exp_blocks[curr_block].trial_idx,
				"current_block": curr_block
			};
			
			return obj;		
		}
		
		//
		// private functions //
		//
		function run()
		{
			// take the experiment structure and dynamically create a set of blocks
			exp_blocks = new Array(opts["experiment_structure"].length);
			
			// iterate through block list to create trials
			for(var i = 0; i < exp_blocks.length; i++)
			{
				var trials = jsPsych[opts["experiment_structure"][i]["type"]]["create"].call(null, opts["experiment_structure"][i]);
				
				exp_blocks[i] = createBlock(trials);
			}

			// run the first block
			exp_blocks[0].next();
		}
		
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
				
					var curr_trial = trial_list[this.trial_idx];
					
					if ( typeof curr_trial == "undefined"){
						return this.done();
					}
					
					do_trial(this, curr_trial);
				},
				
				done: nextBlock,
				
				num_trials: trials_list.length
			}
			
			return block;
		}
		
		function finishExperiment()
		{
			opts["finish"].apply((new Object()), [core.data()]); 
		}
		
		function do_trial(block, trial)
		{
			jsPsych[trial.type]["trial"].call(this, DOM_target, block, trial, 1);
		}
		
		return core;
	})();
}) (jQuery);



