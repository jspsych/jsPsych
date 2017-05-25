/**
 * jspsych-same-different
 * Josh de Leeuw
 *
 * plugin for showing two stimuli sequentially and getting a same / different judgment
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins['same-different'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('same-different', 'stimuli', 'image',function(t){ return !t.is_html || t.is_html == 'undefined'});

  plugin.info = {
    name: 'same-different',
    description: '',
    parameters: {
      stimuli: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: undefined,
        array: true,
        no_function: false,
        description: ''
      },
      is_html: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      answer: {
        type: [jsPsych.plugins.parameterType.SELECT],
        options: ['same', 'different'],
        default: 75,
        no_function: false,
        description: ''
      },
      same_key: {
        type: [jsPsych.plugins.parameterType.KEYCODE],
        default: 'Q',
        no_function: false,
        description: ''
      },
      different_key: {
        type: [jsPsych.plugins.parameterType.KEYCODE],
        default: 'P',
        no_function: false,
        description: ''
      },
      timing_first_stim: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 1000,
        no_function: false,
        description: ''
      },
      timing_gap: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 500,
        no_function: false,
        description: ''
      },
      timing_second_stim: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 1000,
        no_function: false,
        description: ''
      },
      prompt: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // default parameters
    trial.same_key = trial.same_key || 81; // default is 'q'
    trial.different_key = trial.different_key || 80; // default is 'p'
    trial.advance_key = trial.advance_key || jsPsych.ALL_KEYS
    // timing parameters
    trial.timing_first_stim = trial.timing_first_stim || 1000; // if -1, the first stim is shown until any key is pressed
    trial.timing_second_stim = trial.timing_second_stim || 1000; // if -1, then second stim is shown until response.
    trial.timing_gap = trial.timing_gap || 500;
    // optional parameters
    trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // show image
    if (!trial.is_html) {
      display_element.innerHTML = '<img class="jspsych-same-different-stimulus" src="'+trial.stimuli[0]+'"></img>';
    } else {
      display_element.innerHTML = '<div class="jspsych-same-different-stimulus">'+trial.stimuli[0]+'</div>';
    }

    var first_stim_info;
    if (trial.timing_first_stim > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        showBlankScreen();
      }, trial.timing_first_stim);
    } else {
      function afterKeyboardResponse(info) {
        first_stim_info = info;
        showBlankScreen();
      }
      jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: afterKeyboardResponse,
        valid_responses: trial.advance_key,
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }

    function showBlankScreen() {
      display_element.innerHTML = '';

      jsPsych.pluginAPI.setTimeout(function() {
        showSecondStim();
      }, trial.timing_gap);
    }

    function showSecondStim() {
      if (!trial.is_html) {
        display_element.innerHTML += '<img class="jspsych-same-different-stimulus" src="'+trial.stimuli[1]+'"></img>';
      } else {
        display_element.innerHTML += '<div class="jspsych-same-different-stimulus">'+trial.stimuli[1]+'</div>';
      }

      if (trial.timing_second_stim > 0) {
        jsPsych.pluginAPI.setTimeout(function() {
          display_element.querySelector('.jspsych-same-different-stimulus').style.visibility = 'hidden';
        }, trial.timing_second_stim);
      }

      //show prompt here
      if (trial.prompt !== "") {
        display_element.innerHTML += trial.prompt;
      }

      var after_response = function(info) {

        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();

        var correct = false;

        var skey = typeof trial.same_key == 'string' ? jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.same_key) : trial.same_key;
        var dkey = typeof trial.different_key == 'string' ? jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.different_key) : trial.different_key;

        if (info.key == skey && trial.answer == 'same') {
          correct = true;
        }

        if (info.key == dkey && trial.answer == 'different') {
          correct = true;
        }

        var trial_data = {
          "rt": info.rt,
          "answer": trial.answer,
          "correct": correct,
          "stimulus": JSON.stringify([trial.stimuli[0], trial.stimuli[1]]),
          "key_press": info.key
        };
        if (first_stim_info) {
          trial_data["rt_stim1"] = first_stim_info.rt;
          trial_data["key_press_stim1"] = first_stim_info.key;
        }

        display_element.innerHTML = '';

        jsPsych.finishTrial(trial_data);
      }

      jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.same_key, trial.different_key],
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });

    }

  };

  return plugin;
})();
