/**
 * jspsych.js
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 **/
(function($) {
	jsPsych = (function() {

		var core = {};

		//
		// private variables
		//

		// options
		var opts = {};
		// exp structure
		var root_chunk;
		// flow control
		var curr_chunk = 0;
		var global_trial_index = 0;
		var current_trial = {};
		// target DOM element
		var DOM_target;
		// time that the experiment began
		var exp_start_time;

		//
		// public methods
		//

		core.init = function(options) {

			// reset variables
			root_chunk = {};
			opts = {};
			curr_chunk = 0;

			// check if there is a body element on the page
			var default_display_element = $('body');
			if (default_display_element.length === 0) {
				$(document.documentElement).append($('<body>'));
				default_display_element = $('body');
			}

			var defaults = {
				'display_element': default_display_element,
				'on_finish': function(data) {
					return undefined;
				},
				'on_trial_start': function() {
					return undefined;
				},
				'on_trial_finish': function() {
					return undefined;
				},
				'on_data_update': function(data) {
					return undefined;
				},
				'show_progress_bar': false,
				'max_load_time': 30000,
				'skip_load_check': false
			};

			// override default options if user specifies an option
			opts = $.extend({}, defaults, options);

			// set target
			DOM_target = opts.display_element;

			// add CSS class to DOM_target
			DOM_target.addClass('jspsych-display-element');

			// create experiment structure
			root_chunk = parseExpStructure(opts.experiment_structure);

			// wait for everything to load
			if(opts.skip_load_check){
				startExperiment();
			} else {
				allLoaded(startExperiment, opts.max_load_time);
			}
		};

		core.progress = function() {

			var obj = {
				"total_trials": root_chunk.length(),
				"current_trial_global": global_trial_index,
				"current_trial_local": root_chunk.currentTrialLocalIndex(),
				"total_chunks": root_chunk.timeline.length,
				"current_chunk": root_chunk.currentTimelineLocation
			};

			return obj;
		};

		core.startTime = function() {
			return exp_start_time;
		};

		core.totalTime = function() {
			return (new Date()).getTime() - exp_start_time.getTime();
		};

		core.preloadImages = function(images, callback_complete, callback_load) {

			// flatten the images array
			images = flatten(images);

			var n_loaded = 0;
			var loadfn = (typeof callback_load === 'undefined') ? function() {} : callback_load;
			var finishfn = (typeof callback_complete === 'undefined') ? function() {} : callback_complete;

			for (var i = 0; i < images.length; i++) {
				var img = new Image();

				img.onload = function() {
					n_loaded++;
					loadfn(n_loaded);
					if (n_loaded == images.length) {
						finishfn();
					}
				};

				img.src = images[i];
			}
		};

		core.getDisplayElement = function() {
			return DOM_target;
		};

		core.finishTrial = function(){
			// logic to advance to next trial?

			// handle callback at plugin level
			if (typeof current_trial.on_finish === 'function') {
				var trial_data = jsPsych.data.getDataByTrialIndex(global_trial_index);
				current_trial.on_finish(trial_data);
			}

			// handle callback at whole-experiment level
			opts.on_trial_finish();

			// if timing_post_trial is a function, evaluate it
			var time_gap = (typeof current_trial.timing_post_trial == 'function') ? current_trial.timing_post_trial() : current_trial.timing_post_trial;

			if(time_gap > 0){
				setTimeout(next_trial, time_gap);
			} else {
				next_trial();
			}

			function next_trial(){
				global_trial_index++;

				// advance chunk
				root_chunk.advance();

				// update progress bar if shown
				if (opts.show_progress_bar === true) {
					updateProgressBar();
				}

				// check if experiment is over
				if(root_chunk.isComplete()){
					finishExperiment();
					return;
				}

				doTrial(root_chunk.next());
			}
		};

		core.endExperiment = function(){
			root_chunk.end();
		}

		core.endCurrentChunk = function(){
			root_chunk.endCurrentChunk();
		}

		core.currentTrial = function(){
			return current_trial;
		};

		core.initSettings = function(){
			return opts;
		};

		core.currentChunkID = function(){
			return root_chunk.activeChunkID();
		};

		function allLoaded(callback, max_wait){

			var refresh_rate = 1000;
			var max_wait = max_wait || 30000;
			var start = (new Date()).getTime();

			var interval = setInterval(function(){
				if(jsPsych.pluginAPI.audioLoaded()){
					clearInterval(interval);
					callback();
				} else if((new Date()).getTime() - max_wait > start){
					console.error('Experiment failed to load all resouces in time alloted');
				}
			}, refresh_rate);

		}

		function parseExpStructure(experiment_structure) {

			if(!Array.isArray(experiment_structure)){
				throw new Error("Invalid experiment structure. Experiment structure must be an array");
			}

			return createExperimentChunk({
				chunk_type: 'root',
				timeline: experiment_structure
			});

		}

		function createExperimentChunk(chunk_definition, parent_chunk, relative_id){

			var chunk = {};

			chunk.timeline = parseChunkDefinition(chunk_definition.timeline);
			chunk.parentChunk = parent_chunk;
			chunk.relID = relative_id;

			chunk.type = chunk_definition.chunk_type; // root, linear, while, if

			chunk.currentTimelineLocation = 0;
			// this is the current trial since the last time the chunk was reset
			chunk.currentTrialInTimeline = 0;
			// this is the current trial since the chunk started (incl. resets)
			chunk.currentTrialInChunk = 0;
			// flag that indicates the chunk is done; overrides loops and ifs
			chunk.done = false;

			chunk.iteration = 0;

			chunk.length = function(){
				// this will recursively get the number of trials on this chunk's timeline
				var n = 0;
				for(var i=0; i<this.timeline.length; i++){
					n += this.timeline[i].length;
				}
				return n;
			};

			chunk.activeChunkID = function(){
				if(this.timeline[this.currentTimelineLocation].type === 'block'){
					return this.chunkID();
				} else {
					return this.timeline[this.currentTimelineLocation].activeChunkID();
				}
			};

			chunk.endCurrentChunk = function(){
				if(this.timeline[this.currentTimelineLocation].type === 'block'){
					this.end();
				} else {
					this.timeline[this.currentTimelineLocation].endCurrentChunk();
				}
			}

			chunk.chunkID = function() {

				if(typeof this.parentChunk === 'undefined') {
					return 0 + "-" + this.iteration;
				} else {
					return this.parentChunk.chunkID() + "." + this.relID + "-" + this.iteration;
				}

			};

			chunk.next = function() {
				// return the next trial in the block to be run

				// if chunks might need their conditional_function evaluated
				if(this.type == 'if' && this.currentTimelineLocation == 0){
					if(!chunk_definition.conditional_function()){
						this.end();
						this.parentChunk.advance();
						return this.parentChunk.next();
					}
				}

				return this.timeline[this.currentTimelineLocation].next();
			};

			chunk.end = function(){
				// end the chunk no matter what
				chunk.done = true;
			}

			chunk.advance = function(){
				// increment the current trial in the chunk

				this.timeline[this.currentTimelineLocation].advance();

				while(this.currentTimelineLocation < this.timeline.length &&
					this.timeline[this.currentTimelineLocation].isComplete()){
					this.currentTimelineLocation++;
				}

				this.currentTrialInTimeline++;
				this.currentTrialInChunk++;

			};

			chunk.isComplete = function() {
				// return true if the chunk is done running trials
				// return false otherwise

				// if done flag is set, then we're done no matter what
				if(this.done) { return true; }

				// linear chunks just go through the timeline in order and are
				// done when each trial has been completed once
				// the root chunk is a special case of the linear chunk
				if(this.type == 'linear' || this.type == 'root' || this.type == 'if'){
					if (this.currentTimelineLocation >= this.timeline.length) { return true; }
					else { return false; }
				}

				// while chunks play the block again as long as the continue_function
				// returns true
				else if(this.type == 'while'){
					if (this.currentTimelineLocation >= this.timeline.length) {

						if(chunk_definition.continue_function(this.generatedData())){
							this.reset();
							return false;
						} else {
							return true;
						}

					} else {
						return false;
					}
				}

				/*else if(this.type == 'if'){
					if(this.currentTimelineLocation >= this.timeline.length){
						return true;
					}

					if(this.currentTimelineLocation == 0){
						if(chunk_definition.conditional_function()){
							return false;
						} else {
							return true;
						}
					} else {
						return false;
					}
				}*/

			};

			chunk.currentTrialLocalIndex = function() {

				if(this.currentTimelineLocation >= this.timeline.length) {
					return -1;
				}

				if(this.timeline[this.currentTimelineLocation].type == 'block'){
					return this.timeline[this.currentTimelineLocation].trial_idx;
				} else {
					return this.timeline[this.currentTimelineLocation].currentTrialLocalIndex();
				}
			};

			chunk.generatedData = function() {
				// return an array containing all of the data generated by this chunk for this iteration
				var d = jsPsych.data.getTrialsFromChunk(this.chunkID());
				return d;
			};

			chunk.reset = function() {
				this.currentTimelineLocation = 0;
				this.currentTrialInTimeline = 0;
				this.done = false;
				this.iteration++;
				for(var i = 0; i < this.timeline.length; i++){
					this.timeline[i].reset();
				}
			};

			function parseChunkDefinition(chunk_timeline){

				var timeline = [];

				for (var i = 0; i < chunk_timeline.length; i++) {


					var ct = chunk_timeline[i].chunk_type;

					if(typeof ct !== 'undefined') {

						if($.inArray(ct, ["linear", "while", "if"]) > -1){
							timeline.push(createExperimentChunk(chunk_timeline[i], chunk, i));
						} else {
							throw new Error('Invalid experiment structure definition. Element of the experiment_structure array has an invalid chunk_type property');
						}

					} else {
						// create a terminal block ...
						// check to make sure plugin is loaded
						var plugin_name = chunk_timeline[i].type;
						if (typeof chunk_timeline[i].type === 'undefined'){
							throw new Error("Invalid experiment structure definition. One or more trials is missing a 'type' parameter.");
						}
						if (typeof jsPsych[plugin_name] === 'undefined') {
							throw new Error("Failed attempt to create trials using plugin type " + plugin_name + ". Is the plugin loaded?");
						}

						var trials = jsPsych[plugin_name].create(chunk_timeline[i]);

						// add chunk level data to all trials
						if(typeof chunk_definition.data !== 'undefined'){
							for(t in trials){
								trials[t].data = chunk_definition.data;
							}
						}

						// add block/trial level data to all trials
						trials = addParamToTrialsArr(trials, chunk_timeline[i].data, 'data', undefined, true);

						// add options that are generic to all plugins
						trials = addGenericTrialOptions(trials, chunk_timeline[i]);

						// setting default values for repetitions and randomize_order
						var randomize_order = (typeof chunk_timeline[i].randomize_order === 'undefined') ? false : chunk_timeline[i].randomize_order;
						var repetitions = (typeof chunk_timeline[i].repetitions === 'undefined') ? 1 : chunk_timeline[i].repetitions;

						for(var j = 0; j < repetitions; j++) {
							timeline.push(createBlock(trials, randomize_order));
						}
					}
				}

				return timeline;
			}

			return chunk;

		}

		function createBlock(trial_list, randomize_order) {

			var block = {

				trial_idx: 0,

				trials: trial_list,

				type: 'block',

				randomize_order: randomize_order,

				next: function() {

					// stuff that happens when the block is running from the start
					if(this.trial_idx === 0){
						if(this.randomize_order){
							this.trials = jsPsych.randomization.repeat(this.trials, 1, false);
						}
					}

					var curr_trial = this.trials[this.trial_idx];

					return curr_trial;

				},

				isComplete: function() {
					if(this.trial_idx >= this.trials.length){
						return true;
					} else {
						return false;
					}
				},

				advance: function() {
					this.trial_idx++;
				},

				reset: function() {
					this.trial_idx = 0;
				},

				length: trial_list.length
			};

			return block;
		}

		function startExperiment() {

			// show progress bar if requested
			if (opts.show_progress_bar === true) {
				drawProgressBar();
			}

			// record the start time
			exp_start_time = new Date();

			// begin!
			doTrial(root_chunk.next());
		}

		function addGenericTrialOptions(trials_arr, opts) {

			// modify this list to add new generic parameters
			var genericParameters = ['type', 'timing_post_trial', 'on_finish'];

			// default values for generics above
			var defaultValues = [, 1000, ];

			for (var i = 0; i < genericParameters.length; i++) {
				trials_arr = addParamToTrialsArr(trials_arr, opts[genericParameters[i]], genericParameters[i], defaultValues[i], false);
			}

			return trials_arr;

		}

		function addParamToTrialsArr(trials_arr, param, param_name, default_value, extend) {

			if (typeof default_value !== 'undefined') {
				param = (typeof param === 'undefined') ? default_value : param;
			}

			if (typeof param !== 'undefined') {
				if (Array.isArray(param)) {
					// check if parameter setting is the same length as the number of trials
					if (param.length != trials_arr.length) {
						throw new Error('Invalid specification of parameter ' + param_name + ' in plugin type ' + trials_arr[i].type + '. Length of parameter array does not match the number of trials in the block.');
					} else {
						for (var i = 0; i < trials_arr.length; i++) {
							if(extend && typeof trials_arr[i][param_name] !== 'undefined'){
								trials_arr[i][param_name] = $.extend({}, trials_arr[i][param_name], param[i])
							} else {
								trials_arr[i][param_name] = param[i];
							}
						}
					}
				} else {
					// use the same data object for each trial
					for (var i = 0; i < trials_arr.length; i++) {
						if(extend && typeof trials_arr[i][param_name] !== 'undefined'){
							trials_arr[i][param_name] = $.extend({}, trials_arr[i][param_name], param)
						} else {
							trials_arr[i][param_name] = param;
						}
					}
				}
			}
			return trials_arr;
		}

		function finishExperiment() {
			opts.on_finish(jsPsych.data.getData());
		}

		function doTrial(trial) {

			current_trial = trial;

			// call experiment wide callback
			opts.on_trial_start();

			// execute trial method
			jsPsych[trial.type].trial(DOM_target, trial);
		}

		function drawProgressBar() {
			$('body').prepend($('<div id="jspsych-progressbar-container"><span>Completion Progress</span><div id="jspsych-progressbar-outer"><div id="jspsych-progressbar-inner"></div></div></div>'));
		}

		function updateProgressBar() {
			var progress = jsPsych.progress();

			var percentComplete = 100 * ((progress.current_chunk) / progress.total_chunks);

			$('#jspsych-progressbar-inner').css('width', percentComplete + "%");
		}

		return core;
	})();

	jsPsych.data = (function() {

		var module = {};

		// data storage object
		var allData = [];

		// data properties for all trials
		var dataProperties = {};

		module.getData = function() {
			return $.extend(true, [], allData); // deep clone
		};

		module.write = function(data_object) {

			var progress = jsPsych.progress();
			var trial = jsPsych.currentTrial();

			var trial_opt_data = typeof trial.data == 'function' ? trial.data() : trial.data;

			var default_data = {
				'trial_type': trial.type,
				'trial_index': progress.current_trial_local,
				'trial_index_global': progress.current_trial_global,
				'time_elapsed': jsPsych.totalTime(),
				'internal_chunk_id': jsPsych.currentChunkID()
			};

			var ext_data_object = $.extend({}, data_object, trial_opt_data, default_data, dataProperties);

			allData.push(ext_data_object);

			var initSettings = jsPsych.initSettings();
			initSettings.on_data_update(ext_data_object);
		};

		module.addProperties = function(properties){

			// first, add the properties to all data that's already stored
			for(var i=0; i<allData.length; i++){
				for(var key in properties){
					allData[i][key] = properties[key];
				}
			}

			// now add to list so that it gets appended to all future data
			dataProperties = $.extend({}, dataProperties, properties);
		};

		module.addDataToLastTrial = function(data){
			if(allData.length == 0){
				throw new Error("Cannot add data to last trial - no data recorded so far");
			}
			allData[allData.length-1] = $.extend({},allData[allData.length-1],data);
		}

		module.dataAsCSV = function() {
			var dataObj = module.getData();
			return JSON2CSV(dataObj);
		};

		module.localSave = function(filename, format) {

			var data_string;

			if (format == 'JSON' || format == 'json') {
				data_string = JSON.stringify(module.getData());
			} else if (format == 'CSV' || format == 'csv') {
				data_string = module.dataAsCSV();
			} else {
				throw new Error('invalid format specified for jsPsych.data.localSave');
			}

			saveTextToFile(data_string, filename);
		};

		module.getTrialsOfType = function(trial_type) {
			var data = module.getData();

			data = flatten(data);

			var trials = [];
			for (var i = 0; i < data.length; i++) {
				if (data[i].trial_type == trial_type) {
					trials.push(data[i]);
				}
			}

			return trials;
		};

		module.getTrialsFromChunk = function(chunk_id) {
			var data = module.getData();

			data = flatten(data);

			var trials = [];
			for (var i = 0; i < data.length; i++) {
				if (data[i].internal_chunk_id.slice(0, chunk_id.length) === chunk_id) {
					trials.push(data[i]);
				}
			}

			return trials;
		};

		module.getLastTrialData = function() {
			if(allData.length == 0){
				return {};
			}
			return allData[allData.length-1];
		};

		module.getDataByTrialIndex = function(trial_index) {
			for(var i = 0; i<allData.length; i++){
				if(allData[i].trial_index_global == trial_index){
					return allData[i];
				}
			}
			return undefined;
		}

		module.getLastChunkData = function() {
			var lasttrial = module.getLastTrialData();
			var chunk_id = lasttrial.internal_chunk_id;
			if(typeof chunk_id === 'undefined') {
				return [];
			} else {
				var lastchunkdata = module.getTrialsFromChunk(chunk_id);
				return lastchunkdata;
			}
		}

		module.displayData = function(format) {
			format = (typeof format === 'undefined') ? "json" : format.toLowerCase();
			if (format != "json" && format != "csv") {
				console.log('Invalid format declared for displayData function. Using json as default.');
				format = "json";
			}

			var data_string;

			if (format == 'json') {
				data_string = JSON.stringify(module.getData(), undefined, 1);
			} else {
				data_string = module.dataAsCSV();
			}

			var display_element = jsPsych.getDisplayElement();

			display_element.append($('<pre id="jspsych-data-display"></pre>'));

			$('#jspsych-data-display').text(data_string);
		};

		// private function to save text file on local drive

		function saveTextToFile(textstr, filename) {
			var blobToSave = new Blob([textstr], {
				type: 'text/plain'
			});
			var blobURL = "";
			if (typeof window.webkitURL !== 'undefined') {
				blobURL = window.webkitURL.createObjectURL(blobToSave);
			} else {
				blobURL = window.URL.createObjectURL(blobToSave);
			}

			var display_element = jsPsych.getDisplayElement();

			display_element.append($('<a>', {
				id: 'jspsych-download-as-text-link',
				href: blobURL,
				css: {
					display: 'none'
				},
				download: filename,
				html: 'download file'
			}));
			$('#jspsych-download-as-text-link')[0].click();
		}

		//
		// A few helper functions to handle data format conversion
		//

		// this function based on code suggested by StackOverflow users:
		// http://stackoverflow.com/users/64741/zachary
		// http://stackoverflow.com/users/317/joseph-sturtevant

		function JSON2CSV(objArray) {
			var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
			var line = '';
			var result = '';
			var columns = [];

			var i = 0;
			for (var j = 0; j < array.length; j++) {
				for (var key in array[j]) {
					var keyString = key + "";
					keyString = '"' + keyString.replace(/"/g, '""') + '",';
					if ($.inArray(key, columns) == -1) {
						columns[i] = key;
						line += keyString;
						i++;
					}
				}
			}

			line = line.slice(0, -1);
			result += line + '\r\n';

			for (var i = 0; i < array.length; i++) {
				var line = '';
				for (var j = 0; j < columns.length; j++) {
					var value = (typeof array[i][columns[j]] === 'undefined') ? '' : array[i][columns[j]];
					var valueString = value + "";
					line += '"' + valueString.replace(/"/g, '""') + '",';
				}

				line = line.slice(0, -1);
				result += line + '\r\n';
			}

			return result;
		}

		return module;

	})();

	jsPsych.turk = (function() {

		var module = {};

		// core.turkInfo gets information relevant to mechanical turk experiments. returns an object
		// containing the workerID, assignmentID, and hitID, and whether or not the HIT is in
		// preview mode, meaning that they haven't accepted the HIT yet.
		module.turkInfo = function() {

			var turk = {};

			var param = function(url, name) {
				name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
				var regexS = "[\\?&]" + name + "=([^&#]*)";
				var regex = new RegExp(regexS);
				var results = regex.exec(url);
				return (results == null) ? "" : results[1];
			};

			var src = param(window.location.href, "assignmentId") ? window.location.href : document.referrer;

			var keys = ["assignmentId", "hitId", "workerId", "turkSubmitTo"];
			keys.map(

				function(key) {
					turk[key] = unescape(param(src, key));
				});

			turk.previewMode = (turk.assignmentId == "ASSIGNMENT_ID_NOT_AVAILABLE");

			turk.outsideTurk = (!turk.previewMode && turk.hitId === "" && turk.assignmentId == "" && turk.workerId == "")

			turk_info = turk;

			return turk;

		};

		// core.submitToTurk will submit a MechanicalTurk ExternalHIT type
		module.submitToTurk = function(data) {

			var turkInfo = jsPsych.turk.turkInfo();
			var assignmentId = turkInfo.assignmentId;
			var turkSubmitTo = turkInfo.turkSubmitTo;

			if (!assignmentId || !turkSubmitTo) return;

			var dataString = [];

			for (var key in data) {

				if (data.hasOwnProperty(key)) {
					dataString.push(key + "=" + escape(data[key]));
				}
			}

			dataString.push("assignmentId=" + assignmentId);

			var url = turkSubmitTo + "/mturk/externalSubmit?" + dataString.join("&");

			window.location.href = url;
		};

		return module;

	})();

	jsPsych.randomization = (function() {

		var module = {};

		module.repeat = function(array, repetitions, unpack) {

			var arr_isArray = Array.isArray(array);
			var rep_isArray = Array.isArray(repetitions);

			// if array is not an array, then we just repeat the item
			if (!arr_isArray) {
				if (!rep_isArray) {
					array = [array];
					repetitions = [repetitions];
				} else {
					repetitions = [repetitions[0]];
					console.log('Unclear parameters given to randomization.repeat. Multiple set sizes specified, but only one item exists to sample. Proceeding using the first set size.');
				}
			} else {
				if (!rep_isArray) {
					var reps = [];
					for (var i = 0; i < array.length; i++) {
						reps.push(repetitions);
					}
					repetitions = reps;
				} else {
					if (array.length != repetitions.length) {
						console.warning('Unclear parameters given to randomization.repeat. Items and repetitions are unequal lengths. Behavior may not be as expected.');
						// throw warning if repetitions is too short, use first rep ONLY.
						if(repetitions.length < array.length){
							var reps = [];
							for (var i = 0; i < array.length; i++) {
								reps.push(repetitions);
							}
							repetitions = reps;
						} else {
							// throw warning if too long, and then use the first N
							repetitions = repetions.slice(0, array.length);
						}
					}
				}
			}

			// should be clear at this point to assume that array and repetitions are arrays with == length
			var allsamples = [];
			for (var i = 0; i < array.length; i++) {
				for (var j = 0; j < repetitions[i]; j++) {
					allsamples.push(array[i]);
				}
			}

			var out = shuffle(allsamples);

			if (unpack) {
				out = unpackArray(out);
			}

			return shuffle(out);
		}

		module.shuffle = function(arr) {
			return shuffle(arr);
		}

		module.shuffleNoRepeats = function(arr, equalityTest){
				// define a default equalityTest
				if(typeof equalityTest == 'undefined'){
					equalityTest = function(a,b){
						if(a === b) { return true; }
						else { return false; }
					}
				}

				var random_shuffle = shuffle(arr);
				for(var i=0; i<random_shuffle.length-2; i++){
					if(equalityTest(random_shuffle[i], random_shuffle[i+1])){
						// neighbors are equal, pick a new random neighbor to swap (not the first or last element, to avoid edge cases)
						var random_pick = Math.floor(Math.random()*(random_shuffle.length-2))+1;
						// test to make sure the new neighbor isn't equal to the old one
						while(
							equalityTest(random_shuffle[i+1], random_shuffle[random_pick]) ||
							(equalityTest(random_shuffle[i+1], random_shuffle[random_pick+1]) || equalityTest(random_shuffle[i+1], random_shuffle[random_pick-1]))
						){
							random_pick = Math.floor(Math.random()*(random_shuffle.length-2))+1;
						}
						var new_neighbor = random_shuffle[random_pick];
						random_shuffle[random_pick] = random_shuffle[i+1];
						random_shuffle[i+1] = new_neighbor;
					}
				}

				return random_shuffle;
		}

		module.sample = function(arr, size, withReplacement) {
			if(withReplacement == false) {
				if(size > arr.length){
					console.error("jsPsych.randomization.sample cannot take a sample "+
					"larger than the size of the set of items to sample from when "+
					"sampling without replacement.");
				}
			}
			var samp = [];
			var shuff_arr = shuffle(arr);
			for(var i=0; i<size; i++){
				if(!withReplacement){
					samp.push(shuff_arr.pop());
				} else {
					samp.push(shuff_arr[Math.floor(Math.random()*shuff_arr.length)]);
				}
			}
			return samp;
		}

		module.factorial = function(factors, repetitions, unpack) {

			var factorNames = Object.keys(factors);

			var factor_combinations = [];

			for (var i = 0; i < factors[factorNames[0]].length; i++) {
				factor_combinations.push({});
				factor_combinations[i][factorNames[0]] = factors[factorNames[0]][i];
			}

			for (var i = 1; i < factorNames.length; i++) {
				var toAdd = factors[factorNames[i]];
				var n = factor_combinations.length;
				for (var j = 0; j < n; j++) {
					var base = factor_combinations[j];
					for (var k = 0; k < toAdd.length; k++) {
						var newpiece = {};
						newpiece[factorNames[i]] = toAdd[k];
						factor_combinations.push($.extend({}, base, newpiece));
					}
				}
				factor_combinations.splice(0, n);
			}

			repetitions = (typeof repetitions === 'undefined') ? 1 : repetitions;
			var with_repetitions = module.repeat(factor_combinations, repetitions, unpack);

			return with_repetitions;
		}

		function unpackArray(array) {

			var out = {};

			for (var i = 0; i < array.length; i++) {
				var keys = Object.keys(array[i]);
				for (var k = 0; k < keys.length; k++) {
					if (typeof out[keys[k]] === 'undefined') {
						out[keys[k]] = [];
					}
					out[keys[k]].push(array[i][keys[k]]);
				}
			}

			return out;
		}

		function shuffle(array) {
			var m = array.length,
				t, i;

			// While there remain elements to shuffle…
			while (m) {

				// Pick a remaining element…
				i = Math.floor(Math.random() * m--);

				// And swap it with the current element.
				t = array[m];
				array[m] = array[i];
				array[i] = t;
			}

			return array;
		}

		return module;

	})();

	jsPsych.pluginAPI = (function() {

		/* for future centralized key handling... */
		/*$(document).on('keydown', keyHandler);

		function keyHandler(e){

			// record time

			// dispatch events

		}*/

		// keyboard listeners
		var keyboard_listeners = [];

		var held_keys = [];

		var module = {};

		module.getKeyboardResponse = function(parameters){
			//parameters are: callback_function, valid_responses, rt_method, persist, audio_context, audio_context_start_time, allow_held_key?

			parameters.rt_method = (typeof parameters.rt_method === 'undefined') ? 'date' : parameters.rt_method;
			if (parameters.rt_method != 'date' && parameters.rt_method != 'performance' && parameters.rt_method != 'audio') {
				console.log('Invalid RT method specified in getKeyboardResponse. Defaulting to "date" method.');
				parameters.rt_method = 'date';
			}

			var start_time;
			if (parameters.rt_method == 'date') {
				start_time = (new Date()).getTime();
			} else if (parameters.rt_method == 'performance') {
				start_time = performance.now();
			} else if (parameters.rt_method == 'audio') {
				start_time = parameters.audio_context_start_time;
			}

			var listener_id;

			var listener_function = function(e) {

				var key_time;
				if (parameters.rt_method == 'date') {
					key_time = (new Date()).getTime();
				} else if (parameters.rt_method == 'performance') {
					key_time = performance.now();
				} else if (parameters.rt_method == 'audio') {
					key_time = parameters.audio_context.currentTime
				}

				var valid_response = false;
				if (typeof parameters.valid_responses === 'undefined' || parameters.valid_responses.length === 0) {
					valid_response = true;
				}
				for (var i = 0; i < parameters.valid_responses.length; i++) {
					if (typeof parameters.valid_responses[i] == 'string') {
						if (typeof keylookup[parameters.valid_responses[i]] !== 'undefined') {
							if (e.which == keylookup[parameters.valid_responses[i]]) {
								valid_response = true;
							}
						} else {
							throw new Error('Invalid key string specified for getKeyboardResponse');
						}
					} else if (e.which == parameters.valid_responses[i]) {
						valid_response = true;
					}
				}
				// check if key was already held down

				if ( ((typeof parameters.allow_held_key == 'undefined') || !parameters.allow_held_key) && valid_response ) {
					for(i in held_keys){
						if(held_keys[i]==e.which){
							valid_response = false;
							break;
						}
					}
				}

				if (valid_response) {

					held_keys.push(e.which);

					parameters.callback_function({
						key: e.which,
						rt: key_time - start_time
					});

					if ($.inArray(listener_id, keyboard_listeners) > -1) {

						if (!parameters.persist) {
							// remove keyboard listener
							module.cancelKeyboardResponse(listener_id);
						}
					}

					var after_up = function(up) {

						if (up.which == e.which) {
							$(document).off('keyup', after_up);

							// mark key as released
							held_keys.splice($.inArray(e.which, held_keys), 1);
						}
					};

					$(document).keyup(after_up);
				}
			};

			$(document).keydown(listener_function);

			// create listener id object
			listener_id = {
				type: 'keydown',
				fn: listener_function
			};

			// add this keyboard listener to the list of listeners
			keyboard_listeners.push(listener_id);

			return listener_id;

		};

		module.cancelKeyboardResponse = function(listener) {
			// remove the listener from the doc
			$(document).off(listener.type, listener.fn);

			// remove the listener from the list of listeners
			if ($.inArray(listener, keyboard_listeners) > -1) {
				keyboard_listeners.splice($.inArray(listener, keyboard_listeners), 1);
			}
		};

		module.cancelAllKeyboardResponses = function() {
			for (var i = 0; i < keyboard_listeners.length; i++) {
				$(document).off(keyboard_listeners[i].type, keyboard_listeners[i].fn);
			}
			keyboard_listeners = [];
		};

		module.convertKeyCharacterToKeyCode = function(character){
			var code;
			if(typeof keylookup[character] !== 'undefined'){
				code = keylookup[character];
			}
			return code;
		}

		// keycode lookup associative array
		var keylookup = {
			'backspace': 8,
			'tab': 9,
			'enter': 13,
			'shift': 16,
			'ctrl': 17,
			'alt': 18,
			'pause': 19,
			'capslock': 20,
			'esc': 27,
			'space': 32,
			'spacebar': 32,
			' ': 32,
			'pageup': 33,
			'pagedown': 34,
			'end': 35,
			'home': 36,
			'leftarrow': 37,
			'uparrow': 38,
			'rightarrow': 39,
			'downarrow': 40,
			'insert': 45,
			'delete': 46,
			'0': 48,
			'1': 49,
			'2': 50,
			'3': 51,
			'4': 52,
			'5': 53,
			'6': 54,
			'7': 55,
			'8': 56,
			'9': 57,
			'a': 65,
			'b': 66,
			'c': 67,
			'd': 68,
			'e': 69,
			'f': 70,
			'g': 71,
			'h': 72,
			'i': 73,
			'j': 74,
			'k': 75,
			'l': 76,
			'm': 77,
			'n': 78,
			'o': 79,
			'p': 80,
			'q': 81,
			'r': 82,
			's': 83,
			't': 84,
			'u': 85,
			'v': 86,
			'w': 87,
			'x': 88,
			'y': 89,
			'z': 90,
			'A': 65,
			'B': 66,
			'C': 67,
			'D': 68,
			'E': 69,
			'F': 70,
			'G': 71,
			'H': 72,
			'I': 73,
			'J': 74,
			'K': 75,
			'L': 76,
			'M': 77,
			'N': 78,
			'O': 79,
			'P': 80,
			'Q': 81,
			'R': 82,
			'S': 83,
			'T': 84,
			'U': 85,
			'V': 86,
			'W': 87,
			'X': 88,
			'Y': 89,
			'Z': 90,
			'0numpad': 96,
			'1numpad': 97,
			'2numpad': 98,
			'3numpad': 99,
			'4numpad': 100,
			'5numpad': 101,
			'6numpad': 102,
			'7numpad': 103,
			'8numpad': 104,
			'9numpad': 105,
			'multiply': 106,
			'plus': 107,
			'minus': 109,
			'decimal': 110,
			'divide': 111,
			'F1': 112,
			'F2': 113,
			'F3': 114,
			'F4': 115,
			'F5': 116,
			'F6': 117,
			'F7': 118,
			'F8': 119,
			'F9': 120,
			'F10': 121,
			'F11': 122,
			'F12': 123,
			'=': 187,
			',': 188,
			'.': 190,
			'/': 191,
			'`': 192,
			'[': 219,
			'\\': 220,
			']': 221
		};

		module.evaluateFunctionParameters = function(trial, protect) {

			// keys that are always protected
			var always_protected = ['on_finish'];

			protect = (typeof protect === 'undefined') ? [] : protect;

			protect = protect.concat(always_protected);

			var keys = getKeys(trial);

			var tmp = {};
			for (var i = 0; i < keys.length; i++) {

				var process = true;
				for (var j = 0; j < protect.length; j++) {
					if (protect[j] == keys[i]) {
						process = false;
						break;
					}
				}

				if (typeof trial[keys[i]] == "function" && process) {
					tmp[keys[i]] = trial[keys[i]].call();
				} else {
					tmp[keys[i]] = trial[keys[i]];
				}

			}

			return tmp;

		};

		module.enforceArray = function(params, possible_arrays) {

			// function to check if something is an array, fallback
			// to string method if browser doesn't support Array.isArray
			var ckArray = Array.isArray || function(a) {
					return toString.call(a) == '[object Array]';
				};

			for (var i = 0; i < possible_arrays.length; i++) {
				if (typeof params[possible_arrays[i]] !== 'undefined') {
					params[possible_arrays[i]] = ckArray(params[possible_arrays[i]]) ? params[possible_arrays[i]] : [params[possible_arrays[i]]];
				}
			}

			return params;
		};

		function getKeys(obj) {
			var r = [];
			for (var k in obj) {
				if (!obj.hasOwnProperty(k)) continue;
				r.push(k);
			}
			return r;
		}

		// audio
		var context = (typeof window.AudioContext !== 'undefined') ? new AudioContext() : null;
		var audio_buffers = [];

		module.loadAudioFile = function(path) {

			var bufferID = path;
			if(typeof audio_buffers.bufferID !== 'undefined') {
				return bufferID;
			}
			audio_buffers[bufferID] = 'tmp';

			var request = new XMLHttpRequest();
			request.open('GET',path,true);
			request.responseType = 'arraybuffer';
			request.onload = function(){
				context.decodeAudioData(request.response, function(buffer){
					audio_buffers[bufferID] = buffer;
				}, function(){
					console.error('Error loading audio file: '+path);
				});
			}
			request.send();

			return bufferID;

		}

		module.getAudioBuffer = function(audioID) {

			if(audio_buffers[audioID] == 'tmp'){
				console.error('Audio file failed to load in the time alloted.')
				return;
			}

			return audio_buffers[audioID];

		}

		module.audioLoaded = function() {
			for(var i = 0; i < audio_buffers.length; i++){
				if(audio_buffers[i] == 'tmp') {
					return false;
				}
			}
			return true;
		}

		return module;
	})();

	// methods used in multiple modules

	// private function to flatten nested arrays

	function flatten(arr, out) {
		out = (typeof out === 'undefined') ? [] : out;
		for (var i = 0; i < arr.length; i++) {
			if (Array.isArray(arr[i])) {
				flatten(arr[i], out);
			} else {
				out.push(arr[i]);
			}
		}
		return out;
	}

})(jQuery);
