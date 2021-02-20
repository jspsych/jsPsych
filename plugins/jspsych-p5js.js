jsPsych.plugins['p5js-canvas-keyboard-response'] = (function () {
  let plugin = {};

  plugin.info = {
    name: 'p5js-canvas-keyboard-response',
    description: '',
    parameters: {
      setup: {
        type: jsPsych.plugins.parameterType.function,
        array: false,
        pretty_name: 'p5js Setup Function',
        default: null,
        description: 'The p5js setup function.',
      },
      draw: {
        type: jsPsych.plugins.parameterType.function,
        array: false,
        pretty_name: 'Draw Function',
        default: null,
        description: 'The p5js draw function.',
      },
      canvas_size: {
        type: jsPsych.plugins.parameterType.INT,
        array: true,
        pretty_name: 'Size',
        default: [1280, 960],
        description: 'Canvas size.',
      },
      canvas_border: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Border',
        default: '10px solid black',
        description: 'Border style',
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.',
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.',
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.',
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'ResponseEndsTrial',
        default: true,
        description: 'If true, then trial will end when user responds.',
      },
    },
  };

  plugin.trial = function (display_element, trial) {
    // setup canvas
    var new_html = "<div id='p5js_container';'></div>";
    display_element.innerHTML = new_html;

    let p5js_canvas;
    p5js_canvas = p5js.createCanvas(trial.canvas_size[0], trial.canvas_size[1], p5js.WEBGL);
    p5js_canvas.canvas.style.border = trial.canvas_border;
    p5js_canvas.parent(p5js_container);

    if (trial.setup !== null) {
      trial.setup();
    }
    p5js.draw = trial.draw;

    // store response
    let response = {
      rt: null,
      key: null,
    };

    // function to end trial when it is time
    let end_trial = function () {
      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      let trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        key_press: response.key,
      };

      // clear the display
      display_element.innerHTML = '';
      p5js.removeElements();

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    let after_response = function (info) {
      if (response.key == null) {
        response = info;
      }
      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (trial.choices !== jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false,
      });
    }

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function () {
        display_element.querySelector('#p5js_container').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function () {
        p5js.loop();
        end_trial();
      }, trial.trial_duration);
    }
  };

  return plugin;
})();
