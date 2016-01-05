/**
 * jspsych plugin for categorization trials with feedback and animated stimuli
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 **/


jsPsych.plugins["categorize-animation"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('categorize-animation', 'stimuli', 'image');

  plugin.trial = function(display_element, trial) {

    // set default values
    trial.sequence_reps = trial.sequence_reps || 1;
    trial.key_answer = trial.key_answer;
    trial.text_answer = (typeof trial.text_answer === 'undefined') ? "" : trial.text_answer;
    trial.correct_text = trial.correct_text || "Correct.";
    trial.incorrect_text = trial.incorrect_text || "Wrong.";
    trial.allow_response_before_complete = trial.allow_response_before_complete || false;
    trial.frame_time = trial.frame_time || 500;
    trial.timing_feedback_duration = trial.timing_feedback_duration || 2000;
    trial.prompt = (typeof trial.prompt === 'undefined') ? '' : trial.prompt;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    var animate_frame = -1;
    var reps = 0;

    var showAnimation = true;

    var responded = false;
    var timeoutSet = false;
    var correct;


    var startTime = (new Date()).getTime();

    // show animation
    var animate_interval = setInterval(function() {
      display_element.html(""); // clear everything
      animate_frame++;
      if (animate_frame == trial.stimuli.length) {
        animate_frame = 0;
        reps++;
        // check if reps complete //
        if (trial.sequence_reps != -1 && reps >= trial.sequence_reps) {
          // done with animation
          showAnimation = false;
        }
      }

      if (showAnimation) {
        display_element.append($('<img>', {
          "src": trial.stimuli[animate_frame],
          "class": 'jspsych-categorize-animation-stimulus'
        }));
      }

      if (!responded && trial.allow_response_before_complete) {
        // in here if the user can respond before the animation is done
        if (trial.prompt !== "") {
          display_element.append(trial.prompt);
        }
      } else if (!responded) {
        // in here if the user has to wait to respond until animation is done.
        // if this is the case, don't show the prompt until the animation is over.
        if (!showAnimation) {
          if (trial.prompt !== "") {
            display_element.append(trial.prompt);
          }
        }
      } else {
        // user has responded if we get here.

        // show feedback
        var feedback_text = "";
        if (correct) {
          feedback_text = trial.correct_text.replace("%ANS%", trial.text_answer);
        } else {
          feedback_text = trial.incorrect_text.replace("%ANS%", trial.text_answer);
        }
        display_element.append(feedback_text);

        // set timeout to clear feedback
        if (!timeoutSet) {
          timeoutSet = true;
          setTimeout(function() {
            endTrial();
          }, trial.timing_feedback_duration);
        }
      }


    }, trial.frame_time);


    var keyboard_listener;
    var trial_data = {};

    var after_response = function(info) {
      // ignore the response if animation is playing and subject
      // not allowed to respond before it is complete
      if (!trial.allow_response_before_complete && showAnimation) {
        return false;
      }

      correct = false;
      if (trial.key_answer == info.key) {
        correct = true;
      }

      responded = true;

      trial_data = {
        "stimulus": JSON.stringify(trial.stimuli),
        "rt": info.rt,
        "correct": correct,
        "key_press": info.key
      };

      jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_listener);

    }

    keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: 'date',
      persist: true,
      allow_held_key: false
    });

    function endTrial() {
      clearInterval(animate_interval); // stop animation!
      display_element.html(''); // clear everything
      jsPsych.finishTrial(trial_data);
    }
  };

  return plugin;
})();
