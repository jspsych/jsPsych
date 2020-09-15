/**
 * webcam plugin for jsPsych
 * by Alex Rockhill
 *
 * plugin the webcam to be played back to the participant for a trial.
 *
 *
 **/

jsPsych.plugins["webcam"] = (function() {
  var plugin = {};


  plugin.info = {
    name: 'webcam',
    description: 'show the webcam for a trial',
    parameters: {
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
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      flip_lr: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Flip left right',
        default: false,
        description: 'Whether to flip the video left to right so that ' +
                     'it looks like a mirror'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // setup stimulus
    var video_html = '<div><video autoplay="true" id="videoElement"' +
                     ((trial.width) ? ' width="'+trial.width+'"': '') +
                     ((trial.height) ? ' height="'+trial.height+'"': '') +
                    '></video></div>'

    // add prompt if there is one
    if (trial.prompt !== null) {
      video_html += trial.prompt;
    }

    display_element.innerHTML = video_html;
    var video = display_element.querySelector('#videoElement');
    if(trial.flip_lr === true){
      video.style.cssText = "-moz-transform: scale(-1, 1); \
        -webkit-transform: scale(-1, 1); -o-transform: scale(-1, 1); \
        transform: scale(-1, 1); filter: FlipH;";
    }

    // get webcam
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(
        {video: {width : ((trial.width) ? trial.width: window.innerWidth),
                   height: ((trial.height) ? trial.height: window.innerHeight)}})
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch(function (error) {
        console.log("The following error occurred: " + error);
      });
    }

    // function to end trial when it is time
    function end_trial() {

      if(trial.blank === false){
        //get the video object
        var video = document.querySelector("#videoElement");

        // stop the webcam
        var stream = video.srcObject;
        var tracks = stream.getTracks();

        for (var i = 0; i < tracks.length; i++) {
          var track = tracks[i];
          track.stop();
        }

        video.srcObject = null;
      }

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      jsPsych.pluginAPI.cancelAllKeyboardResponses();

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial();
    };

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }
  };

  return plugin;
})();
