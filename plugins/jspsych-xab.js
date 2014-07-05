/*  jspsych-xab.js
 *	Josh de Leeuw
 *
 *  This plugin runs a single XAB trial, where X is an image presented in isolation, and A and B are choices, with A or B being equal to X. 
 *	The subject's goal is to identify whether A or B is identical to X.
 *
 * documentation: https://github.com/jodeleeuw/jsPsych/wiki/jspsych-xab
 *
 */

(function($) {
    jsPsych.xab = (function() {

        var plugin = {};

        plugin.create = function(params) {
            
            params = jsPsych.pluginAPI.enforceArray(params, ['data']);

            // the number of trials is determined by how many entries the params.stimuli array has
            var trials = new Array(params.stimuli.length);

            for (var i = 0; i < trials.length; i++) {
                trials[i] = {};
                trials[i].type = "xab";
                trials[i].x_path = params.stimuli[i][0];
                // if there is only a pair of stimuli, then the first is the target and is shown twice.
                // if there is a triplet, then the first is X, the second is the target, and the third is foil (useful for non-exact-match XAB).
                if (params.stimuli[i].length == 2) {
                    trials[i].a_path = params.stimuli[i][0];
                    trials[i].b_path = params.stimuli[i][1];
                }
                else {
                    trials[i].a_path = params.stimuli[i][1];
                    trials[i].b_path = params.stimuli[i][2];
                }
                trials[i].left_key = params.left_key || 81; // defaults to 'q'
                trials[i].right_key = params.right_key || 80; // defaults to 'p'
                // timing parameters
                trials[i].timing_x = params.timing_x || 1000; // defaults to 1000msec.
                trials[i].timing_xab_gap = params.timing_xab_gap || 1000; // defaults to 1000msec.
                trials[i].timing_ab = params.timing_ab || -1; // defaults to -1, meaning infinite time on AB. If a positive number is used, then AB will only be displayed for that length.
                trials[i].timing_post_trial = (typeof params.timing_post_trial === 'undefined') ? 1000 : params.timing_post_trial; // defaults to 1000msec.
                // optional parameters
                trials[i].is_html = (typeof params.is_html === 'undefined') ? false : params.is_html;
                trials[i].prompt = (typeof params.prompt === 'undefined') ? "" : params.prompt;
                trials[i].data = (typeof params.data === 'undefined') ? {} : params.data[i];

            }
            return trials;
        };

        var xab_trial_complete = false;

        plugin.trial = function(display_element, block, trial, part) {
            
            // if any trial variables are functions
            // this evaluates the function and replaces
            // it with the output of the function
            trial = jsPsych.pluginAPI.normalizeTrialVariables(trial);
            
            switch (part) {

                // the first part of the trial is to show the X stimulus.    
            case 1:
                // reset this variable to false
                xab_trial_complete = false;

                // how we display the content depends on whether the content is 
                // HTML code or an image path.
                if (!trial.is_html) {
                    display_element.append($('<img>', {
                        src: trial.x_path,
                        "class": 'jspsych-xab-stimulus'
                    }));
                }
                else {
                    display_element.append($('<div>', {
                        "class": 'jspsych-xab-stimulus',
                        html: trial.x_path
                    }));
                }

                // start a timer of length trial.timing_x to move to the next part of the trial
                setTimeout(function() {
                    plugin.trial(display_element, block, trial, part + 1);
                }, trial.timing_x);
                break;

                // the second part of the trial is the gap between X and AB.
            case 2:
                // remove the x stimulus
                $('.jspsych-xab-stimulus').remove();

                // start timer
                setTimeout(function() {
                    plugin.trial(display_element, block, trial, part + 1);
                }, trial.timing_xab_gap);
                break;

                // the third part of the trial is to display A and B, and get the subject's response
            case 3:

                // randomize whether the target is on the left or the right
                var images = [trial.a_path, trial.b_path];
                var target_left = (Math.floor(Math.random() * 2) === 0); // 50% chance target is on left.
                if (!target_left) {
                    images = [trial.b_path, trial.a_path];
                }

                // show the options
                if (!trial.is_html) {
                    display_element.append($('<img>', {
                        "src": images[0],
                        "class": 'jspsych-xab-stimulus left'
                    }));
                    display_element.append($('<img>', {
                        "src": images[1],
                        "class": 'jspsych-xab-stimulus right'
                    }));
                }
                else {
                    display_element.append($('<div>', {
                        "class": 'jspsych-xab-stimulus left',
                        html: images[0]
                    }));
                    display_element.append($('<div>', {
                        "class": 'jspsych-xab-stimulus right',
                        html: images[1]
                    }));
                }

                if (trial.prompt !== "") {
                    display_element.append(trial.prompt);
                }

                // if timing_ab is > 0, then we hide the stimuli after timing_ab milliseconds
                if (trial.timing_ab > 0) {
                    setTimeout(function() {
                        if (!xab_trial_complete) {
                            $('.jspsych-xab-stimulus').css('visibility', 'hidden');
                        }
                    }, trial.timing_ab);
                }

                // create the function that triggers when a key is pressed.
                var after_response = function(info) {
                    
                    var correct = false; // true when the correct response is chosen
                    
                    if (info.key == trial.left_key) // 'q' key by default
                    {
                        if (target_left) {
                            correct = true;
                        }
                    }
                    else if (info.key == trial.right_key) // 'p' key by default
                    {
                        if (!target_left) {
                            correct = true;
                        }
                    }
                    
                       
                    // create object to store data from trial
                    var trial_data = {
                        "trial_type": "xab",
                        "trial_index": block.trial_idx,
                        "rt": info.rt,
                        "correct": correct,
                        "stimulus_x": trial.x_path,
                        "stimulus_a": trial.a_path,
                        "stimulus_b": trial.b_path,
                        "key_press": info.key
                    };
                    block.writeData($.extend({}, trial_data, trial.data));
                    
                    display_element.html(''); // remove all
                    
                    xab_trial_complete = true;
                    
                    // move on to the next trial after timing_post_trial milliseconds
                    if(trial.timing_post_trial > 0) {
                        setTimeout(function() {
                            block.next();
                        }, trial.timing_post_trial);
                    } else {
                        block.next();
                    }
                
                };
                
                jsPsych.pluginAPI.getKeyboardResponse(after_response, [trial.left_key, trial.right_key], 'date', false);
                
                break;
            }
        };

        return plugin;
    })();
})(jQuery);
