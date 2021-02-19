jsPsych.plugins['audio-slider-response'] = (function () {
  var plugin = {};

  jsPsych.pluginAPI.registerPreload('audio-slider-response', 'stimulus', 'audio');

  plugin.info = {
    name: 'audio-slider-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.AUDIO,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The image to be displayed'
      },
      min: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Min slider',
        default: 0,
        description: 'Sets the minimum value of the slider.'
      },
      max: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Max slider',
        default: 100,
        description: 'Sets the maximum value of the slider',
      },
      slider_start: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Slider starting value',
        default: 50,
        description: 'Sets the starting value of the slider',
      },
      step: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Step',
        default: 1,
        description: 'Sets the step of the slider'
      },
      labels: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Labels',
        default: [],
        array: true,
        description: 'Labels of the slider.',
      },
      slider_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Slider width',
        default: null,
        description: 'Width of the slider in pixels.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default: 'Continue',
        array: false,
        description: 'Label of the button to advance.'
      },
      require_movement: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Require movement',
        default: false,
        description: 'If true, the participant will have to move the slider before continuing.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the slider.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when user makes a response.'
      },
      response_allowed_while_playing: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response allowed while playing',
        default: true,
        description: 'If true, then responses are allowed while the audio is playing. ' +
          'If false, then the audio must finish playing before a response is accepted.'
      }
    }
  }

  plugin.trial = function (display_element, trial) {

    // half of the thumb width value from jspsych.css, used to adjust the label positions
    var half_thumb_width = 7.5;

    // setup stimulus
    var context = jsPsych.pluginAPI.audioContext();
    var audio;

    // record webaudio context start time
    var startTime;

    // for storing data related to response
    var response;


    // load audio file
    jsPsych.pluginAPI.getAudioBuffer(trial.stimulus)
      .then(function (buffer) {
        if (context !== null) {
          audio = context.createBufferSource();
          audio.buffer = buffer;
          audio.connect(context.destination);
        } else {
          audio = buffer;
          audio.currentTime = 0;
        }
        setupTrial();
      })
      .catch(function (err) {
        console.error(`Failed to load audio file "${trial.stimulus}". Try checking the file path. We recommend using the preload plugin to load audio files.`)
        console.error(err)
      });

    function setupTrial() {


      // set up end event if trial needs it
      if (trial.trial_ends_after_audio) {

        audio.addEventListener('ended', end_trial);

      }

      // enable slider after audio ends if necessary
      if ((!trial.response_allowed_while_playing) & (!trial.trial_ends_after_audio)) {

        audio.addEventListener('ended', enable_slider);

      }

      var html = '<div id="jspsych-audio-slider-response-wrapper" style="margin: 100px 0px;">';
      html += '<div class="jspsych-audio-slider-response-container" style="position:relative; margin: 0 auto 3em auto; width:';
      if (trial.slider_width !== null) {
        html += trial.slider_width + 'px;';
      } else {
        html += 'auto;';
      }
      html += '">';
      html += '<input type="range" class="jspsych-slider" value="' + trial.slider_start + '" min="' + trial.min + '" max="' + trial.max + '" step="' + trial.step + '" id="jspsych-audio-slider-response-response"';
      if (!trial.response_allowed_while_playing) {
        html += ' disabled';
      }
      html += '></input><div>'
      for (var j = 0; j < trial.labels.length; j++) {
        var label_width_perc = 100 / (trial.labels.length - 1);
        var percent_of_range = j * (100 / (trial.labels.length - 1));
        var percent_dist_from_center = ((percent_of_range - 50) / 50) * 100;
        var offset = (percent_dist_from_center * half_thumb_width) / 100;
        html += '<div style="border: 1px solid transparent; display: inline-block; position: absolute; ' +
          'left:calc(' + percent_of_range + '% - (' + label_width_perc + '% / 2) - ' + offset + 'px); text-align: center; width: ' + label_width_perc + '%;">';
        html += '<span style="text-align: center; font-size: 80%;">' + trial.labels[j] + '</span>';
        html += '</div>'
      }
      html += '</div>';
      html += '</div>';
      html += '</div>';

      if (trial.prompt !== null) {
        html += trial.prompt;
      }

      // add submit button
      var next_disabled_attribute = "";
      if (trial.require_movement | !trial.response_allowed_while_playing) {
        next_disabled_attribute = "disabled";
      }
      html += '<button id="jspsych-audio-slider-response-next" class="jspsych-btn" ' + next_disabled_attribute + '>' + trial.button_label + '</button>';

      display_element.innerHTML = html;

      response = {
        rt: null,
        response: null
      };

      if (!trial.response_allowed_while_playing) {
        display_element.querySelector('#jspsych-audio-slider-response-response').disabled = true;
        display_element.querySelector('#jspsych-audio-slider-response-next').disabled = true;
      }

      if (trial.require_movement) {
        display_element.querySelector('#jspsych-audio-slider-response-response').addEventListener('click', function () {
          display_element.querySelector('#jspsych-audio-slider-response-next').disabled = false;
        });
      }

      display_element.querySelector('#jspsych-audio-slider-response-next').addEventListener('click', function () {
        // measure response time
        var endTime = performance.now();
        var rt = endTime - startTime;
        if (context !== null) {
          endTime = context.currentTime;
          rt = Math.round((endTime - startTime) * 1000);
        }
        response.rt = rt;
        response.response = display_element.querySelector('#jspsych-audio-slider-response-response').valueAsNumber;

        if (trial.response_ends_trial) {
          end_trial();
        } else {
          display_element.querySelector('#jspsych-audio-slider-response-next').disabled = true;
        }

      });

      startTime = performance.now();
      // start audio
      if (context !== null) {
        startTime = context.currentTime;
        audio.start(startTime);
      } else {
        audio.play();
      }

      // end trial if trial_duration is set
      if (trial.trial_duration !== null) {
        jsPsych.pluginAPI.setTimeout(function () {
          end_trial();
        }, trial.trial_duration);
      }
    }

    // function to enable slider after audio ends
    function enable_slider() {
      document.querySelector('#jspsych-audio-slider-response-response').disabled = false;
      if (!trial.require_movement) {
        document.querySelector('#jspsych-audio-slider-response-next').disabled = false;
      }
    }

    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // stop the audio file if it is playing
      // remove end event listeners if they exist
      if (context !== null) {
        audio.stop();
      } else {
        audio.pause();
      }

      audio.removeEventListener('ended', end_trial);
      audio.removeEventListener('ended', enable_slider);


      // save data
      var trialdata = {
        rt: response.rt,
        stimulus: trial.stimulus,
        slider_start: trial.slider_start,
        response: response.response
      };

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trialdata);
    }
  };

  return plugin;
})();
