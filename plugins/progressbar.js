console.log("progressbar loaded");
jsPsych.plugins["progressbar"] = (function() {

    // !!! NOTE !!! requires modified jsPsych client code bundled with this experiment,
    // which adds recording of 'up' events

    var plugin = {};
  
    plugin.info = {
      name: 'progressbar',
      description: '',
      parameters: {
        stimulus: {
          type: jsPsych.plugins.parameterType.HTML_STRING,
          pretty_name: 'Stimulus',
          default: undefined,
          description: 'The HTML string to be displayed'
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
        step: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Timestep to update progress bar',
          default: 5,
          description: 'The frequency at which the progress bar is updated with a new value.'
        }
  
      }
    }
  
    plugin.trial = function(display_element, trial) {
  
      // TODO: make these ordered properly

      var new_html = '<div id="progressbar-stimulus"><progress id="progressbar" value="0" max="100"></progress>'+trial.stimulus+'</div>';
      var startTime = jsPsych.totalTime(); 

      // draw
      display_element.innerHTML = new_html;

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

      var response = [];
      var after_response = function(info) {
        response.push(info);
      }

      // start the response listener
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: true,
        allow_held_key: false, // don't record multiple 'down' events for the same key
        record_up: true 
      });

      // set progressbar timeout
      var updateProgress = function() {
        var elapsed = jsPsych.totalTime() - startTime;
        var val = (elapsed / trial.stimulus_duration) * 100;
        display_element.querySelector('#progressbar').value = 100 - val;

        jsPsych.pluginAPI.setTimeout(updateProgress, trial.step);
      }

      // set initial progress bar state and timeout
      updateProgress();
  
      // hide stimulus if stimulus_duration is set
      if (trial.stimulus_duration !== null) {
        jsPsych.pluginAPI.setTimeout(function() {
          display_element.querySelector('#progressbar-stimulus').style.visibility = 'hidden';
          display_element.querySelector('#progressbar').style.visibility = 'hidden';
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
