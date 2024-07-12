import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "visual-search-circle",
  version: version,
  parameters: {
    /**
     * Path to image file that is the search target. This parameter must specified when the stimuli set is
     * defined using the `target`, `foil` and `set_size` parameters, but should NOT be specified when using
     * the `stimuli` parameter.
     */
    target: {
      type: ParameterType.IMAGE,
      default: null,
    },
    /**
     * Path to image file that is the foil/distractor. This image will be repeated for all distractors up to
     * the `set_size` value. This parameter must specified when the stimuli set is defined using the `target`,
     * `foil` and `set_size` parameters, but should NOT be specified when using the `stimuli` parameter.
     */
    foil: {
      type: ParameterType.IMAGE,
      default: null,
    },
    /**
     * How many items should be displayed, including the target when `target_present` is `true`. The foil
     * image will be repeated up to this value when `target_present` is `false`, or up to `set_size - 1`
     * when `target_present` is `true`. This parameter must specified when using the `target`, `foil` and
     * `set_size` parameters to define the stimuli set, but should NOT be specified when using the `stimuli`
     * parameter.
     */
    set_size: {
      type: ParameterType.INT,
      default: null,
    },
    /**
     * Array containing all of the image files to be displayed. This parameter must be specified when NOT
     * using the `target`, `foil`, and `set_size` parameters to define the stimuli set.
     */
    stimuli: {
      type: ParameterType.IMAGE,
      default: [],
      array: true,
    },
    /**
     * Is the target present? This parameter must always be specified. When using the `target`, `foil` and
     * `set_size` parameters, `false` means that the foil image will be repeated up to the set_size, and
     * `true` means that the target will be presented along with the foil image repeated up to set_size - 1.
     * When using the `stimuli` parameter, this parameter is only used to determine the response accuracy.
     */
    target_present: {
      type: ParameterType.BOOL,
      default: undefined,
    },
    /**
     * Path to image file that is a fixation target. This parameter must always be specified.
     */
    fixation_image: {
      type: ParameterType.IMAGE,
      default: undefined,
    },
    /** Two element array indicating the height and width of the search array element images. */
    target_size: {
      type: ParameterType.INT,
      array: true,
      default: [50, 50],
    },
    /** Two element array indicating the height and width of the fixation image. */
    fixation_size: {
      type: ParameterType.INT,
      array: true,
      default: [16, 16],
    },
    /** The diameter of the search array circle in pixels. */
    circle_diameter: {
      type: ParameterType.INT,
      default: 250,
    },
    /** The key to press if the target is present in the search array. */
    target_present_key: {
      type: ParameterType.KEY,
      default: "j",
    },
    /** The key to press if the target is not present in the search array. */
    target_absent_key: {
      type: ParameterType.KEY,
      default: "f",
    },
    /** The maximum amount of time the participant is allowed to search before the trial will continue. A value
     * of null will allow the participant to search indefinitely.
     */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** How long to show the fixation image for before the search array (in milliseconds). */
    fixation_duration: {
      type: ParameterType.INT,
      default: 1000,
    },
    /** If true, the trial will end when the participant makes a response. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: true,
    },
  },
  data: {
    /** True if the participant gave the correct response. */
    correct: {
      type: ParameterType.BOOL,
    },
    /** Indicates which key the participant pressed. */
    response: {
      type: ParameterType.STRING,
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
    rt: {
      type: ParameterType.INT,
    },
    /** The number of items in the search array. */
    set_size: {
      type: ParameterType.INT,
    },
    /** True if the target is present in the search array. */
    target_present: {
      type: ParameterType.BOOL,
    },
    /** Array where each element is the pixel value of the center of an image in the search array. If the target is present, then the first element will represent the location of the target. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
    locations: {
      type: ParameterType.INT,
      array: true,
    },
  },
};

type Info = typeof info;

/**
 * This plugin presents a customizable visual-search task modelled after [Wang, Cavanagh, & Green (1994)](http://dx.doi.org/10.3758/BF03206946).
 * The participant indicates whether or not a target is present among a set of distractors. The stimuli are displayed in a circle, evenly-spaced,
 * equidistant from a fixation point. Here is an example using normal and backward Ns:
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/visual-search-circle/ visual-search-circle plugin documentation on jspsych.org}
 **/
class VisualSearchCirclePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var paper_size = trial.circle_diameter + trial.target_size[0];

    // fixation location
    var fix_loc = this.generateFixationLoc(trial);

    // check for correct combination of parameters and create stimuli set
    var to_present = this.generatePresentationSet(trial);

    // stimulus locations on the circle
    var display_locs = this.generateDisplayLocs(to_present.length, trial);

    // get target to draw on
    display_element.innerHTML +=
      '<div id="jspsych-visual-search-circle-container" style="position: relative; width:' +
      paper_size +
      "px; height:" +
      paper_size +
      'px"></div>';
    var paper = display_element.querySelector("#jspsych-visual-search-circle-container");

    const show_fixation = () => {
      // show fixation
      //var fixation = paper.image(trial.fixation_image, fix_loc[0], fix_loc[1], trial.fixation_size[0], trial.fixation_size[1]);
      paper.innerHTML +=
        "<img src='" +
        trial.fixation_image +
        "' style='position: absolute; top:" +
        fix_loc[0] +
        "px; left:" +
        fix_loc[1] +
        "px; width:" +
        trial.fixation_size[0] +
        "px; height:" +
        trial.fixation_size[1] +
        "px;'></img>";

      // wait
      this.jsPsych.pluginAPI.setTimeout(() => {
        // after wait is over
        show_search_array();
      }, trial.fixation_duration);
    };

    const response = {
      rt: null,
      key: null,
      correct: false,
    };

    const end_trial = () => {
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();

      // data saving
      const trial_data = {
        correct: response.correct,
        rt: response.rt,
        response: response.key,
        locations: display_locs,
        target_present: trial.target_present,
        set_size: trial.set_size,
      };

      // go to next trial
      this.jsPsych.finishTrial(trial_data);
    };

    show_fixation();

    const show_search_array = () => {
      for (var i = 0; i < display_locs.length; i++) {
        paper.innerHTML +=
          "<img src='" +
          to_present[i] +
          "' style='position: absolute; top:" +
          display_locs[i][0] +
          "px; left:" +
          display_locs[i][1] +
          "px; width:" +
          trial.target_size[0] +
          "px; height:" +
          trial.target_size[1] +
          "px;'></img>";
      }

      const after_response = (info: { key: string; rt: number }) => {
        var correct = false;

        if (
          (this.jsPsych.pluginAPI.compareKeys(info.key, trial.target_present_key) &&
            trial.target_present) ||
          (this.jsPsych.pluginAPI.compareKeys(info.key, trial.target_absent_key) &&
            !trial.target_present)
        ) {
          correct = true;
        }

        response.rt = info.rt;
        response.key = info.key;
        response.correct = correct;

        if (trial.response_ends_trial) {
          end_trial();
        }
      };

      const valid_keys = [trial.target_present_key, trial.target_absent_key];

      const key_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: valid_keys,
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });

      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          if (!response.rt) {
            this.jsPsych.pluginAPI.cancelKeyboardResponse(key_listener);
          }

          end_trial();
        }, trial.trial_duration);
      }

      function clear_display() {
        display_element.innerHTML = "";
      }
    };
  }

  private generateFixationLoc(trial) {
    var paper_size = trial.circle_diameter + trial.target_size[0];
    return [
      Math.floor(paper_size / 2 - trial.fixation_size[0] / 2),
      Math.floor(paper_size / 2 - trial.fixation_size[1] / 2),
    ];
  }

  private generateDisplayLocs(n_locs: number, trial: TrialType<Info>) {
    // circle params
    var diam = trial.circle_diameter; // pixels
    var radi = diam / 2;
    var paper_size = diam + trial.target_size[0];

    // stimuli width, height
    var stimh = trial.target_size[0];
    var stimw = trial.target_size[1];
    var hstimh = stimh / 2;
    var hstimw = stimw / 2;

    var display_locs = [];
    var random_offset = Math.floor(Math.random() * 360);
    for (var i = 0; i < n_locs; i++) {
      display_locs.push([
        Math.floor(paper_size / 2 + this.cosd(random_offset + i * (360 / n_locs)) * radi - hstimw),
        Math.floor(paper_size / 2 - this.sind(random_offset + i * (360 / n_locs)) * radi - hstimh),
      ]);
    }
    return display_locs;
  }

  private generatePresentationSet(trial: TrialType<Info>) {
    var to_present = [];
    if (trial.target !== null && trial.foil !== null && trial.set_size !== null) {
      if (trial.target_present) {
        for (var i = 0; i < trial.set_size - 1; i++) {
          to_present.push(trial.foil);
        }
        to_present.push(trial.target);
      } else {
        for (var i = 0; i < trial.set_size; i++) {
          to_present.push(trial.foil);
        }
      }
    } else if (trial.stimuli.length > 0) {
      to_present = trial.stimuli;
    } else {
      console.error(
        "Error in visual-search-circle plugin: you must specify an array of images via the stimuli parameter OR specify the target, foil and set_size parameters."
      );
    }
    return to_present;
  }

  private cosd(num: number) {
    return Math.cos((num / 180) * Math.PI);
  }

  private sind(num: number) {
    return Math.sin((num / 180) * Math.PI);
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
    const key = this.jsPsych.pluginAPI.getValidKey([
      trial.target_present_key,
      trial.target_absent_key,
    ]);
    const set = this.generatePresentationSet(trial);

    const default_data = {
      correct: trial.target_present
        ? key == trial.target_present_key
        : key == trial.target_absent_key,
      response: key,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      set_size: set.length,
      target_present: trial.target_present,
      locations: this.generateDisplayLocs(set.length, trial),
    };

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

    if (data.rt !== null) {
      this.jsPsych.pluginAPI.pressKey(data.response, trial.fixation_duration + data.rt);
    }
  }
}

export default VisualSearchCirclePlugin;
