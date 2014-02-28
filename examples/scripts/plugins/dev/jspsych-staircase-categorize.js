/* jspsych-staircase-categorize.js
 *	Josh de Leeuw, Sep. 2013
 *
 *
 *
 */

(function($) {
    jsPsych.staircase_categorize = (function() {

        var plugin = {};

        plugin.create = function(params) {
            var trials = []; // everything is a single trial, since it is unknown how many presentations it will take.

            trials[0] = {};
            trials[0].type = "staircase_categorize";
            // items structure is four nested arrays. top level array is separate staircases that should be interleaved.
            // second level array is difficulty. third arrays are sets of options. inner most array are stimuli of equivalent
            // difficulty and category.
            trials[0].items = params.items;
            // two level nested array. top level is separate staircases. 
            // second (inner) level is list of key responses in order that stimuli are ordered for third level of items array.
            trials[0].choices = params.choices;
            trials[0].n_up = params.n_up || 1;
            trials[0].n_down = params.n_down || 1;
            trials[0].n_turns = params.n_turns || 10;
            trials[0].n_turns_average = params.n_turns_average || 6;
            // timing
            trials[0].timing_post_trial = params.timing_post_trial || 1000; // default 1000ms between trials.
            trials[0].timing_item = params.timing_item || 1000;

            // optional parameters
            if (params.data !== undefined) {
                trials[0].data = params.data;
            }
            if (params.prompt !== undefined) {
                trials[0].prompt = params.prompt;
            }

            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {
            
            var interleaver = new StaircaseInterleaver(display_element, trial, block);
            interleaver.start();
        };
        
        function StaircaseInterleaver(display_element, trial, block) {
            this.staircases = [];
            
            for(var i=0; i<trial.items.length; i++)
            {
                var s_trial = $.extend(true, {}, trial);
                s_trial.items = s_trial.items[i];
                s_trial.choices = s_trial.choices[i];
                var staircase = new StaircaseController(display_element, s_trial, this, block);
                this.staircases.push(staircase);
            }
            
            this.start = function() {
                this.next_trial();
            };
            
            this.next_trial = function() {
                var eligible_staircases = [];
                for (var i = 0; i < this.staircases.length; i++) {
                    if (this.staircases[i].is_complete === false) {
                        eligible_staircases.push(this.staircases[i]);
                    }
                }

                if (eligible_staircases.length === 0) {
                    this.finish();
                }
                else {
                    var which_staircase = Math.floor(Math.random() * eligible_staircases.length);

                    eligible_staircases[which_staircase].next_trial();
                }
            };
            
            this.finish = function()
            {
                // end the whole staircase process
                block.next();
            }
        }

        function StaircaseController(display_element, trial, interleaver, block) {
            this.current_item = 0;
            this.total_turns = 0;
            this.current_direction = 1;
            this.turns = [];
            this.consecutive_correct = 0;
            this.consecutive_incorrect = 0;
            this.items = trial.items;
            this.is_complete = false;
            this.interleaver = interleaver;

            this.next_trial = function() {
                
                var item_set = this.items[this.current_item];
                
                // pick which category to show randomly
                var which_category = Math.floor(Math.random()*item_set.length);
                
                // pick which exemplar to show randomly
                var which_exemplar = Math.floor(Math.random()*item_set[which_category].length);
                
                var this_trial = {
                    a_path: item_set[which_category][which_exemplar],
                    choices: trial.choices,
                    correct_response: trial.choices[which_category]
                };
                
                this.do_trial(this_trial);
                
            };

            this.finish_trial = function(correct) {
                // change the counters
                if (correct) {
                    this.consecutive_incorrect = 0;
                    this.consecutive_correct++;
                }
                else {
                    this.consecutive_incorrect++;
                    this.consecutive_correct = 0;
                }

                var new_direction;

                if (correct) {
                    if (this.consecutive_correct >= trial.n_up) {
                        new_direction = 1; // make it harder
                        this.consecutive_correct = 0; // reset this because we changed difficulty.
                    }
                    else {
                        // do the same
                        new_direction = 0;
                    }
                }
                else {
                    if (this.consecutive_incorrect >= trial.n_down) {
                        // make it easier
                        new_direction = -1;
                        this.consecutive_incorrect = 0; // reset because we changed difficulty
                    }
                    else {
                        // do the same
                        new_direction = 0;
                    }
                }

                // if there is a turn, add it.
                if (new_direction !== 0) {
                    if (this.current_direction != new_direction) {
                        this.turns.push(this.current_item);
                    }
                    this.current_direction = new_direction;
                }
                
                // check if we are done
                if (this.turns.length >= trial.n_turns ){
                    this.is_complete = true;
                }

                // now figure out what the next item is
                this.current_item = this.current_item + new_direction;
                if (this.current_item < 0) {
                    this.current_item = 0;
                }
                if (this.current_item >= trial.items.length) {
                    this.current_item = trial.items.length - 1;
                }
                
                // tell the interleaver that we are done
                this.interleaver.next_trial();
            };

            this.do_trial = function(this_trial) {

                var trial_complete = false;
                
                // show image
                display_element.append($('<img>', {
                    "src": this_trial.a_path,
                    "class": 'staircase-categorize'
                }));

                if (trial.prompt) {
                    display_element.append(trial.prompt);
                }

                var startTime = (new Date()).getTime();

                // set timer to remove image
                if (trial.timing_item > 0) {
                    setTimeout(function() {
                        if (!trial_complete) {
                            $('.staircase-categorize').css('visibility', 'hidden');
                        }
                    }, trial.timing_item);
                }

                var resp_func = function(e) {

                    var flag = false;
                    var correct = false;

                    if ($.inArray(e.which, this_trial.choices) > -1) {
                        flag = true;
                        correct = (e.which == this_trial.correct_response);
                    }

                    if (flag) {
                        var endTime = (new Date()).getTime();
                        var rt = (endTime - startTime);
                        var t_idx = block.data.length;

                        var trial_data = {
                            "trial_type": "staircase-categorize",
                            "trial_index": t_idx,
                            "rt": rt,
                            "correct": correct,
                            "a_path": this_trial.a_path,
                            "staircase_index": e.data.iterator_object.current_item,
                            "staircase_direction": e.data.iterator_object.current_direction,
                            "key_press": e.which
                        };
                        block.data.push($.extend({},trial_data,trial.data));
                        $(document).unbind('keyup', resp_func);
                        display_element.html(''); // remove all
                        trial_complete = true;
                        setTimeout(function() {
                            e.data.iterator_object.finish_trial(correct);
                        }, trial.timing_post_trial);
                    }
                }
                $(document).keyup({iterator_object: this}, resp_func);
            }
        }

        return plugin;
    })();
})(jQuery);
