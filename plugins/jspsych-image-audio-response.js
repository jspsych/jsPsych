/**
 * jspsych-image-audio-response
 * Matt Jaquiery, Feb 2018
 *
 * plugin for displaying a stimulus and getting an audio response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["image-audio-response"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'image-audio-response',
    description: 'Present an image and retrieve an audio response',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The image to be displayed'
      },
      bufferLength: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Buffer length',
        default: 4000,
        description: 'Length of the audio buffer.'
      },
      postprocessing: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: 'Postprocessing function',
        default: null,
        description: 'Function to execute on the audio data prior to saving. '+
            'Passed the audio data and the return value is saved in the '+
            'response object.'
      },
      allowPlayback: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Allow playback',
        default: false,
        description: 'Whether to allow the participant to play back their '+
            'recording and re-record if unhappy.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed under the button.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
      margin_vertical: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin vertical',
        default: '0px',
        description: 'The vertical margin of the button.'
      },
      margin_horizontal: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin horizontal',
        default: '8px',
        description: 'The horizontal margin of the button.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, then trial will end when user responds.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    if(typeof trial.choices === 'undefined'){
      console.error('Required parameter "choices" missing in image-audio-response');
    }
    if(typeof trial.stimulus === 'undefined'){
      console.error('Required parameter "stimulus" missing in image-audio-response');
    }

    // display stimulus
    let html = '<img src="'+trial.stimulus+'" id="jspsych-image-audio-response-stimulus"></img>';

    // add audio element
    html += '<div id="jspsych-image-audio-response-audio-container">'+
        '<div id="jspsych-image-audio-response-light" '+
        'style="border: 2px solid darkred; background-color: inherit; '+
        'width: 50px; height: 50px; border-radius: 50px; margin: auto; '+
        'display: block;"></div></div>';

    //show prompt if there is one
    if (trial.prompt !== null) {
      html += trial.prompt;
    }

    display_element.innerHTML = html;

    // audio element processing
    function startRecording(e = null) {
        // e is non-null if called from an event (i.e. button press)
        if (e !== null) {
            // remove existing playback elements
            playbackElements.forEach(function (id) {
                let element = document.getElementById(id);
                element.outerHTML = "";
                delete element;
            });
        }
        navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(process_audio, trial.bufferLength);
        // Add visual indicators to let people know we're recording
        document.querySelector('#jspsych-image-audio-response-light').style.backgroundColor = 'darkred';
    }

    startRecording();

    // start timing
    let start_time = performance.now();

    // store response
    let response = {
      rt: null,
      audioData: null
    };

    let recorder = null;
    // function to handle responses by the subject
    function process_audio(stream) {
        // This code largely thanks to skyllo at
        // http://air.ghost.io/recording-to-an-audio-file-using-html5-and-js/

        // store streaming data chunks in array
        const chunks = [];
        // create media recorder instance to initialize recording
        recorder = new MediaRecorder(stream);
        console.log("recorder:" + recorder)
        recorder.data = [];
        recorder.wrapUp = false;
        // function to be called when data is received
        if (trial.postprocessing !== null) {
            console.log("Registering custom postprocessing function.")
            recorder.ondataavailable = postprocessing(e);
        }
        else {
            console.log("Using default postprocessing function.");
            recorder.ondataavailable = e => {
                console.log("Processing audio data "+e)
                // add stream data to chunks
                chunks.push(e.data);
                if (recorder.wrapUp)
                    onRecordingFinish(chunks);
            };
        }

        // start recording with 1 second time between receiving 'ondataavailable' events
        recorder.start(1000);
        // setTimeout to stop recording after 4 seconds
        setTimeout(() => {
        // this will trigger one final 'ondataavailable' event and set recorder state to 'inactive'
            recorder.stop();
            recorder.wrapUp = true;
        }, trial.bufferLength);
    }

    let playbackElements = [];

    function showPlaybackTools(data) {
        // Audio Player
        let playerDiv = display_element.querySelector('#jspsych-image-audio-response-audio-container');
        const blob = new Blob(data, { type: 'audio/webm' });
        let url = (URL.createObjectURL(blob));
        let player = playerDiv.appendChild(document.createElement('audio'));
        player.id = 'jspsych-image-audio-response-audio';
        player.src = url;
        player.controls = true;
        // Okay/rerecord buttons
        let buttonDiv = display_element.appendChild(document.createElement('div'));
        buttonDiv.id = 'jspsych-image-audio-response-buttons';
        let okay = buttonDiv.appendChild(document.createElement('button'));
        let rerecord = buttonDiv.appendChild(document.createElement('button'));
        okay.id = 'jspsych-image-audio-response-okay';
        rerecord.id = 'jspsych-image-audio-response-rerecord';
        okay.textContent = 'Okay';
        rerecord.textContent = 'Rerecord';
        okay.addEventListener('click', end_trial);
        rerecord.addEventListener('click', startRecording);
        // Save ids of things we want to delete later:
        playbackElements = [player.id, buttonDiv.id];
    }

    function onRecordingFinish(data) {
      // visual indicator
      document.querySelector('#jspsych-image-audio-response-light').style.backgroundColor = 'inherit';
      // measure rt
      let end_time = performance.now();
      let rt = end_time - start_time;
      response.audioData = data;
      response.rt = rt;

      if (trial.allowPlayback) {
          showPlaybackTools(data);
      } else if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      let trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "audioData": response.audioData
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };



    // hide image if timing is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-image-audio-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
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
