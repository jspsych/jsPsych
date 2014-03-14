/** 
 * jspsych plugin for categorization trials with feedback
 * Josh de Leeuw
 * updated October 2013
 * 
 * display an image or HTML object and then give corrective feedback based on the subject's response
 *
 * parameters:
 *      stimuli: array of stimuli. array elements can be paths to images or strings of HTML.
 *      key_answer: array of key codes representing the correct answer for each stimulus.
 *      text_answer: array of strings representing the label associated with each stimulus. optional.
 *      choices: array of key codes representing valid choices that can be made. other key responses will be ignored.
 *      correct_text: HTML string to show when correct answer is given.
 *      incorrect_text: HTML string to show when incorrect answer is given.
 *              NOTE: for both of the above, the special string %ANS% can be used. The text_answer associated with 
 *              the trial will be substituted for %ANS%. 
 *      timing_stim: how long to show the stimulus for. -1 will show until response is given.
 *      timing_feedback_duration: how long to show the feedback for.
 *      timing_post_trial: how long to show a blank screen before the next trial.
 *      show_stim_with_feedback: if true, the stimulus will remain on the screen while feedback is given.
 *      is_html: must set to true if the stimulus is HTML code.
 *      force_correct_button_press: if true, then the user must press the correct key after feedback is given.
 *      prompt: HTML string to show when the subject is viewing the stimulus and making a categorization decision.
 *      data: the optional data object
**/

(function($) {
    jsPsych.categorize = (function() {

        var plugin = {};

        plugin.create = function(params) {
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
            trial = jsPsych.normalizeTrialVariables(trial);
            
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
                        id: 'jspsych-categorize-stimulus',
                        "class": 'cat',
                        html: trial.a_path
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
                var resp_func = function(e) {
                    var flag = false;
                    var correct = false;
                    if (e.which == trial.key_answer) // correct category
                    {
                        flag = true;
                        correct = true;
                    }
                    else {
                        // check if the key is any of the options, or if it is an accidental keystroke
                        for (var i = 0; i < trial.choices.length; i++) {
                            if (e.which == trial.choices[i]) {
                                flag = true;
                                correct = false;
                            }
                        }
                    }
                    if (flag) {
                        cat_trial_complete = true;

                        // measure response time
                        var endTime = (new Date()).getTime();
                        var rt = (endTime - startTime);

                        // save data
                        var trial_data = {
                            "trial_type": "categorize",
                            "trial_index": block.trial_idx,
                            "rt": rt,
                            "correct": correct,
                            "stimulus": trial.a_path,
                            "key_press": e.which
                        };

                        block.writeData($.extend({}, trial_data, trial.data));

                        // clear function
                        $(document).unbind('keydown', resp_func);
                        display_element.html('');
                        plugin.trial(display_element, block, trial, part + 1);
                    }
                };

                // add event listener
                $(document).keydown(resp_func);
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
                            "class": 'cat',
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
                    var resp_func_corr_key = function(e) {
                        if (e.which == trial.key_answer) // correct category
                        {
                            $(document).unbind('keyup', resp_func_corr_key);
                            plugin.trial(display_element, block, trial, part + 1);
                        }
                    };
                    $(document).keyup(resp_func_corr_key);
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
