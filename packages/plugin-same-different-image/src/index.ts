import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "same-different-image",
  parameters: {
    /** Array containing the images to be displayed. */
    stimuli: {
      type: ParameterType.IMAGE,
      pretty_name: "Stimuli",
      default: undefined,
      array: true,
    },
    /** Correct answer: either "same" or "different". */
    answer: {
      type: ParameterType.SELECT,
      pretty_name: "Answer",
      options: ["same", "different"],
      default: undefined,
    },
    /** The key that subjects should press to indicate that the two stimuli are the same. */
    same_key: {
      type: ParameterType.KEY,
      pretty_name: "Same key",
      default: "q",
    },
    /** The key that subjects should press to indicate that the two stimuli are different. */
    different_key: {
      type: ParameterType.KEY,
      pretty_name: "Different key",
      default: "p",
    },
    /** How long to show the first stimulus for in milliseconds. If null, then the stimulus will remain on the screen until any keypress is made. */
    first_stim_duration: {
      type: ParameterType.INT,
      pretty_name: "First stimulus duration",
      default: 1000,
    },
    /** How long to show a blank screen in between the two stimuli */
    gap_duration: {
      type: ParameterType.INT,
      pretty_name: "Gap duration",
      default: 500,
    },
    /** How long to show the second stimulus for in milliseconds. If null, then the stimulus will remain on the screen until a valid response is made. */
    second_stim_duration: {
      type: ParameterType.INT,
      pretty_name: "Second stimulus duration",
      default: 1000,
    },
    /** Any content here will be displayed below the stimulus. */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null,
    },
  },
};

type Info = typeof info;

/**
 * **same-different-image**
 *
 * jsPsych plugin for showing two image stimuli sequentially and getting a same / different judgment via keypress
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-same-different-image/ same-different-image plugin documentation on jspsych.org}
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
        // kill any remaining setTimeout handlers
        this.jsPsych.pluginAPI.clearAllTimeouts();

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

        display_element.innerHTML = "";

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
