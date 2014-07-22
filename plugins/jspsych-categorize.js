/** 
 * jspsych plugin for categorization trials with feedback
 * Josh de Leeuw
 * 
 * documentation: https://github.com/jodeleeuw/jsPsych/wiki/jspsych-categorize
**/

(function($) {
    jsPsych.categorize = (function() {

        var plugin = {};

        plugin.create = function(params) {
            
            params = jsPsych.pluginAPI.enforceArray(params, ['choices', 'stimuli', 'key_answer', 'text_answer', 'data']);
            
            var trials = [];
            for (var i = 0; i < params.stimuli.length; i++) {
                trials.push({});
                trials[i].type = "categorize";
                trials[i].a_path = params.stimuli[i];
                trials[i].key_answer = params.key_answer[i];
                trials[i].text_answer = (typeof params.text_answer === 'undefined') ? "" : params.text_answer[i];
                trials[i].choices = params.choices;
                trials[i].correct_text = (typeof params.correct_text === 'undefined') ? "<p class='feedback'>Correct</p>" : params.correct_text;
                trials[i].incorrect_text = (typeof params.incorrect_text === 'undefined') ? "<p class='feedback'>Incorrect</p>" : params.incorrect_text;
                // timing params
                trials[i].timing_stim = params.timing_stim || -1; // default is to show image until response
                trials[i].timing_feedback_duration = params.timing_feedback_duration || 2000;
                trials[i].timing_post_trial = (typeof params.timing_post_trial === 'undefined') ? 1000 : params.timing_post_trial;
                // optional params
                trials[i].show_stim_with_feedback = (typeof params.show_stim_with_feedback === 'undefined') ? true : params.show_stim_with_feedback;
                trials[i].is_html = (typeof params.is_html === 'undefined') ? false : params.is_html;
                trials[i].force_correct_button_press = (typeof params.force_correct_button_press === 'undefined') ? false : params.force_correct_button_press;
                trials[i].prompt = (typeof params.prompt === 'undefined') ? '' : params.prompt;
                trials[i].data = (typeof params.data === 'undefined') ? {} : params.data[i];
            }
            return trials;
        };

        var cat_trial_complete = false;

        plugin.trial = function(display_element, block, trial, part) {
            
            // if any trial variables are functions
            // this evaluates the function and replaces
            // it with the output of the function
            trial = jsPsych.pluginAPI.normalizeTrialVariables(trial);
            
            switch (part) {
            case 1:
                // set finish flag
                cat_trial_complete = false;

                if (!trial.is_html) {
                    // add image to display
                    display_element.append($('<img>', {
                        "src": trial.a_path,
                        "class": 'jspsych-categorize-stimulus',
                        "id": 'jspsych-categorize-stimulus'
                    }));
                }
                else {
                    display_element.append($('<div>', {
                        "id": 'jspsych-categorize-stimulus',
                        "class": 'jspsych-categorize-stimulus',
                        "html": trial.a_path
                    }));
                }

                // hide image after time if the timing parameter is set
                if (trial.timing_stim > 0) {
                    setTimeout(function() {
                        if (!cat_trial_complete) {
                            $('#jspsych-categorize-stimulus').css('visibility', 'hidden');
                        }
                    }, trial.timing_stim);
                }

                // if prompt is set, show prompt
                if (trial.prompt !== "") {
                    display_element.append(trial.prompt);
                }

                // start measuring RT
                var startTime = (new Date()).getTime();

                // create response function
                var after_response = function(info) {
                    
                    var correct = false;
                    if(trial.key_answer == info.key) { correct = true; }
                    
                    cat_trial_complete = true;
                    
                    // save data
                    var trial_data = {
                        "trial_type": "categorize",
                        "trial_index": block.trial_idx,
                        "rt": info.rt,
                        "correct": correct,
                        "stimulus": trial.a_path,
                        "key_press": info.key
                    };

                    block.writeData($.extend({}, trial_data, trial.data));

                    display_element.html('');
                    
                    plugin.trial(display_element, block, trial, part + 1);
                }
                
                jsPsych.pluginAPI.getKeyboardResponse(after_response, trial.choices, 'date', false);
                
                break;

            case 2:
                // show image during feedback if flag is set
                if (trial.show_stim_with_feedback) {
                    if (!trial.is_html) {
                        // add image to display
                        display_element.append($('<img>', {
                            "src": trial.a_path,
                            "class": 'jspsych-categorize-stimulus',
                            "id": 'jspsych-categorize-stimulus'
                        }));
                    }
                    else {
                        display_element.append($('<div>', {
                            "id": 'jspsych-categorize-stimulus',
                            "class": 'jspsych-categorize-stimulus',
                            "html": trial.a_path
                        }));
                    }
                }

                // substitute answer in feedback string.
                var atext = "";
                if (block.data[block.trial_idx].correct) {
                    atext = trial.correct_text.replace("%ANS%", trial.text_answer);
                }
                else {
                    atext = trial.incorrect_text.replace("%ANS%", trial.text_answer);
                }

                // show the feedback
                display_element.append(atext);

                // check if force correct button press is set
                if (trial.force_correct_button_press && block.data[block.trial_idx].correct === false) {
                    
                    var after_forced_response = function(info) {
                        plugin.trial(display_element, block, trial, part + 1);
                    }
                    
                    jsPsych.pluginAPI.getKeyboardResponse(after_forced_response, trial.key_answer, 'date', false);
                    
                }
                else {
                    setTimeout(function() {
                        plugin.trial(display_element, block, trial, part + 1);
                    }, trial.timing_feedback_duration);
                }
                break;
            case 3:
                display_element.html("");
                if(trial.timing_post_trial > 0){
                    setTimeout(function() {
                        block.next();
                    }, trial.timing_post_trial);
                } else {
                    block.next();
                }
                break;
            }
        };

        return plugin;
    })();
})(jQuery);
