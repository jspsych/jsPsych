/**
 * jspsych-same-different
 * Josh de Leeuw
 * 
 * plugin for showing two stimuli sequentially and getting a same / different judgment
 * 
 * documentation: https://github.com/jodeleeuw/jsPsych/wiki/jspsych-same-different
 * 
 */ 
(function($) {
    jsPsych['same-different'] = (function() {

        var plugin = {};

        plugin.create = function(params) {
            
            params = jsPsych.pluginAPI.enforceArray(params, ['data','answer'])
            
            var trials = new Array(params.stimuli.length);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {};
                trials[i].type = "same-different";
                trials[i].a_path = params.stimuli[i][0];
                trials[i].b_path = params.stimuli[i][1];
                trials[i].answer = params.answer[i];
                trials[i].same_key = params.same_key || 81; // default is 'q'
                trials[i].different_key = params.different_key || 80; // default is 'p'
                // timing parameters
                trials[i].timing_first_stim = params.timing_first_stim || 1000;
                trials[i].timing_second_stim = params.timing_second_stim || 1000; // if -1, then second stim is shown until response.
                trials[i].timing_gap = params.timing_gap || 500;
                trials[i].timing_post_trial = (typeof params.timing_post_trial === 'undefined') ? 1000 : params.timing_post_trial;
                // optional parameters
                trials[i].is_html = (typeof params.is_html === 'undefined') ? false : true;
                trials[i].prompt = (typeof params.prompt === 'undefined') ? "" : params.prompt;
                trials[i].data = (typeof params.data === 'undefined') ? {} : params.data[i];
            }
            return trials;
        };

        var sd_trial_complete = false;

        plugin.trial = function(display_element, block, trial, part) {
            
            // if any trial variables are functions
            // this evaluates the function and replaces
            // it with the output of the function
            trial = jsPsych.pluginAPI.normalizeTrialVariables(trial);
            
            
            switch (part) {
            case 1:
                sd_trial_complete = false;
                // show image
                if (!trial.is_html) {
                    display_element.append($('<img>', {
                        src: trial.a_path,
                        "class": 'jspsych-same-different-stimulus'
                    }));
                }
                else {
                    display_element.append($('<div>', {
                        html: trial.a_path,
                        "class": 'jspsych-same-different-stimulus'
                    }));
                }
                setTimeout(function() {
                    plugin.trial(display_element, block, trial, part + 1);
                }, trial.timing_first_stim);
                break;
            case 2:
                $('.jspsych-same-different-stimulus').remove();
                setTimeout(function() {
                    plugin.trial(display_element, block, trial, part + 1);
                }, trial.timing_gap);
                break;
            case 3:
                if (!trial.is_html) {
                    display_element.append($('<img>', {
                        src: trial.b_path,
                        "class": 'jspsych-same-different-stimulus',
                        id: 'jspsych-same-different-second-stimulus'
                    }));
                }
                else {
                    display_element.append($('<div>', {
                        html: trial.b_path,
                        "class": 'jspsych-same-different-stimulus',
                        id: 'jspsych-same-different-second-stimulus'
                    }));
                }

                if (trial.timing_second_stim > 0) {
                    setTimeout(function() {
                        if (!sd_trial_complete) {
                            $("#jspsych-same-different-second-stimulus").css('visibility', 'hidden');
                        }
                    }, trial.timing_second_stim);
                }
                
                //show prompt here
                if (trial.prompt !== "") {
                    display_element.append(trial.prompt);
                }

                var after_response = function(info){
                    
                    var correct = false;
                    
                    if(info.key == trial.same_key && trial.answer == 'same'){
                        correct = true;
                    }
                    
                    if(info.key == trial.different_key && trial.answer == 'different'){
                        correct = true;
                    }
                    
                    var trial_data = {
                        "trial_type": "same-different",
                        "trial_index": block.trial_idx,
                        "rt": info.rt,
                        "correct": correct,
                        "stimulus": trial.a_path,
                        "stimulus_2": trial.b_path,
                        "key_press": info.key
                    };
                    block.writeData($.extend({}, trial_data, trial.data));
                    
                    display_element.html('');
                    
                    if(trial.timing_post_trial > 0) {
                        setTimeout(function() {
                            block.next();
                        }, trial.timing_post_trial);
                    } else {
                        block.next();
                    }
                }
                
                jsPsych.pluginAPI.getKeyboardResponse(after_response, [trial.same_key, trial.different_key], 'date', false);
                
                break;
            }
        };

        return plugin;
    })();
})(jQuery);
