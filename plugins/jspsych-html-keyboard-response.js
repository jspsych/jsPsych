/**
 * jspsych-html-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["html-keyboard-response"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'html-keyboard-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      max_stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Max stimulus duration',
        default: null,
        description: 'How long to hide the stimulus, after it is displayed.'
      },
      min_stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Min stimulus duration',
        default: null,
        description: 'How long to prevent responses, after stimulus has been displayed.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },

    }
  }

  plugin.trial = function(display_element, trial) {

    if (trial.trial_duration && trial.min_stimulus_duration) {
      if (!(trial.trial_duration > trial.min_stimulus_duration)) {
        throw Error("trial_duration has to be greater than min_stimulus_duration")
      }
    }

    const keyboard_response_container = document.createElement('div')
    keyboard_response_container.id = 'jspsych-html-keyboard-response-stimulus'

    const stimulus_container = document.createElement('div')
    stimulus_container.innerHTML = trial.stimulus

    // make prompt
    const prompt_element = trial.prompt ? document.createElement("div") : null
    if (prompt_element) {
      prompt_element.innerHTML = trial.prompt
    }

    // draw
    display_element.innerHTML = '' // erase progress bar
    keyboard_response_container.appendChild(stimulus_container)
    if (prompt_element) {
      keyboard_response_container.appendChild(prompt_element)
    }
    display_element.appendChild(keyboard_response_container)

    // store response
    var response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    var end_trial = function(rt_offset) {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var rt = rt_offset ? response.rt + rt_offset : response.rt;
      var trial_data = {
        "rt": rt,
        "stimulus": trial.stimulus,
        "key_press": response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info, rt_offset) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      keyboard_response_container.className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial(rt_offset);
      }
    };

    function enable_user_response(adjusted_trial_duration, rt_offset) {
      // start the response listener
      if (trial.choices != jsPsych.NO_KEYS) {
        jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: function(info) { after_response(info, rt_offset) },
          valid_responses: trial.choices,
          rt_method: 'performance',
          persist: false,
          allow_held_key: false
        });
      }

      // hide stimulus if max_stimulus_duration is set
      if (trial.max_stimulus_duration !== null) {
        jsPsych.pluginAPI.setTimeout(function() {
          stimulus_container.style.visibility = 'hidden';
        }, trial.max_stimulus_duration);
      }

      // end trial if  is set
      if (adjusted_trial_duration !== null) {
        jsPsych.pluginAPI.setTimeout(function() {
          end_trial(rt_offset);
        }, adjusted_trial_duration);
      }
    }

    if (trial.min_stimulus_duration) {
      if (prompt_element) {
        prompt_element.style.visibility = 'hidden';
      }
      jsPsych.pluginAPI.setTimeout(function() {
        if (prompt_element) {
          prompt_element.style.visibility = '';
        }
        enable_user_response(trial.trial_duration ? trial.trial_duration - trial.min_stimulus_duration : null,
          trial.min_stimulus_duration)

      }, trial.min_stimulus_duration)

    } else {
      enable_user_response(trial.trial_duration)
    }


  };

  return plugin;
})();
