/**
 * jspsych-slider-response
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['slider-response'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('slider-response', 'stimulus', 'image', function(t){ return !t.is_html || t.is_html == 'undefined'});

  plugin.info = {
    name: 'slider-response',
    description: '',
    parameters: {

    }
  }

  plugin.trial = function(display_element, trial) {

    trial.min = trial.min || 0;
    trial.max = trial.max || 100;
    trial.step = trial.step || 1;
    trial.is_html = typeof trial.is_html === 'undefined' ? false : trial.is_html;
    trial.button_label = typeof trial.button_label === 'undefined' ? 'Next' : trial.button_label;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    var html = '<div id="jspsych-slider-response" class="jspsych-slider-response-question" style="margin: 100px 0px;">';
    html += '<div class="jspsych-slider-response-question-text">' + trial.stimulus + '</div>';
    html += '<div class="jspsych-slider-response-container" style="position:relative;">';
    html += '<input type="range" min="'+trial.min+'" max="'+trial.max+'" step="'+trial.step+'" style="width: 100%;" id="jspsych-slider-response-response"></input>';
    html += '<div>'
    for(var j=0; j < trial.labels.length; j++){
      var width = 100/(trial.labels.length-1);
      var left_offset = (j * (100 /(trial.labels.length - 1))) - (width/2);
      html += '<div style="display: inline-block; position: absolute; left:'+left_offset+'%; text-align: center; width: '+width+'%;">';
      html += '<span style="text-align: center; font-size: 80%;">'+trial.labels[j]+'</span>';
      html += '</div>'
    }
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // add submit button
    html += '<button id="jspsych-slider-response-next" class="jspsych-btn">'+trial.button_label+'</button>';

    display_element.innerHTML = html;

    display_element.querySelector('#jspsych-slider-response-next').addEventListener('click', function() {
      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // save data
      var trialdata = {
        "rt": response_time,
        "response": display_element.querySelector('#jspsych-slider-response-response').value
      };

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trialdata);
    });

    var startTime = (new Date()).getTime();
  };

  return plugin;
})();
