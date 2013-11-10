/** 
 * jspsych-similarity.js
 * Josh de Leeuw
 * 
 * This plugin create a trial where two images are shown sequentially, and the subject rates their similarity using a slider controlled with the mouse.
 *
 * parameters:
 *      stimuli:            array of arrays. inner arrays are two stimuli. stimuli can be image paths or html strings. each inner array is one trial.
 *      label_low:          label to display at the left end of the similarity slider scale.
 *      label_high:         label to display at the right end of the similiarity slider scale.
 *      timing_first_stim:  how long to show the first stimulus.
 *      timing_second_stim: how long to show the second stimulus. can be -1 to show until a response is given.
 *      timing_image_gap:   how long to show a blank screen between the two stimuli.
 *      timing_post_trial:  how long to show a blank screen after the trial is over.
 *      is_html:            must set to true when using HTML strings as the stimuli.
 *      prompt:             optional HTML string to display with the stimulus.
 *      data:               the optional data object
 * 
 */

(function($) {
    jsPsych.similarity = (function() {

        var plugin = {};

        plugin.create = function(params) {
            var trials = new Array(params.stimuli.length);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {};
                trials[i].type = "similarity";
                trials[i].a_path = params.stimuli[i][0];
                trials[i].b_path = params.stimuli[i][1];

                trials[i].label_low = params.label_low || "Not at all similar";
                trials[i].label_high = params.label_high || "Identical";

                trials[i].timing_first_stim = params.timing_first_stim || 1000; // default 1000ms
                trials[i].timing_second_stim = params.timing_second_stim || -1; // -1 = inf time; positive numbers = msec to display second image.
                trials[i].timing_image_gap = params.timing_image_gap || 1000; // default 1000ms
                trials[i].timing_post_trial = params.timing_post_trial || 1000; // default 1000ms

                trials[i].is_html = (typeof params.is_html === 'undefined') ? false : params.is_html;
                trials[i].prompt = (typeof params.prompt === 'undefined') ? '' : params.prompt;
                trials[i].data = (typeof params.data === 'undefined') ? {} : params.data[i];
            }
            return trials;
        };

        var sim_trial_complete = false;

        plugin.trial = function(display_element, block, trial, part) {
            switch (part) {
            case 1:
                sim_trial_complete = false;
                // show the images
                if (!trial.is_html) {
                    display_element.append($('<img>', {
                        "src": trial.a_path,
                        "class": 'sim'
                    }));
                }
                else {
                    display_element.append($('<div>', {
                        "html": trial.a_path,
                        "class": 'sim'
                    }));
                }

                setTimeout(function() {
                    plugin.trial(display_element, block, trial, part + 1);
                }, trial.timing_first_stim);
                break;

            case 2:

                $('.sim').remove();

                setTimeout(function() {
                    plugin.trial(display_element, block, trial, part + 1);
                }, trial.timing_image_gap);
                break;
            case 3:

                if (!trial.is_html) {
                    display_element.append($('<img>', {
                        "src": trial.b_path,
                        "class": 'sim',
                        "id": 'jspsych_sim_second_image'
                    }));
                }
                else {
                    display_element.append($('<div>', {
                        "html": trial.b_path,
                        "class": 'sim',
                        "id": 'jspsych_sim_second_image'
                    }));
                }

                if (trial.timing_second_stim > 0) {
                    setTimeout(function() {
                        if (!sim_trial_complete) {
                            $("#jspsych_sim_second_image").css('visibility', 'hidden');
                        }
                    }, trial.timing_second_stim);
                }

                // create slider
                display_element.append($('<div>', {
                    "id": 'slider',
                    "class": 'sim'
                }));
                $("#slider").slider({
                    value: 50,
                    min: 0,
                    max: 100,
                    step: 1,
                });


                // create labels for slider
                display_element.append($('<div>', {
                    "id": 'slider_labels',
                    "class": 'sim'
                }));

                $('#slider_labels').append($('<p class="slider_left sim">' + trial.label_low + '</p>'));
                $('#slider_labels').append($('<p class="slider_right sim">' + trial.label_high + '</p>'));

                //  create button
                display_element.append($('<button>', {
                    'id': 'next',
                    'class': 'sim',
                    'html': 'Submit Answer'
                }));
                
                // if prompt is set, show prompt
                if (trial.prompt !== "") {
                    display_element.append(trial.prompt);
                }

                $("#next").click(function() {
                    var endTime = (new Date()).getTime();
                    var response_time = endTime - startTime;
                    sim_trial_complete = true;
                    var score = $("#slider").slider("value");
                    block.writeData($.extend({}, {
                        "sim_score": score,
                        "rt": response_time,
                        "stimulus": trial.a_path,
                        "stimulus_2": trial.b_path,
                        "trial_type": "similarity",
                        "trial_index": block.trial_idx
                    }, trial.data));
                    // goto next trial in block
                    display_element.html('');
                    setTimeout(function() {
                        block.next();
                    }, trial.timing_post_trial);
                });

                var startTime = (new Date()).getTime();
                break;


            }
        };

        return plugin;
    })();
})(jQuery);