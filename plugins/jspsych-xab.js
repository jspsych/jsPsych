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

  jsPsych.pluginAPI.registerPreload('xab', 'stimuli', 'image',function(t){ return !t.is_html || t.is_html == 'undefined'});

  plugin.info = {
    name: 'xab',
    description: '',
    parameters: {
      stimulus: {
        type: [jsPsych.plugins.parameterType.STRING],
        array: true,
        default: undefined,
        no_function: false,
        description: ''
      },
      is_html: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      left_key: {
        type: [jsPsych.plugins.parameterType.KEYCODE],
        default: 'q',
        no_function: false,
        description: ''
      },
      right_key: {
        type: [jsPsych.plugins.parameterType.KEYCODE],
        default: 'p',
        no_function: false,
        description: ''
      },
      prompt: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      },
      timing_x: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 1000,
        no_function: false,
        description: ''
      },
      timing_xab_gap: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 1000,
        no_function: false,
        description: ''
      },
      timing_ab: {
        type: [jsPsych.plugins.parameterType.INT],
        default: -1,
        no_function: false,
        description: ''
      },
      timing_response: {
        type: [jsPsych.plugins.parameterType.INT],
        default: -1,
        no_function: false,
        description: ''
      }
    }
  }

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

    // how we display the content depends on whether the content is
    // HTML code or an image path.
    if (!trial.is_html) {
      display_element.innerHTML = '<img class="jspsych-xab-stimulus" src="'+trial.x_path+'"></img>';
    } else {
      display_element.innerHTML = '<div class="jspsych-xab-stimulus">'+trial.x_path+'</div>';
    }

    // start a timer of length trial.timing_x to move to the next part of the trial
    jsPsych.pluginAPI.setTimeout(function() {
      showBlankScreen();
    }, trial.timing_x);


    function showBlankScreen() {
      // remove the x stimulus
      display_element.innerHTML = '';

      // start timer
      jsPsych.pluginAPI.setTimeout(function() {
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

      if (!trial.is_html) {
        display_element.innerHTML = '<img class="jspsych-xab-stimulus" src="'+trial.x_path+'"></img>';
      } else {
        display_element.innerHTML = '<div class="jspsych-xab-stimulus">'+trial.x_path+'</div>';
      }
      // show the options
      if (!trial.is_html) {
        display_element.innerHTML += '<img class="jspsych-xab-stimulus left" src="'+images[0]+'"></img>';
        display_element.innerHTML += '<img class="jspsych-xab-stimulus right" src="'+images[1]+'"></img>';
      } else {
        display_element.innerHTML += '<div class="jspsych-xab-stimulus left">'+images[0]+'</div>';
        display_element.innerHTML += '<div class="jspsych-xab-stimulus right">'+images[1]+'</div>';
      }

      if (trial.prompt !== "") {
        display_element.innerHTML += trial.prompt;
      }

      // if timing_ab is > 0, then we hide the stimuli after timing_ab milliseconds
      if (trial.timing_ab > 0) {
        jsPsych.pluginAPI.setTimeout(function() {
          var matches = display_element.querySelectorAll('.jspsych-xab-stimulus');
          for(var i=0; i<matches.length; i++){
            matches[i].style.visibility = 'hidden';
          }
        }, trial.timing_ab);
      }

      // if timing_response > 0, then we end the trial after timing_response milliseconds
      if (trial.timing_response > 0) {
        jsPsych.pluginAPI.setTimeout(function() {
          end_trial({
            rt: -1,
            correct: false,
            key: -1
          });
        }, trial.timing_response);
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
