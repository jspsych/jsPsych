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
        description: "The type of mask for the sentence (1 vs. 2 vs. 3).",
      },
      mask_character: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: "Character",
        default: "_",
        description: "The character to use for the mask.",
      },
      mask3_character_length: {
        type: jsPsych.plugins.parameterType.INT,
        array: false,
        pretty_name: "Number of mask characters",
        default: 5,
        description:
          'The number of mask characters for initial "word" for mask type 3.',
      },
      mask_on_word: {
        type: jsPsych.plugins.parameterType.BOOL,
        array: false,
        pretty_name: "Mask word",
        default: true,
        description: "Show mask together with presented word.",
      },
      mask_gap_character: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: "Mask Gap Character.",
        default: " ",
        description: "Character used to mask the individual word gaps.",
      },
      mask_y_offset: {
        type: jsPsych.plugins.parameterType.INT,
        array: false,
        pretty_name: "MaskOffset",
        default: 0,
        description: "Y offset of the mark relative to text baseline.",
      },
      font: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: "Font",
        default: "80px monospaced",
        description: "Font (should be monospaced font)",
      },
      line_height: {
        type: jsPsych.plugins.parameterType.INT,
        array: false,
        pretty_name: "Line Height",
        default: 80,
        description: "Line height if multi-line text",
      },
      font_colour: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: "Font",
        default: "black",
        description: "Font colour",
      },
      mask_colour: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: "Font",
        default: "black",
        description: "Mask colour",
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
        array: true,
        pretty_name: "position",
        default: [0, 0],
        description: "Text Position",
      },
      x_align: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: "align",
        default: "left",
        description: "Text Alignment",
      },
      y_align: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: "Y align multi-line",
        default: "top",
        description: "Y align multi-line text in the centre",
      },
    },
  };

  function text_mask(txt, mask_character) {
    return txt.replace(/[^\s]/g, mask_character);
  }

  // deal with mask type 1 and 2
  let mask_operator = {
    1: (a, b) => a !== b,
    2: (a, b) => a > b,
  };

  function display_word(mask_type) {
    "use strict";
    return (words, word_number) =>
      words
        .map((word, idx) =>
          mask_operator[mask_type](idx, word_number)
            ? text_mask(word, " ")
            : word
        )
        .join(" ");
  }

  function display_mask(
    mask_type,
    mask_on_word,
    mask_character,
    mask_gap_character
  ) {
    "use strict";
    return (words, word_number) =>
      words
        .map((word, idx) =>
          mask_operator[mask_type](idx, word_number)
            ? text_mask(word, mask_character)
            : text_mask(word, mask_on_word ? mask_character : " ")
        )
        .join(mask_gap_character);
  }

  plugin.trial = function (display_element, trial) {
    "use strict";
    // setup canvas
    display_element.innerHTML =
      "<div>" +
      '<canvas id="canvas" width="' +
      trial.canvas_size[0] +
      '" height="' +
      trial.canvas_size[1] +
      '" style="border: ' +
      trial.canvas_border +
      ';"></canvas>' +
      "</div>";

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

    // text properties
    let words = [];
    let line_length = [];
    let sentence_length = 0;
    let word_number = -1;
    let word_number_line = -1;
    let line_number = 0;
    let sentence = trial.sentence.replace(/(\r\n|\n|\r)/gm, "");
    let words_concat = sentence.split(" ");

    // if mask type = 3, repeat mask character x times
    if (trial.mask_type === 3)
      trial.mask_character = trial.mask_character.repeat(
        trial.mask3_character_length
      );

    // deal with potential multi-line sentences with user defined splits
    if (trial.mask_type !== 3) {
      trial.sentence_split = trial.sentence.split("\n").map((s) => s.trim());
      for (let i = 0; i < trial.sentence_split.length; i++) {
        words[i] = trial.sentence_split[i].split(" ");
        sentence_length += words[i].length;
        line_length.push(words[i].length);
      }
      // center multi-line text on original y position
      if (words.length > 1 && trial.y_align === "center") {
        trial.xy_position[1] -= words.length * 0.5 * trial.line_height;
      }
    } else {
      words = trial.sentence.split(" ");
      sentence_length = words.length;
    }

    const word = display_word(trial.mask_type);
    const mask = display_mask(
      trial.mask_type,
      trial.mask_on_word,
      trial.mask_character,
      trial.mask_gap_character
    );

    function draw() {
      // canvas
      ctx.fillStyle = trial.canvas_colour;
      ctx.fillRect(
        canvas_rect[0],
        canvas_rect[1],
        canvas_rect[2],
        canvas_rect[3]
      );

      // text + mask
      if (trial.mask_type !== 3) {
        // words
        ctx.fillStyle = trial.font_colour;
        ctx.fillText(
          word(words[line_number], word_number_line),
          trial.xy_position[0],
          trial.xy_position[1] + line_number * trial.line_height
        );
        // mask
        ctx.fillStyle = trial.mask_colour;
        for (let i = 0; i < words.length; i++) {
          let mw = i === line_number ? word_number_line : -1;
          ctx.fillText(
            mask(words[i], mw),
            trial.xy_position[0],
            trial.xy_position[1] + i * trial.line_height + trial.mask_y_offset
          );
        }
      } else {
        // mask type 3 always in center
        if (word_number === -1) {
          ctx.fillStyle = trial.mask_colour;
          ctx.fillText(
            trial.mask_character,
            trial.xy_position[0],
            trial.xy_position[1] + trial.mask_y_offset
          );
        } else {
          ctx.fillStyle = trial.font_colour;
          ctx.fillText(
            words[word_number],
            trial.xy_position[0],
            trial.xy_position[1]
          );
        }
      }

      // set line/word numbers
      if (word_number_line + 1 < line_length[line_number]) {
        word_number_line++;
      } else if (line_number < words.length - 1) {
        line_number++;
        word_number_line = 0;
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
        word: words_concat[word_number - 1],
        word_number: word_number,
        sentence: sentence,
      };

      // clear the display and move to next trial
      display_element.innerHTML = "";
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    const after_response = function (info) {
      response.rt = info.rt;
      response.word = words_concat[word_number];
      response.word_number = word_number + 1;
      response.sentence = sentence;

      // store data
      if (word_number < sentence_length - 1) {
        jsPsych.data.write(response);
      }

      word_number++;
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      keyboardListener = key();

      // keep drawing until words in sentence complete
      if (word_number < sentence_length) {
        draw();
      } else {
        end_trial();
      }
    };

    // start the response listener
    let keyboardListener = key();
    function key() {
      return jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
    }
  };

  return plugin;
})();
