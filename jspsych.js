// jspsych.js
// 
//	Josh de Leeuw 
//	Percepts and Concepts Lab, Indiana University
//
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
		// time that the experiment began
		var exp_start_time;
		
		//
		// public methods
		//
		
		// core.init creates the experiment and starts running it
		//		display_element is an HTML element (usually a <div>) that will display jsPsych content
		//		options is an object: {
		//			"experiment_structure": an array of blocks specifying the experiment
		//			"finish": function to execute when the experiment ends
		//		}
		//
		core.init = function(display_element, options){
		
			// reset the key variables
			// TODO: properly define this as a class with instance variables?
			exp_blocks = [];
			opts = {};
			initialized = false;
			curr_block = 0;
			
		
			var defaults = {
				'on_trial_start': function(){ return undefined; },
				'on_trial_finish': function() { return undefined; },
				'on_data_update' : function(data) { return undefined; }
			};
			// import options
			opts = $.extend({}, defaults, options);
			// set target
			DOM_target = display_element;
			
			run();
		};
		
		// core.data returns all of the data objects for each block as an array
		//      where core.data[0] = data object from block 0, etc...
		
		core.data = function(){
			var all_data = [];
			for(var i=0;i<exp_blocks.length;i++)
			{
				all_data[i] = exp_blocks[i].data;
			}
			return all_data;
		};
		
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
		
		// core.startTime() returns the Date object which represents the time that the experiment started.
				
		core.startTime = function(){
			return exp_start_time;
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
			
			// record the start time
			exp_start_time = new Date();

			// begin! - run the first block
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
				
					// call on_trial_finish() 
					//     if not very first trial
					//		and not the last call in this block (no trial due to advance in block)
					if(typeof this.trials[this.trial_idx+1] != "undefined" && (curr_block !=0 || this.trial_idx > -1)) { opts.on_trial_finish() };
					
					this.trial_idx = this.trial_idx+1;
				
					var curr_trial = this.trials[this.trial_idx];
					
					if ( typeof curr_trial == "undefined"){
						return this.done();
					}
					
					// call on_trial_start()
					opts.on_trial_start();
							
					do_trial(this, curr_trial);
				},
				
				writeData: function(data_object) {
				    this.data[this.trial_idx] = data_object;
				    opts.on_data_update(data_object);
				},
				
				done: nextBlock,
				
				num_trials: trial_list.length
			}
			
			return block;
		}
		
		function finishExperiment()
		{
			opts["finish"].apply((new Object()), [core.data()]); 
		}
		
		function do_trial(block, trial)
		{
			// execute trial method
			jsPsych[trial.type]["trial"].call(this, DOM_target, block, trial, 1);
		}
		
		return core;
	})();
}) (jQuery);



