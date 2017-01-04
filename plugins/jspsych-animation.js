/**
 * jsPsych plugin for showing animations and recording keyboard responses
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 */

jsPsych.plugins.animation = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('animation', 'stimuli', 'image');

  plugin.info = {
    name: 'animation',
    description: '',
    parameters: {
      stimuli: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: undefined,
        no_function: false,
        array: true,
        description: ''
      },
      frame_time: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 250,
        no_function: false,
        description: ''
      },
      frame_isi: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 0,
        no_function: false,
        description: ''
      },
      sequence_reps: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 1,
        no_function: false,
        description: ''
      },
      choices: {
        type: [jsPsych.plugins.parameterType.KEYCODE],
        default: jsPsych.ALL_KEYS,
        no_function: false,
        array: true,
        description: ''
      },
      prompt: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    trial.frame_time = trial.frame_time || 250;
    trial.frame_isi = trial.frame_isi || 0;
    trial.sequence_reps = trial.sequence_reps || 1;
    trial.choices = trial.choices || jsPsych.ALL_KEYS;
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    var interval_time = trial.frame_time + trial.frame_isi;
    var animate_frame = -1;
    var reps = 0;
    var startTime = (new Date()).getTime();
    var animation_sequence = [];
    var responses = [];
    var current_stim = "";

    var animate_interval = setInterval(function() {
      var showImage = true;
      display_element.innerHTML = ''; // clear everything
      animate_frame++;
      if (animate_frame == trial.stimuli.length) {
        animate_frame = 0;
        reps++;
        if (reps >= trial.sequence_reps) {
          endTrial();
          clearInterval(animate_interval);
          showImage = false;
        }
      }
      if (showImage) {
        show_next_frame();
      }
    }, interval_time);

    function show_next_frame() {
      // show image
      display_element.innerHTML = '<img src="'+trial.stimuli[animate_frame]+'" id="jspsych-animation-image"></img>';

      current_stim = trial.stimuli[animate_frame];

      // record when image was shown
      animation_sequence.push({
        "stimulus": trial.stimuli[animate_frame],
        "time": (new Date()).getTime() - startTime
      });

      if (trial.prompt !== "") {
        display_element.innerHTML += trial.prompt;
      }

      if (trial.frame_isi > 0) {
        jsPsych.pluginAPI.setTimeout(function() {
          display_element.querySelector('#jspsych-animation-image').style.visibility = 'hidden';
          current_stim = 'blank';
          // record when blank image was shown
          animation_sequence.push({
            "stimulus": 'blank',
            "time": (new Date()).getTime() - startTime
          });
        }, trial.frame_time);
      }
    }

    var after_response = function(info) {

      responses.push({
        key_press: info.key,
        rt: info.rt,
        stimulus: current_stim
      });

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-animation-image').className += ' responded';
    }

    // hold the jspsych response listener object in memory
    // so that we can turn off the response collection when
    // the trial ends
    var response_listener = jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: 'date',
      persist: true,
      allow_held_key: false
    });

    function endTrial() {

      jsPsych.pluginAPI.cancelKeyboardResponse(response_listener);

      var trial_data = {
        "animation_sequence": JSON.stringify(animation_sequence),
        "responses": JSON.stringify(responses)
      };

      jsPsych.finishTrial(trial_data);
    }
  };

  return plugin;
})();
