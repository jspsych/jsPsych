/**
 * jspsych-single-stim
 * Josh de Leeuw
 * 
 * plugin for displaying a stimulus and getting a keyboard response
 * 
 * documentation: https://github.com/jodeleeuw/jsPsych/wiki/jspsych-single-stim
 *
 **/

(function($) {
    jsPsych["single-stim"] = (function() {

        var plugin = {};

        plugin.create = function(params) {
            
            params = jsPsych.pluginAPI.enforceArray(params, ['stimuli', 'choices', 'data']);
            
            var trials = new Array(params.stimuli.length);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {};
                trials[i].type = "single-stim";
                trials[i].a_path = params.stimuli[i];
                trials[i].choices = params.choices;
                // option to show image for fixed time interval, ignoring key responses
                //      true = image will keep displaying after response
                //      false = trial will immediately advance when response is recorded
                trials[i].continue_after_response = (typeof params.continue_after_response === 'undefined') ? true : params.continue_after_response;
                // timing parameters
                trials[i].timing_stim = params.timing_stim || -1; // if -1, then show indefinitely
                trials[i].timing_response = params.timing_response || -1; // if -1, then wait for response forever
                trials[i].timing_post_trial = (typeof params.timing_post_trial === 'undefined') ? 1000 : params.timing_post_trial;
                // optional parameters
                trials[i].is_html = (typeof params.is_html === 'undefined') ? false : params.is_html;
                trials[i].prompt = (typeof params.prompt === 'undefined') ? "" : params.prompt;
                trials[i].data = (typeof params.data === 'undefined') ? {} : params.data[i];
            }
            return trials;
        };



        plugin.trial = function(display_element, block, trial, part) {
            
            // if any trial variables are functions
            // this evaluates the function and replaces
            // it with the output of the function
            trial = jsPsych.pluginAPI.normalizeTrialVariables(trial);

            var trial_complete = false;

            if (!trial.is_html) {
                display_element.append($('<img>', {
                    src: trial.a_path,
                    id: 'jspsych-single-stim-stimulus'
                }));
            }
            else {
                display_element.append($('<div>', {
                    html: trial.a_path,
                    id: 'jspsych-single-stim-stimulus'
                }));
            }

            //show prompt here
            if (trial.prompt !== "") {
                display_element.append(trial.prompt);
            }

            var end_trial = function(info) {
                
                trial_complete = true;

                var trial_data = {
                    "trial_type": "single-stim",
                    "trial_index": block.trial_idx,
                    "rt": info.rt,
                    "stimulus": trial.a_path,
                    "key_press": info.key
                };

                block.writeData($.extend({}, trial_data, trial.data));
                
                display_element.html('');
                if (trial.timing_post_trial > 0) {
                    setTimeout(function() {
                        block.next();
                    }, trial.timing_post_trial);
                }
                else {
                    block.next();
                }
            };

            var after_response = function(info) {
                
                // after a valid response, the stimulus will have the CSS class 'responded'
                // which can be used to provide visual feedback that a response was recorded
                $("#jspsych-single-stim-stimulus").addClass('responded');

                if (trial.continue_after_response) {
                    // response triggers the next trial in this case.
                    // if hide_image_after_response is true, then next
                    // trial should be triggered by timeout function below.
                    end_trial(info);
                }
            };
        

            jsPsych.pluginAPI.getKeyboardResponse(after_response, trial.choices);
            
            // hide image if timing is set
            if (trial.timing_stim > 0) {
                setTimeout(function() {
                    if (!trial_complete) {
                        $('#jspsych-single-stim-stimulus').css('visibility', 'hidden');
                    }
                }, trial.timing_stim);
            }

            // end trial if time limit is set
            if (trial.timing_response > 0) {
                setTimeout(function() {
                    if (!trial_complete) {
                        end_trial({rt: -1, key: -1});
                    }
                }, trial.timing_response);
            }

        };


        return plugin;
    })();
})(jQuery);
