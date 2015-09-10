/**
 * jspsych-survey-multi-choice
 * a jspsych plugin for multiple choice survey questions
 *
 * Shane Martin
 *
 * documentation: docs.jspsych.org
 *
 */

(function($) {
  jsPsych['survey-multi-choice'] = (function() {

    var plugin = {};

    plugin.create = function(params) {

      //params = jsPsych.pluginAPI.enforceArray(params, ['data']);

      var trials = [];
      for (var i = 0; i < params.questions.length; i++) {
        trials.push({
          preamble: (typeof params.preamble === 'undefined') ? "" : params.preamble[i],
          questions: params.questions[i],
          labels: params.labels[i],
          intervals: params.intervals[i],
          show_ticks: (typeof params.show_ticks === 'undefined') ? true : params.show_ticks
        });
      }
      return trials;
    };

    plugin.trial = function(display_element, trial) {

      // if any trial variables are functions
      // this evaluates the function and replaces
      // it with the output of the function
      trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

      // show preamble text
      display_element.append($('<div>', {
        "id": 'jspsych-survey-multi-choice-preamble',
        "class": 'jspsych-survey-multi-choice-preamble'
      }));

      $('#jspsych-survey-multi-choice-preamble').html(trial.preamble);

      // add multiple-choice scale questions
      for (var i = 0; i < trial.questions.length; i++) {
        // create div
        display_element.append($('<div>', {
          "id": 'jspsych-survey-multi-choice-' + i,
          "class": 'jspsych-survey-multi-choice-question'
        }));

        // add question text
        $("#jspsych-survey-multi-choice-" + i).append('<p class="jspsych-survey-multi-choice-text survey-multiple-choice">' + trial.questions[i] + '</p>');

        // create slider
        $("#jspsych-survey-multi-choice-" + i).append($('<div>', {
          "id": 'jspsych-survey-multi-choice-slider-' + i,
          "class": 'jspsych-survey-multi-choice-slider jspsych-survey-multi-choice'
        }));
        $("#jspsych-survey-multi-choice-slider-" + i).slider({
          value: Math.ceil(trial.intervals[i] / 2),
          min: 1,
          max: trial.intervals[i],
          step: 1
        });

        // show tick marks
        if (trial.show_ticks) {
          $("#jspsych-survey-multi-choice-" + i).append($('<div>', {
            "id": 'jspsych-survey-multi-choice-sliderticks' + i,
            "class": 'jspsych-survey-multi-choice-sliderticks jspsych-survey-multi-choice',
            "css": {
              "position": 'relative'
            }
          }));
          for (var j = 1; j < trial.intervals[i] - 1; j++) {
            $('#jspsych-survey-multi-choice-slider-' + i).append('<div class="jspsych-survey-multi-choice-slidertickmark"></div>');
          }

          $('#jspsych-survey-multi-choice-slider-' + i + ' .jspsych-survey-multi-choice-slidertickmark').each(function(index) {
            var left = (index + 1) * (100 / (trial.intervals[i] - 1));
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
        $("#jspsych-survey-multi-choice-" + i).append($('<ul>', {
          "id": "jspsych-survey-multi-choice-sliderlabels-" + i,
          "class": 'jspsych-survey-multi-choice-sliderlabels survey-multiple-choice',
          "css": {
            "width": "100%",
            "margin": "10px 0px 0px 0px",
            "padding": "0px",
            "display": "inline-block",
            "position": "relative",
            "height": "2em"
          }
        }));

        for (var j = 0; j < trial.labels[i].length; j++) {
          $("#jspsych-survey-multi-choice-sliderlabels-" + i).append('<li>' + trial.labels[i][j] + '</li>');
        }

        // position labels to match slider intervals
        var slider_width = $("#jspsych-survey-multi-choice-slider-" + i).width();
        var num_items = trial.labels[i].length;
        var item_width = slider_width / num_items;
        var spacing_interval = slider_width / (num_items - 1);

        $("#jspsych-survey-multi-choice-sliderlabels-" + i + " li").each(function(index) {
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
      }

      // add submit button
      display_element.append($('<button>', {
        'id': 'jspsych-survey-multi-choice-next',
        'class': 'jspsych-survey-multi-choice'
      }));
      $("#jspsych-survey-multi-choice-next").html('Submit Answers');
      $("#jspsych-survey-multi-choice-next").click(function() {
        // measure response time
        var endTime = (new Date()).getTime();
        var response_time = endTime - startTime;

        // create object to hold responses
        var question_data = {};
        $("div.jspsych-survey-multi-choice-slider").each(function(index) {
          var id = "Q" + index;
          var val = $(this).slider("value");
          var obje = {};
          obje[id] = val;
          $.extend(question_data, obje);
        });

        // save data
        jsPsych.data.write({
          "rt": response_time,
          "responses": JSON.stringify(question_data)
        });

        display_element.html('');

        // next trial
        jsPsych.finishTrial();
      });

      var startTime = (new Date()).getTime();
    };

    return plugin;
  })();
})(jQuery);
