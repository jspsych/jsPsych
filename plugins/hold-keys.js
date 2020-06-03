jsPsych.plugins["hold-keys"] = (function() {

    // !!! NOTE !!! requires modified jsPsych client code bundled with this experiment,
    // which adds recording of 'up' events

    var plugin = {};
  
    plugin.info = {
      name: 'hold-keys',
      description: '',
      parameters: {
        stimulus: {
          type: jsPsych.plugins.parameterType.HTML_STRING,
          pretty_name: 'Stimulus',
          default: undefined,
          description: 'The HTML string to be displayed'
        },
        choices: {
          type: jsPsych.plugins.parameterType.KEYCODE,
          array: true,
          pretty_name: 'Choices',
          default: jsPsych.NO_KEYS,
          description: 'The keys the subject must hold to respond to the stimulus.'
        },
        prompt: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: 'Prompt',
          default: null,
          description: 'Any content here will be displayed below the stimulus.'
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
          description: 'How long to show trial before it ends.'
        },
        response_ends_trial: {
          type: jsPsych.plugins.parameterType.BOOL,
          pretty_name: 'Response ends trial',
          default: true,
          description: 'If true, trial will end when subject makes a response.'
        },
  
      }
    }
  
    plugin.trial = function(display_element, trial) {
  
      var new_html = '<div id="jspsych-html-keyboard-response-stimulus">'+trial.stimulus+'</div>';
  
      // add prompt
      if(trial.prompt !== null){
        new_html += trial.prompt;
      }
  
      // draw
      display_element.innerHTML = new_html;
  
      // store response
      var response = [];
  
      // store keys that have been recorded as held
      var keys_down = {};

      var held_over = [];
      for (let [key, value] of Object.entries(jsPsych.pluginAPI.getHeldKeys())) {
          if(value == true) {
            held_over.push(parseInt(key))
          }
      }

      // function to end trial when it is time
      var end_trial = function() {
  
        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();
  
        // kill keyboard listeners
        if (typeof keyboardListener !== 'undefined') {
          jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }

        var key_up = [];
        var key_down = [];
        var rt_up = [];
        var rt_down = [];

        for(var i = 0; i < response.length; i++) {
            if(response[i].down) {
                key_down.push(response[i].key)
                rt_down.push(response[i].rt)
            }
            else {
                key_up.push(response[i].key)
                rt_up.push(response[i].rt)
            }
        }

        // gather the data to store for the trial
        var trial_data = {
          "held_over": held_over, // keys held over from the last trial
          "key_up": key_up, 
          "key_down": key_down,
          "rt_up": rt_up,
          "rt_down": rt_down,
          "stimulus": trial.stimulus,
        };
  
        // clear the display
        display_element.innerHTML = '';
  
        // move on to the next trial
        jsPsych.finishTrial(trial_data);
      };

  
      // function to handle responses by the subject
      var after_response = function(info) {
  
        response.push(info);
        
        keys_down[info.key] = info.down;
  
        if (trial.response_ends_trial & (trial.choices !== jsPsych.NO_KEYS) & (trial.choices !== jsPsych.ALL_KEYS)) {
            var all_down = true;
            for(var i=0; i < trial.choices.length; i++) {
                all_down = all_down & (keys_down[trial.choices[i]] == true);
            }

            // check all keys
            if(all_down) {
                end_trial();
            }
        }
      };
  
      // start the response listener
      if (trial.choices != jsPsych.NO_KEYS) {
        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: 'performance',
          persist: true,
          allow_held_key: false, // don't record multiple 'down' events for the same key
          record_up: true 
        });
      }
  
      // hide stimulus if stimulus_duration is set
      if (trial.stimulus_duration !== null) {
        jsPsych.pluginAPI.setTimeout(function() {
          display_element.querySelector('#jspsych-html-keyboard-response-stimulus').style.visibility = 'hidden';
        }, trial.stimulus_duration);
      }
  
      // end trial if trial_duration is set
      if (trial.trial_duration !== null) {
        jsPsych.pluginAPI.setTimeout(function() {
          end_trial();
        }, trial.trial_duration);
      }
  
    };
  
    return plugin;
  })();
