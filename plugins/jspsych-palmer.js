/**
 * jspsych-palmer
 * Josh de Leeuw (October 2013)
 *
 * a jspsych plugin for presenting and querying about stimuli modeled after
 *
 * Palmer, S. (1977). Hierarchical Structure in Perceptual Representation. Cognitive Psychology, 9, 441.
 *
 * and
 *
 * Goldstone, R. L., Rogosky, B. J., Pevtzow, R., & Blair, M. (2005). Perceptual and semantic reorganization during category learning.
 * In H. Cohen & C. Lefebvre (Eds.) Handbook of Categorization in Cognitive Science. (pp. 651-678). Amsterdam: Elsevier.
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins.palmer = (function() {

  var plugin = {};

  plugin.info = {
    name: 'palmer',
    description: '',
    parameters: {
      configuration: {
        type: [jsPsych.plugins.parameterType.INT],
        default: undefined,
        array: true,
        no_function: false,
        description: ''
      },
      show_feedback: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      grid_spacing: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 75,
        no_function: false,
        description: ''
      },
      circle_radius: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 20,
        no_function: false,
        description: ''
      },
      square_size: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 3,
        no_function: false,
        description: ''
      },
      timing_feedback: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 1000,
        no_function: false,
        description: ''
      },
      prompt: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      },
      button_label: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: 'Done',
        no_function: false,
        description: ''
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // default parameter settings
    trial.show_feedback = (typeof trial.show_feedback === 'undefined') ? false : trial.show_feedback;
    trial.grid_spacing = trial.grid_spacing || 75;
    trial.square_size = trial.square_size || 3;
    trial.circle_radius = trial.circle_radius || 20;
    trial.timing_item = trial.timing_item || 1000;
    trial.timing_feedback = trial.timing_feedback || 1000;
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;
    trial.button_label = typeof trial.button_label === 'undefined' ? 'Submit Answers' : trial.button_label;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // variables to keep track of user interaction
    var start_circle = -1;
    var end_circle = -1;
    var line_started = false;

    var size = trial.grid_spacing * (trial.square_size + 1);

    display_element.innerHTML += "<svg id='jspsych-palmer-snapCanvas' width='" + size + "' height='" + size + "'></svg>";

    var paper = Snap("#jspsych-palmer-snapCanvas");

    // create the circles at the vertices.
    var circles = [];
    var node_idx = 0;
    for (var i = 1; i <= trial.square_size; i++) {
      for (var j = 1; j <= trial.square_size; j++) {
        var circle = paper.circle(trial.grid_spacing * j, trial.grid_spacing * i, trial.circle_radius);
        circle.attr("fill", "#000").attr("stroke-width", "0").attr("stroke", "#000").data("node", node_idx);

        circle.hover(

          function() {
            this.attr("stroke-width", "2");
            //this.attr("stroke", "#000");
          },

          function() {
            this.attr("stroke-width", "0");
            //this.attr("stroke", "#fff")
          }).click(

          function() {
            if (!line_started) {
              line_started = true;
              start_circle = this.data("node");
              this.attr("fill", "#777").attr("stroke", "#777");
            } else {
              end_circle = this.data("node");
              draw_connection(start_circle, end_circle);
            }
          });

        node_idx++;
        circles.push(circle);
      }
    }

    function draw_connection(start_circle, end_circle) {
      var the_line = getLineIndex(start_circle, end_circle);
      if (the_line > -1) {
        toggle_line(the_line);
      }
      // reset highlighting on circles
      for (var i = 0; i < circles.length; i++) {
        circles[i].attr("fill", "#000").attr("stroke", "#000");
      }
      // cleanup the variables
      line_started = false;
      start_circle = -1;
      end_circle = -1;
    }

    // create all possible lines that connect circles
    var horizontal_lines = [];
    var vertical_lines = [];
    var backslash_lines = [];
    var forwardslash_lines = [];

    for (var i = 0; i < trial.square_size; i++) {
      for (var j = 0; j < trial.square_size; j++) {
        var current_item = (i * trial.square_size) + j;
        // add horizontal connections
        if (j < (trial.square_size - 1)) {
          horizontal_lines.push([current_item, current_item + 1]);
        }
        // add vertical connections
        if (i < (trial.square_size - 1)) {
          vertical_lines.push([current_item, current_item + trial.square_size]);
        }
        // add diagonal backslash connections
        if (i < (trial.square_size - 1) && j < (trial.square_size - 1)) {
          backslash_lines.push([current_item, current_item + trial.square_size + 1]);
        }
        // add diagonal forwardslash connections
        if (i < (trial.square_size - 1) && j > 0) {
          forwardslash_lines.push([current_item, current_item + trial.square_size - 1]);
        }
      }
    }

    var lines = horizontal_lines.concat(vertical_lines).concat(backslash_lines).concat(forwardslash_lines);

    // actually draw the lines
    var lineIsVisible = [];
    var lineElements = [];

    for (var i = 0; i < lines.length; i++) {
      var line = paper.path("M" + circles[lines[i][0]].attr("cx") + " " + circles[lines[i][0]].attr("cy") + "L" + circles[lines[i][1]].attr("cx") + " " + circles[lines[i][1]].attr("cy")).attr("stroke-width", "8").attr("stroke", "#000");
      line.attr({
        visibility: 'hidden'
      });
      lineElements.push(line);
      lineIsVisible.push(0);
    }

    // define some helper functions to toggle lines on and off

    // this function gets the index of a line based on the two circles it connects

    function getLineIndex(start_circle, end_circle) {
      var the_line = -1;
      for (var i = 0; i < lines.length; i++) {
        if ((start_circle == lines[i][0] && end_circle == lines[i][1]) || (start_circle == lines[i][1] && end_circle == lines[i][0])) {
          the_line = i;
          break;
        }
      }
      return the_line;
    }

    // this function turns a line on/off based on the index (the_line)

    function toggle_line(the_line) {
      if (the_line > -1) {
        if (lineIsVisible[the_line] === 0) {
          lineElements[the_line].attr({
            visibility: 'visible'
          });
          lineElements[the_line].prependTo(paper);
          lineIsVisible[the_line] = 1;
        } else {
          lineElements[the_line].attr({
            visibility: 'hidden'
          });
          lineElements[the_line].prependTo(paper);
          lineIsVisible[the_line] = 0;
        }
      }
    }

    // this function takes an array of length = num lines, and displays the line whereever there
    // is a 1 in the array.

    function showConfiguration(configuration) {
      for (var i = 0; i < configuration.length; i++) {
        if (configuration[i] != lineIsVisible[i]) {
          toggle_line(i);
        }
      }
    }

    // highlight a line

    function highlightLine(line) {
      lineElements[line].attr("stroke", "#f00");
    }

    // start recording the time
    var startTime = (new Date()).getTime();

    display_element.innerHTML += '<p><button id="jspsych-palmer-submitButton" class="jspsych-btn" type="button">'+trial.button_label+'</button></p>';
    display_element.querySelector('#jspsych-palmer-submitButton').addEventListener('click', function() {
      save_data();
    });

    if (trial.prompt !== "") {
      display_element.innerHTML += '<div id="jspsych-palmer-prompt">'+trial.prompt+'</div>';
    }

    function arrayDifferences(arr1, arr2) {
      var n_diff = 0;
      for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] != arr2[i]) {
          n_diff++;
        }
      }
      return n_diff;
    }

    // save data
    var trial_data = {};

    function save_data() {

      // measure RT
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // check if configuration is correct
      // this is meaningless for trials where the user can't edit
      var n_diff = arrayDifferences(trial.configuration, lineIsVisible);
      var correct = (n_diff === 0);

      trial_data = {
        "configuration": JSON.stringify(lineIsVisible),
        "target_configuration": JSON.stringify(trial.configuration),
        "rt": response_time,
        "correct": correct,
        "num_wrong": n_diff,
      };

      if (trial.show_feedback) {
        // hide the button
        display_element.querySelector('#jspsych-palmer-submitButton').style.display = 'none';
        display_element.querySelector('#jspsych-palmer-prompt').style.display = 'none';

        showConfiguration(trial.configuration);
        var feedback = "";
        if (correct) {
          feedback = "Correct!";
        } else {
          if (n_diff > 1) {
            feedback = "You missed " + n_diff + " lines. The correct symbol is shown above.";
          } else {
            feedback = "You missed 1 line. The correct symbol is shown above.";
          }
        }
        display_element.innerHTML += "<p id='jspsych-palmer-feedback'>" + feedback + "</p>";

        jsPsych.pluginAPI.setTimeout(function() {
          next_trial();
        }, trial.timing_feedback);

      } else {
        next_trial();
      }
    }

    function next_trial() {

      display_element.innerHMTL = '';

      // next trial
      jsPsych.finishTrial(trial_data);

    }


  };

  // method for drawing palmer stimuli.
  // returns the string description of svg element containing the stimulus

  plugin.generate_stimulus = function(square_size, grid_spacing, circle_radius, configuration) {

    var size = grid_spacing * (square_size + 1);

    // create a div to hold the generated svg object
    var stim_div = document.querySelector('html').innerHTML += '<div id="jspsych-palmer-container" style="display:none;"><svg id="jspsych-palmer-temp-stim" width="' + size + '" height="' + size + '"></svg></div>';

    // create the snap object
    var paper = Snap("#jspsych-palmer-temp-stim");

    // create the circles at the vertices.
    var circles = [];
    var node_idx = 0;
    for (var i = 1; i <= square_size; i++) {
      for (var j = 1; j <= square_size; j++) {
        var circle = paper.circle(grid_spacing * j, grid_spacing * i, circle_radius);
        circle.attr("fill", "#000").attr("stroke-width", "0").attr("stroke", "#000").data("node", node_idx);
        node_idx++;
        circles.push(circle);
      }
    }

    // create all possible lines that connect circles
    var horizontal_lines = [];
    var vertical_lines = [];
    var backslash_lines = [];
    var forwardslash_lines = [];

    for (var i = 0; i < square_size; i++) {
      for (var j = 0; j < square_size; j++) {
        var current_item = (i * square_size) + j;
        // add horizontal connections
        if (j < (square_size - 1)) {
          horizontal_lines.push([current_item, current_item + 1]);
        }
        // add vertical connections
        if (i < (square_size - 1)) {
          vertical_lines.push([current_item, current_item + square_size]);
        }
        // add diagonal backslash connections
        if (i < (square_size - 1) && j < (square_size - 1)) {
          backslash_lines.push([current_item, current_item + square_size + 1]);
        }
        // add diagonal forwardslash connections
        if (i < (square_size - 1) && j > 0) {
          forwardslash_lines.push([current_item, current_item + square_size - 1]);
        }
      }
    }

    var lines = horizontal_lines.concat(vertical_lines).concat(backslash_lines).concat(forwardslash_lines);

    // actually draw the lines
    var lineIsVisible = [];
    var lineElements = [];

    for (var i = 0; i < lines.length; i++) {
      var line = paper.path("M" + circles[lines[i][0]].attr("cx") + " " + circles[lines[i][0]].attr("cy") + "L" + circles[lines[i][1]].attr("cx") + " " + circles[lines[i][1]].attr("cy")).attr("stroke-width", "8").attr("stroke", "#000");
      line.attr({
        visibility: 'hidden'
      });
      lineElements.push(line);
      lineIsVisible.push(0);
    }

    // define some helper functions to toggle lines on and off

    // this function turns a line on/off based on the index (the_line)

    function toggle_line(the_line) {
      if (the_line > -1) {
        if (lineIsVisible[the_line] === 0) {
          lineElements[the_line].attr({
            visibility: 'visible'
          });
          lineElements[the_line].prependTo(paper);
          lineIsVisible[the_line] = 1;
        } else {
          lineElements[the_line].attr({
            visibility: 'hidden'
          });
          lineElements[the_line].prependTo(paper);
          lineIsVisible[the_line] = 0;
        }
      }
    }

    // displays the line wherever there
    // is a 1 in the array.
    // showConfiguration(configuration)
    for (var i = 0; i < configuration.length; i++) {
      if (configuration[i] == 1) {
        toggle_line(i);
      }
    }


    var svg = document.getElementById("jspsych-palmer-container").innerHTML;

    document.getElementById('jspsych-palmer-container').outerHTML = '';

    return svg;
  };

  return plugin;
})();
