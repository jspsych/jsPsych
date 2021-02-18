/**
 * jspsych-video-slider-response
 * Josh de Leeuw
 *
 * plugin for playing a video file and getting a slider response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["video-slider-response"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('video-slider-response', 'stimulus', 'video');

  plugin.info = {
    name: 'video-slider-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.VIDEO,
        pretty_name: 'Video',
        default: undefined,
        description: 'The video file to play.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Width',
        default: '',
        description: 'The width of the video in pixels.'
      },
      height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Height',
        default: '',
        description: 'The height of the video display in pixels.'
      },
      autoplay: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Autoplay',
        default: true,
        description: 'If true, the video will begin playing as soon as it has loaded.'
      },
      controls: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Controls',
        default: false,
        description: 'If true, the subject will be able to pause the video or move the playback to any point in the video.'
      },
      start: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Start',
        default: null,
        description: 'Time to start the clip.'
      },
      stop: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Stop',
        default: null,
        description: 'Time to stop the clip.'
      },
      rate: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Rate',
        default: 1,
        description: 'The playback rate of the video. 1 is normal, <1 is slower, >1 is faster.'
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
        pretty_name:'Labels',
        default: [],
        array: true,
        description: 'Labels of the slider.',
      },
      slider_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name:'Slider width',
        default: null,
        description: 'Width of the slider in pixels.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        array: false,
        description: 'Label of the button to advance.'
      },
      require_movement: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Require movement',
        default: false,
        description: 'If true, the participant will have to move the slider before continuing.'
      },
      trial_ends_after_video: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'End trial after video finishes',
        default: false,
        description: 'If true, the trial will end immediately after the video finishes playing.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, the trial will end when subject makes a response.'
      },
      response_allowed_while_playing: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response allowed while playing',
        default: true,
        description: 'If true, then responses are allowed while the video is playing. '+
          'If false, then the video must finish playing before a response is accepted.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // half of the thumb width value from jspsych.css, used to adjust the label positions
    var half_thumb_width = 7.5; 

    // setup stimulus
    var video_html = '<video id="jspsych-video-slider-response-stimulus-video"';

    if(trial.width) {
      video_html += ' width="'+trial.width+'"';
    }
    if(trial.height) {
      video_html += ' height="'+trial.height+'"';
    }
    if(trial.autoplay & (trial.start == null)){
      // if autoplay is true and the start time is specified, then the video will start automatically
      // via the play() method, rather than the autoplay attribute, to prevent showing the first frame
      video_html += " autoplay ";
    }
    if(trial.controls){
      video_html +=" controls ";
    }
    if (trial.start !== null) {
      // hide video element when page loads if the start time is specified, 
      // to prevent the video element from showing the first frame
      video_html += ' style="visibility: hidden;"'; 
    }
    video_html +=">";

    var video_preload_blob = jsPsych.pluginAPI.getVideoBuffer(trial.stimulus[0]);
    if(!video_preload_blob) {
      for(var i=0; i<trial.stimulus.length; i++){
        var file_name = trial.stimulus[i];
        if(file_name.indexOf('?') > -1){
          file_name = file_name.substring(0, file_name.indexOf('?'));
        }
        var type = file_name.substr(file_name.lastIndexOf('.') + 1);
        type = type.toLowerCase();
        if (type == "mov") {
          console.warn('Warning: video-slider-response plugin does not reliably support .mov files.')
        }
        video_html+='<source src="' + file_name + '" type="video/'+type+'">';
      }
    }
    video_html += "</video>";

    var html = '<div id="jspsych-video-slider-response-wrapper" style="margin: 100px 0px;">';
    html += '<div id="jspsych-video-slider-response-stimulus">' + video_html + '</div>';
    html += '<div class="jspsych-video-slider-response-container" style="position:relative; margin: 0 auto 3em auto; width:';
    if (trial.slider_width !== null) {
      html += trial.slider_width+'px;'
    } else {
      html += 'auto;'
    }
    html += '">';
    html += '<input type="range" class="jspsych-slider" value="'+trial.slider_start+'" min="'+trial.min+'" max="'+trial.max+'" step="'+trial.step+'" id="jspsych-video-slider-response-response"';
    if (!trial.response_allowed_while_playing) {
      html += ' disabled';
    }
    html += '></input><div>'
    for(var j=0; j < trial.labels.length; j++){
      var label_width_perc = 100/(trial.labels.length-1);
      var percent_of_range = j * (100/(trial.labels.length - 1));
      var percent_dist_from_center = ((percent_of_range-50)/50)*100;
      var offset = (percent_dist_from_center * half_thumb_width)/100;
      html += '<div style="border: 1px solid transparent; display: inline-block; position: absolute; '+
        'left:calc('+percent_of_range+'% - ('+label_width_perc+'% / 2) - '+offset+'px); text-align: center; width: '+label_width_perc+'%;">';
      html += '<span style="text-align: center; font-size: 80%;">'+trial.labels[j]+'</span>';
      html += '</div>'
    }
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // add prompt if there is one
    if (trial.prompt !== null) {
      html += '<div>'+trial.prompt+'</div>';
    }

    // add submit button
    var next_disabled_attribute = "";
    if (trial.require_movement | !trial.response_allowed_while_playing) {
      next_disabled_attribute = "disabled";
    }
    html += '<button id="jspsych-video-slider-response-next" class="jspsych-btn" '+ next_disabled_attribute + '>'+trial.button_label+'</button>';

    display_element.innerHTML = html;

    var video_element = display_element.querySelector('#jspsych-video-slider-response-stimulus-video');

    if(video_preload_blob){
      video_element.src = video_preload_blob;
    }

    video_element.onended = function(){
      if(trial.trial_ends_after_video){
        end_trial();
      } else if (!trial.response_allowed_while_playing) {
        enable_slider();
      }
    }

    video_element.playbackRate = trial.rate;

    // if video start time is specified, hide the video and set the starting time
    // before showing and playing, so that the video doesn't automatically show the first frame
    if(trial.start !== null){
      video_element.pause();
      video_element.currentTime = trial.start;
      video_element.onseeked = function() {
        video_element.style.visibility = "visible";
        if (trial.autoplay) {
          video_element.play();
        }
      }
    }

    if(trial.stop !== null){
      video_element.addEventListener('timeupdate', function(e){
        var currenttime = video_element.currentTime;
        if(currenttime >= trial.stop){
          video_element.pause();
        }
      })
    }

    if(trial.require_movement){
      display_element.querySelector('#jspsych-video-slider-response-response').addEventListener('click', function(){
        display_element.querySelector('#jspsych-video-slider-response-next').disabled = false;
      });
    }

    var startTime = performance.now();

    // store response
    var response = {
      rt: null,
      response: null
    };

    display_element.querySelector('#jspsych-video-slider-response-next').addEventListener('click', function() {
      // measure response time
      var endTime = performance.now();
      response.rt = endTime - startTime;
      response.response = display_element.querySelector('#jspsych-video-slider-response-response').valueAsNumber;

      if(trial.response_ends_trial){
        end_trial();
      } else {
        display_element.querySelector('#jspsych-video-slider-response-next').disabled = true;
      }

    });

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // stop the video file if it is playing
      // remove any remaining end event handlers
      display_element.querySelector('#jspsych-video-slider-response-stimulus-video').pause();
      display_element.querySelector('#jspsych-video-slider-response-stimulus-video').onended = function() {};

      // gather the data to store for the trial
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        start: trial.start,
        slider_start: trial.slider_start,
        response: response.response
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to enable slider after video ends
    function enable_slider() {
      document.querySelector('#jspsych-video-slider-response-response').disabled = false;
      if (!trial.require_movement) {
        document.querySelector('#jspsych-video-slider-response-next').disabled = false;
      }
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }
  };

  return plugin;
})();
