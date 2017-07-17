/*  jspsych-xab.js
 *	Josh de Leeuw
 *
 *  This plugin runs a single XAB trial, where X is an image presented in isolation, and A and B are choices, with A or B being equal to X.
 *	The subject's goal is to identify whether A or B is identical to X.
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins['xab-image'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('xab-image', 'stimuli', 'image');

  plugin.info = {
    name: 'xab-image',
    description: '',
    parameters: {
      stimuli: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimuli',
        array: true,
        default: undefined,
        description: 'Array of 2 or 3 HTML elements.'
      },
      left_key: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Left key',
        default: 'q',
        description: 'Which key the subject should press to indicate that the target is on the left side.'
      },
      right_key: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Right key',
        default: 'p',
        description: 'Which key the subject should press to indicate that the target is on the right side.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: '',
        description: 'Any content here will be displayed below the stimulus.'
      },
      x_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'X duration',
        default: 1000,
        description: 'How long to show the X stimulus for in milliseconds.'
      },
      x_durationab_gap: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'X durationab gap',
        default: 1000,
        description: 'How long to show a blank screen in between X and AB in milliseconds.'
      },
      ab_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'AB duration',
        default: -1,
        description: 'How long to show A and B in milliseconds.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: -1,
        description: 'The maximum duration to wait for a response.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

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

    // how we display the content depends on whether the content is
    // HTML code or an image path.

    display_element.innerHTML = '<img class="jspsych-xab-stimulus" src="'+trial.x_path+'"></img>';


    // start a timer of length trial.x_duration to move to the next part of the trial
    jsPsych.pluginAPI.setTimeout(function() {
      showBlankScreen();
    }, trial.x_duration);


    function showBlankScreen() {
      // remove the x stimulus
      display_element.innerHTML = '';

      // start timer
      jsPsych.pluginAPI.setTimeout(function() {
        showSecondStimulus();
      }, trial.x_durationab_gap);
    }


    function showSecondStimulus() {

      // randomize whether the target is on the left or the right
      var images = [trial.a_path, trial.b_path];
      var target_left = (Math.floor(Math.random() * 2) === 0); // 50% chance target is on left.
      if (!target_left) {
        images = [trial.b_path, trial.a_path];
      }

      // show the options
      display_element.innerHTML += '<img class="jspsych-xab-stimulus left" src="'+images[0]+'"></img>';
      display_element.innerHTML += '<img class="jspsych-xab-stimulus right" src="'+images[1]+'"></img>';

      if (trial.prompt !== "") {
        display_element.innerHTML += trial.prompt;
      }

      // if ab_duration is > 0, then we hide the stimuli after ab_duration milliseconds
      if (trial.ab_duration > 0) {
        jsPsych.pluginAPI.setTimeout(function() {
          var matches = display_element.querySelectorAll('.jspsych-xab-stimulus');
          for(var i=0; i<matches.length; i++){
            matches[i].style.visibility = 'hidden';
          }
        }, trial.ab_duration);
      }

      // if trial_duration > 0, then we end the trial after trial_duration milliseconds
      if (trial.trial_duration > 0) {
        jsPsych.pluginAPI.setTimeout(function() {
          end_trial({
            rt: -1,
            correct: false,
            key: -1
          });
        }, trial.trial_duration);
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
        jsPsych.pluginAPI.clearAllTimeouts();

        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);

        // create object to store data from trial
        var trial_data = {
          "rt": info.rt,
          "correct": info.correct,
          "stimulus": JSON.stringify([trial.x_path, trial.a_path, trial.b_path]),
          "key_press": info.key
        };

        display_element.innerHTML = ''; // remove all

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
