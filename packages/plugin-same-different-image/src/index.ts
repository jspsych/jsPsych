import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "same-different-image",
  version: version,
  parameters: {
    /** A pair of stimuli, represented as an array with two entries,
     * one for each stimulus. The stimulus is a path to an image file.
     * Stimuli will be shown in the order that they are defined in the array. */
    stimuli: {
      type: ParameterType.IMAGE,
      default: undefined,
      array: true,
    },
    /** Either `'same'` or `'different'`. */
    answer: {
      type: ParameterType.SELECT,
      options: ["same", "different"],
      default: undefined,
    },
    /** The key that subjects should press to indicate that the two stimuli are the same. */
    same_key: {
      type: ParameterType.KEY,
      default: "q",
    },
    /** The key that subjects should press to indicate that the two stimuli are different. */
    different_key: {
      type: ParameterType.KEY,
      default: "p",
    },
    /** How long to show the first stimulus for in milliseconds. If the value of this parameter is null then the stimulus will be shown until the participant presses any key. */
    first_stim_duration: {
      type: ParameterType.INT,
      default: 1000,
    },
    /** How long to show a blank screen in between the two stimuli */
    gap_duration: {
      type: ParameterType.INT,
      default: 500,
    },
    /** How long to show the second stimulus for in milliseconds. If null, then the stimulus will remain on the screen until a valid response is made. */
    second_stim_duration: {
      type: ParameterType.INT,
      default: 1000,
    },
    /** This string can contain HTML markup. Any content here will be displayed
     * below the stimulus. The intention is that it can be used to provide a
     * reminder about the action the participant is supposed to take
     * (e.g., which key to press). */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
  },
  data: {
    /** An array of length 2 containing the paths to the image files that the participant saw for each trial.
     * This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
    stimulus: {
      type: ParameterType.STRING,
      array: true,
    },
    /** Indicates which key the participant pressed.  */
    response: {
      type: ParameterType.STRING,
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the second stimulus first appears on the screen until the participant's response. */
    rt: {
      type: ParameterType.INT,
    },
    /** `true` if the participant's response matched the `answer` for this trial. */
    correct: {
      type: ParameterType.BOOL,
    },
    /** The correct answer to the trial, either `'same'` or `'different'`. */
    answer: {
      type: ParameterType.STRING,
    },
  },
};

type Info = typeof info;

/**
 * The same-different-image plugin displays two stimuli sequentially. Stimuli are images.
 * The participant responds using the keyboard, and indicates whether the stimuli were the
 * same or different. Same does not necessarily mean identical; a category judgment could be
 * made, for example.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/same-different-image/ same-different-image plugin documentation on jspsych.org}
 */
class SameDifferentImagePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const showBlankScreen = () => {
      display_element.innerHTML = "";

      this.jsPsych.pluginAPI.setTimeout(showSecondStim, trial.gap_duration);
    };

    display_element.innerHTML =
      '<img class="jspsych-same-different-stimulus" src="' + trial.stimuli[0] + '"></img>';

    var first_stim_info: { key: string; rt: number };
    if (trial.first_stim_duration > 0) {
      this.jsPsych.pluginAPI.setTimeout(showBlankScreen, trial.first_stim_duration);
    } else {
      const afterKeyboardResponse = (info: { key: string; rt: number }) => {
        first_stim_info = info;
        showBlankScreen();
      };
      this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: afterKeyboardResponse,
        valid_responses: "ALL_KEYS",
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
    }

    const showSecondStim = () => {
      var html =
        '<img class="jspsych-same-different-stimulus" src="' + trial.stimuli[1] + '"></img>';
      //show prompt
      if (trial.prompt !== null) {
        html += trial.prompt;
      }

      display_element.innerHTML = html;

      if (trial.second_stim_duration > 0) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          display_element.querySelector<HTMLElement>(
            ".jspsych-same-different-stimulus"
          ).style.visibility = "hidden";
        }, trial.second_stim_duration);
      }

      const after_response = (info: { key: string; rt: number }) => {
        var correct = false;

        var skey = trial.same_key;
        var dkey = trial.different_key;

        if (this.jsPsych.pluginAPI.compareKeys(info.key, skey) && trial.answer == "same") {
          correct = true;
        }

        if (this.jsPsych.pluginAPI.compareKeys(info.key, dkey) && trial.answer == "different") {
          correct = true;
        }

        var trial_data = {
          rt: info.rt,
          answer: trial.answer,
          correct: correct,
          stimulus: [trial.stimuli[0], trial.stimuli[1]],
          response: info.key,
        };
        if (first_stim_info) {
          trial_data["rt_stim1"] = first_stim_info.rt;
          trial_data["response_stim1"] = first_stim_info.key;
        }

        this.jsPsych.finishTrial(trial_data);
      };

      this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.same_key, trial.different_key],
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
    };
  }

  simulate(
    trial: TrialType<Info>,
    simulation_mode,
    simulation_options: any,
    load_callback: () => void
  ) {
    if (simulation_mode == "data-only") {
      load_callback();
      this.simulate_data_only(trial, simulation_options);
    }
    if (simulation_mode == "visual") {
      this.simulate_visual(trial, simulation_options, load_callback);
    }
  }

  private create_simulation_data(trial: TrialType<Info>, simulation_options) {
    const key = this.jsPsych.pluginAPI.getValidKey([trial.same_key, trial.different_key]);

    const default_data = <any>{
      stimuli: trial.stimuli,
      response: key,
      answer: trial.answer,
      correct: trial.answer == "same" ? key == trial.same_key : key == trial.different_key,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
    };

    if (trial.first_stim_duration == null) {
      default_data.rt_stim1 = this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true);
      default_data.response_stim1 = this.jsPsych.pluginAPI.getValidKey([
        trial.same_key,
        trial.different_key,
      ]);
    }

    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);

    this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);

    return data;
  }

  private simulate_data_only(trial: TrialType<Info>, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);

    this.jsPsych.finishTrial(data);
  }

  private simulate_visual(trial: TrialType<Info>, simulation_options, load_callback: () => void) {
    const data = this.create_simulation_data(trial, simulation_options);

    const display_element = this.jsPsych.getDisplayElement();

    this.trial(display_element, trial);
    load_callback();

    if (trial.first_stim_duration == null) {
      this.jsPsych.pluginAPI.pressKey(data.response_stim1, data.rt_stim1);
    }

    this.jsPsych.pluginAPI.pressKey(
      data.response,
      trial.first_stim_duration + trial.gap_duration + data.rt
    );
  }
}

export default SameDifferentImagePlugin;
