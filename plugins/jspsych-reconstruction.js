/**
 * jspsych-reconstruction
 * a jspsych plugin for a reconstruction task where the subject recreates
 * a stimulus from memory
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['reconstruction'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'reconstruction',
    description: '',
    parameters: {
      stim_function: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: 'Stimulus function',
        default: undefined,
        description: 'A function with a single parameter that returns an HTML-formatted string representing the stimulus.'
      },
      starting_value: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Starting value',
        default: 0.5,
        description: 'The starting value of the stimulus parameter.'
      },
      step_size: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Step size',
        default: 0.05,
        description: 'The change in the stimulus parameter caused by pressing one of the modification keys.'
      },
      key_increase: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Key increase',
        default: 'h',
        description: 'The key to press for increasing the parameter value.'
      },
      key_decrease: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Key decrease',
        default: 'g',
        description: 'The key to press for decreasing the parameter value.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        description: 'The text that appears on the button to finish the trial.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // current param level
    var param = trial.starting_value;

    // set-up key listeners
    var after_response = function(info) {

      //console.log('fire');

      var key_i = (typeof trial.key_increase == 'string') ? jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.key_increase) : trial.key_increase;
      var key_d = (typeof trial.key_decrease == 'string') ? jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.key_decrease) : trial.key_decrease;

      // get new param value
      if (info.key == key_i) {
        param = param + trial.step_size;
      } else if (info.key == key_d) {
        param = param - trial.step_size;
      }
      param = Math.max(Math.min(1, param), 0);

      // refresh the display
      draw(param);
    }

    // listen for responses
    var key_listener = jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: [trial.key_increase, trial.key_decrease],
      rt_method: 'date',
      persist: true,
      allow_held_key: true
    });
    // draw first iteration
    draw(param);

    function draw(param) {

      //console.log(param);

      display_element.innerHTML = '<div id="jspsych-reconstruction-stim-container">'+trial.stim_function(param)+'</div>';

      // add submit button
      display_element.innerHTML += '<button id="jspsych-reconstruction-next" class="jspsych-btn jspsych-reconstruction">'+trial.button_label+'</button>';

      display_element.querySelector('#jspsych-reconstruction-next').addEventListener('click', endTrial);
    }

    function endTrial() {
      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // clear keyboard response
      jsPsych.pluginAPI.cancelKeyboardResponse(key_listener);

      // save data
      var trial_data = {
        "rt": response_time,
        "final_value": param,
        "start_value": trial.starting_value
      };

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trial_data);
    }

    var startTime = (new Date()).getTime();

  };

  return plugin;
})();
