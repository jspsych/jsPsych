/**
 * jspsych plugin for categorization trials with feedback
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 **/


jsPsych.plugins.categorize = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('categorize', 'stimulus', 'image',function(t){ return !t.is_html || t.is_html == 'undefined'});

  plugin.info = {
    name: 'categorize',
    description: '',
    parameters: {
      stimulus: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: undefined,
        no_function: false,
        description: ''
      },
      is_html: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: undefined,
        no_function: false,
        description: ''
      },
      key_answer: {
        type: [jsPsych.plugins.parameterType.KEYCODE],
        default: undefined,
        no_function: false,
        description: ''
      },
      choices: {
        type: [jsPsych.plugins.parameterType.KEYCODE],
        default: jsPsych.ALL_KEYS,
        array: true,
        no_function: false,
        description: ''
      },
      text_answer: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      },
      correct_text: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: 'Correct.',
        no_function: false,
        description: ''
      },
      incorrect_text: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: 'Wrong.',
        no_function: false,
        description: ''
      },
      prompt: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      },
      force_correct_button_press: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      show_stim_with_feedback: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: true,
        no_function: false,
        description: ''
      },
      show_feedback_on_timeout: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      timeout_message: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: 'Please respond faster.',
        no_function: false,
        description: ''
      },
      timing_stim: {
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
      },
      timing_feedback_duration: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 2000,
        no_function: false,
        description: ''
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // default parameters
    trial.choices = trial.choices || jsPsych.ALL_KEYS;
    trial.text_answer = (typeof trial.text_answer === 'undefined') ? "" : trial.text_answer;
    trial.correct_text = (typeof trial.correct_text === 'undefined') ? "<p class='feedback'>Correct</p>" : trial.correct_text;
    trial.incorrect_text = (typeof trial.incorrect_text === 'undefined') ? "<p class='feedback'>Incorrect</p>" : trial.incorrect_text;
    trial.show_stim_with_feedback = (typeof trial.show_stim_with_feedback === 'undefined') ? true : trial.show_stim_with_feedback;
    trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
    trial.force_correct_button_press = (typeof trial.force_correct_button_press === 'undefined') ? false : trial.force_correct_button_press;
    trial.prompt = (typeof trial.prompt === 'undefined') ? '' : trial.prompt;
    trial.show_feedback_on_timeout = (typeof trial.show_feedback_on_timeout === 'undefined') ? false : trial.show_feedback_on_timeout;
    trial.timeout_message = trial.timeout_message || "<p>Please respond faster.</p>";
    // timing params
    trial.timing_stim = trial.timing_stim || -1; // default is to show image until response
    trial.timing_response = trial.timing_response || -1; // default is no max response time
    trial.timing_feedback_duration = trial.timing_feedback_duration || 2000;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    if (!trial.is_html) {
      display_element.innerHTML = '<img id="jspsych-categorize-stimulus" class="jspsych-categorize-stimulus" src="'+trial.stimulus+'"></img>';
    } else {
      display_element.innerHTML = '<div id="jspsych-categorize-stimulus" class="jspsych-categorize-stimulus">'+trial.stimulus+'</div>';
    }

    // hide image after time if the timing parameter is set
    if (trial.timing_stim > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-categorize-stimulus').style.visibility = 'hidden';
      }, trial.timing_stim);
    }

    // if prompt is set, show prompt
    if (trial.prompt !== "") {
      display_element.innerHTML += trial.prompt;
    }

    var trial_data = {};

    // create response function
    var after_response = function(info) {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // clear keyboard listener
      jsPsych.pluginAPI.cancelAllKeyboardResponses();

      var correct = false;
      if (trial.key_answer == info.key) {
        correct = true;
      }

      // save data
      trial_data = {
        "rt": info.rt,
        "correct": correct,
        "stimulus": trial.stimulus,
        "key_press": info.key
      };

      display_element.innerHTML = '';

      var timeout = info.rt == -1;
      doFeedback(correct, timeout);
    }

    jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: 'date',
      persist: false,
      allow_held_key: false
    });

    if (trial.timing_response > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        after_response({
          key: -1,
          rt: -1
        });
      }, trial.timing_response);
    }

    function doFeedback(correct, timeout) {

      if (timeout && !trial.show_feedback_on_timeout) {
        display_element.innerHTML += trial.timeout_message;
      } else {
        // show image during feedback if flag is set
        if (trial.show_stim_with_feedback) {
          if (!trial.is_html) {
            display_element.innerHTML = '<img id="jspsych-categorize-stimulus" class="jspsych-categorize-stimulus" src="'+trial.stimulus+'"></img>';
          } else {
            display_element.innerHTML = '<div id="jspsych-categorize-stimulus" class="jspsych-categorize-stimulus">'+trial.stimulus+'</div>';
          }
        }

        // substitute answer in feedback string.
        var atext = "";
        if (correct) {
          atext = trial.correct_text.replace("%ANS%", trial.text_answer);
        } else {
          atext = trial.incorrect_text.replace("%ANS%", trial.text_answer);
        }

        // show the feedback
        display_element.innerHTML += atext;
      }
      // check if force correct button press is set
      if (trial.force_correct_button_press && correct === false && ((timeout && trial.show_feedback_on_timeout) || !timeout)) {

        var after_forced_response = function(info) {
          endTrial();
        }

        jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_forced_response,
          valid_responses: [trial.key_answer],
          rt_method: 'date',
          persist: false,
          allow_held_key: false
        });

      } else {
        jsPsych.pluginAPI.setTimeout(function() {
          endTrial();
        }, trial.timing_feedback_duration);
      }

    }

    function endTrial() {
      display_element.innerHTML = '';
      jsPsych.finishTrial(trial_data);
    }

  };

  return plugin;
})();
