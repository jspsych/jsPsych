/**
 * jspsych-image-slider-response
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['image-slider-response'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('image-slider-response', 'stimulus', 'image');

  plugin.info = {
    name: 'image-slider-response',
    description: '',
    parameters: {
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        default: -1,
        no_function: false,
        description: ''
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        default: -1,
        no_function: false,
        description: ''
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: true,
        no_function: false,
        description: ''
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    trial.min = trial.min || 0;
    trial.max = trial.max || 100;
    trial.step = trial.step || 1;
    trial.button_label = typeof trial.button_label === 'undefined' ? 'Next' : trial.button_label;
    trial.response_ends_trial = (typeof trial.response_ends_trial == 'undefined') ? true : trial.response_ends_trial;
    trial.stimulus_duration = trial.stimulus_duration || -1;
    trial.trial_duration = trial.trial_duration || -1;
    trial.prompt = trial.prompt || "";

    var html = '<div id="jspsych-image-slider-response-wrapper" style="margin: 100px 0px;">';
    html += '<div id="jspsych-image-slider-response-stimulus"><img src="' + trial.stimulus + '"></div>';
    html += '<div class="jspsych-image-slider-response-container" style="position:relative;">';
    html += '<input type="range" min="'+trial.min+'" max="'+trial.max+'" step="'+trial.step+'" style="width: 100%;" id="jspsych-image-slider-response-response"></input>';
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

    html += trial.prompt;

    // add submit button
    html += '<button id="jspsych-image-slider-response-next" class="jspsych-btn">'+trial.button_label+'</button>';

    display_element.innerHTML = html;

    var response = {
      rt: -1,
      response: -1
    };

    display_element.querySelector('#jspsych-image-slider-response-next').addEventListener('click', function() {
      // measure response time
      var endTime = (new Date()).getTime();
      response.rt = endTime - startTime;
      response.response = display_element.querySelector('#jspsych-image-slider-response-response').value;

      if(trial.response_ends_trial){
        end_trial();
      } else {
        display_element.querySelector('#jspsych-image-slider-response-next').disabled = true;
      }

    });

    function end_trial(){

      jsPsych.pluginAPI.clearAllTimeouts();

      // save data
      var trialdata = {
        "rt": response.rt,
        "response": response.response
      };

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trialdata);
    }

    if (trial.stimulus_duration > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-image-slider-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

    var startTime = (new Date()).getTime();
  };

  return plugin;
})();
