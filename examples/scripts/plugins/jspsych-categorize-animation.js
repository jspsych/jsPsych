/** 
 * jspsych plugin for categorization trials with feedback and animated stimuli
 * Josh de Leeuw
 * updated December 2013
 * 
 * display a sequence of images at a fixed frame rate then give corrective feedback based on the subject's response
 *
 * parameters:
 *      stimuli: array of arrays. inner array elements are paths to images. each inner array is a set of frames
 *                  that will be displayed as an animation sequence.
 *      key_answer: array of key codes representing the correct answer for each stimulus.
 *      text_answer: array of strings representing the label associated with each stimulus. optional.
 *      choices: array of key codes representing valid choices that can be made. other key responses will be ignored.
 *      correct_text: HTML string to show when correct answer is given.
 *      incorrect_text: HTML string to show when incorrect answer is given.
 *              NOTE: for both of the above, the special string %ANS% can be used. The text_answer associated with 
 *              the trial will be substituted for %ANS%. 
 *      reps: how many cycles through the animation sequence to show. -1 will show until response is given.
 *      allow_response_before_complete: if true, the subject can give a response before the animation sequence finishes.
 *      timing_feedback_duration: how long to show the feedback for.
 *      timing_post_trial: how long to show a blank screen before the next trial.
 *      frame_time: how many ms to show each individual image in the animation sequence.
 *      prompt: HTML string to show when the subject is viewing the stimulus and making a categorization decision.
 *      data: the optional data object
 **/

(function($) {
    jsPsych["categorize-animation"] = (function() {

        var plugin = {};

        plugin.create = function(params) {
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
            trial = jsPsych.normalizeTrialVariables(trial);
            
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
                        "class": 'jspsych-categorize-animate-stimulus'
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

            // attach response function

            var resp_func = function(e) {

                if (!trial.allow_response_before_complete && showAnimation) {
                    return false;
                }

                var flag = false; // valid keystroke?
                var correct = false; // correct answer?

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
                if (flag) // if keystroke is one of the choices
                {
                    responded = true;
                    var endTime = (new Date()).getTime();
                    var rt = (endTime - startTime);

                    var trial_data = {
                        "trial_type": trial.type,
                        "trial_index": block.trial_idx,
                        "stimulus": trial.stims[0],
                        "rt": rt,
                        "correct": correct,
                        "key_press": e.which
                    };
                    block.writeData($.extend({}, trial_data, trial.data));
                    $(document).unbind('keydown', resp_func);
                }
            };
            $(document).keydown(resp_func);

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
