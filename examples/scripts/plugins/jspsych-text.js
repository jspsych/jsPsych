/* jspsych-text.js
 * Josh de Leeuw
 *
 * This plugin displays text (including HTML formatted strings) during the experiment.
 * Use it to show instructions, provide performance feedback, etc...
 *
 * documentation: https://github.com/jodeleeuw/jsPsych/wiki/jspsych-text
 * 
 *
 */

(function($) {
    jsPsych.text = (function() {

        var plugin = {};

        plugin.create = function(params) {
            
            params = jsPsych.pluginAPI.enforceArray(params, ['text','data']);
            
            var trials = new Array(params.text.length);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {};
                trials[i].type = "text"; // must match plugin name
                trials[i].text = params.text[i]; // text of all trials
                trials[i].cont_key = params.cont_key || []; // keycode to press to advance screen, default is all keys.
                trials[i].timing_post_trial = (typeof params.timing_post_trial === 'undefined') ? 0 : params.timing_post_trial;
                trials[i].data = (typeof params.data === 'undefined') ? {} : params.data[i];
            }
            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {
            
            // if any trial variables are functions
            // this evaluates the function and replaces
            // it with the output of the function
            trial = jsPsych.pluginAPI.normalizeTrialVariables(trial);
            
            // set the HTML of the display target to replaced_text.
            display_element.html(trial.text);

            var after_response = function(info) {
                    
                display_element.html(''); // clear the display
                
                save_data(info.key, info.rt);
                
                if (trial.timing_post_trial > 0) {
                    setTimeout(function() {
                        block.next();
                    }, trial.timing_post_trial);
                }
                else {
                    block.next();
                } // call block.next() to advance the experiment after a delay.
                
            };

            var mouse_listener = function(e) {
                
                var rt = (new Date()).getTime() - start_time;
                
                display_element.unbind('click', mouse_listener); 
                
                after_response({key: 'mouse', rt: rt});
                
            };

            // check if key is 'mouse'
            if (trial.cont_key == 'mouse') {
                display_element.click(mouse_listener);
                var start_time = (new Date()).getTime();
            } else {
                jsPsych.pluginAPI.getKeyboardResponse(after_response, trial.cont_key);
            }

            function save_data(key, rt) {
                block.writeData($.extend({}, {
                    "trial_type": "text",
                    "trial_index": block.trial_idx,
                    "rt": rt,
                    "key_press": key
                }, trial.data));
            }
        };

        return plugin;
    })();
})(jQuery);
