/*--------------Plugin for displaying HTML content at grid positions--------------*/

jsPsych.plugins["positional-html-display"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "positional-html-display",
    parameters: {
        stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: undefined,
        pretty_name: 'Stimulus', 
        description: 'The word, or list of words, to be displayed.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial'
      },
      grid_rows: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Display Rows',
        default: null,
        description: 'Rows in grid'
      },
      grid_cols: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Display Columns',
        default: null,
        description: 'Columns in grid'
      },
      row: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Display Row',
        default: 0,
        description: 'Row to display html'
      },
      col: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Display Column',
        default: 0,
        description: 'Column to display html'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    var time_elapsed = jsPsych.totalTime();
    var start_time = performance.now(); //time elapsed since origin (window-load)

    var keys_down = {};

    var response = [];
    var held_over = [];
    for (let [key, value] of Object.entries(jsPsych.pluginAPI.getHeldKeys())) {
        if(value == true) {
          held_over.push(parseInt(key))
        }
    }

  /*------------Check Sizing------------------*/

    var css_grid = "<style>#container {display: grid; grid-template-columns: repeat(" + trial.grid_cols + ", 1fr); grid-template-rows: repeat(" + trial.grid_rows + ", 1fr); width: 95vw; height: 95vh; align-items:center} </style>";

    if(trial.row > trial.grid_rows  || trial.col > trial.grid_cols) {
      throw "Grid index out of range";
    }
  
  /*------------Container Element-------------*/
  
    var display_element = jsPsych.getDisplayElement(); 

    //creating a new element to house the stimulus words
    var container = '<div id="container">' + css_grid + '<div id="stimulus">' + trial.stimulus + '</div>' + '</div>';

    display_element.innerHTML = container;
    var stim = display_element.querySelector("#container").querySelector("#stimulus");
    stim.style.gridRow = trial.row;
    stim.style.gridColumn = trial.col;
    stim.style.textAlign = "center";
    stim.style.marginTop = "0px"
    stim.style.marginBottom = "0px"
    stim.style.alignSelf = "center";
    stim.style.fontSize = (95/trial.grid_rows) + "vh";

    var after_response = function(info) {
        response.push(info);
        keys_down[info.key] = info.down;
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
    /*------------Word Display-------------*/

    //hides stimulus after stimulus duration 
    if (trial.stimulus_duration !== null) { 
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector("#container").style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }
  
    // function to end trial when it is time
    var end_trial = function() {
      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

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

      // add all data to trial
      var trial_data = { 
        "held_over": held_over, // keys held over from the last trial
        "key_up": key_up, 
        "key_down": key_down,
        "rt_up": rt_up,
        "rt_down": rt_down,
        "row": trial.row,
        "col": trial.col,
        "grid_rows": trial.grid_rows,
        "grid_cols": trial.grid_cols,
        "stimulus": trial.stimulus,
        "start_time": time_elapsed 
      }; 

      //clears display 
      display_element.innerHTML = ''; 
      //move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }
  };

  return plugin;
})();
