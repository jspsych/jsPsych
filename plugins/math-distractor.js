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
      }
    }
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
    var tbox = '<input id="math_box" type="number"></div>'
    var timed_out = false;

    var gen_trial = function() {
      // setup question and response box
      var nums = [randomInt(1,10), randomInt(1,10), randomInt(1,10)];
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

    var keyboard_listener = function(info) {
       // set up response collection
       console.log(info.key)
      if (info.key=== ' ' | info.key=== ';' | info.key === 'Enter' | info.key===',') {

        // get response time (when participant presses enter)
        rts.push(info.rt);
        // get recalled word
        word = display_element.querySelector('#math_box').value;
        recalled_words.push(word);

        // generate new problem
        if(timed_out) {
          end_trial()
        }
        else {
          gen_trial()
        }
        return false
      }
      return true
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
