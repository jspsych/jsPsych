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
          options: params.options[i],
        });
      }
      return trials;
    };

    plugin.trial = function(display_element, trial) {

      var plugin_id_name = "jspsych-survey-multi-choice",
          plugin_id_selector = '#' + plugin_id_name,
          _join = function(/*args*/) {
            var arr = Array.prototype.slice.call(arguments, _join.length);
            return arr.join(separator='-');
          }

      // if any trial variables are functions
      // this evaluates the function and replaces
      // it with the output of the function
      trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

      // show preamble text
      var preamble_id_name = _join(plugin_id_name, 'preamble');
      display_element.append($('<div>', {
        "id": preamble_id_name,
        "class":preamble_id_name
      }));
      $('#' + preamble_id_name).html(trial.preamble);

      // add multiple-choice questions
      for (var i = 0; i < trial.questions.length; i++) {
        // create div
        display_element.append($('<div>', {
          "id": _join(plugin_id_name, i),
          "class": _join(plugin_id_name, 'question')
        }));

        // create question container
        var question_selector = _join(plugin_id_selector, i);

        $(question_selector).append($('<div>', {
          "id": _join(plugin_id_name, 'radio', i),
          "class": plugin_id_name + '-radio ' + plugin_id_name
        }));

        // add question text
        $(question_selector).append(
          '<p class="' + plugin_id_name + '-text survey-multi-choice">' + trial.questions[i] + '</p>'
        );

        // create option radio buttons
        for (var j = 0; j < trial.options[i].length; j++) {
          var option_id_name = _join(plugin_id_name, "option", i, j),
              option_id_selector = '#' + option_id_name;

          // add radio button container
          $(question_selector).append($('<div>', {
            "id": option_id_name,
            "class": _join(plugin_id_name, 'option')
          }));
          // console.log($(option_id_selector));

          // add label and question text
          var option_label = '<label class="' + plugin_id_name + '-text">' + trial.options[i][j] + '</label>';
          $(option_id_selector).append(option_label);

          // create radio button
          var input_id_name = _join(plugin_id_name, 'response', i, j);
          $(option_id_selector + " label").prepend('<input type="radio" name="#' + input_id_name + '" value="' + j + '">');
        }
      }

      // add submit button
      display_element.append($('<button>', {
        'id': plugin_id_name + '-next',
        'class': plugin_id_name
      }));
      $(plugin_id_selector + "-next").html('Submit options');
      $(plugin_id_selector + "-next").click(function() {
        // measure response time
        var endTime = (new Date()).getTime();
        var response_time = endTime - startTime;

        // create object to hold responses
        var question_data = {};
        $("div." + plugin_id_name + "-radio").each(function(index) {
          var id = "Q" + index;
          var val = $(this).find("label input:radio").val();
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
