jsPsych.plugins["countdown"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'countdown',
    description: '',
    parameters: {
      seconds: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'seconds',
        default: 10,
        description: 'The number of seconds to count down'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // hide stimulus if stimulus_duration is set
    var number = trial.seconds
    var callback = function() {
      display_element.innerHTML = "<p id='stim'>" + number.toString() + "</p>";
      number--
      jsPsych.pluginAPI.setTimeout(callback, 1000);
    }

    callback()

    jsPsych.pluginAPI.setTimeout(function() {
      end_trial();
    }, trial.seconds * 1000);
  };

  return plugin;
})();
