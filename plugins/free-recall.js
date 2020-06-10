jsPsych.plugins['free-recall'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'free-recall',
    description: '',
    parameters: {
      preamble: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'The maximum duration to wait for a response.'
      },
      max_length: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Minimum response length',
        default: 12,
        description: "The minimum number of letters that must be entered for a response to be logged."
      },
      min_length: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Minimum response length',
        default: 1,
        description: "The minimum number of letters that must be entered for a response to be logged."
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    trial.preamble = typeof trial.preamble == 'undefined' ? "" : trial.preamble;

    // Default value for time limit option
    trial.trial_duration = trial.trial_duration || -1;
    // Time handlers
    var setTimeoutHandlers = [];

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    // trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // show preamble text
    display_element.innerHTML += '<div id="jspsych-free-recall-preamble" class="jspsych-free-recall-preamble">'+trial.preamble+'</div>';

    // add question and textbox for answer
    display_element.innerHTML += '<div id="jspsych-free-recall" class="jspsych-free-recall-question" style="margin: 2em 0em;">'+
      '<input name="jspsych-free-recall-response" id="recall_box" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" pattern=".{' + trial.min_length + ',' + trial.max_length + '}" required autofocus>'+
      '</div>';

    // set up response collection
    var rts = [];
    var recalled_words = [];
    var key_presses = [];
    var key_times = [];

    $(function(){
      $('input').focus();
    })

    var keyboard_listener = function(info) {
       // set up response collection
      key_presses.push(info.key)
      key_times.push(info.rt)

      if (info.key=== ',' | info.key==='Enter' | info.key===';' | info.key===' ') {
        word = document.querySelector('#recall_box').value;

        if(word.length >= trial.min_length && word.length <= trial.max_length) {
          // get response time (when participant presses enter)
          rts.push(info.rt);
          // get recalled word

          word = document.querySelector('#recall_box').value;
          recalled_words.push(word);

          // empty the contents of the textarea
          document.querySelector('#recall_box').value = '';
        }

        return false;
      }
      
      return true;
    }

    var end_trial = function() {
      // kill any remaining setTimeout handlers
      for (var i = 0; i < setTimeoutHandlers.length; i++) {
        clearTimeout(setTimeoutHandlers[i]);
      }

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // clear the display
      display_element.innerHTML = '';

      // gather the data to store for the trial
      var trial_data = {
        "rt": rts,
        "recwords": recalled_words,
        "key_presses": key_presses,
        "key_times": key_times,
        "start_time": startTime,
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    var startTime = jsPsych.totalTime();
    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: keyboard_listener,
              rt_method: "performance",
              allow_held_key: false,
              persist: true,
              propagate: true

        })

    if (trial.trial_duration > 0) {
      var t2 = setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
      setTimeoutHandlers.push(t2);
    }

  };


  return plugin;
})();
