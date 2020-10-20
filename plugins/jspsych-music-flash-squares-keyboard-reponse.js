/**
 * jspsych-music-flash-squares-keyboard-reponse
 * Benjamin Kubit 01Oct2020
 *
 * plugin for visual target detection task with flashing squares while auditory stim is playing in the background
 *
 * 
 *
 **/


jsPsych.plugins["music-flash-squares-keyboard-reponse"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('music-flash-squares-keyboard-reponse', 'stimulus', 'audio');

  plugin.info = {
    name: 'music-flash-squares-keyboard-reponse',
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
      add_fixation: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Add Fixation cross',
        default: true,
        description: 'If true, displays fixation cross'
      },
      fix_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Dimensions of fixation cross',
        default: 40,
        description: 'Hieght and width of fixation cross.'
      },
      vtarg_grid_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Vtarg grid width',
        default: 800,
        description: 'Total width of target grid.'
      },
      vtarg_grid_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Vtarg grid height',
        default: 800,
        description: 'Total height of target grid.'
      },
      vtarg_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Size of vtargs',
        default: 40,
        description: 'Height (and width) of square vtargs.'
      },
      flash_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Flash duration',
        default: 500,
        description: 'ms target appears for.'
      },
      maxISI: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Longest possible ISI',
        default: 500,
        description: 'Max ms between target presentations.'
      },
      minISI: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Shortest possible ISI',
        default: 250,
        description: 'min ms between target presentations.'
      },
      numColsLocations: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'N vtargs in a row',
        default: 4,
        description: 'Number of possible target locations in a row.'
      },
      numRowsLocations: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'N vtargs in a column',
        default: 4,
        description: 'Number of possible target locations in a column.'
      },
      targetProb: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Vtarg probability',
        default: .05,
        description: 'Probability of square with target color appearing.'
      },
      targetColor: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Vtarg color',
        default: 'red',
        description: 'Color of target squares (to respond to).'
      },
      distractColors: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Distractor color',
        default: ['purple','yellow','blue','black'],
        description: 'Color of target squares (to respond to).'
      },
      vtarg_start_delay: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Detection onset delay',
        default: 300,
        description: 'Amount of time between music onset and the start of vtarg presentations.'
      },
      timeConvert: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Event and Response time conversion',
        default: 1000,
        description: 'Number to multiply time values by (1000 = ms).'
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

    var end_time = 0;
    // store response
    var run_events = []
    var trial_data = {
        time: null,
        type: null,
        stimulus: null,
        key_press: null,
        color: null,
      };
    var response_data = {
        time: null,
        type: null,
        stimulus: null,
        key_press: null,
        color: null,
      };

    var response = {
      rt: null,
      key: null
    };

    // set up the vtarg grid
    var svgns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgns, "svg");
    $(svg).attr({"width": trial.vtarg_grid_width, "height": trial.vtarg_grid_height});
    $("#svgdiv").append(svg);
    var numLocations = trial.numColsLocations*trial.numRowsLocations;
    var currLocation = 0;


    if(trial.add_fixation==true){
      var dpathval = 'M'+(trial.vtarg_grid_width/2)+','+(trial.vtarg_grid_height/2-(trial.fix_height/2))+' V'+(trial.vtarg_grid_height/2+trial.fix_height/2)+' M'+(trial.vtarg_grid_height/2-(trial.fix_height/2))+','+(trial.vtarg_grid_height/2)+' H'+(trial.vtarg_grid_height/2+trial.fix_height/2);
      //dpathval = 'M'+(400)+','+(400-20)+' V'+(400-20+40)+' M'+(400-20)+','+(400)+' H'+(400-20+40)
      var fixp = document.createElementNS(svgns,'path');
      $(fixp).attr({'id':'fixation','d':dpathval,'stroke':'gray','fill':'gray','stroke-width':3,'opacity':1});
      $(svg).append(fixp);
    }
    

    for (l=0;l<trial.numRowsLocations;l++){
      var xoffset= trial.vtarg_grid_width/trial.numRowsLocations*l+trial.vtarg_grid_width/trial.numRowsLocations*.5-trial.vtarg_height/2;
      for (h=0;h<trial.numColsLocations;h++){
        var square = document.createElementNS(svgns,'rect');
        var yoffset= trial.vtarg_grid_height/trial.numColsLocations*h+trial.vtarg_grid_height/trial.numColsLocations*.5-trial.vtarg_height/2;
        $(square).attr({'id':'rect-'+currLocation,'width':trial.vtarg_height,'height':trial.vtarg_height,'x':xoffset,'y':yoffset,'fill':'black','stroke-width':1,'opacity':0});
        $(svg).append(square);
        currLocation++;
      }
    }

    // funciton that controls the presentation of visual stims
    function toggle_fill(){
      trial_data = {
        time: null,
        type: null,
        stimulus: trial.stimulus.replace(/^.*[\\\/]/, ''),
        key_press: null,
        color: null,
      };
      var nextISIS = trial.flash_duration+(Math.floor(Math.random() * (Math.floor(trial.maxISI) - Math.ceil(trial.minISI) + 1)) + Math.ceil(trial.minISI))
      var rect_id = 'rect-'+Math.floor(Math.random() * numLocations);
      var rect = document.getElementById(rect_id);
      var fillval = rect.getAttribute('fill');
      // pic rand num to detemrine the color
      var trialChoice = Math.floor(Math.random() * 100); //rand int from 0 to 99

      if(Math.round(context.currentTime*trial.timeConvert)+trial.flash_duration+nextISIS < Math.round(startTime*trial.timeConvert)+(trial.trial_duration)){

        if(fillval == 'black'){

          if(trialChoice < trial.targetProb*100){
            var ctype = trial.targetColor;
            rect.setAttribute('fill',trial.targetColor);
            rect.setAttribute('opacity',1);
            trial_data.type = 'target';
          }
          else {
            //rand choose another color
            randomElement = trial.distractColors[Math.floor(Math.random() * trial.distractColors.length)];
            var ctype = randomElement;
            rect.setAttribute('fill',randomElement);
            rect.setAttribute('opacity',1);
            trial_data.type = 'distractor';
          }

          trial_data.time = Math.round(context.currentTime * trial.timeConvert);
          trial_data.color = ctype;
           //push target event
          run_events.push(trial_data);
          jsPsych.pluginAPI.setTimeout(function(){
            rect.setAttribute('fill',fillval);
            rect.setAttribute('opacity',0);
          },trial.flash_duration);
          
        } 
        jsPsych.pluginAPI.setTimeout(toggle_fill,nextISIS);

      } else {
        //bought to end, make sure square is turned off
        rect.setAttribute('opacity',0);
      }
    }

    // function to end trial when it is time
    function end_trial() {
      // kill any remaining setTimeout handlers (including vtargs)
      jsPsych.pluginAPI.clearAllTimeouts();

      // stop the audio file if it is playing
      // remove end event listeners if they exist
      if(context !== null){
        source.stop();
        source.onended = function() { }
      } else {
        audio.pause();
        audio.removeEventListener('ended', end_trial);
      }

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(run_events);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      response = info;

      //append this info to current trial_data
      response_data.stimulus = trial.stimulus.replace(/^.*[\\\/]/, '');
      response_data.time = Math.round(response.rt * trial.timeConvert);
      response_data.key_press = response.key;
      response_data.type = 'response';
      response_data.color = null;
     
      run_events.push(response_data);

      response_data = {
        time: null,
        type: null,
        stimulus: null,
        key_press: null,
        color: null,
      };

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
          rt_method: 'audio',
          persist: true,
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
      if(trial.trial_duration !== null) {
        jsPsych.pluginAPI.setTimeout(function() {
          end_trial();
        }, trial.trial_duration);
      }



      display_element.innerHTML = svg.outerHTML;
      jsPsych.pluginAPI.setTimeout(toggle_fill,trial.vtarg_start_delay);
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
