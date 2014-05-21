// jspsych.js
// 
//	Josh de Leeuw 
//	Percepts and Concepts Lab, Indiana University
//
//
(function($) {
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
        // turk info
        var turk_info;

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
        core.init = function(options) {

            // reset the key variables
            exp_blocks = [];
            opts = {};
            initialized = false;
            curr_block = 0;

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
                }
            };

            // import options
            opts = $.extend({}, defaults, options);
            // set target
            DOM_target = opts.display_element;

            run();
        };

        // core.data returns all of the data objects for each block as an array
        //      where core.data[0] = data object from block 0, etc...
        // if flatten is true, then the hierarchical structure of the data
        // is removed and each array entry will be a single trial.

        core.data = function(flatten) {
            var all_data = [];
            for (var i = 0; i < exp_blocks.length; i++) {
                all_data[i] = exp_blocks[i].data;
            }
            
            if(flatten===true){
                all_data = flattenData(all_data);
            }
            
            return all_data;
        };

        // core.dataAsCSV returns a CSV string that contains all of the data
        //      append_data is an option map object that will append values
        //      to every row. for example, if append_data = {"subject": 4},
        //      then a column called subject will be added to the data and
        //      it will always have the value 4.
        core.dataAsCSV = function(append_data) {
            var dataObj = core.data();
            return JSON2CSV(flattenData(dataObj, append_data));
        };

        core.saveCSVdata = function(filename, append_data) {
            var data_string = core.dataAsCSV(append_data);
            saveTextToFile(data_string, filename);
        };

        // core.progress returns an object with the following properties
        // 		total_blocks: the number of total blocks in the experiment
        //		total_trials: the number of total trials in the experiment
        //		current_trial_global: the current trial number in global terms
        // 					i.e. if each block has 20 trials and the experiment is
        //					currently in block 2 trial 10, this has a value of 30.
        //		current_trial_local: the current trial number within the block.
        //		current_block: the current block number.

        core.progress = function() {

            var total_trials = 0;
            for (var i = 0; i < exp_blocks.length; i++) {
                total_trials += exp_blocks[i].num_trials;
            }

            var current_trial_global = 0;
            for (var i = 0; i < curr_block; i++) {
                current_trial_global += exp_blocks[i].num_trials;
            }
            current_trial_global += exp_blocks[curr_block].trial_idx;

            var obj = {
                "total_blocks": exp_blocks.length,
                "total_trials": total_trials,
                "current_trial_global": current_trial_global,
                "current_trial_local": exp_blocks[curr_block].trial_idx,
                "current_block": curr_block
            };

            return obj;
        };

        // core.startTime() returns the Date object which represents the time that the experiment started.

        core.startTime = function() {
            return exp_start_time;
        };

        // core.preloadImage will load images into the browser cache so that they appear quickly when
        // used during a trial. 
        //  images: array of paths to images
        //  callback_complete: a function with no arguments that calls when loading is complete
        //  callback_load: a function with a single argument that calls whenever an image is loaded
        //                  argument is the number of images currently loaded.

        core.preloadImages = function(images, callback_complete, callback_load){
            
            // flatten the images array
            images = flatten(images);
            
            var n_loaded = 0;
            var loadfn = (typeof callback_load === 'undefined') ? function(){} : callback_load;
            var finishfn = (typeof callback_complete === 'undefined') ? function(){} : callback_complete;
          
            for(var i=0;i<images.length;i++){
              var img = new Image();
              
              img.onload = function(){
                n_loaded++;
                loadfn(n_loaded);
                if(n_loaded == images.length){
                    finishfn();
                }
              };
              
              img.src = images[i];
            }
        };
        
        // core.turkInfo gets information relevant to mechanical turk experiments. returns an object
        // containing the workerID, assignmentID, and hitID, and whether or not the HIT is in
        // preview mode, meaning that they haven't accepted the HIT yet.
        core.turkInfo = function(force_refresh)
        {
            // default value is false
            force_refresh = (typeof force_refresh === 'undefined') ? false : force_refresh;
            // if we already have the turk_info and force_refresh is false
            // then just return the cached version.
            if(typeof turk_info !== 'undefined' && !force_refresh) {
                return turk_info;
            } else {
                
                var turk = {};

                var param = function(url, name ) {
                  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
                  var regexS = "[\\?&]"+name+"=([^&#]*)";
                  var regex = new RegExp( regexS );
                  var results = regex.exec( url );
                  return ( results == null ) ? "" : results[1];
                };

                var src = param(window.location.href, "assignmentId") ? window.location.href : document.referrer;
            
                var keys = ["assignmentId","hitId","workerId"];
                keys.map(
                    function(key) {
                        turk[key] = unescape(param(src, key));
                    }
                );
            
                turk.previewMode = (turk.assignmentId == "ASSIGNMENT_ID_NOT_AVAILABLE");
                
                turk.outsideTurk = (!turk.previewMode && turk.hitId === "" && turk.assignmentId == "" && turk.workerId == "")

                turk_info = turk;
                
                return turk;
            }
            
        };
        

        //
        // These are public functions, intended to be used for developing plugins.
        // They aren't considered part of the normal API for the core library.
        //

        core.normalizeTrialVariables = function(trial, protect){
            
            protect = (typeof protect === 'undefined') ? [] : protect;
            
            var keys = getKeys(trial);
            
            var tmp = {};
            for(var i=0; i<keys.length; i++){
                
                var process = true;
                for(var j = 0; j < protect.length; j++){
                    if(protect[j] == keys[i]){
                        process = false;
                        break;
                    }
                }
                
                if(typeof trial[keys[i]] == "function" && process){
                    tmp[keys[i]] = trial[keys[i]].call();
                } else {
                    tmp[keys[i]] = trial[keys[i]];
                }
                
            }
            
            return tmp;
            
        }
        
        // if possible_array is not an array, then return a one-element array
        // containing possible_array
        core.enforceArray = function(params, possible_arrays) {
            
            // function to check if something is an array, fallback
            // to string method if browser doesn't support Array.isArray
            var ckArray = Array.isArray || function(a) {
                return toString.call(a) == '[object Array]';
            }
            
            for(var i=0; i<possible_arrays.length; i++){
                params[possible_arrays[i]] = ckArray(params[possible_arrays[i]]) ? params[possible_arrays[i]] : [params[possible_arrays[i]]];
            }
            
            return params;
        } 

        //
        // private functions //
        //
        function run() {
            // take the experiment structure and dynamically create a set of blocks
            exp_blocks = new Array(opts.experiment_structure.length);

            // iterate through block list to create trials
            for (var i = 0; i < exp_blocks.length; i++) {
                var trials = jsPsych[opts["experiment_structure"][i]["type"]]["create"].call(null, opts["experiment_structure"][i]);

                exp_blocks[i] = createBlock(trials);
            }

            // record the start time
            exp_start_time = new Date();

            // begin! - run the first block
            exp_blocks[0].next();
        }

        function nextBlock() {
            curr_block += 1;
            if (curr_block == exp_blocks.length) {
                finishExperiment();
            }
            else {
                exp_blocks[curr_block].next();
            }
        }

        function createBlock(trial_list) {
            var block = {
                trial_idx: -1,

                trials: trial_list,

                data: [],

                next: function() {

                    // call on_trial_finish() 
                    //     if not very first trial
                    //		and not the last call in this block (no trial due to advance in block)
                    if (typeof this.trials[this.trial_idx + 1] != "undefined" && (curr_block != 0 || this.trial_idx > -1)) {
                        opts.on_trial_finish();
                    };

                    this.trial_idx = this.trial_idx + 1;

                    var curr_trial = this.trials[this.trial_idx];

                    if (typeof curr_trial == "undefined") {
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
            };

            return block;
        }

        function finishExperiment() {
            opts["on_finish"].apply((new Object()), [core.data()]);
        }

        function do_trial(block, trial) {
            // execute trial method
            jsPsych[trial.type]["trial"].call(this, DOM_target, block, trial, 1);
        }

        //
        // A few helper functions to handle data format conversion
        //
        function flattenData(data_object, append_data) {

            append_data = (typeof append_data === undefined) ? {} : append_data;

            var trials = [];

            // loop through data_object
            for (var i = 0; i < data_object.length; i++) {
                for (var j = 0; j < data_object[i].length; j++) {
                    var data = $.extend({}, data_object[i][j], append_data);
                    trials.push(data);
                }
            }

            return trials;
        }

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
                    if ($.inArray(key,columns) == -1) {
                        columns[i] = key;
                        line += keyString;
                        i++;
                    }
                }
            }

            line = line.slice(0, - 1);
            result += line + '\r\n';

            for (var i = 0; i < array.length; i++) {
                var line = '';
                for (var j = 0; j < columns.length; j++) {
                    var value = (typeof array[i][columns[j]] === 'undefined') ? '' : array[i][columns[j]];
                    var valueString = value + "";
                    line += '"' + valueString.replace(/"/g, '""') + '",';
                }

                line = line.slice(0, - 1);
                result += line + '\r\n';
            }

            return result;
        }

        function saveTextToFile(textstr, filename) {
            var blobToSave = new Blob([textstr], {
                type: 'text/plain'
            });
            var blobURL = "";
            if (typeof window.webkitURL !== 'undefined') {
                blobURL = window.webkitURL.createObjectURL(blobToSave);
            }
            else {
                blobURL = window.URL.createObjectURL(blobToSave);
            }
            DOM_target.append($('<a>', {
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
        
        function getKeys(obj) {
            var r = [];
            for (var k in obj) {
                if (!obj.hasOwnProperty(k)) 
                    continue;
                r.push(k);
            }
            return r;
        }
        
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

        return core;
    })();
})(jQuery);
