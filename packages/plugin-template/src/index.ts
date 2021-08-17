import { JsPsych, JsPsychPlugin, TrialType, parameterType } from "jspsych";

const info = <const>{
  name: "PLUGIN-NAME",
  parameters: {
    parameter_name: {
      type: parameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      default: undefined,
    },
    parameter_name2: {
      type: parameterType.IMAGE,
      default: undefined,
    }
  }
};

type Info = typeof info;

/* Plugin description and author */
class PluginNamePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {};

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // data saving
    var trial_data = {
      parameter_name: "parameter value",
    };

    // end trial
    this.jsPsych.finishTrial(trial_data);
  };
}

export default PluginNamePlugin;
