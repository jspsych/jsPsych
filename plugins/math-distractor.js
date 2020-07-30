jsPsych.plugins['math-distractor'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'math-distractor',
    description: '',
    parameters: {
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'The maximum duration to wait for a response.'
      },
      audio_correct: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Audio to play when a correct response is entered',
        default: null,
        description: 'Audio to play when a correct response is entered'
      },
      audio_incorrect: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Audio to play when an incorrect response is entered',
        default: null,
        description: 'Audio to play when an incorrect response is entered'
      }
    },
  }

  plugin.trial = function(display_element, trial) {

    // Default value for time limit option
    trial.trial_duration = trial.trial_duration || -1;
    // Time handlers
    var setTimeoutHandlers = [];

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    // trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    var rts = [];
    var recalled_words = [];
    var num_a = [];
    var num_b = [];
    var num_c = [];
    var tbox = '<input class="task_input" id="math_box"></div>'
    var timed_out = false;
    var current_answer;

    var gen_trial = function() {
      // setup question and response box
      var nums = [randomInt(1,10), randomInt(1,10), randomInt(1,10)];
      current_answer = nums.reduce(function(a, b){ return a + b; }, 0);
      var prob = '<div id="math"><label>' + nums[0].toString() + ' + ' + nums[1].toString() + ' + ' + nums[2].toString() + ' = </label>';
      display_element.innerHTML = prob + tbox;

      // log the new problem
      num_a.push(nums[0]);
      num_b.push(nums[1]);
      num_c.push(nums[2]);

      // automatically place cursor in textarea when page loads
      $(function(){
        $('input').focus();
      });
    };

    var isdigit = function(char){
      return /^\d$/.test(char);
    }


    var keyboard_listener = function(info) {
       // set up response collection
       console.log(info.key)
      if (info.key=== ' ' | info.key=== ';' | info.key === 'Enter' | info.key===',') {

        // get recalled word
        word = display_element.querySelector('#math_box').value;

        if(word.length == 0) {
          return false;
        }

        // get response time (when participant presses enter)
        rts.push(info.rt);
        recalled_words.push(word);

        var callback = function() {
          display_element.querySelector('#math').style.color = "#ffffff";
          display_element.querySelector('#math_box').style.color = "#ffffff";
          if(timed_out) {
            end_trial();
          } else {
            gen_trial();
          }
        }


        // TODO: play beep and change text color
        if(word == current_answer) {
          display_element.querySelector('#math').style.color = "#00ff00";
          display_element.querySelector('#math_box').style.color = "#00ff00";

          if(trial.audio_correct != null) {
            var audio = new Audio(trial.audio_correct);
            audio.onended = callback;
            audio.play();
          } else {
            setTimeout(callback, 500);
          }
        }
        else {
          display_element.querySelector('#math').style.color = "#ff0000";
          display_element.querySelector('#math_box').style.color = "#ff0000";

          if(trial.audio_incorrect != null) {
            var audio = new Audio(trial.audio_incorrect);
            audio.onended = callback;
            audio.play();
          } else {
            setTimeout(callback, 500);
          }
        }

        return false
      }
      else if (isdigit(info.key) || info.key == 'Backspace'){
          return true;
      }
      return false;
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
        "responses": recalled_words,
        "num1": num_a,
        "num2": num_b,
        "num3": num_c,
        "start_time": startTime  
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
    gen_trial();

    if (trial.trial_duration > 0) {
      var t2 = setTimeout(function() {
        timed_out = true;
      }, trial.trial_duration);
      setTimeoutHandlers.push(t2);
    }

  };


  return plugin;
})();
