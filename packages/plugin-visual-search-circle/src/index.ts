import { JsPsych, JsPsychPlugin, TrialType, parameterType } from "jspsych";

const info = <const>{
  name: "visual-search-circle",
  parameters: {
    /* The image to be displayed. */
    target: {
      type: parameterType.IMAGE,
      pretty_name: "Target",
      default: undefined,
      preload: true
    },
    /* Path to image file that is the foil/distractor. */
    foil: {
      type: parameterType.IMAGE,
      pretty_name: "Foil",
      default: undefined,
      preload: true
    },
    /* Path to image file that is a fixation target. */
    fixation_image: {
      type: parameterType.IMAGE,
      pretty_name: "Fixation image",
      default: undefined,
      preload: true
    },
    /* How many items should be displayed? */
    set_size: {
      type: parameterType.INT,
      pretty_name: "Set size",
      default: undefined
    },
    /* Is the target present? */
    target_present: {
      type: parameterType.BOOL,
      pretty_name: "Target present",
      default: true
    },
    /* Two element array indicating the height and width of the search array element images. */
    target_size: {
      type: parameterType.INT,
      pretty_name: "Target size",
      array: true,
      default: [50, 50]
    },
    /* Two element array indicating the height and width of the fixation image. */
    fixation_size: {
      type: parameterType.INT,
      pretty_name: "Fixation size",
      array: true,
      default: [16, 16]
    },
    /* The diameter of the search array circle in pixels. */
    circle_diameter: {
      type: parameterType.INT,
      pretty_name: "Circle diameter",
      default: 250
    },
    /* The key to press if the target is present in the search array. */
    target_present_key: {
      type: parameterType.KEY,
      pretty_name: "Target present key",
      default: "j"
    },
    /* The key to press if the target is not present in the search array. */
    target_absent_key: {
      type: parameterType.KEY,
      pretty_name: "Target absent key",
      default: "f"
    },
    /* The maximum duration to wait for a response. */
    trial_duration: {
      type: parameterType.INT,
      pretty_name: "Trial duration",
      default: null
    },
    /* How long to show the fixation image for before the search array (in milliseconds). */
    fixation_duration: {
      type: parameterType.INT,
      pretty_name: "Fixation duration",
      default: 1000
    }
  }
};

type Info = typeof info;

/**
 *
 * jspsych-visual-search-circle
 * Josh de Leeuw
 *
 * display a set of objects, with or without a target, equidistant from fixation
 * subject responds to whether or not the target is present
 *
 * based on code written for psychtoolbox by Ben Motz
 *
 * documentation: docs.jspsych.org
 *
 **/
class VisualSearchCirclePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {};

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // circle params
    var diam = trial.circle_diameter; // pixels
    var radi = diam / 2;
    var paper_size = diam + trial.target_size[0];

    // stimuli width, height
    var stimh = trial.target_size[0];
    var stimw = trial.target_size[1];
    var hstimh = stimh / 2;
    var hstimw = stimw / 2;

    // fixation location
    var fix_loc = [
      Math.floor(paper_size / 2 - trial.fixation_size[0] / 2),
      Math.floor(paper_size / 2 - trial.fixation_size[1] / 2),
    ];

    // possible stimulus locations on the circle
    var display_locs = [];
    var possible_display_locs = trial.set_size;
    var random_offset = Math.floor(Math.random() * 360);
    for (var i = 0; i < possible_display_locs; i++) {
      display_locs.push([
        Math.floor(
          paper_size / 2 + cosd(random_offset + i * (360 / possible_display_locs)) * radi - hstimw
        ),
        Math.floor(
          paper_size / 2 - sind(random_offset + i * (360 / possible_display_locs)) * radi - hstimh
        ),
      ]);
    }

    // get target to draw on
    display_element.innerHTML +=
      '<div id="jspsych-visual-search-circle-container" style="position: relative; width:' +
      paper_size +
      "px; height:" +
      paper_size +
      'px"></div>';
    var paper = display_element.querySelector("#jspsych-visual-search-circle-container");

    // check distractors - array?
    var foil_arr = [];
    if (!Array.isArray(trial.foil)) {
      const fa = [];
      for (var i = 0; i < trial.set_size; i++) {
        fa.push(trial.foil);
      }
      foil_arr = fa;
    } else {
      foil_arr = trial.foil;
    }

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
      this.jsPsych.pluginAPI.setTimeout(function () {
        // after wait is over
        show_search_array();
      }, trial.fixation_duration);
    }

    const end_trial = (rt: number, correct: boolean, key_press: string) => {
      // data saving
      var trial_data = {
        correct: correct,
        rt: rt,
        response: key_press,
        locations: display_locs,
        target_present: trial.target_present,
        set_size: trial.set_size,
      };

      // go to next trial
      this.jsPsych.finishTrial(trial_data);
    }

    show_fixation();

    const show_search_array = () => {
      var search_array_images = [];

      var to_present = [];
      if (trial.target_present) {
        to_present.push(trial.target);
      }
      to_present = to_present.concat(foil_arr);

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

      var trial_over = false;

      const after_response = (info: {key: string, rt: number}) => {
        trial_over = true;

        var correct = false;

        if (
          (this.jsPsych.pluginAPI.compareKeys(info.key, trial.target_present_key) &&
            trial.target_present) ||
          (this.jsPsych.pluginAPI.compareKeys(info.key, trial.target_absent_key) && !trial.target_present)
        ) {
          correct = true;
        }

        clear_display();

        end_trial(info.rt, correct, info.key);
      };

      var valid_keys = [trial.target_present_key, trial.target_absent_key];

      const key_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: valid_keys,
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });

      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(function () {
          if (!trial_over) {
            this.jsPsych.pluginAPI.cancelKeyboardResponse(key_listener);

            trial_over = true;

            var rt = null;
            var correct = false;
            var key_press = null;

            clear_display();

            end_trial(rt, correct, key_press);
          }
        }, trial.trial_duration);
      }

      function clear_display() {
        display_element.innerHTML = "";
      }
    }

    // helper function for determining stimulus locations
    function cosd(num: number) {
      return Math.cos((num / 180) * Math.PI);
    }

    function sind(num: number) {
      return Math.sin((num / 180) * Math.PI);
    }
  };
}

export default VisualSearchCirclePlugin;
