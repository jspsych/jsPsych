jsPsych.plugins['audio-test'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'audio_test',
    description: '',
    parameters: {
      questions: {
        type: [jsPsych.plugins.parameterType.STRING],
        array: true,
        default: undefined,
        no_function: false,
        description: ''
      },
      premable: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      },
      word: {
      	type: [jsPsych.plugins.parameterType.STRING],
      	default: '',
      	no_function: false,
      	description: 'The word that needs to be entered to complete the audio test.'
      }
    }
  };

  plugin.trial = function(display_element, trial) {

    trial.preamble = typeof trial.preamble == 'undefined' ? "" : trial.preamble;
    if (typeof trial.rows == 'undefined') {
      trial.rows = [];
      for (var i = 0; i < trial.questions.length; i++) {
        trial.rows.push(1);
      }
    }
    if (typeof trial.columns == 'undefined') {
      trial.columns = [];
      for (var i = 0; i < trial.questions.length; i++) {
        trial.columns.push(40);
      }
    }

    // Default value for time limit option
    trial.duration = trial.duration || -1;
    // Time handlers
    var setTimeoutHandlers = [];

    // show preamble text
    display_element.innerHTML += '<div id="jspsych-free-recall-preamble" class="jspsych-free-recall-preamble">'+trial.preamble+'</div>';

    // add question and textbox for answer
    display_element.innerHTML += '<div id="jspsych-free-recall" class="jspsych-free-recall-question" style="margin: 2em 0em;">'+
      '<p class="jspsych-free-recall">' + trial.questions + '</p>'+
      '<textarea name="#jspsych-free-recall-response" id="recall_box" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>'+
      '</div>';

    // set up response collection
    var rts = [];
    var responses = [];
    var failed = 0;

    var keyboard_listener = function(info) {
       // set up response collection
      key_presses.push(info.key)
      key_times.push(info.rt)

      if (info.key=== ',' | info.key==='Enter' | info.key===';' | info.key===' ') {

        // get response time (when participant presses enter)
        rts.push(info.rt);
        // get recalled word
        word = display_element.querySelector('textarea').value;
        recalled_words.push(word);

        // empty the contents of the textarea
        display_element.querySelector('textarea').value = '';

        if (word == trial.word.toLowerCase()) {
        	end_trial();
        } else {
        	failed += 1;
        	// empty the contents of the textarea
          display_element.querySelector('textarea').value = '';
          if (failed >= 4) {
            alert('The word you entered does not match the word presented. Please try again.\n\nIf you feel that you may be unable to complete the auditory portions of the task, we ask that you return to MTurk at this time.');
          } else {
            alert('The word you entered does not match the word presented. Please try again.');
          }
        }

        return false;
      }
      
      return true;
    }

    // automatically place cursor in textarea when page loads
    $(function(){
    	$('textarea').focus();
    });

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
        "responses": responses
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: keyboard_listener,
              rt_method: "performance",
              allow_held_key: false,
              persist: true,
              propagate: true

        })

    if (trial.duration > 0) {
      var t2 = setTimeout(function() {
        end_trial();
      }, trial.duration);
      setTimeoutHandlers.push(t2);
    }

  };

  return plugin;
})();
