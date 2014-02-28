/* jspsych-text.js
 * Josh de Leeuw
 *
 * This plugin displays text (including HTML formatted strings) during the experiment.
 * Use it to show instructions, provide performance feedback, etc...
 * 
 * No data is currently collected with this plugin. Do not use it for situations in which
 * data collection is important.
 *
 * Parameters:
 * 		type: "text"
 *		text: an array of strings. Each element in the array will be displayed on a separate screen.
 *		cont_key: the keycode of the key the user should press to advance to the next screen. Default is '13' which is ENTER. May specify mouse click
 *                  by listing the key as 'mouse'
 *		timing_post_trial: an array with a single element representing the time in milliseconds to delay on a blank screen after the continue key is pressed. Default is no delay.
 *		variables: see variables section below.
 *      data: optional data object
 *
 * Optional Variables: If you want to display dynamic information that is updated at the moment the text is rendered on the screen,
 * such calculating an accuracy score to tell a subject how many trials they got right, you can use the optional variables parameter.
 * The variables are specified as an array of arrays. The outer level array indexes for which block of text you are showing, and the
 * outer array should have the same length as the text array. Each element of the outer level array is also an array, with one element
 * for each variable that you are specifying. Variables are specified as functions which return the string that you want to display.
 * To indicate where a variable should be placed in the text, use the special string "%v" in the text. This will be replaced by the
 * return value of the function that is in the variables array. Each "%v" string will be replaced in the order that they appear in the
 * text, and only one replacement will be made per function call. Therefore, you should have the same number of "%v" strings as you have
 * elements in the inner arrays of the "variables" array.
 *			
 *				Example:
 * 					var goodbye_func = function(){return "goodbye";}
 *					var hello_func = function(){return "hello";}
 *					"text": ["%v, %v.", "I don't know why you say %v, I say %v."]
 *					"variables":[[hello_func, hello_func],[goodbye_func, hello_func]]
 *
 *				When the above parameters are loaded into the text plugin, the first screen would show 
 * 				"hello, hello." and the second screen would show "I don't know why you say goodbye, I say hello."
 *
 */

(function($) {
    jsPsych.text = (function() {

        var plugin = {};

        plugin.create = function(params) {
            var trials = new Array(params.text.length);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {};
                trials[i].type = "text"; // must match plugin name
                trials[i].text = params.text[i]; // text of all trials
                trials[i].cont_key = params.cont_key || '13'; // keycode to press to advance screen, default is ENTER.
                trials[i].timing_post_trial = (typeof params.timing_post_trial === 'undefined') ? 0 : params.timing_post_trial;
                trials[i].variables = (typeof params.variables === 'undefined') ? undefined : params.variables[i];
                trials[i].data = (typeof params.data === 'undefined') ? {} : params.data[i];
            }
            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {
            // the text for the trial is in trial.text, but we need to replace any variables that are in the text.
            var replaced_text = trial.text;

            // check to see if there are any variables defined.
            if (typeof trial.variables !== 'undefined') {
                for (var i = 0; i < trial.variables.length; i++) {
                    // loop through the array of variables and call each variable function
                    // to get the actual text that should be substituted in.
                    var variable_text = trial.variables[i]();
                    // replace the "%v" with the return value of the function.
                    replaced_text = replaced_text.replace("%v", variable_text);
                }
            }
            // set the HTML of the display target to replaced_text.
            display_element.html(replaced_text);

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