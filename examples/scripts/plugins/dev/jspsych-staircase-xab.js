/* jspsych-staircase.js
 *	Josh de Leeuw, Sep. 2013
 *
 *
 *
 */

(function($) {
    jsPsych.staircase_xab = (function() {

        var plugin = {};

        plugin.create = function(params) {
            var trials = []; // everything is a single trial, since it is unknown how many presentations it will take.

            trials[0] = {};
            trials[0].type = "staircase_xab";
            trials[0].items = params.items;
            trials[0].foils = params.foils;
            trials[0].left_key = params.left_key || 81; // array of all the correct key responses
            trials[0].right_key = params.right_key || 80; // valid key responses
            trials[0].n_up = params.n_up || 1;
            trials[0].n_down = params.n_down || 1;
            trials[0].n_turns = params.n_turns || 10;
            trials[0].n_turns_average = params.n_turns_average || 6;
            // timing
            trials[0].timing_post_trial = params.timing_post_trial || 1000; // default 1000ms between trials.
            trials[0].timing_x = params.timing_x || 1000;
            trials[0].timing_xab_gap = params.timing_xab_gap || 1000;
            trials[0].timing_ab = params.timing_ab || -1; // default is indefinitely.

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
            var current_item = 0; // start with the easiest item
            var total_turns = 0; // counter for keeping track of how many turns
            var current_direction = 1; // which way are we currently moving in item set; +1 = harder; -1 = easier
            var turns = []; // store the items where we turned
            var consecutive_correct = 0;
            var consecutive_incorrect = 0;

            // do a trial, check if we've hit total_turns, if yes then end, if not do another trial.

            var staircase_xab_trial_complete = false;

            function next_trial() {
                if (total_turns < trial.n_turns) {
                    // do trial
                    var this_trial = { };
                    do_trial(display_element, block, this )
                }
                else {
                    // end run
                }
            }

            function finish_trial(correct) {
                // change the counters
                if (correct) {
                    consecutive_incorrect = 0;
                    consecutive_correct++;
                }
                else {
                    consecutive_incorrect++;
                    consecutive_correct = 0;
                }

                var new_direction;

                if (correct) {
                    if (consecutive_correct >= trial.n_up) {
                        new_direction = 1; // make it harder
                        consecutive_correct = 0; // reset this because we changed difficulty.
                    }
                    else {
                        // do the same
                        new_direction = 0;
                    }
                }
                else {
                    if (consecutive_incorrect >= trial.n_down) {
                        // make it easier
                        new_direction = -1;
                        consecutive_incorrect = 0; // reset because we changed difficulty
                    }
                    else {
                        // do the same
                        new_direction = 0;
                    }
                }

                // if there is a turn, add it.
                if (new_direction !== 0) {
                    if (current_direction != new_direction) {
                        turns.push(current_item);
                    }
                    current_direction = new_direction;
                }

                // now figure out what the next item is
                current_item = current_item + new_direction;
                if (current_item < 0) {
                    current_item = 0;
                }
                if (current_item >= trial.items.length) {
                    current_item = trial.items.length - 1;
                }
            }

            function do_trial(display_element, block, trial, part) {
                switch (part) {
                case 1:

                    staircase_xab_trial_complete = false;

                    display_element.append($('<img>', {
                        "src": trial.a_path,
                        "class": 'staircase-xab'
                    }));

                    setTimeout(function() {
                        do_trial(display_element, block, trial, part + 1)
                    }, trial.timing_x);

                    break;

                case 2:

                    $('.staircase-xab').remove();

                    setTimeout(function() {
                        do_trial(display_element, block, trial, part + 1)
                    }, trial.timing_xab_gap);

                    break;

                case 3:

                    var startTime = (new Date()).getTime();
                    var images = [trial.a_path, trial.b_path];
                    var target_left = (Math.floor(Math.random() * 2) == 0); // 50% chance target is on left.
                    if (!target_left) {
                        images = [trial.b_path, trial.a_path];
                    }

                    // show the images
                    display_element.append($('<img>', {
                        "src": images[0],
                        "class": 'staircase-xab'
                    }));
                    display_element.append($('<img>', {
                        "src": images[1],
                        "class": 'staircase-xab'
                    }));

                    if (trial.prompt) {
                        display_element.append(trial.prompt);
                    }

                    if (trial.timing_ab > 0) {
                        setTimeout(function() {
                            if (!staircase_xab_trial_complete) {
                                $('.staircase-xab').css('visibility', 'hidden');
                            }
                        }, trial.timing_ab);
                    }

                    var resp_func = function(e) {
                        var flag = false;
                        var correct = false;
                        if (e.which == trial.left_key) {
                            flag = true;
                            if (target_left) {
                                correct = true;
                            }
                        }
                        else if (e.which == trial.right_key) {
                            flag = true;
                            if (!target_left) {
                                correct = true;
                            }
                        }
                        if (flag) {
                            var endTime = (new Date()).getTime();
                            var rt = (endTime - startTime);

                            var trial_data = {
                                "trial_type": "staircase-xab",
                                "trial_index": block.trial_idx,
                                "rt": rt,
                                "correct": correct,
                                "x_path": trial.x_path,
                                "a_path": trial.a_path,
                                "b_path": trial.b_path,
                                "key_press": e.which
                            }
                            //block.data[block.trial_idx] = $.extend({},trial_data,trial.data);
                            $(document).unbind('keyup', resp_func);
                            display_element.html(''); // remove all
                            staircase_xab_trial_complete = true;
                            setTimeout(function() {
                                block.next();
                            }, trial.timing_post_trial);
                        }
                    }
                    $(document).keyup(resp_func);
                    break;
                }
            }
        }

        return plugin;
    })();
})(jQuery);
