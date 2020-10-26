/**
 * jspsych-music-bleep-tones-keyboard-reponse
 * Benjamin Kubit 16Oct2020
 *
 * plugin for auditory target detection task with tone bleeps while auditory stim is playing in the background
 *
 * 
 *
 **/


jsPsych.plugins["music-bleep-tones-keyboard-reponse"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('music-bleep-tones-keyboard-reponse', 'stimulus', 'audio');

  plugin.info = {
    name: 'music-bleep-tones-keyboard-reponse',
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
        default: false,
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
      bleep_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Bleep duration',
        default: 500,
        description: 'ms target appears for.'
      },
      bleep_frequency: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Bleep frequency',
        default: 700,
        description: 'Hz of beep.'
      },
      maxNtargsPerTrial: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Max N vtargs',
        default: 2,
        description: 'Max number of target color squares per trial.'
      },
      minNtargsPerTrial: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Min N vtargs',
        default: 1,
        description: 'Min number of target color squares per trial.'
      },
      min_time_btw_targs: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Min ms between targets',
        default: 4000,
        description: 'Min ms between targets.'
      },
      atarg_start_delay: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Detection onset delay',
        default: 2000,
        description: 'Amount of time between music onset and the start of vtarg presentations.'
      },
      timeConvert: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Event and Response time conversion',
        default: 1000,
        description: 'Number to multiply time values by (1000 = ms).'
      },
      freqs: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'target chords each loop key',
        default: {"C.mp3": [466.16,587.33,698.46],"E.mp3": [466.16,587.33,698.46],"Ab.mp3": [466.16,587.33,698.46]},
        description: 'tritones for each possible loop key (Hz).'
      },
      atarg_gain: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Target volume',
        default: .05,
        description: '0-1 volume node gain.'
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
    var run_events = [];
    var trial_data = {
        time: null,
        type: null,
        stimulus: null,
        key_press: null,
        Hz: null
    };
    var response_data = {
        time: null,
        type: null,
        stimulus: null,
        key_press: null,
        Hz: null
    };

    var response = {
      rt: null,
      key: null
    };

    // set up the vtarg grid
    // NOTE, seems to be required to feed into display_element.innerHTML
    var svgns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgns, "svg");
    $(svg).attr({"width": trial.vtarg_grid_width, "height": trial.vtarg_grid_height});
    $("#svgdiv").append(svg);


    if(trial.add_fixation==true){
      var dpathval = 'M'+(trial.vtarg_grid_width/2)+','+(trial.vtarg_grid_height/2-(trial.fix_height/2))+' V'+(trial.vtarg_grid_height/2+trial.fix_height/2)+' M'+(trial.vtarg_grid_height/2-(trial.fix_height/2))+','+(trial.vtarg_grid_height/2)+' H'+(trial.vtarg_grid_height/2+trial.fix_height/2);
      //dpathval = 'M'+(400)+','+(400-20)+' V'+(400-20+40)+' M'+(400-20)+','+(400)+' H'+(400-20+40)
      var fixp = document.createElementNS(svgns,'path');
      $(fixp).attr({'id':'fixation','d':dpathval,'stroke':'gray','fill':'gray','stroke-width':3,'opacity':1});
      $(svg).append(fixp);
    }

    //pic the num and time of targets we'll be presenting
    var ntargets = (Math.floor(Math.random() * (Math.floor(trial.maxNtargsPerTrial) - Math.ceil(trial.minNtargsPerTrial) + 1)) + Math.ceil(trial.minNtargsPerTrial));
    var targtimes = [];
    for(it=0;it<ntargets;it++){
      var tooclose = true;
      //set the time window when they will be presented
      while(tooclose) {
        var targstarttime = (Math.floor(Math.random() * (Math.floor(trial.trial_duration-trial.min_time_btw_targs-trial.bleep_duration) - Math.ceil(trial.atarg_start_delay) + 1)) + Math.ceil(trial.atarg_start_delay));
        if(it>0){
          //grab time diffs. 
          var ntestclose = 0;
          for(iot=0;iot<targtimes.length;iot++){
            if(Math.abs(targstarttime-targtimes[iot])<trial.min_time_btw_targs){
              ntestclose = ntestclose + 1;
            }
          }
          if(ntestclose==0){
            //done with this targ
            tooclose = false;
          }
        } else {
          //only 1 targ
          tooclose = false
        }
      }
      targtimes.push(targstarttime);
    }
    targtimes.sort(function(a, b){return a-b});
    var curr_targ_num = 0;

    if(trial.freqs[trial.stimulus.replace(/^.*[_]/, '')] == undefined) {
      var currfreqs = [466.16,587.33,698.46]
      
    }
    else {
      var currfreqs = trial.freqs[trial.stimulus.replace(/^.*[_]/, '')];
      
    }
    

    // funciton that controls the presentation of visual stims
    function play_targ(){
      trial_data = {
        time: null,
        type: null,
        stimulus: trial.stimulus.replace(/^.*[\\\/]/, ''),
        key_press: null,
        Hz: trial.bleep_frequency,
      };

      var nextISIS = trial.min_time_btw_targs;
      var trialChoice = Math.floor(Math.random() * 100); //rand int from 0 to 99

      if(Math.round(context.currentTime*trial.timeConvert)+trial.bleep_duration+nextISIS < Math.round(startTime*trial.timeConvert)+(trial.trial_duration)){

        if(curr_targ_num < ntargets && Math.abs(Math.round(context.currentTime*trial.timeConvert)-targtimes[curr_targ_num]) <= trial.bleep_duration+nextISIS){
          // set up the distractor sound 


          var vol = context.createGain();
          var osc1 = context.createOscillator(); // instantiate an oscillator
          osc1.type = 'sine'; // this is the default - also square, sawtooth, triangle
          osc1.frequency.value = currfreqs[0];//trial.bleep_frequency; // Hz
          vol.gain.value = trial.atarg_gain; // from 0 to 1, 1 full volume, 0 is muted
          osc1.connect(vol); // connect osc to vol
          vol.connect(context.destination);
          osc1.start();
          jsPsych.pluginAPI.setTimeout(function(){
            osc1.stop();
          },trial.bleep_duration);

          var osc2 = context.createOscillator(); // instantiate an oscillator
          osc2.type = 'sine'; // this is the default - also square, sawtooth, triangle
          osc2.frequency.value = currfreqs[1];//trial.bleep_frequency; // Hz
          vol.gain.value = trial.atarg_gain; // from 0 to 1, 1 full volume, 0 is muted
          osc2.connect(vol); // connect osc to vol
          vol.connect(context.destination);
          osc2.start();
          jsPsych.pluginAPI.setTimeout(function(){
            osc2.stop();
          },trial.bleep_duration);

          var osc3 = context.createOscillator(); // instantiate an oscillator
          osc3.type = 'sine'; // this is the default - also square, sawtooth, triangle
          osc3.frequency.value = currfreqs[2];//trial.bleep_frequency; // Hz
          vol.gain.value = trial.atarg_gain; // from 0 to 1, 1 full volume, 0 is muted
          osc3.connect(vol); // connect osc to vol
          vol.connect(context.destination);
          osc3.start();
          jsPsych.pluginAPI.setTimeout(function(){
            osc3.stop();
          },trial.bleep_duration);


          
          trial_data.type = 'target';
          trial_data.time = Math.round(context.currentTime * trial.timeConvert);
          curr_targ_num = curr_targ_num + 1
           //push target event
          run_events.push(trial_data);

        }

        jsPsych.pluginAPI.setTimeout(play_targ,nextISIS);
        
      } else {
        //bought to end, make sure square is turned off
        trial_data = {
          time: null,
          type: null,
          stimulus: trial.stimulus.replace(/^.*[\\\/]/, ''),
          key_press: null,
          Hz: trial.bleep_frequency,
        };
      }
    }

    // function to end trial when it is time
    function end_trial() {
      // kill any remaining setTimeout handlers (including vtargs)
      jsPsych.pluginAPI.clearAllTimeouts();

      // stop the audio file if it is playing
      // remove end event listeners if they exist
      if(trial.stimulus!=='') {
        //skip these if there is no audio being played
        if(context !== null){
          source.stop();
          source.onended = function() { }
        } else {
          audio.pause();
          audio.removeEventListener('ended', end_trial);
        }
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
      response_data.Hz = null;
     
      run_events.push(response_data);

      response_data = {
        time: null,
        type: null,
        stimulus: null,
        key_press: null,
        Hz: null
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

      //update the target times
      for(it=0;it<ntargets;it++){
        targtimes[it] = targtimes[it] + Math.round(startTime*trial.timeConvert);
      }
      display_element.innerHTML = svg.outerHTML;
      jsPsych.pluginAPI.setTimeout(play_targ,trial.atarg_start_delay);
    };

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
