/* jspsych-video.js
 * Josh de Leeuw
 *
 * This plugin displays a video. The trial ends when the video finishes.
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins.video = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('video', 'sources', 'video');

  plugin.info = {
    name: 'video',
    description: '',
    parameters: {
      sources: {
        type: jsPsych.plugins.parameterType.VIDEO,
        pretty_name: 'Sources',
        array: true,
        default: undefined,
        description: 'The video file to play.'
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
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the video content.'
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
      }
    }
  }


  plugin.trial = function(display_element, trial) {

    // display stimulus


    var video_html = '<video id="jspsych-video-player"'
      if(trial.width) {
        video_html += ' width="'+trial.width+'"'
      }
      if(trial.height) {
        video_html += ' height="'+trial.height+'"'
      }
    if(trial.autoplay){
      video_html += "autoplay "
    }
    if(trial.controls){
      video_html +="controls "
    }
    video_html+=">"

    var file_name = trial.sources[0];

    //show prompt if there is one
    if (trial.prompt !== null) {
      video_html += trial.prompt;
    }

    display_element.innerHTML = video_html;

    var video_blob = jsPsych.pluginAPI.getVideoBuffer(file_name);
    if(!video_blob) throw(file_name + ' (video) not preloaded')

    display_element.childNodes[0].src = video_blob;

    display_element.querySelector('#jspsych-video-player').onended = function(){
      end_trial();
    }

    // event handler to set timeout to end trial if video is stopped
    display_element.querySelector('#jspsych-video-player').onplay = function(){
      display_element.src =  jsPsych.pluginAPI.getVideoBuffer(trial.stimulus);
      if(trial.stop !== null){
        if(trial.start == null){
          trial.start = 0;
        }
        jsPsych.pluginAPI.setTimeout(end_trial, (trial.stop-trial.start)*1000);
      }
    }

    if(trial.start !== null){
      display_element.querySelector('#jspsych-video-player').currentTime = trial.start;
    }

    // function to end trial when it is time
    var end_trial = function() {

      // gather the data to store for the trial
      var trial_data = {
        stimulus: JSON.stringify(trial.sources)
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

  };

  return plugin;
})();
