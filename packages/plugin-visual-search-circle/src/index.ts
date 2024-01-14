import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "visual-search-circle",
  parameters: {
    /** The target image to be displayed. This must specified when using the target, foil and set_size parameters to define the stimuli set, rather than the stimuli parameter. */
    target: {
      type: ParameterType.IMAGE,
      pretty_name: "Target",
      default: null,
    },
    /** The image to use as the foil/distractor. This must specified when using the target, foil and set_size parameters to define the stimuli set, rather than the stimuli parameter. */
    foil: {
      type: ParameterType.IMAGE,
      pretty_name: "Foil",
      default: null,
    },
    /** How many items should be displayed, including the target when target_present is true? This must specified when using the target, foil and set_size parameters to define the stimuli set, rather than the stimuli parameter. */
    set_size: {
      type: ParameterType.INT,
      pretty_name: "Set size",
      default: null,
    },
    /** Array containing one or more image files to be displayed. This only needs to be specified when NOT using the target, foil, and set_size parameters to define the stimuli set. */
    stimuli: {
      type: ParameterType.IMAGE,
      pretty_name: "Stimuli",
      default: null,
      array: true,
    },
    /**
     * Is the target present?
     * When using the target, foil and set_size parameters, false means that the foil image will be repeated up to the set_size,
     * and if true, then the target will be presented along with the foil image repeated up to set_size - 1.
     * When using the stimuli parameter, this parameter is only used to determine the response accuracy.
     */
    target_present: {
      type: ParameterType.BOOL,
      pretty_name: "Target present",
      default: undefined,
    },
    /** Path to image file that is a fixation target. */
    fixation_image: {
      type: ParameterType.IMAGE,
      pretty_name: "Fixation image",
      default: undefined,
    },
    /** Two element array indicating the height and width of the search array element images. */
    target_size: {
      type: ParameterType.INT,
      pretty_name: "Target size",
      array: true,
      default: [50, 50],
    },
    /** Two element array indicating the height and width of the fixation image. */
    fixation_size: {
      type: ParameterType.INT,
      pretty_name: "Fixation size",
      array: true,
      default: [16, 16],
    },
    /** The diameter of the search array circle in pixels. */
    circle_diameter: {
      type: ParameterType.INT,
      pretty_name: "Circle diameter",
      default: 250,
    },
    /** The key to press if the target is present in the search array. */
    target_present_key: {
      type: ParameterType.KEY,
      pretty_name: "Target present key",
      default: "j",
    },
    /** The key to press if the target is not present in the search array. */
    target_absent_key: {
      type: ParameterType.KEY,
      pretty_name: "Target absent key",
      default: "f",
    },
    /** The maximum duration to wait for a response. */
    trial_duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: null,
    },
    /** How long to show the fixation image for before the search array (in milliseconds). */
    fixation_duration: {
      type: ParameterType.INT,
      pretty_name: "Fixation duration",
      default: 1000,
    },
    /** Whether a keyboard response ends the trial early */
    response_ends_trial: {
      type: ParameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true,
    },
  },
};

type Info = typeof info;

/**
 * **visual-search-circle**
 *
 * jsPsych plugin to display a set of objects, with or without a target, equidistant from fixation.
 * Subject responds with key press to whether or not the target is present.
 * Based on code written for psychtoolbox by Ben Motz.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-visual-search-circle/ visual-search-circle plugin documentation on jspsych.org}
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
      display_element.innerHTML = "";

      this.jsPsych.pluginAPI.clearAllTimeouts();
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

  private generateDisplayLocs(n_locs, trial) {
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

  private generatePresentationSet(trial) {
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
    } else if (trial.stimuli !== null) {
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
