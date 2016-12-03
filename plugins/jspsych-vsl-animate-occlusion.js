/**
 * jsPsych plugin for showing animations that mimic the experiment described in
 *
 * Fiser, J., & Aslin, R. N. (2002). Statistical learning of higher-order
 * temporal structure from visual shape sequences. Journal of Experimental
 * Psychology: Learning, Memory, and Cognition, 28(3), 458.
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins['vsl-animate-occlusion'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('vsl-animate-occlusion', 'stimuli', 'image');

  plugin.info = {
    name: 'vsl-animate-occlusion',
    description: '',
    parameters: {
      stimuli: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: undefined,
        array: true,
        no_function: false,
        description: ''
      },
      choices: {
        type: [jsPsych.plugins.parameterType.KEYCODE],
        array: true,
        default: jsPsych.ALL_KEYS,
        no_function: false,
        description: ''
      },
      canvas_size: {
        type: [jsPsych.plugins.parameterType.INT],
        array: true,
        default: [400,400],
        no_function: false,
        description: ''
      },
      image_size: {
        type: [jsPsych.plugins.parameterType.INT],
        array: true,
        default: [100,100],
        no_function: false,
        description: ''
      },
      initial_direction: {
        type: [jsPsych.plugins.parameterType.SELECT],
        choices: ['left','right'],
        default: 'left',
        no_function: false,
        description: ''
      },
      occlude_center: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: true,
        no_function: false,
        description: ''
      },
      timing_cycle: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 1000,
        no_function: false,
        description: ''
      },
      timing_pre_movement: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 500,
        no_function: false,
        description: ''
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // default trial parameters
    trial.timing_cycle = trial.timing_cycle || 1000;
    trial.canvas_size = trial.canvas_size || [400, 400];
    trial.image_size = trial.image_size || [100, 100];
    trial.initial_direction = trial.initial_direction || "left";
    trial.occlude_center = (typeof trial.occlude_center === 'undefined') ? true : trial.occlude_center;
    trial.choices = trial.choices || jsPsych.ALL_KEYS;
    trial.timing_pre_movement = (typeof trial.timing_pre_movement === 'undefined') ? 500 : trial.timing_pre_movement;

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
      if (trial.stimuli.length == which_image) {
        endTrial();
      } else {

        var d = directions[next_direction];
        next_direction === 0 ? next_direction = 1 : next_direction = 0;
        var i = trial.stimuli[which_image];
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

    display_element.innerHTML += "<svg id='jspsych-vsl-animate-occlusion-canvas' width=" + trial.canvas_size[0] + " height=" + trial.canvas_size[1] + "></svg>";

    var paper = Snap("#jspsych-vsl-animate-occlusion-canvas");

    var c = paper.image(trial.stimuli[which_image], trial.canvas_size[0] / 2 - trial.image_size[0] / 2, trial.canvas_size[1] / 2 - trial.image_size[1] / 2, trial.image_size[0], trial.image_size[1]).attr({
      "id": 'jspsych-vsl-animate-occlusion-moving-image'
    });

    display_element.querySelector('#jspsych-vsl-animate-occlusion-moving-image').removeAttribute('preserveAspectRatio');

    if (trial.occlude_center) {
      paper.rect((trial.canvas_size[0] / 2) - (trial.image_size[0] / 2), 0, trial.image_size[0], trial.canvas_size[1]).attr({
        fill: "#000"
      });
    }

    // add key listener
    var after_response = function(info) {
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
      jsPsych.pluginAPI.setTimeout(function() {
        next_step();
      }, trial.timing_pre_movement);
    } else {
      next_step();
    }

    function endTrial() {

      display_element.innerHTML = '';

      jsPsych.pluginAPI.cancelKeyboardResponse(key_listener);

      var trial_data = {
        "stimuli": JSON.stringify(trial.stimuli),
        "responses": JSON.stringify(responses)
      };

      jsPsych.finishTrial(trial_data);
    }
  };

  return plugin;
})();
