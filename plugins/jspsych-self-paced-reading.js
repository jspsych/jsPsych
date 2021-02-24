// Initial self-paced-reading plugin
jsPsych.plugins["self-paced-reading"] = (function () {
  let plugin = {};

  plugin.info = {
    name: "self-paced-reading",
    description: "",
    parameters: {
      sentence: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: "Sentence",
        default: {},
        description: "Sentence to be presented word-by-word.",
      },
      mask_type: {
        type: jsPsych.plugins.parameterType.INT,
        array: false,
        pretty_name: "Mask type",
        default: 1,
        description: "The type of mask for the sentence.",
      },
      font: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: "Font",
        default: "40px monospace",
        description: "Font (should be monospaced font)",
      },
      font_colour: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: "Font",
        default: "black",
        description: "Font colour",
      },
      canvas_colour: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: "Colour",
        default: "white",
        description: "Canvas colour.",
      },
      canvas_size: {
        type: jsPsych.plugins.parameterType.INT,
        array: true,
        pretty_name: "Size",
        default: [1280, 960],
        description: "Canvas size.",
      },
      canvas_border: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Border",
        default: "0px solid black",
        description: "Border style",
      },
      translate_origin: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: "Translate",
        default: false,
        description: "Translate origin to center",
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: "Choices",
        default: jsPsych.ALL_KEYS,
        description:
          "The keys the subject is allowed to press to respond to the stimulus.",
      },
      xy_position: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: "align",
        default: "left",
        description: "Text Alignment",
      },
      x_align: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: "align",
        default: "left",
        description: "Text Alignment",
      },
    },
  };

  function textMask(txt) {
    return txt.replace(/[a-z.!?ßäÄüÜöÖ’-]/gi, "_");
  }

  plugin.trial = function (display_element, trial) {
    // setup canvas
    var new_html =
      "<div>" +
      '<canvas id="canvas" width="' +
      trial.canvas_size[0] +
      '" height="' +
      trial.canvas_size[1] +
      '" style="border: ' +
      trial.canvas_border +
      ';"></canvas>' +
      "</div>";

    display_element.innerHTML = new_html;
    let canvas = document.getElementById("canvas");
    let ctx = document.getElementById("canvas").getContext("2d");

    ctx.fillStyle = trial.canvas_colour;
    let canvas_rect;
    if (trial.translate_origin) {
      ctx.translate(canvas.width / 2, canvas.height / 2); // make center (0, 0)
      canvas_rect = [
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height,
      ];
    } else {
      canvas_rect = [0, 0, canvas.width, canvas.height];
    }
    ctx.fillRect(
      canvas_rect[0],
      canvas_rect[1],
      canvas_rect[2],
      canvas_rect[3]
    );

    // basic font style
    ctx.font = trial.font;
    ctx.textAlign = trial.x_align;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";

    // text properties
    const words = trial.sentence.split(" ");
    let word_number = trial.mask_type === 3 ? 0 : -1;

    function draw() {
      ctx.fillStyle = trial.canvas_colour;
      ctx.fillRect(
        canvas_rect[0],
        canvas_rect[1],
        canvas_rect[2],
        canvas_rect[3]
      );
      ctx.fillStyle = trial.font_colour;

      if (trial.mask_type !== 3) {
        if (trial.mask_type === 1) {
          w = words.map(function (word, idx) {
            return idx !== word_number ? textMask(word) : word;
          });
        } else if (trial.mask_type === 2) {
          w = words.map(function (word, idx) {
            return idx > word_number ? textMask(word) : word;
          });
        }
        ctx.fillText(
          textMask(w.join(" ")),
          trial.xy_position[0],
          trial.xy_position[1]
        );
        ctx.fillText(w.join(" "), trial.xy_position[0], trial.xy_position[1]);
      } else {
        ctx.fillText(
          words[word_number],
          trial.xy_position[0],
          trial.xy_position[1]
        );
      }
    }

    // store response
    let response = {
      rt: null,
      word: null,
      word_number: null,
      sentence: null,
    };

    draw(); // draw initial sentence outline

    // function to end trial when it is time
    const end_trial = function () {
      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);

      // gather the data to store for the trial
      const trial_data = {
        rt: response.rt,
        word: words[word_number - 1],
        word_number: word_number,
        sentence: trial.sentence,
      };

      // clear the display and move to next trial
      display_element.innerHTML = "";
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    const after_response = function (info) {
      response.rt = info.rt;
      response.word = words[word_number];
      response.word_number = word_number + 1;
      response.sentence = trial.sentence;

      // store data
      if (word_number < words.length - 1) {
        jsPsych.data.write(response);
      }

      // next word
      word_number++;

      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      keyboardListener = key();

      if (word_number < words.length) {
        draw();
      } else {
        end_trial();
      }
    };

    // start the response listener
    keyboardListener = key();
    function key() {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
      return keyboardListener;
    }
  };

  return plugin;
})();
