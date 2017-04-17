/**
 * jspsych-similarity.js
 * Josh de Leeuw
 *
 * This plugin create a trial where two images are shown sequentially, and the subject rates their similarity using a slider controlled with the mouse.
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins.similarity = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('similarity', 'stimuli', 'image',function(t){ return !t.is_html || t.is_html == 'undefined'});

  plugin.info = {
    name: 'similarity',
    description: '',
    parameters: {
      stimuli: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: undefined,
        array: true,
        no_function: false,
        description: ''
      },
      is_html: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      labels: {
        type: [jsPsych.plugins.parameterType.STRING],
        array: true,
        default: ['Not at all similar', 'Identical'],
        no_function: false,
        description: ''
      },
      intervals: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 100,
        no_function: false,
        description: ''
      },
      show_ticks: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      show_response: {
        type: [jsPsych.plugins.parameterType.SELECT],
        options: ['FIRST_STIMULUS', 'SECOND_STIMULUS','POST_STIMULUS'],
        default: 'SECOND_STIMULUS',
        no_function: false,
        description: ''
      },
      timing_first_stim: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 1000,
        no_function: false,
        description: ''
      },
      timing_image_gap: {
        type: [jsPsych.plugins.parameterType.INT],
        default: 1000,
        no_function: false,
        description: ''
      },
      timing_second_stim: {
        type: [jsPsych.plugins.parameterType.INT],
        default: -1,
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
        default: '',
        no_function: false,
        description: 'Submit Answers'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // default parameters
    trial.labels = (typeof trial.labels === 'undefined') ? ["Not at all similar", "Identical"] : trial.labels;
    trial.intervals = trial.intervals || 100;
    trial.show_ticks = (typeof trial.show_ticks === 'undefined') ? false : trial.show_ticks;

    trial.show_response = trial.show_response || "SECOND_STIMULUS";

    trial.timing_first_stim = trial.timing_first_stim || 1000; // default 1000ms
    trial.timing_second_stim = trial.timing_second_stim || -1; // -1 = inf time; positive numbers = msec to display second image.
    trial.timing_image_gap = trial.timing_image_gap || 1000; // default 1000ms

    trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
    trial.prompt = (typeof trial.prompt === 'undefined') ? '' : trial.prompt;
    
    trial.button_label = typeof trial.button_label === 'undefined' ? 'Submit Answers' : trial.button_label;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // show the images
    if (!trial.is_html) {
      display_element.innerHTML += '<img src="'+trial.stimuli[0]+'" id="jspsych-sim-stim"></img>';
    } else {
      display_element.innerHTML += '<div id="jspsych-sim-stim">'+trial.stimuli[0]+'</div>';
    }

    if (trial.show_response == "FIRST_STIMULUS") {
      show_response_slider(display_element, trial);
    }

    jsPsych.pluginAPI.setTimeout(function() {
      showBlankScreen();
    }, trial.timing_first_stim);


    function showBlankScreen() {

      display_element.querySelector('#jspsych-sim-stim').style.visibility = 'hidden';

      jsPsych.pluginAPI.setTimeout(function() {
        showSecondStim();
      }, trial.timing_image_gap);
    }

    function showSecondStim() {

      if (!trial.is_html) {
        display_element.querySelector('#jspsych-sim-stim').src = trial.stimuli[1];
      } else {
        display_element.querySelector('#jspsych-sim-stim').innerHTML = trial.stimuli[1];
      }

      display_element.querySelector('#jspsych-sim-stim').style.visibility = 'visible';

      if (trial.show_response == "SECOND_STIMULUS") {
        show_response_slider(display_element, trial);
      }

      if (trial.timing_second_stim > 0) {
        jsPsych.pluginAPI.setTimeout(function() {
          display_element.querySelector("#jspsych-sim-stim").style.visibility = 'hidden';
          if (trial.show_response == "POST_STIMULUS") {
            show_response_slider(display_element, trial);
          }
        }, trial.timing_second_stim);
      }
    }


    function show_response_slider(display_element, trial) {

      var startTime = (new Date()).getTime();

      // create slider
      display_element.append($('<div>', {
        "id": 'slider',
        "class": 'sim'
      }));

      $("#slider").slider({
        value: Math.ceil(trial.intervals / 2),
        min: 1,
        max: trial.intervals,
        step: 1,
      });

      // show tick marks
      if (trial.show_ticks) {
        for (var j = 1; j < trial.intervals - 1; j++) {
          $('#slider').append('<div class="slidertickmark"></div>');
        }

        $('#slider .slidertickmark').each(function(index) {
          var left = (index + 1) * (100 / (trial.intervals - 1));
          $(this).css({
            'position': 'absolute',
            'left': left + '%',
            'width': '1px',
            'height': '100%',
            'background-color': '#222222'
          });
        });
      }

      // create labels for slider
      display_element.append($('<ul>', {
        "id": "sliderlabels",
        "class": 'sliderlabels',
        "css": {
          "width": "100%",
          "height": "3em",
          "margin": "10px 0px 0px 0px",
          "padding": "0px",
          "display": "block",
          "position": "relative"
        }
      }));

      for (var j = 0; j < trial.labels.length; j++) {
        $("#sliderlabels").append('<li>' + trial.labels[j] + '</li>');
      }

      // position labels to match slider intervals
      var slider_width = $("#slider").width();
      var num_items = trial.labels.length;
      var item_width = slider_width / num_items;
      var spacing_interval = slider_width / (num_items - 1);

      $("#sliderlabels li").each(function(index) {
        $(this).css({
          'display': 'inline-block',
          'width': item_width + 'px',
          'margin': '0px',
          'padding': '0px',
          'text-align': 'center',
          'position': 'absolute',
          'left': (spacing_interval * index) - (item_width / 2)
        });
      });

      //  create button
      display_element.append($('<button>', {
        'id': 'next',
        'class': 'sim',
        'html': trial.button_label
      }));

      // if prompt is set, show prompt
      if (trial.prompt !== "") {
        display_element.append(trial.prompt);
      }

      display_element.querySelector("#next").addEventListener('click', function() {
        var endTime = (new Date()).getTime();
        var response_time = endTime - startTime;

        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();

        var score = $("#slider").slider("value");
        var trial_data = {
          "sim_score": score,
          "rt": response_time,
          "stimulus": JSON.stringify([trial.stimuli[0], trial.stimuli[1]])
        };

        // goto next trial in block
        display_element.innerHTML = '';
        jsPsych.finishTrial(trial_data);
      });
    }
  };
  return plugin;
})();
