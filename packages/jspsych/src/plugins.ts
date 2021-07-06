// enumerate possible parameter types for plugins
export const parameterType = {
  BOOL: 0,
  STRING: 1,
  INT: 2,
  FLOAT: 3,
  FUNCTION: 4,
  KEY: 5,
  SELECT: 6,
  HTML_STRING: 7,
  IMAGE: 8,
  AUDIO: 9,
  VIDEO: 10,
  OBJECT: 11,
  COMPLEX: 12,
  TIMELINE: 13,
};

export const universalPluginParameters = {
  data: {
    type: parameterType.OBJECT,
    pretty_name: "Data",
    default: {},
    description: "Data to add to this trial (key-value pairs)",
  },
  on_start: {
    type: parameterType.FUNCTION,
    pretty_name: "On start",
    default: function () {
      return;
    },
    description: "Function to execute when trial begins",
  },
  on_finish: {
    type: parameterType.FUNCTION,
    pretty_name: "On finish",
    default: function () {
      return;
    },
    description: "Function to execute when trial is finished",
  },
  on_load: {
    type: parameterType.FUNCTION,
    pretty_name: "On load",
    default: function () {
      return;
    },
    description: "Function to execute after the trial has loaded",
  },
  post_trial_gap: {
    type: parameterType.INT,
    pretty_name: "Post trial gap",
    default: null,
    description: "Length of gap between the end of this trial and the start of the next trial",
  },
  css_classes: {
    type: parameterType.STRING,
    pretty_name: "Custom CSS classes",
    default: null,
    description:
      "A list of CSS classes to add to the jsPsych display element for the duration of this trial",
  },
};
