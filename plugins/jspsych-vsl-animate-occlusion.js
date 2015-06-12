/**
* jsPsych plugin for showing animations that mimic the experiment described in
*
* Fiser, J., & Aslin, R. N. (2002). Statistical learning of higher-order
* temporal structure from visual shape sequences. Journal of Experimental
* Psychology: Learning, Memory, and Cognition, 28(3), 458.
*
* Josh de Leeuw
*
* documentation: https://github.com/jodeleeuw/jsPsych/wiki/jspsych-vsl-animate-occlusion
*
*/

(function($) {
  jsPsych['vsl-animate-occlusion'] = (function() {

    var plugin = {};

    plugin.create = function(params) {

      var trials = new Array(1);

      trials[0] = {};
      trials[0].type = "vsl-animate-occlusion";
      trials[0].stims = params.stimuli;
      trials[0].timing_cycle = params.timing_cycle || 1000;
      trials[0].canvas_size = params.canvas_size || [400, 400];
      trials[0].image_size = params.image_size || [100, 100];
      trials[0].initial_direction = params.initial_direction || "left";
      trials[0].occlude_center = (typeof params.occlude_center === 'undefined') ? true : params.occlude_center;
      trials[0].choices = params.choices || []; // spacebar
      trials[0].timing_pre_movement = (typeof params.timing_pre_movement === 'undefined') ? 500 : params.timing_pre_movement;
      //trials[0].prompt = (typeof params.prompt === 'undefined') ? "" : params.prompt;

      return trials;
    };

    plugin.trial = function(display_element, trial) {

      // if any trial variables are functions
      // this evaluates the function and replaces
      // it with the output of the function
      trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

      // variable to keep track of timing info and responses
      var start_time = 0;
      var responses = [];

      var directions = [
      [{
        params: {
          x: trial.canvas_size[0] - trial.image_size[0]
        },
        ms: trial.timing_cycle / 2
      }, {
        params: {
          x: trial.canvas_size[0] / 2 - trial.image_size[0] / 2
        },
        ms: trial.timing_cycle / 2
      }],
      [{
        params: {
          x: 0
        },
        ms: trial.timing_cycle / 2
      }, {
        params: {
          x: trial.canvas_size[0] / 2 - trial.image_size[0] / 2
        },
        ms: trial.timing_cycle / 2
      }]
      ];

      var which_image = 0;
      var next_direction = (trial.initial_direction == "right") ? 0 : 1;

      function next_step() {
        if (trial.stims.length == which_image) {
          endTrial();
        }
        else {

          var d = directions[next_direction];
          next_direction === 0 ? next_direction = 1 : next_direction = 0;
          var i = trial.stims[which_image];
          which_image++;

          c.animate(d[0].params, d[0].ms, mina.linear, function() {
            c.animate(d[1].params, d[1].ms, mina.linear, function() {
              next_step();
            });
          });

          c.attr({
            href: i
          });

          // start timer for this trial
          start_time = (new Date()).getTime();
        }
      }

      display_element.append($("<svg id='jspsych-vsl-animate-occlusion-canvas' width="+trial.canvas_size[0]+" height="+trial.canvas_size[1]+"></svg>"));

      var paper = Snap("#jspsych-vsl-animate-occlusion-canvas");

      var c = paper.image(trial.stims[which_image], trial.canvas_size[0] / 2 - trial.image_size[0] / 2, trial.canvas_size[1] / 2 - trial.image_size[1] / 2, trial.image_size[0], trial.image_size[1]).attr({
        "id": 'jspsych-vsl-animate-occlusion-moving-image'
      });

      document.getElementById('jspsych-vsl-animate-occlusion-moving-image').removeAttribute('preserveAspectRatio');

      if (trial.occlude_center) {
        paper.rect((trial.canvas_size[0] / 2) - (trial.image_size[0] / 2), 0, trial.image_size[0], trial.canvas_size[1]).attr({
          fill: "#000"
        });
      }

      // add key listener
      var after_response = function(info){
        responses.push({
          key: info.key,
          stimulus: which_image - 1,
          rt: info.rt
        });
      }

      key_listener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'date',
        persist: true,
        allow_held_key: false
      });

      if (trial.timing_pre_movement > 0) {
        setTimeout(function() {
          next_step();
        }, trial.timing_pre_movement);
      }
      else {
        next_step();
      }

      function endTrial() {

        display_element.html('');

        jsPsych.pluginAPI.cancelKeyboardResponse(key_listener);

        jsPsych.data.write({
          "stimuli": JSON.stringify(trial.stims),
          "responses": JSON.stringify(responses)
        });

        jsPsych.finishTrial();
      }
    };

    return plugin;
  })();
})(jQuery);
