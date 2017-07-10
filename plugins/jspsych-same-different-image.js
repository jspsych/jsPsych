/**
 * jspsych-same-different
 * Josh de Leeuw
 *
 * plugin for showing two stimuli sequentially and getting a same / different judgment
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins['same-different-image'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('same-different', 'stimuli', 'image')

  plugin.info = {
    name: 'same-different-image',
    description: '',
    parameters: {
      stimuli: {
        type: jsPsych.plugins.parameterType.IMAGE,
        default: undefined,
        array: true,
        no_function: false,
        description: ''
      },
      answer: {
        type: jsPsych.plugins.parameterType.SELECT,
        options: ['same', 'different'],
        default: 75,
        no_function: false,
        description: ''
      },
      same_key: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        default: 'Q',
        no_function: false,
        description: ''
      },
      different_key: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        default: 'P',
        no_function: false,
        description: ''
      },
      first_stim_duration: {
        type: jsPsych.plugins.parameterType.INT,
        default: 1000,
        no_function: false,
        description: ''
      },
      gap_duration: {
        type: jsPsych.plugins.parameterType.INT,
        default: 500,
        no_function: false,
        description: ''
      },
      second_stim_duration: {
        type: jsPsych.plugins.parameterType.INT,
        default: 1000,
        no_function: false,
        description: ''
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
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
    trial.first_stim_duration = trial.first_stim_duration || 1000; // if -1, the first stim is shown until any key is pressed
    trial.second_stim_duration = trial.second_stim_duration || 1000; // if -1, then second stim is shown until response.
    trial.gap_duration = trial.gap_duration || 500;
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;

    display_element.innerHTML = '<img class="jspsych-same-different-stimulus" src="'+trial.stimuli[0]+'"></img>';

    var first_stim_info;
    if (trial.first_stim_duration > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        showBlankScreen();
      }, trial.first_stim_duration);
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
      }, trial.gap_duration);
    }

    function showSecondStim() {

      display_element.innerHTML += '<img class="jspsych-same-different-stimulus" src="'+trial.stimuli[1]+'"></img>';


      if (trial.second_stim_duration > 0) {
        jsPsych.pluginAPI.setTimeout(function() {
          display_element.querySelector('.jspsych-same-different-stimulus').style.visibility = 'hidden';
        }, trial.second_stim_duration);
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
