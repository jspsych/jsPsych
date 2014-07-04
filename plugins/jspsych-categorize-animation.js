/** 
 * jspsych plugin for categorization trials with feedback and animated stimuli
 * Josh de Leeuw
 * 
 * documentation: https://github.com/jodeleeuw/jsPsych/wiki/jspsych-categorize-animation
 **/

(function($) {
    jsPsych["categorize-animation"] = (function() {

        var plugin = {};

        plugin.create = function(params) {
            
            params = jsPsych.pluginAPI.enforceArray(params, ['key_answer','text_answer','choices','data']);
            
            var trials = new Array(params.stimuli.length);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {};
                trials[i].type = "categorize-animation";
                trials[i].stims = params.stimuli[i];
                trials[i].reps = params.reps || 1;
                trials[i].key_answer = params.key_answer[i];
                trials[i].text_answer = (typeof params.text_answer === 'undefined') ? "" : params.text_answer[i];
                trials[i].choices = params.choices;
                trials[i].correct_text = params.correct_text || "Correct.";
                trials[i].incorrect_text = params.incorrect_text || "Wrong.";
                trials[i].allow_response_before_complete = params.allow_response_before_complete || false;
                trials[i].frame_time = params.frame_time || 500;
                trials[i].timing_feedback_duration = params.timing_feedback_duration || 2000;
                trials[i].timing_post_trial = (typeof params.timing_post_trial === 'undefined') ? 1000 : params.timing_post_trial;
                trials[i].prompt = (typeof params.prompt === 'undefined') ? '' : params.prompt;
                trials[i].data = (typeof params.data === 'undefined') ? {} : params.data[i];
            }
            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {
            
            // if any trial variables are functions
            // this evaluates the function and replaces
            // it with the output of the function
            trial = jsPsych.pluginAPI.normalizeTrialVariables(trial);
            
            var animate_frame = -1;
            var reps = 0;

            var showAnimation = true;

            var responded = false;
            var timeoutSet = false;


            var startTime = (new Date()).getTime();

            // show animation
            var animate_interval = setInterval(function() {
                display_element.html(""); // clear everything
                animate_frame++;
                if (animate_frame == trial.stims.length) {
                    animate_frame = 0;
                    reps++;
                    // check if reps complete //
                    if (trial.reps != -1 && reps >= trial.reps) {
                        // done with animation
                        showAnimation = false;
                    }
                }

                if (showAnimation) {
                    display_element.append($('<img>', {
                        "src": trial.stims[animate_frame],
                        "class": 'jspsych-categorize-animation-stimulus'
                    }));
                }

                if (!responded && trial.allow_response_before_complete) {
                    // in here if the user can respond before the animation is done
                    if (trial.prompt !== "") {
                        display_element.append(trial.prompt);
                    }
                }
                else if (!responded) {
                    // in here if the user has to wait to respond until animation is done.
                    // if this is the case, don't show the prompt until the animation is over.
                    if (!showAnimation) {
                        if (trial.prompt !== "") {
                            display_element.append(trial.prompt);
                        }
                    }
                }
                else {
                    // user has responded if we get here.

                    // show feedback
                    var feedback_text = "";
                    if (block.data[block.trial_idx].correct) {
                        feedback_text = trial.correct_text.replace("%ANS%", trial.text_answer);
                    }
                    else {
                        feedback_text = trial.incorrect_text.replace("%ANS%", trial.text_answer);
                    }
                    display_element.append(feedback_text);

                    // set timeout to clear feedback
                    if (!timeoutSet) {
                        timeoutSet = true;
                        setTimeout(function() {
                            endTrial();
                        }, trial.timing_feedback_duration);
                    }
                }


            }, trial.frame_time);

            
            var keyboard_listener;
            
            var after_response = function(info){
                // ignore the response if animation is playing and subject
                // not allowed to respond before it is complete
                if (!trial.allow_response_before_complete && showAnimation) {
                    return false;
                }
                
                var correct = false;
                if(trial.key_answer == info.key) {
                    correct = true;
                }
                
                responded = true;

                var trial_data = {
                    "trial_type": trial.type,
                    "trial_index": block.trial_idx,
                    "stimulus": trial.stims[0],
                    "rt": info.rt,
                    "correct": correct,
                    "key_press": info.key
                };
                
                block.writeData($.extend({}, trial_data, trial.data));
                
                jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_listener);
                
            }
            
            jsPsych.pluginAPI.getKeyboardResponse(after_response, trial.choices, 'date', true);

            function endTrial() {
                clearInterval(animate_interval); // stop animation!
                display_element.html(''); // clear everything
                if(trial.timing_post_trial > 0){
                    setTimeout(function() {
                        block.next();
                    }, trial.timing_post_trial);
                } else {
                    block.next();
                }
            }
        };

        return plugin;
    })();
})(jQuery);
