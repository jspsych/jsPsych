/**
 * jspsych-survey-text
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['survey-text'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'survey-text',
    description: '',
    parameters: {
      questions: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Questions',
        array: true,
        default: undefined,
        description: 'Prompts for the subject to respond.'
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: '',
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      rows: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Rows',
        array: true,
        default: 1,
        description: 'The number of rows for the response text box.'
      },
      columns: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Columns',
        array: true,
        default: 40,
        description: 'The number of columns for the response text box.'
      },
      values: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Values',
        array: true,
        default: '',
        description: 'The strings will be used to populate the response fields with editable answers.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default: 'Next',
        description: 'The text that appears on the button to finish the trial.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {


    if (typeof trial.rows == 'undefined') {
      trial.rows = [];
      for (var i = 0; i < trial.questions.length; i++) {
        trial.rows.push(1);
      }
    }
    if (typeof trial.columns == 'undefined') {
      trial.columns = [];
      for (var i = 0; i < trial.questions.length; i++) {
        trial.columns.push(40);
      }
    }
    if (typeof trial.values == 'undefined') {
      trial.values = [];
      for (var i = 0; i < trial.questions.length; i++) {
        trial.values.push("");
      }
    }

    // show preamble text
    var html = '<div id="jspsych-survey-text-preamble" class="jspsych-survey-text-preamble">'+trial.preamble+'</div>';

    // add questions
    for (var i = 0; i < trial.questions.length; i++) {
      html += '<div id="jspsych-survey-text-"'+i+'" class="jspsych-survey-text-question" style="margin: 2em 0em;">';
      html += '<p class="jspsych-survey-text">' + trial.questions[i] + '</p>';
      if(trial.rows[i] == 1){
        html += '<input type="text" name="#jspsych-survey-text-response-' + i + '" size="'+trial.columns[i]+'">'+trial.values[i]+'</input>';
      } else {
        html += '<textarea name="#jspsych-survey-text-response-' + i + '" cols="' + trial.columns[i] + '" rows="' + trial.rows[i] + '">'+trial.values[i]+'</textarea>';
      }
      html += '</div>';
    }

    // add submit button
    html += '<button id="jspsych-survey-text-next" class="jspsych-btn jspsych-survey-text">'+trial.button_label+'</button>';

    display_element.innerHTML = html;

    display_element.querySelector('#jspsych-survey-text-next').addEventListener('click', function() {
      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // create object to hold responses
      var question_data = {};
      var matches = display_element.querySelectorAll('div.jspsych-survey-text-question');
      for(var index=0; index<matches.length; index++){
        var id = "Q" + index;
        var val = matches[index].querySelector('textarea, input').value;
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
