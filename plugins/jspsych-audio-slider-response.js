jsPsych.plugins['audio-slider-response'] = (function() {
	var plugin = {};

	jsPsych.pluginAPI.registerPreload('audio-slider-response', 'stimulus', 'audio');

	plugin.info = {
		name: 'audio-slider-response',
		description: '',
    parameters: {
      stimulus: {
		type: jsPsych.plugins.parameterType.AUDIO,
		default: undefined,
		no_function: false,
		description: ''
	  },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        default: -1,
        no_function: false,
        description: ''
      },
      min: {
        type: jsPsych.plugins.parameterType.INT,
        default: 0,
        no_function: false,
        description: ''
      },
      max: {
        type: jsPsych.plugins.parameterType.INT,
        default: 100,
        no_function: false,
        description: ''
      },
      step: {
        type: jsPsych.plugins.parameterType.INT,
        default: 1,
        no_function: false,
        description: ''
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'Next',
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
      trial_ends_after_audio: {
        type: jsPsych.plugins.parameterType.BOOL,
       	default: false,
        no_function: false,
        description: ''
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        default: '',
        no_function: false,
        description: ''
      }
    }
  }

    plugin.trial = function(display_element, trial) {

    // setup stimulus
    var context = jsPsych.pluginAPI.audioContext();
    if(context !== null){
      var source = context.createBufferSource();
      source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
      source.connect(context.destination);
    } else {
      var audio = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
      audio.currentTime = 0;
    }

    // set up end event if trial needs it
    if(trial.trial_ends_after_audio){
      if(context !== null){
        source.onended = function() {
          end_trial();
        }
      } else {
        audio.addEventListener('ended', end_trial);
      }
    }

    var html = '<div id="jspsych-audio-slider-response-wrapper" style="margin: 100px 0px;">';
    html += '<div id="jspsych-audio-slider-response-stimulus"><img src="' + trial.stimulus + '"></div>';
    html += '<div class="jspsych-audio-slider-response-container" style="position:relative;">';
    html += '<input type="range" min="'+trial.min+'" max="'+trial.max+'" step="'+trial.step+'" style="width: 100%;" id="jspsych-audio-slider-response-response"></input>';
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
    html += '<button id="jspsych-audio-slider-response-next" class="jspsych-btn">'+trial.button_label+'</button>';

    display_element.innerHTML = html;

    var response = {
      rt: -1,
      response: -1
    };

    display_element.querySelector('#jspsych-audio-slider-response-next').addEventListener('click', function() {
      // measure response time
      var endTime = (new Date()).getTime();
      response.rt = endTime - startTime;
      response.response = display_element.querySelector('#jspsych-audio-slider-response-response').value;

      if(trial.response_ends_trial){
        end_trial();
      } else {
        display_element.querySelector('#jspsych-audio-slider-response-next').disabled = true;
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
        display_element.querySelector('#jspsych-audio-slider-response-stimulus').style.visibility = 'hidden';
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
