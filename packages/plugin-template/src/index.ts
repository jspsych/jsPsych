import jsPsych from "jspsych";

const plugin = <any>{};

plugin.info = {
  name: "PLUGIN-NAME",
  parameters: {
    parameter_name: {
      type: jsPsych.plugins.parameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      default: undefined,
    },
    parameter_name2: {
      type: jsPsych.plugins.parameterType.IMAGE,
      default: undefined,
    },
  },
};

plugin.trial = function (display_element, trial) {
  // data saving
  var trial_data = {
    parameter_name: "parameter value",
  };

  // end trial
  jsPsych.finishTrial(trial_data);
};

export default plugin;
