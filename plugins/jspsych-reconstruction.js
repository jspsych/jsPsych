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

  plugin.trial = function(display_element, trial) {

    // default parameter values
    trial.starting_value = (typeof trial.starting_value == 'undefined') ? 0.5 : trial.starting_value;
    trial.step_size = trial.step_size || 0.05;
    trial.key_increase = trial.key_increase || 'h';
    trial.key_decrease = trial.key_decrease || 'g';

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial, ['stim_function']);

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

      display_element.html('');

      display_element.append($('<div id="jspsych-reconstruction-stim-container"></div>'));

      $('#jspsych-reconstruction-stim-container').html(trial.stim_function(param));

      // add submit button
      display_element.append($('<button>', {
        'id': 'jspsych-reconstruction-next',
        'class': 'jspsych-btn jspsych-reconstruction'
      }));
      $("#jspsych-reconstruction-next").html('Submit Answers');
      $("#jspsych-reconstruction-next").click(endTrial);
    }

    function endTrial() {
      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // save data
      var trial_data = {
        "rt": response_time,
        "final_value": param,
        "start_value": trial.starting_value
      };

      display_element.html('');

      // next trial
      jsPsych.finishTrial(trial_data);
    }

    var startTime = (new Date()).getTime();

  };

  return plugin;
})();
