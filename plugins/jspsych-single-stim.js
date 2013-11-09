// Josh de Leeuw
// Updated October 2013
//
// This plugin is for presenting a single image and collecting a key response.
// It can be used for categorizing images (without feedback), collecting yes/no responses, etc...
//
//  parameters
//      stimuli: array of stimuli to present. elements of the array can be either paths to images
//                  or HTML strings
//      choices: array of key codes that represent valid responses. other key codes will be ignored
//      continue_after_response: when true, the trial will end as soon as the user gives a response.
//                  if false, then the trial will continue until timing_response is reached
//      timing_stim: how long to show the stimulus for. -1 will show indefinitely.
//      timing_response: how long to wait for a response. this timer starts at the same time as the
//                  timer for the stimulus presentation. if the timer is reached without a response
//                  given, then the user's response will be recorded as a "-1" for the trial, and the
//                  trial will end.
//      timing_post_trial: how long to show a blank screen after the trial ends.
//      is_html: must set to true when using HTML strings as the stimuli.
//      prompt: optional HTML string to display with the stimulus.
//      data: the optional data object


(function($) {
    jsPsych["single-stim"] = (function() {

        var plugin = {};

        plugin.create = function(params) {
            var trials = new Array(params.stimuli.length);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {};
                trials[i].type = "single-stim";
                trials[i].a_path = params.stimuli[i];
                trials[i].choices = params.choices;
                // option to show image for fixed time interval, ignoring key responses
                //      true = image will keep displaying after response
                //      false = trial will immediately advance when response is recorded
                trials[i].continue_after_response = params.continue_after_response || true;
                // timing parameters
                trials[i].timing_stim = params.timing_stim || -1; // if -1, then show indefinitely
                trials[i].timing_response = params.timing_response || -1; // if -1, then wait for response forever
                trials[i].timing_post_trial = params.timing_post_trial || 1000;
                // optional parameters
                trials[i].is_html = (typeof params.is_html === 'undefined') ? false : params.is_html;
                trials[i].prompt = (typeof params.prompt === 'undefined') ? "" : params.prompt;
                trials[i].data = (typeof params.data === 'undefined') ? {} : params.data[i];
            }
            return trials;
        };



        plugin.trial = function(display_element, block, trial, part) {

            var trial_complete = false;

            var startTime = (new Date()).getTime();
            
            var key_press = -1;

            if (!trial.is_html) {
                display_element.append($('<img>', {
                    src: trial.a_path,
                    id: 'ss'
                }));
            }
            else {
                display_element.append($('<div>', {
                    html: trial.a_path,
                    id: 'ss'
                }));
            }

            //show prompt here
            if (trial.prompt !== "") {
                display_element.append(trial.prompt);
            }

            var cont_function = function() {
                var endTime = (new Date()).getTime();
                var rt = (endTime - startTime);
                trial_complete = true;

                var trial_data = {
                    "trial_type": "single-stim",
                    "trial_index": block.trial_idx,
                    "rt": rt,
                    "stimulus": trial.a_path,
                    "key_press": key_press
                };

                block.writeData($.extend({}, trial_data, trial.data));
                $(document).unbind('keyup', resp_func);
                display_element.html('');
                setTimeout(function() {
                    block.next();
                }, trial.timing_post_trial);
            };

            var resp_func = function(e) {
                var flag = false;
                // check if the key is any of the options, or if it is an accidental keystroke
                for (var i = 0; i < trial.choices.length; i++) {
                    if (e.which == trial.choices[i]) {
                        flag = true;
                    }
                }
                if (flag) {
                    key_press = e.which;

                    // after a valid response, the stimulus will have the CSS class 'responded'
                    // which can be used to provide visual feedback that a response was recorded
                    $("#ss").addClass('responded');

                    if (trial.continue_after_response) {
                        // response triggers the next trial in this case.
                        // if hide_image_after_response is true, then next
                        // trial should be triggered by timeout function below.
                        cont_function();
                    }
                }
            };

            $(document).keyup(resp_func);

            // hide image if timing is set
            if (trial.timing_stim > 0) {
                setTimeout(function() {
                    if (!trial_complete) {
                        $('#ss').css('visibility', 'hidden');
                    }
                }, trial.timing_stim);
            }

            // end trial if time limit is set
            if (trial.timing_response > 0) {
                setTimeout(function() {
                    if (!trial_complete) {
                        cont_function();
                    }
                }, trial.timing_response);
            }

        };


        return plugin;
    })();
})(jQuery);