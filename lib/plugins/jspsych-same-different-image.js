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

  jsPsych.pluginAPI.registerPreload('same-different-image', 'stimuli', 'image')

  plugin.info = {
    name: 'same-different-image',
    description: '',
    parameters: {
      stimuli: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimuli',
        default: undefined,
        array: true,
        description: 'The images to be displayed.'
      },
      answer: {
        type: jsPsych.plugins.parameterType.SELECT,
        pretty_name: 'Answer',
        options: ['same', 'different'],
        default: 75,
        description: 'Either "same" or "different".'
      },
      same_key: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Same key',
        default: 'Q',
        description: ''
      },
      different_key: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Different key',
        default: 'P',
        description: 'The key that subjects should press to indicate that the two stimuli are the same.'
      },
      first_stim_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'First stimulus duration',
        default: 1000,
        description: 'How long to show the first stimulus for in milliseconds.'
      },
      gap_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Gap duration',
        default: 500,
        description: 'How long to show a blank screen in between the two stimuli.'
      },
      second_stim_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Second stimulus duration',
        default: 1000,
        description: 'How long to show the second stimulus for in milliseconds.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

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

      var html = '<img class="jspsych-same-different-stimulus" src="'+trial.stimuli[1]+'"></img>';
      //show prompt
      if (trial.prompt !== null) {
        html += trial.prompt;
      }

      display_element.innerHTML = html;

      if (trial.second_stim_duration > 0) {
        jsPsych.pluginAPI.setTimeout(function() {
          display_element.querySelector('.jspsych-same-different-stimulus').style.visibility = 'hidden';
        }, trial.second_stim_duration);
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
