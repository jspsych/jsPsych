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
            
            params = jsPsych.pluginAPI.enforceArray(params, ['text', 'cont_key']);
            
            var trials = new Array(params.text.length);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {};
                trials[i].text = params.text[i]; // text of all trials
                trials[i].cont_key = params.cont_key || []; // keycode to press to advance screen, default is all keys.
            }
            return trials;
        };

        plugin.trial = function(display_element, trial) {
            
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
                        jsPsych.finishTrial();
                    }, trial.timing_post_trial);
                }
                else {
                    jsPsych.finishTrial();
                } 
                
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
                jsPsych.data.write($.extend({}, {
                    "rt": rt,
                    "key_press": key
                }, trial.data));
            }
        };

        return plugin;
    })();
})(jQuery);
