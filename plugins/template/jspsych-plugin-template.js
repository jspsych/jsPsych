/*
 * Example plugin template
 */
 var jsPsych = window.jsPsych || require('jspsych');

 (function (root, factory) {
   if(typeof define === "function" && define.amd) {
      define([], factory);
   } else if(typeof module === "object" && module.exports) {
      module.exports = factory;
   } else {
      root.jsPsych.plugins["PLUGIN-NAME"] = factory;  // modify with your plugin name
   }
 }(this, (function() {

  var plugin = {};

  plugin.info = {
    name: "PLUGIN-NAME",
    parameters: {
      parameter_name: {
        type: jsPsych.plugins.parameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: undefined
      },
      parameter_name: {
        type: jsPsych.plugins.parameterType.IMAGE,
        default: undefined
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // data saving
    var trial_data = {
      parameter_name: 'parameter value'
    };

    // end trial
    jsPsych.finishTrial(trial_data);
  };

  return plugin;
})()
));
