/*  jspsych-xab.js
 *	Josh de Leeuw
 *
 *  This plugin runs a single XAB trial, where X is an image presented in isolation, and A and B are choices, with A or B being equal to X.
 *	The subject's goal is to identify whether A or B is identical to X.
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins.xab = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('xab', 'stimuli', 'image');

  plugin.trial = function(display_element, trial) {

    // default trial values
    trial.left_key = trial.left_key || 81; // defaults to 'q'
    trial.right_key = trial.right_key || 80; // defaults to 'p'
    trial.timing_x = trial.timing_x || 1000; // defaults to 1000msec.
    trial.timing_xab_gap = trial.timing_xab_gap || 1000; // defaults to 1000msec.
    trial.timing_ab = trial.timing_ab || -1; // defaults to -1, meaning infinite time on AB. If a positive number is used, then AB will only be displayed for that length.
    trial.timing_response = trial.timing_response || -1; //
    trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // unpack the stimuli array
    trial.x_path = trial.stimuli[0];

    // if there is only a pair of stimuli, then the first is the target and is shown twice.
    // if there is a triplet, then the first is X, the second is the target, and the third is foil (useful for non-exact-match XAB).
    if (trial.stimuli.length == 2) {
      trial.a_path = trial.stimuli[0];
      trial.b_path = trial.stimuli[1];
    } else {
      trial.a_path = trial.stimuli[1];
      trial.b_path = trial.stimuli[2];
    }

    // this array holds handlers from setTimeout calls
    // that need to be cleared if the trial ends early
    var setTimeoutHandlers = [];

    // how we display the content depends on whether the content is
    // HTML code or an image path.
    if (!trial.is_html) {
      display_element.append($('<img>', {
        src: trial.x_path,
        "class": 'jspsych-xab-stimulus'
      }));
    } else {
      display_element.append($('<div>', {
        "class": 'jspsych-xab-stimulus',
        html: trial.x_path
      }));
    }

    // start a timer of length trial.timing_x to move to the next part of the trial
    setTimeout(function() {
      showBlankScreen();
    }, trial.timing_x);


    function showBlankScreen() {
      // remove the x stimulus
      $('.jspsych-xab-stimulus').remove();

      // start timer
      setTimeout(function() {
        showSecondStimulus();
      }, trial.timing_xab_gap);
    }


    function showSecondStimulus() {

      // randomize whether the target is on the left or the right
      var images = [trial.a_path, trial.b_path];
      var target_left = (Math.floor(Math.random() * 2) === 0); // 50% chance target is on left.
      if (!target_left) {
        images = [trial.b_path, trial.a_path];
      }

      // show the options
      if (!trial.is_html) {
        display_element.append($('<img>', {
          "src": images[0],
          "class": 'jspsych-xab-stimulus left'
        }));
        display_element.append($('<img>', {
          "src": images[1],
          "class": 'jspsych-xab-stimulus right'
        }));
      } else {
        display_element.append($('<div>', {
          "class": 'jspsych-xab-stimulus left',
          html: images[0]
        }));
        display_element.append($('<div>', {
          "class": 'jspsych-xab-stimulus right',
          html: images[1]
        }));
      }

      if (trial.prompt !== "") {
        display_element.append(trial.prompt);
      }

      // if timing_ab is > 0, then we hide the stimuli after timing_ab milliseconds
      if (trial.timing_ab > 0) {
        setTimeoutHandlers.push(setTimeout(function() {
          $('.jspsych-xab-stimulus').css('visibility', 'hidden');
        }, trial.timing_ab));
      }

      // if timing_response > 0, then we end the trial after timing_response milliseconds
      if (trial.timing_response > 0) {
        var t2 = setTimeout(function() {
          end_trial({
            rt: -1,
            correct: false,
            key: -1
          });
        }, trial.timing_response);
        setTimeoutHandlers.push(t2);
      }

      // create the function that triggers when a key is pressed.
      var after_response = function(info) {

        var correct = false; // true when the correct response is chosen

        if (info.key == trial.left_key) // 'q' key by default
        {
          if (target_left) {
            correct = true;
          }
        } else if (info.key == trial.right_key) // 'p' key by default
        {
          if (!target_left) {
            correct = true;
          }
        }

        info.correct = correct;

        end_trial(info);

      };

      var end_trial = function(info) {
        // kill any remaining setTimeout handlers
        for (var i = 0; i < setTimeoutHandlers.length; i++) {
          clearTimeout(setTimeoutHandlers[i]);
        }

        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);

        // create object to store data from trial
        var trial_data = {
          "rt": info.rt,
          "correct": info.correct,
          "stimulus": JSON.stringify([trial.x_path, trial.a_path, trial.b_path]),
          "key_press": info.key
        };

        display_element.html(''); // remove all

        // move on to the next trial after timing_post_trial milliseconds
        jsPsych.finishTrial(trial_data);
      }

      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.left_key, trial.right_key],
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }
  };

  return plugin;
})();
