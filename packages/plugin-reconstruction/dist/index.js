import { ParameterType } from 'jspsych';

var version = "2.1.0";

const info = {
  name: "reconstruction",
  version,
  parameters: {
    /** A function with a single parameter that returns an HTML-formatted string representing the stimulus. */
    stim_function: {
      type: ParameterType.FUNCTION,
      default: void 0
    },
    /** The starting value of the stimulus parameter. */
    starting_value: {
      type: ParameterType.FLOAT,
      default: 0.5
    },
    /** The change in the stimulus parameter caused by pressing one of the modification keys. */
    step_size: {
      type: ParameterType.FLOAT,
      default: 0.05
    },
    /** The key to press for increasing the parameter value. */
    key_increase: {
      type: ParameterType.KEY,
      default: "h"
    },
    /** The key to press for decreasing the parameter value. */
    key_decrease: {
      type: ParameterType.KEY,
      default: "g"
    },
    /** The text that appears on the button to finish the trial. */
    button_label: {
      type: ParameterType.STRING,
      default: "Continue"
    }
  },
  data: {
    /** The starting value of the stimulus parameter. */
    start_value: {
      type: ParameterType.INT
    },
    /** The final value of the stimulus parameter. */
    final_value: {
      type: ParameterType.INT
    },
    /** The length of time, in milliseconds, that the trial lasted. */
    rt: {
      type: ParameterType.INT
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class ReconstructionPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    var param = trial.starting_value;
    const endTrial = () => {
      var endTime = performance.now();
      var response_time = Math.round(endTime - startTime);
      this.jsPsych.pluginAPI.cancelKeyboardResponse(key_listener);
      var trial_data = {
        rt: response_time,
        final_value: param,
        start_value: trial.starting_value
      };
      this.jsPsych.finishTrial(trial_data);
    };
    const draw = (param2) => {
      display_element.innerHTML = '<div id="jspsych-reconstruction-stim-container">' + trial.stim_function(param2) + "</div>";
      display_element.innerHTML += '<button id="jspsych-reconstruction-next" class="jspsych-btn jspsych-reconstruction">' + trial.button_label + "</button>";
      display_element.querySelector("#jspsych-reconstruction-next").addEventListener("click", endTrial);
    };
    const after_response = (info2) => {
      var key_i = trial.key_increase;
      var key_d = trial.key_decrease;
      if (this.jsPsych.pluginAPI.compareKeys(info2.key, key_i)) {
        param = param + trial.step_size;
      } else if (this.jsPsych.pluginAPI.compareKeys(info2.key, key_d)) {
        param = param - trial.step_size;
      }
      param = Math.max(Math.min(1, param), 0);
      draw(param);
    };
    var key_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: [trial.key_increase, trial.key_decrease],
      rt_method: "performance",
      persist: true,
      allow_held_key: true
    });
    draw(param);
    var startTime = performance.now();
  }
  simulate(trial, simulation_mode, simulation_options, load_callback) {
    if (simulation_mode == "data-only") {
      load_callback();
      this.simulate_data_only(trial, simulation_options);
    }
    if (simulation_mode == "visual") {
      this.simulate_visual(trial, simulation_options, load_callback);
    }
  }
  create_simulation_data(trial, simulation_options) {
    const default_data = {
      rt: this.jsPsych.randomization.sampleExGaussian(2e3, 200, 1 / 200, true),
      start_value: trial.starting_value,
      final_value: this.jsPsych.randomization.randomInt(0, Math.round(1 / trial.step_size)) * trial.step_size
    };
    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
    this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
    return data;
  }
  simulate_data_only(trial, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);
    this.jsPsych.finishTrial(data);
  }
  simulate_visual(trial, simulation_options, load_callback) {
    const data = this.create_simulation_data(trial, simulation_options);
    const display_element = this.jsPsych.getDisplayElement();
    this.trial(display_element, trial);
    load_callback();
    let steps = Math.round((data.final_value - trial.starting_value) / trial.step_size);
    const rt_per_step = (data.rt - 300) / steps;
    let t = 0;
    while (steps != 0) {
      if (steps > 0) {
        this.jsPsych.pluginAPI.pressKey(trial.key_increase, t + rt_per_step);
        steps--;
      } else {
        this.jsPsych.pluginAPI.pressKey(trial.key_decrease, t + rt_per_step);
        steps++;
      }
      t += rt_per_step;
    }
    this.jsPsych.pluginAPI.clickTarget(
      display_element.querySelector("#jspsych-reconstruction-next"),
      data.rt
    );
  }
}

export { ReconstructionPlugin as default };
//# sourceMappingURL=index.js.map
