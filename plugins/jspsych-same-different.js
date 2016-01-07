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

  jsPsych.pluginAPI.registerPreload('same-different', 'stimuli', 'image');

  plugin.trial = function(display_element, trial) {

    // default parameters
    trial.same_key = trial.same_key || 81; // default is 'q'
    trial.different_key = trial.different_key || 80; // default is 'p'
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

    // this array holds handlers from setTimeout calls
    // that need to be cleared if the trial ends early
    var setTimeoutHandlers = [];

    // show image
    if (!trial.is_html) {
      display_element.append($('<img>', {
        src: trial.stimuli[0],
        "class": 'jspsych-same-different-stimulus'
      }));
    } else {
      display_element.append($('<div>', {
        html: trial.stimuli[0],
        "class": 'jspsych-same-different-stimulus'
      }));
    }

    var first_stim_info;
    if (trial.timing_first_stim > 0) {
      setTimeoutHandlers.push(setTimeout(function() {
        showBlankScreen();
      }, trial.timing_first_stim));
    } else {
      function afterKeyboardResponse(info) {
        first_stim_info = info;
        showBlankScreen();
      }
      jsPsych.pluginAPI.getKeyboardResponse(afterKeyboardResponse, [], 'date', false);
    }

    function showBlankScreen() {
      $('.jspsych-same-different-stimulus').remove();

      setTimeoutHandlers.push(setTimeout(function() {
        showSecondStim();
      }, trial.timing_gap));
    }

    function showSecondStim() {
      if (!trial.is_html) {
        display_element.append($('<img>', {
          src: trial.stimuli[1],
          "class": 'jspsych-same-different-stimulus',
          id: 'jspsych-same-different-second-stimulus'
        }));
      } else {
        display_element.append($('<div>', {
          html: trial.stimuli[1],
          "class": 'jspsych-same-different-stimulus',
          id: 'jspsych-same-different-second-stimulus'
        }));
      }

      if (trial.timing_second_stim > 0) {
        setTimeoutHandlers.push(setTimeout(function() {
          $("#jspsych-same-different-second-stimulus").css('visibility', 'hidden');
        }, trial.timing_second_stim));
      }

      //show prompt here
      if (trial.prompt !== "") {
        display_element.append(trial.prompt);
      }

      var after_response = function(info) {

        // kill any remaining setTimeout handlers
        for (var i = 0; i < setTimeoutHandlers.length; i++) {
          clearTimeout(setTimeoutHandlers[i]);
        }

        var correct = false;

        if (info.key == trial.same_key && trial.answer == 'same') {
          correct = true;
        }

        if (info.key == trial.different_key && trial.answer == 'different') {
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

        display_element.html('');

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
