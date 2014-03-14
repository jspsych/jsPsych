/**
 * jsPsych plugin for showing animations
 * Josh de Leeuw
 * updated January 2014
 * 
 * shows a sequence of images at a fixed frame rate.
 * subject can respond with keys if desired.
 * entire animation sequence is recorded as JSON encoded string.
 * responses are tagged with rt and image that was onscreen.
 *
 * parameters:
 *      stimuli: array of arrays. inner arrays should consist of all the frames of the animation sequence. each inner array
 *                  corresponds to a single trial
 *      frame_time: how long to display each frame in ms.
 *      frame_isi: length of gap between successive frames.
 *      repetitions: how many times to show the animation sequence.
 *      choices: array of valid key responses during animation.
 *      timing_post_trial: how long to show a blank screen after the trial in ms.
 *      prompt: optional HTML string to display while the animation is playing
 *      data: optional data object
 * 
 */


(function($) {
    jsPsych.animation = (function() {

        var plugin = {};

        plugin.create = function(params) {

            var trials = new Array(params.stimuli.length);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {};
                trials[i].type = "animation";
                trials[i].stims = params.stimuli[i];
                trials[i].frame_time = params.frame_time || 250;
                trials[i].frame_isi = params.frame_isi || 0;
                trials[i].repetitions = params.repetitions || 1;
                trials[i].choices = params.choices || [];
                trials[i].timing_post_trial = (typeof params.timing_post_trial === 'undefined') ? 1000 : params.timing_post_trial;
                trials[i].prompt = (typeof params.prompt === 'undefined') ? "" : params.prompt;
                trials[i].data = (typeof params.data === 'undefined') ? {} : params.data[i];
            }
            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {
            
            // if any trial variables are functions
            // this evaluates the function and replaces
            // it with the output of the function
            trial = jsPsych.normalizeTrialVariables(trial);
            
            var interval_time = trial.frame_time + trial.frame_isi;
            var animate_frame = -1;
            var reps = 0;
            var startTime = (new Date()).getTime();
            var animation_sequence = [];
            var responses = [];
            var current_stim = "";

            var animate_interval = setInterval(function() {
                var showImage = true;
                display_element.html(""); // clear everything
                animate_frame++;
                if (animate_frame == trial.stims.length) {
                    animate_frame = 0;
                    reps++;
                    if (reps >= trial.repetitions) {
                        endTrial();
                        clearInterval(animate_interval);
                        showImage = false;
                    }
                }
                if (showImage) {
                    show_next_frame();
                }
            }, interval_time);

            function show_next_frame() {
                // show image
                display_element.append($('<img>', {
                    "src": trial.stims[animate_frame],
                    "id": 'jspsych-animation-image'
                }));
                
                current_stim = trial.stims[animate_frame];

                // record when image was shown
                animation_sequence.push({
                    "stimulus": current_stim,
                    "time": (new Date()).getTime() - startTime
                });

                if (trial.prompt !== "") {
                    display_element.append(trial.prompt);
                }

                if (trial.frame_isi > 0) {
                    setTimeout(function() {
                        $('#jspsych-animation-image').css('visibility', 'hidden');
                        current_stim = 'blank';
                        // record when blank image was shown
                        animation_sequence.push({
                            "stimulus": 'blank',
                            "time": (new Date()).getTime() - startTime
                        });
                    }, trial.frame_time);
                }
            }

            var resp_func = function(e) {
                var flag = false;
                // check if the key is any of the options, or if it is an accidental keystroke
                for (var i = 0; i < trial.choices.length; i++) {
                    if (e.which == trial.choices[i]) {
                        flag = true;
                    }
                }
                if (flag) {
                    var key_press = e.which;

                    // record rt
                    var endTime = (new Date()).getTime();

                    responses.push({
                        "key_press": key_press,
                        "rt": endTime - startTime,
                        "stimulus": current_stim
                    });

                    // after a valid response, the stimulus will have the CSS class 'responded'
                    // which can be used to provide visual feedback that a response was recorded
                    $("#jspsych-animation-image").addClass('responded');
                }
            };
            
            $(document).keydown(resp_func);

            function endTrial() {
                 $(document).unbind('keydown', resp_func);
                
                block.writeData($.extend({}, {
                    "trial_type": "animation",
                    "trial_index": block.trial_idx,
                    "animation_sequence": JSON.stringify(animation_sequence),
                    "responses": JSON.stringify(responses)
                }, trial.data));

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
