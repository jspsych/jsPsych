import { ParameterType } from 'jspsych';

var version = "2.2.0";

const info = {
  name: "visual-search-circle",
  version,
  parameters: {
    /**
     * Path to image file that is the search target. This parameter must specified when the stimuli set is
     * defined using the `target`, `foil` and `set_size` parameters, but should NOT be specified when using
     * the `stimuli` parameter.
     */
    target: {
      type: ParameterType.IMAGE,
      default: null
    },
    /**
     * Path to image file that is the foil/distractor. This image will be repeated for all distractors up to
     * the `set_size` value. This parameter must specified when the stimuli set is defined using the `target`,
     * `foil` and `set_size` parameters, but should NOT be specified when using the `stimuli` parameter.
     */
    foil: {
      type: ParameterType.IMAGE,
      default: null
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
      default: null
    },
    /**
     * Array containing all of the image files to be displayed. This parameter must be specified when NOT
     * using the `target`, `foil`, and `set_size` parameters to define the stimuli set.
     */
    stimuli: {
      type: ParameterType.IMAGE,
      default: [],
      array: true
    },
    /**
     * Is the target present? This parameter must always be specified. When using the `target`, `foil` and
     * `set_size` parameters, `false` means that the foil image will be repeated up to the set_size, and
     * `true` means that the target will be presented along with the foil image repeated up to set_size - 1.
     * When using the `stimuli` parameter, this parameter is only used to determine the response accuracy.
     */
    target_present: {
      type: ParameterType.BOOL,
      default: void 0
    },
    /**
     * Path to image file that is a fixation target. This parameter must always be specified.
     */
    fixation_image: {
      type: ParameterType.IMAGE,
      default: void 0
    },
    /** Two element array indicating the height and width of the search array element images. */
    target_size: {
      type: ParameterType.INT,
      array: true,
      default: [50, 50]
    },
    /** Two element array indicating the height and width of the fixation image. */
    fixation_size: {
      type: ParameterType.INT,
      array: true,
      default: [16, 16]
    },
    /** The diameter of the search array circle in pixels. */
    circle_diameter: {
      type: ParameterType.INT,
      default: 250
    },
    /** The key to press if the target is present in the search array. */
    target_present_key: {
      type: ParameterType.KEY,
      default: "j"
    },
    /** The key to press if the target is not present in the search array. */
    target_absent_key: {
      type: ParameterType.KEY,
      default: "f"
    },
    /** The maximum amount of time the participant is allowed to search before the trial will continue. A value
     * of null will allow the participant to search indefinitely.
     */
    trial_duration: {
      type: ParameterType.INT,
      default: null
    },
    /** How long to show the fixation image for before the search array (in milliseconds). */
    fixation_duration: {
      type: ParameterType.INT,
      default: 1e3
    },
    /** Whether to use randomized locations on the circle for the items. If `false`, then the first item will always show at the location specified by `location_first_item`. */
    randomize_item_locations: {
      type: ParameterType.BOOL,
      pretty_name: "Randomize item locations",
      default: true
    },
    /** 
     * If `randomize_item_locations` is `false`, the location of the first item on the circle, in degrees.
     * 0 degrees is above the fixation, and moving clockwise in the positive direction.
    */
    location_first_item: {
      type: ParameterType.INT,
      pretty_name: "Location first item",
      default: 0
    },
    /** If true, the trial will end when the participant makes a response. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: true
    }
  },
  data: {
    /** True if the participant gave the correct response. */
    correct: {
      type: ParameterType.BOOL
    },
    /** Indicates which key the participant pressed. */
    response: {
      type: ParameterType.STRING
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
    rt: {
      type: ParameterType.INT
    },
    /** The number of items in the search array. */
    set_size: {
      type: ParameterType.INT
    },
    /** True if the target is present in the search array. */
    target_present: {
      type: ParameterType.BOOL
    },
    /** Array where each element is the pixel value of the center of an image in the search array. If the target is present, then the first element will represent the location of the target. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
    locations: {
      type: ParameterType.INT,
      array: true
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class VisualSearchCirclePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    var paper_size = trial.circle_diameter + trial.target_size[0];
    var fix_loc = this.generateFixationLoc(trial);
    var to_present = this.generatePresentationSet(trial);
    var display_locs = this.generateDisplayLocs(to_present.length, trial);
    display_element.innerHTML += '<div id="jspsych-visual-search-circle-container" style="position: relative; width:' + paper_size + "px; height:" + paper_size + 'px"></div>';
    var paper = display_element.querySelector("#jspsych-visual-search-circle-container");
    const show_fixation = () => {
      paper.innerHTML += "<img src='" + trial.fixation_image + "' style='position: absolute; top:" + fix_loc[0] + "px; left:" + fix_loc[1] + "px; width:" + trial.fixation_size[0] + "px; height:" + trial.fixation_size[1] + "px;'></img>";
      this.jsPsych.pluginAPI.setTimeout(() => {
        show_search_array();
      }, trial.fixation_duration);
    };
    const response = {
      rt: null,
      key: null,
      correct: false
    };
    const end_trial = () => {
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
      const trial_data = {
        correct: response.correct,
        rt: response.rt,
        response: response.key,
        locations: display_locs,
        target_present: trial.target_present,
        set_size: trial.set_size
      };
      this.jsPsych.finishTrial(trial_data);
    };
    show_fixation();
    const show_search_array = () => {
      for (var i = 0; i < display_locs.length; i++) {
        paper.innerHTML += "<img src='" + to_present[i] + "' style='position: absolute; top:" + display_locs[i][0] + "px; left:" + display_locs[i][1] + "px; width:" + trial.target_size[0] + "px; height:" + trial.target_size[1] + "px;'></img>";
      }
      const after_response = (info2) => {
        var correct = false;
        if (this.jsPsych.pluginAPI.compareKeys(info2.key, trial.target_present_key) && trial.target_present || this.jsPsych.pluginAPI.compareKeys(info2.key, trial.target_absent_key) && !trial.target_present) {
          correct = true;
        }
        response.rt = info2.rt;
        response.key = info2.key;
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
        allow_held_key: false
      });
      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          if (!response.rt) {
            this.jsPsych.pluginAPI.cancelKeyboardResponse(key_listener);
          }
          end_trial();
        }, trial.trial_duration);
      }
    };
  }
  generateFixationLoc(trial) {
    var paper_size = trial.circle_diameter + trial.target_size[0];
    return [
      Math.floor(paper_size / 2 - trial.fixation_size[0] / 2),
      Math.floor(paper_size / 2 - trial.fixation_size[1] / 2)
    ];
  }
  generateDisplayLocs(n_locs, trial) {
    var diam = trial.circle_diameter;
    var radi = diam / 2;
    var paper_size = diam + trial.target_size[0];
    var stimh = trial.target_size[0];
    var stimw = trial.target_size[1];
    var hstimh = stimh / 2;
    var hstimw = stimw / 2;
    var display_locs = [];
    var offset = trial.randomize_item_locations ? Math.floor(Math.random() * 360) : trial.location_first_item - 180;
    for (var i = 0; i < n_locs; i++) {
      display_locs.push([
        Math.floor(paper_size / 2 + this.cosd(offset + i * (360 / n_locs)) * radi - hstimw),
        Math.floor(paper_size / 2 - this.sind(offset + i * (360 / n_locs)) * radi - hstimh)
      ]);
    }
    return display_locs;
  }
  generatePresentationSet(trial) {
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
  cosd(num) {
    return Math.cos(num / 180 * Math.PI);
  }
  sind(num) {
    return Math.sin(num / 180 * Math.PI);
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
    const key = this.jsPsych.pluginAPI.getValidKey([
      trial.target_present_key,
      trial.target_absent_key
    ]);
    const set = this.generatePresentationSet(trial);
    const default_data = {
      correct: trial.target_present ? key == trial.target_present_key : key == trial.target_absent_key,
      response: key,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      set_size: set.length,
      target_present: trial.target_present,
      locations: this.generateDisplayLocs(set.length, trial)
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
    if (data.rt !== null) {
      this.jsPsych.pluginAPI.pressKey(data.response, trial.fixation_duration + data.rt);
    }
  }
}

export { VisualSearchCirclePlugin as default };
//# sourceMappingURL=index.js.map
