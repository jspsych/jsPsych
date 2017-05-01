/* jspsych-fullscreen.js
 * Josh de Leeuw
 *
 * toggle fullscreen mode in the browser
 *
 */

jsPsych.plugins.fullscreen = (function() {

  var plugin = {};

  plugin.info = {
    name: 'fullscreen',
    description: '',
    parameters: {
      pages: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: undefined,
        array: true,
        no_function: false,
        description: ''
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    trial.fullscreen_mode = typeof trial.fullscreen_mode === 'undefinded' ? true : trial.fullscreen_mode;
    trial.message = trial.message || '';
    trial.button_label = trial.button_label || '';
    trial.delay_after = trial.delay_after || 1000;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // check if keys are allowed in fullscreen mode
    var keyboardNotAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element;
    if (keyboardNotAllowed) {
      // This is Safari, and keyboard events will be disabled. Don't allow fullscreen here.
      // do something else?
      endTrial();
    } else {
      if(trial.fullscreen_mode){
        display_element.innerHTML = trial.message + '<button id="jspsych-fullscreen-btn" class="jspsych-btn">'+trial.button_label+'</button>';
        var listener = display_element.querySelector('#jspsych-fullscreen-btn').addEventListener('click', function() {
          var element = document.documentElement;
          if (element.requestFullscreen) {
            element.requestFullscreen();
          } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
          } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
          } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
          }
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
      endTrial();
    }

    function endTrial() {
      jsPsych.pluginAPI.setTimeout(function(){

        display_element.innerHTML = '';

        var trial_data = {
          success: !keyboardNotAllowed
        };

        jsPsych.finishTrial(trial_data);

      }, trial.delay_after);
    }

  };

  return plugin;
})();
