/**
 * jsPsych plugin for showing animations and recording keyboard responses
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 */

(function($) {
  jsPsych.animation = (function() {

    var plugin = {};

    plugin.create = function(params) {

      params = jsPsych.pluginAPI.enforceArray(params, ['choices']);

      var trials = new Array(params.stimuli.length);
      for (var i = 0; i < trials.length; i++) {
        trials[i] = {};
        trials[i].stims = params.stimuli[i];
        trials[i].frame_time = params.frame_time || 250;
        trials[i].frame_isi = params.frame_isi || 0;
        trials[i].sequence_reps = params.sequence_reps || 1;
        trials[i].choices = params.choices || [];
        trials[i].prompt = (typeof params.prompt === 'undefined') ? "" : params.prompt;
      }
      return trials;
    };

    plugin.trial = function(display_element, trial) {

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
        display_element.html(""); // clear everything
        animate_frame++;
        if (animate_frame == trial.stims.length) {
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
        display_element.append($('<img>', {
          "src": trial.stims[animate_frame],
          "id": 'jspsych-animation-image'
        }));

        current_stim = trial.stims[animate_frame];

        // record when image was shown
        animation_sequence.push({
          "stimulus": current_stim,
          "time": (new Date()).getTime() - startTime
        });

        if (trial.prompt !== "") {
          display_element.append(trial.prompt);
        }

        if (trial.frame_isi > 0) {
          setTimeout(function() {
            $('#jspsych-animation-image').css('visibility', 'hidden');
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
        $("#jspsych-animation-image").addClass('responded');
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

        jsPsych.data.write({
          "animation_sequence": JSON.stringify(animation_sequence),
          "responses": JSON.stringify(responses)
        });

        jsPsych.finishTrial();
      }
    };

    return plugin;
  })();
})(jQuery);
