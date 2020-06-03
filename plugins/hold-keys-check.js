jsPsych.plugins["hold-keys-check"] = (function() {

    // !!! NOTE !!! requires modified jsPsych client code bundled with this experiment,
    // which adds recording of 'up' events

    var plugin = {};
  
    plugin.info = {
      name: 'hold-keys-check',
      description: '',
      parameters: {
        message_true: {
          type: jsPsych.plugins.parameterType.HTML_STRING,
          pretty_name: 'Stimulus',
          default: '',
          description: 'The HTML string to be displayed'
        },
        message_false: {
          type: jsPsych.plugins.parameterType.HTML_STRING,
          pretty_name: 'Stimulus',
          default: '',
          description: 'The HTML string to be displayed'
        },
        keys: {
          type: jsPsych.plugins.parameterType.KEYCODE,
          array: true,
          pretty_name: 'keys',
          default: undefined, 
          description: 'The keys the subject must hold to respond to the stimulus.'
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
      }
    }
  
    plugin.trial = function(display_element, trial) {
  
      var held_over = [];
      for (let [key, value] of Object.entries(jsPsych.pluginAPI.getHeldKeys())) {
          if(value == true) {
            held_over.push(key)
          }
      }

      var all_down = true;
      for(var i=0; i < trial.keys.length; i++) {
        down = false;
        for(var j=0; j < held_over.length; j++) {
            if(trial.keys[i] == held_over[j]) {
              down = true;
              break;
            }
        }
        all_down = all_down & down;
      }

      // add prompt
      if(all_down) {     
        display_element.innerHTML = trial.message_true
      }
      else {
        display_element.innerHTML = trial.message_false
      }

      // function to end trial when it is time
      var end_trial = function() {
  
        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();
  

        // gather the data to store for the trial
        var trial_data = {
          "held_over": held_over, // keys held over from the last trial
          "all_down": all_down,
          "to_hold": trial.keys,
        };
  
        // clear the display
        display_element.innerHTML = '';
  
        // move on to the next trial
        jsPsych.finishTrial(trial_data);
      };

      // end trial if trial_duration is set
      if (trial.trial_duration !== null) {
        jsPsych.pluginAPI.setTimeout(function() {
          end_trial();
        }, trial.trial_duration);
      }
  
    };
  
    return plugin;
  })();
