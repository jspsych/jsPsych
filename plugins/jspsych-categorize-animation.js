/**
 * jspsych plugin for categorization trials with feedback and animated stimuli
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 **/


jsPsych.plugins["categorize-animation"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('categorize-animation', 'stimuli', 'image');

  plugin.info = {
    name: 'categorize-animation',
    description: '',
    parameters: {
      stimuli: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimuli',
        default: undefined,
        description: 'Array of paths to image files.'
      },
      key_answer: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Key answer',
        default: undefined,
        description: 'The key to indicate correct response'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        array: true,
        description: 'The keys subject is allowed to press to respond to stimuli.'
      },
      text_answer: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Text answer',
        default: null,
        description: 'Text to describe correct answer.'
      },
      correct_text: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Correct text',
        default: 'Correct.',
        description: 'String to show when subject gives correct answer'
      },
      incorrect_text: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Incorrect text',
        default: 'Wrong.',
        description: 'String to show when subject gives incorrect answer.'
      },
      frame_time: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Frame time',
        default: 500,
        description: 'Duration to display each image.'
      },
      sequence_reps: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Sequence repetitions',
        default: 1,
        description: 'How many times to display entire sequence.'
      },
      allow_response_before_complete: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Allow response before complete',
        default: false,
        description: 'If true, subject can response before the animation sequence finishes'
      },
      feedback_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Feedback duration',
        default: 2000,
        description: 'How long to show feedback'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    var animate_frame = -1;
    var reps = 0;

    var showAnimation = true;

    var responded = false;
    var timeoutSet = false;
    var correct;


    var startTime = (new Date()).getTime();

    // show animation
    var animate_interval = setInterval(function() {
      display_element.innerHTML = ''; // clear everything
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
        display_element.innerHTML += '<img src="'+trial.stimuli[animate_frame]+'" class="jspsych-categorize-animation-stimulus"></img>';
      }

      if (!responded && trial.allow_response_before_complete) {
        // in here if the user can respond before the animation is done
        if (trial.prompt !== null) {
          display_element.innerHTML += trial.prompt;
        }
      } else if (!responded) {
        // in here if the user has to wait to respond until animation is done.
        // if this is the case, don't show the prompt until the animation is over.
        if (!showAnimation) {
          if (trial.prompt !== null) {
            display_element.innerHTML += trial.prompt;
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
        display_element.innerHTML += feedback_text;

        // set timeout to clear feedback
        if (!timeoutSet) {
          timeoutSet = true;
          jsPsych.pluginAPI.setTimeout(function() {
            endTrial();
          }, trial.feedback_duration);
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
      display_element.innerHTML = ''; // clear everything
      jsPsych.finishTrial(trial_data);
    }
  };

  return plugin;
})();
