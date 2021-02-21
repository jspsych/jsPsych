jsPsych.plugins['text-moving-window-keyboard-response'] = (function () {
  let plugin = {};

  plugin.info = {
    name: 'text-moving-window-keyboard-response',
    description: '',
    parameters: {
      sentence: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: 'Sentence',
        default: {},
        description: 'Sentence to be presented word-by-word.',
      },
      max_width: {
        type: jsPsych.plugins.parameterType.INT,
        array: false,
        pretty_name: 'SentenceWidth',
        default: 1000,
        description: 'Maximum width of the sentence before line-break.',
      },
      mask_type: {
        type: jsPsych.plugins.parameterType.INT,
        array: false,
        pretty_name: 'Mask type',
        default: 1,
        description: 'The type of mask for the sentence.',
      },
      font: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: 'Font',
        default: '40px monospace',
        description: 'Font (should be monospaced font)',
      },
      text_align: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: 'align',
        default: 'left',
        description: 'Text Alignment',
      },
      line_height: {
        type: jsPsych.plugins.parameterType.INT,
        array: false,
        pretty_name: 'LineHeight',
        default: 30,
        description: 'Spacing between lines if sentence split across lines.',
      },
      canvas_colour: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: 'Colour',
        default: 'white',
        description: 'Canvas colour.',
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
        default: '0px solid black',
        description: 'Border style',
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.',
      },
    },
  };

  function textMask(txt) {
    return txt.replace(/[a-z.!?ßäÄüÜöÖ’-]/gi, '_');
  }

  plugin.trial = function (display_element, trial) {
    // setup canvas
    var new_html =
      '<div>' +
      '<canvas id="canvas" width="' +
      trial.canvas_size[0] +
      '" height="' +
      trial.canvas_size[1] +
      '" style="border: ' +
      trial.canvas_border +
      ';"></canvas>' +
      '</div>';

    display_element.innerHTML = new_html;
    let canvas = document.getElementById('canvas');
    let ctx = document.getElementById('canvas').getContext('2d');

    ctx.fillStyle = trial.canvas_colour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2); // make center (0, 0)

    // basic font style
    ctx.font = trial.font;
    ctx.textAlign = trial.text_align;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';

    // text properties
    const numLines = Math.ceil(ctx.measureText(trial.sentence).width / trial.max_width);
    const words = trial.sentence.split(' ');
    const xpos = trial.text_align === 'left' ? -(trial.max_width / 2) : 0;
    let ypos = -(trial.line_height * numLines) / 2 + trial.line_height / 2;

    // keep adding word until it is too long
    // NB most self-paced reading paradigms present sentences on a single line!
    let line = '';
    for (let n = 0; n < words.length; n++) {
      let word;
      if (trial.mask_type === 1) {
        word = n === trial.word_number ? words[n] : textMask(words[n]);
      } else if (trial.mask_type === 2) {
        word = n <= trial.word_number ? words[n] : textMask(words[n]);
      }
      let tmp = line + word + ' ';
      if (ctx.measureText(tmp).width > trial.max_width && n > 0) {
        ctx.fillText(line, xpos, ypos);
        ctx.fillText(textMask(line), xpos, ypos);
        line = word + ' ';
        ypos += trial.line_height;
      } else {
        line = tmp;
      }
    }
    ctx.fillText(line, xpos, ypos);
    ctx.fillText(textMask(line), xpos, ypos);

    // store response
    let response = {
      rt: null,
      key: null,
    };

    // function to end trial when it is time
    const end_trial = function () {
      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      const trial_data = {
        rt: response.rt,
        sentence: trial.sentence,
        word: words[trial.word_number],
        key_press: response.key,
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    const after_response = function (info) {
      if (response.key == null) {
        response = info;
      }
      end_trial();
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
  };

  return plugin;
})();
