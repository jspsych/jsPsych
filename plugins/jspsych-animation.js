/* jsPsych plugin for showing animations
 * Josh de Leeuw
 * updated October 2013
 * 
 * shows a sequence of images at a fixed frame rate.
 * no data is collected from the subject, but it does record the path of the first image
 * in each sequence, and allows for optional data tagging as well.
 *
 * parameters:
 *      stimuli: array of arrays. inner arrays should consist of all the frames of the animation sequence. each inner array
 *                  corresponds to a single trial
 *      frame_time: how long to display each frame in ms.
 *      repetitions: how many times to show the animation sequence.
 *      timing_post_trial: how long to show a blank screen after the trial in ms.
 *      prompt: optional HTML string to display while the animation is playing
 *      data: optional data object
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
                trials[i].repetitions = params.repetitions || 1;
                trials[i].timing_post_trial = params.timing_post_trial;
                trials[i].prompt = (typeof params.prompt === 'undefined') ? "" : params.prompt;
                trials[i].data = (typeof params.data === 'undefined') ? {} : params.data[i];
            }
            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {
            var animate_frame = -1;
            var reps = 0;
            switch (part) {
            case 1:
                var animate_interval = setInterval(function() {
                    var showImage = true;
                    display_element.html(""); // clear everything
                    animate_frame++;
                    if (animate_frame == trial.stims.length) {
                        animate_frame = 0;
                        reps++;
                        if (reps >= trial.repetitions) {
                            plugin.trial(display_element, block, trial, part + 1);
                            clearInterval(animate_interval);
                            showImage = false;
                        }
                    }
                    if (showImage) {
                        display_element.append($('<img>', {
                            "src": trial.stims[animate_frame],
                            "class": 'animate'
                        }));
                        if (trial.prompt !== "") {
                            display_element.append(trial.prompt);
                        }
                    }
                }, trial.frame_time);
                break;
            case 2:
                block.writeData($.extend({}, {
                    "trial_type": "animation",
                    "trial_index": block.trial_idx,
                    "a_path": trial.stims[0]
                }, trial.data));
                setTimeout(function() {
                    block.next();
                }, trial.timing_post_trial);
                break;
            }
        };

        return plugin;
    })();
})(jQuery);