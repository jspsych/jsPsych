/**
 * jspsych-music-image-keyboard-response
 * Benjamin Kubit 01Oct2020
 *
 * plugin for displaying multiple visual stims while auditory stim is playing in the background
 *
 * 
 *
 **/


jsPsych.plugins["music-image-keyboard-response"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('music-image-keyboard-response', 'stimulus', 'audio');

  plugin.info = {
    name: 'music-image-keyboard-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.AUDIO,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The audio to be played.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Choices',
        array: true,
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'The maximum duration to wait for a response.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, the trial will end when user makes a response.'
      },
      trial_ends_after_audio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Trial ends after audio',
        default: false,
        description: 'If true, then the trial will end as soon as the audio file finishes playing.'
      },
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

    // show prompt if there is one
    if (trial.prompt !== null) {
      display_element.innerHTML = trial.prompt;
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

    // store response
    //var vtargresponses = []
    var trial_data = {
        "rt": [],
        "stimulus": [],
        "key_press": [],
        "tt": [],
        "color": []
      };
    var response = {
      rt: null,
      key: null
    };


    // set up the vtarg grid
    var vtargtimeOuts = []; //hold timer ids
    var vtargonsetTimes = {"tt": [],
                            "color": []}; //hold onsets of targets
    var svgns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgns, "svg");
    var width = 800;
    var height = 800;
    var rect_width = rect_height = 40;
    $(svg).attr({"width": width, "height": height});
    $("#svgdiv").append(svg);
    var flash_duration = 1000;
    var numColsLocations = 4;
    var numRowsLocations = 4;
    var numLocations = numColsLocations*numRowsLocations;
    var currLocation = 0;
    var targetProb = .1;
    var distractColors = ['purple','yellow','blue','black']

    for (l=0;l<numRowsLocations;l++){
      var xoffset= width/numRowsLocations*l+width/numRowsLocations*.5-rect_width/2;
      for (h=0;h<numColsLocations;h++){
        var square = document.createElementNS(svgns,'rect');
        var yoffset= height/numColsLocations*h+height/numColsLocations*.5-rect_height/2;
        $(square).attr({'id':'rect-'+currLocation,'width':rect_width,'height':rect_height,'x':xoffset,'y':yoffset,'fill':'black','stroke-width':1,'opacity':0});
        $(svg).append(square);
        currLocation++;
      }
    }


    // funciton that controls the presentation of visual stims
    //NOTE this also needs to log the onset time of targets (red squeares)
    function toggle_fill(){
      //(context.currentTime>startTime+context.duration)
      if(context.state !== "running"){
        for (var i = 0; i < vtargtimeOuts.length; i++) {
            clearTimeout(vtargtimeOuts[i]);
            vtargtimeOuts = [];
        }
        return;
      }
      var rect_id = 'rect-'+Math.floor(Math.random() * numLocations);
      var rect = document.getElementById(rect_id);
      var fillval = rect.getAttribute('fill');
      // pic rand num to detemrine the color
      var trialChoice = Math.floor(Math.random() * 100); //rand int from 0 to 99

      if(fillval == 'black'){
        if(trialChoice < targetProb*100){
          var ctype = 'red';
          rect.setAttribute('fill','red');
          rect.setAttribute('opacity',1);
        }
        else {
          //rand choose another color
          randomElement = distractColors[Math.floor(Math.random() * distractColors.length)];
          var ctype = randomElement;
          rect.setAttribute('fill',randomElement);
          rect.setAttribute('opacity',1);
        }
        vtargtimeOuts.push(setTimeout(function(){
            vtargonsetTimes.tt.push(context.currentTime);
            vtargonsetTimes.color.push(ctype);
            rect.setAttribute('fill',fillval);
            rect.setAttribute('opacity',0);
        },flash_duration))
      } 
      vtargtimeOuts.push(setTimeout(toggle_fill,flash_duration+(500*Math.ceil(Math.random() * 10))));
      
    }

    // function to end trial when it is time
    function end_trial() {
      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill the vtarg events
      /* should happen after source.stop()
      for (var i = 0; i < vtargtimeOuts.length; i++) {
            clearTimeout(vtargtimeOuts[i]);
            vtargtimeOuts = [];
            rect.setAttribute('opacity',0);
        }
      */

      // stop the audio file if it is playing
      // remove end event listeners if they exist
      if(context !== null){
        source.stop();
        source.onended = function() { }
      } else {
        audio.pause();
        audio.removeEventListener('ended', end_trial);
      }

      /*
      // gather the data to store for the trial
      if(context !== null && response.rt !== null){
        response.rt = Math.round(response.rt * 1000);
      }
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key
      };
      */
      //add info for vtargets
      trial_data.tt = vtargonsetTimes.tt
      trial_data.color = vtargonsetTimes.color

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      response = info;
      

      trial_data.rt.push(Math.round(response.rt * 1000));
      trial_data.stimulus.push(trial.stimulus);
      trial_data.key_press.push(response.key);

      /*
      var trial_data = {
        "rt": Math.round(response.rt * 1000);,
        "stimulus": trial.stimulus,
        "key_press": response.key
      };
      */

      //vtargresponses.push(trial_data); this worked though

      /*
      // only record the first response
      if (response.key == null) {
        response = info;
      }
      */

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // Embed the rest of the trial into a function so that we can attach to a button if desired
    var start_audio = function(){
      if(context !== null){
        context.resume(); 
        startTime = context.currentTime;
        source.start(startTime);
        
      } else {
        audio.play();
      }

      // start the response listener
      if(context !== null) {
        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: 'performance',
          // what's the right way to do this?
          persist: true,// BK changed to true. should have this grab a parameter though
          allow_held_key: false,
          audio_context: context,
          audio_context_start_time: startTime
        });
      } else {
        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: 'performance',
          persist: true,
          allow_held_key: false
        });
      }

      // end trial if time limit is set
      if (trial.trial_duration !== null) {
        jsPsych.pluginAPI.setTimeout(function() {
          end_trial();
        }, trial.trial_duration);
      }

      display_element.innerHTML = svg.outerHTML;
      vtargtimeOuts.push(setTimeout(toggle_fill,3000));
    }

    // Either start the trial or wait for the user to click start
    if(!trial.click_to_start || context==null){
      start_audio();
    } else {
      // Register callback for start sound button if we have one
      $('#start_button').on('click', function(ev){
        ev.preventDefault();
        start_audio();
      })
    }
  };

  return plugin;
})();
