/* jspsych-text.js
 * Josh de Leeuw
 *
 * This plugin displays text (including HTML formatted strings) during the experiment.
 * Use it to show instructions, provide performance feedback, etc...
 *
 * documentation: docs.jspsych.org
 *
 *
 */

jsPsych.plugins.text = (function() {

  var plugin = {};

  plugin.info = {
    name: 'text',
    description: '',
    parameters: {
      text: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: undefined,
        no_function: false,
        description: ''
      },
      choices: {
        type: [jsPsych.plugins.parameterType.KEYCODE, jsPsych.plugins.parameterType.SELECT],
        options: ['mouse'],
        array: true,
        default: undefined,
        no_function: false,
        description: ''
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    trial.choices = trial.choices || jsPsych.ALL_KEYS;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // set the HTML of the display target to replaced_text.
    display_element.innerHTML = trial.text;

    var after_response = function(info) {

      display_element.innerHTML = ''; // clear the display

      var trialdata = {
        "rt": info.rt,
        "key_press": info.key
      }

      jsPsych.finishTrial(trialdata);

    };

    var mouse_listener = function(e) {

      var rt = (new Date()).getTime() - start_time;

      display_element.removeEventListener('click', mouse_listener);

      after_response({
        key: 'mouse',
        rt: rt
      });

    };

    // check if key is 'mouse'
    if (trial.choices == 'mouse') {
      display_element.addEventListener(mouse_listener);
      var start_time = (new Date()).getTime();
    } else {
      jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }

  };

  return plugin;
})();
