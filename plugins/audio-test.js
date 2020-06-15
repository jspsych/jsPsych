console.log("audio test loaded");
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
      audio_file: {
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
    display_element.innerHTML += '<div id="audio-test-preamble" class="audio-test-preamble">' + trial.preamble + '</div>';

    // add audio element
    var str = '<audio id="audio-test-track" class="audio-test-track" controls> <source src="' + trial.audio_file + 
                                  '" type="audio/wav">Your browser does not support the our audio. We ask that you switch browsers or return to MTurk at this time.</audio>';
    console.log(str);
    display_element.innerHTML += str

    // add question and textbox for answer
    display_element.innerHTML += '<div id="audio-test-question" class="audio-test-question" style="margin: 2em 0em;">'+
      '<p class="audio-test-question">' + trial.questions + '</p>'+
      '<textarea name="#jspsych-free-recall-response" id="recall_box" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>'+
      '</div>';

    // set up response collection
    var failed = 0;

    var rts = [];
    var recalled_words = [];
    var key_presses = [];
    var key_times = [];

    var keyboard_listener = function(info) {
      // set up response collection
      key_presses.push(info.key)
      key_times.push(info.rt)
      console.log(info.key);

      if (info.key === ',' | info.key === 'Enter' | info.key === ';' | info.key === ' ') {

        // get response time (when participant presses enter)
        rts.push(info.rt);
        // get recalled word
        word = display_element.querySelector('textarea').value;
        recalled_words.push(word);

        // empty the contents of the textarea
        display_element.querySelector('textarea').value = '';

        if (word == trial.word.toLowerCase()) {
          display_element.querySelector('#audio-test-preamble').style.color = "#00ff00";
          display_element.querySelector('textarea').style.visibility = 'hidden';
          setTimeout(end_trial, 500);
        } else {
        	failed += 1;
          display_element.querySelector('#audio-test-preamble').style.color = "#ff0000";
          setTimeout(() => {
            display_element.querySelector('#audio-test-preamble').style.color = "";
          }, 500)

        	// empty the contents of the textarea
          display_element.querySelector('textarea').value = '';
          if (failed >= 4) {
            display_element.innerHTML += '<p id="warning">If you feel that you may be unable to complete the auditory portions of the task, we ask that you return to MTurk at this time.</p>';
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
        "recwords": recalled_words,
        "key_presses": key_presses,
        "key_times": key_times,
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
