/* jspsych-text.js
 * Josh de Leeuw
 *
 * This plugin displays text (including HTML formatted strings) during the experiment.
 * Use it to show instructions, provide performance feedback, etc...
 * 
 *
 */

(function($) {
    jsPsych.text = (function() {

        var plugin = {};

        plugin.create = function(params) {
            
            params = jsPsych.enforceArray(params, ['text','data']);
            
            var trials = new Array(params.text.length);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {};
                trials[i].type = "text"; // must match plugin name
                trials[i].text = params.text[i]; // text of all trials
                trials[i].cont_key = params.cont_key || '13'; // keycode to press to advance screen, default is ENTER.
                trials[i].timing_post_trial = (typeof params.timing_post_trial === 'undefined') ? 0 : params.timing_post_trial;
                trials[i].data = (typeof params.data === 'undefined') ? {} : params.data[i];
            }
            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {
            
            // if any trial variables are functions
            // this evaluates the function and replaces
            // it with the output of the function
            trial = jsPsych.normalizeTrialVariables(trial);
            
            // set the HTML of the display target to replaced_text.
            display_element.html(trial.text);

            var startTime = (new Date()).getTime();

            // it's possible that if the user is holding down the cont_key when
            // they arrive on the page that they will advance as soon as the
            // key is released. this prevents that from happening by requiring a
            // full cycle on the page with a down and up event.
            var cont_key_down = false;

            // define a function that will advance to the next trial when the user presses
            // the continue key.
            var key_listener = function(e) {
                if (e.which == trial.cont_key && cont_key_down) {
                    save_data();
                    $(document).unbind('keyup', key_listener); // remove the response function, so that it doesn't get triggered again.
                    $(document).unbind('keydown', key_down_listener);
                    display_element.html(''); // clear the display
                    if (trial.timing_post_trial > 0) {
                        setTimeout(function() {
                            block.next();
                        }, trial.timing_post_trial);
                    }
                    else {
                        block.next();
                    } // call block.next() to advance the experiment after a delay.
                }
            };

            var key_down_listener = function(e) {
                if (e.which == trial.cont_key) {
                    cont_key_down = true;
                }
            };

            var mouse_listener = function(e) {
                save_data();
                display_element.unbind('click', mouse_listener); // remove the response function, so that it doesn't get triggered again.
                display_element.html(''); // clear the display
                if (trial.timing_post_trial > 0) {
                    setTimeout(function() {
                        block.next();
                    }, trial.timing_post_trial);
                }
                else {
                    block.next();
                } // call block.next() to advance the experiment after a delay.
            };

            // check if key is 'mouse'
            if (trial.cont_key == 'mouse') {
                display_element.click(mouse_listener);
            }
            else {
                // attach the response function to the html document.
                $(document).keydown(key_down_listener);
                $(document).keyup(key_listener);
            }

            var save_data = function() {
                var rt = (new Date()).getTime() - startTime;
                block.writeData($.extend({}, {
                    "trial_type": "text",
                    "trial_index": block.trial_idx,
                    "rt": rt
                }, trial.data));
            };
        };

        return plugin;
    })();
})(jQuery);
