/**
 * jspsych-survey-slider
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['survey-slider'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'survey-slider',
    description: '',
    parameters: {

    }
  }

  plugin.trial = function(display_element, trial) {

    trial.preamble = typeof trial.preamble == 'undefined' ? "" : trial.preamble;
    trial.button_label = typeof trial.button_label === 'undefined' ? 'Next' : trial.button_label;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // show preamble text
    var html = '<div id="jspsych-survey-slider-preamble" class="jspsych-survey-slider-preamble">'+trial.preamble+'</div>';

    // add questions
    for (var i = 0; i < trial.questions.length; i++) {
      html += '<div id="jspsych-survey-slider-"'+i+'" class="jspsych-survey-slider-question" style="margin: 2em 0em;">';
      html += '<div class="jspsych-survey-slider-question-text">' + trial.questions[i] + '</div>';
      html += '<input type="range" name="#jspsych-survey-slider-response-' + i + '"></input>';
      html += '</div>';
    }

    // add submit button
    html += '<button id="jspsych-survey-slider-next" class="jspsych-btn">'+trial.button_label+'</button>';

    display_element.innerHTML = html;

    display_element.querySelector('#jspsych-survey-slider-next').addEventListener('click', function() {
      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // create object to hold responses
      var question_data = {};
      var matches = display_element.querySelectorAll('div.jspsych-survey-slider-question');
      for(var index=0; index<matches.length; index++){
        var id = "Q" + index;
        var val = matches[index].querySelector('input').value;
        var obje = {};
        obje[id] = val;
        Object.assign(question_data, obje);
      }
      // save data
      var trialdata = {
        "rt": response_time,
        "responses": JSON.stringify(question_data)
      };

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trialdata);
    });

    var startTime = (new Date()).getTime();
  };

  return plugin;
})();
