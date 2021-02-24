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
        default: undefined,
        description: 'Either "same" or "different".'
      },
      same_key: {
        type: jsPsych.plugins.parameterType.KEY,
        pretty_name: 'Same key',
        default: 'q',
        description: ''
      },
      different_key: {
        type: jsPsych.plugins.parameterType.KEY,
        pretty_name: 'Different key',
        default: 'p',
        description: 'The key that subjects should press to indicate that the two stimuli are the same.'
      },
      first_stim_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'First stimulus duration',
        default: null,
        description: 'How long to show the first stimulus for in milliseconds. If null, then the stimulus will remain on the screen until any keypress is made.'
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
        default: null,
        description: 'How long to show the second stimulus for in milliseconds. If null, then the stimulus will remain on the screen until a valid response is made.'
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
        rt_method: 'performance',
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

        var skey = trial.same_key;
        var dkey = trial.different_key;

        if (jsPsych.pluginAPI.compareKeys(info.key,skey) && trial.answer == 'same') {
          correct = true;
        }

        if (jsPsych.pluginAPI.compareKeys(info.key, dkey) && trial.answer == 'different') {
          correct = true;
        }

        var trial_data = {
          rt: info.rt,
          answer: trial.answer,
          correct: correct,
          stimulus: [trial.stimuli[0], trial.stimuli[1]],
          response: info.key
        };
        if (first_stim_info) {
          trial_data["rt_stim1"] = first_stim_info.rt;
          trial_data["response_stim1"] = first_stim_info.key;
        }

        display_element.innerHTML = '';

        jsPsych.finishTrial(trial_data);
      }

      jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.same_key, trial.different_key],
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });

    }

  };

  return plugin;
})();
