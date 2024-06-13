import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "animation",
  version: version,
  parameters: {
    /** Each element of the array is a path to an image file. */
    stimuli: {
      type: ParameterType.IMAGE,
      default: undefined,
      array: true,
    },
    /** How long to display each image in milliseconds. */
    frame_time: {
      type: ParameterType.INT,
      default: 250,
    },
    /** If greater than 0, then a gap will be shown between each image in the sequence. This parameter
     * specifies the length of the gap in milliseconds.
     */
    frame_isi: {
      type: ParameterType.INT,
      default: 0,
    },
    /** How many times to show the entire sequence. There will be no gap (other than the gap specified by `frame_isi`)
     * between repetitions. */
    sequence_reps: {
      type: ParameterType.INT,
      default: 1,
    },
    /** This array contains the key(s) that the participant is allowed to press in order to respond to the stimulus.
     * Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see
     * [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and
     * [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/)
     * for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"`
     * means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed. */
    choices: {
      type: ParameterType.KEYS,
      default: "ALL_KEYS",
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that
     * it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key(s) to press). */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /**
     * If true, the images will be drawn onto a canvas element. This prevents a blank screen (white flash) between consecutive
     * images in some browsers, like Firefox and Edge. If false, the image will be shown via an img element, as in previous
     * versions of jsPsych.
     */
    render_on_canvas: {
      type: ParameterType.BOOL,
      default: true,
    },
  },
  data: {
    /** An array, where each element is an object that represents a stimulus in the animation sequence. Each object has
     * a `stimulus` property, which is the image that was displayed, and a `time` property, which is the time in ms,
     * measured from when the sequence began, that the stimulus was displayed. The array will be encoded in JSON format
     * when data is saved using either the `.json()` or `.csv()` functions.
     */
    animation_sequence: {
      type: ParameterType.COMPLEX,
      array: true,
      parameters: {
        stimulus: {
          type: ParameterType.STRING,
        },
        time: {
          type: ParameterType.INT,
        },
      },
    },
    /** An array, where each element is an object representing a response given by the participant. Each object has a
     * `stimulus` property, indicating which image was displayed when the key was pressed, an `rt` property, indicating
     * the time of the key press relative to the start of the animation, and a `key_press` property, indicating which
     * key was pressed. The array will be encoded in JSON format when data is saved using either the `.json()` or `.csv()`
     * functions.
     */
    response: {
      type: ParameterType.COMPLEX,
      array: true,
      parameters: {
        stimulus: {
          type: ParameterType.STRING,
        },
        rt: {
          type: ParameterType.INT,
        },
        key_press: {
          type: ParameterType.STRING,
        },
      },
    },
  },
};

type Info = typeof info;

/**
 * This plugin displays a sequence of images at a fixed frame rate. The sequence can be looped a specified number of times.
 * The participant is free to respond at any point during the animation, and the time of the response is recorded.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/animation/ animation plugin documentation on jspsych.org}
 */
class AnimationPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var interval_time = trial.frame_time + trial.frame_isi;
    var animate_frame = 0;
    var reps = 0;
    var startTime = performance.now();
    var animation_sequence = [];
    var responses = [];
    var current_stim = "";

    if (trial.render_on_canvas) {
      // first clear the display element (because the render_on_canvas method appends to display_element instead of overwriting it with .innerHTML)
      if (display_element.hasChildNodes()) {
        // can't loop through child list because the list will be modified by .removeChild()
        while (display_element.firstChild) {
          display_element.removeChild(display_element.firstChild);
        }
      }
      var canvas = document.createElement("canvas");
      canvas.id = "jspsych-animation-image";
      canvas.style.margin = "0";
      canvas.style.padding = "0";
      display_element.insertBefore(canvas, null);
      var ctx = canvas.getContext("2d");
    }

    const endTrial = () => {
      this.jsPsych.pluginAPI.cancelKeyboardResponse(response_listener);

      var trial_data = {
        animation_sequence: animation_sequence,
        response: responses,
      };

      this.jsPsych.finishTrial(trial_data);
    };

    var animate_interval = setInterval(() => {
      var showImage = true;
      if (!trial.render_on_canvas) {
        display_element.innerHTML = ""; // clear everything
      }
      animate_frame++;
      if (animate_frame == trial.stimuli.length) {
        animate_frame = 0;
        reps++;
        if (reps >= trial.sequence_reps) {
          endTrial();
          clearInterval(animate_interval);
          showImage = false;
        }
      }
      if (showImage) {
        show_next_frame();
      }
    }, interval_time);

    const show_next_frame = () => {
      if (trial.render_on_canvas) {
        display_element.querySelector<HTMLElement>("#jspsych-animation-image").style.visibility =
          "visible";
        var img = new Image();
        img.src = trial.stimuli[animate_frame];
        canvas.height = img.naturalHeight;
        canvas.width = img.naturalWidth;
        ctx.drawImage(img, 0, 0);
        if (trial.prompt !== null && animate_frame == 0 && reps == 0) {
          display_element.insertAdjacentHTML("beforeend", trial.prompt);
        }
      } else {
        // show image
        display_element.innerHTML =
          '<img src="' + trial.stimuli[animate_frame] + '" id="jspsych-animation-image"></img>';
        if (trial.prompt !== null) {
          display_element.innerHTML += trial.prompt;
        }
      }
      current_stim = trial.stimuli[animate_frame];

      // record when image was shown
      animation_sequence.push({
        stimulus: trial.stimuli[animate_frame],
        time: Math.round(performance.now() - startTime),
      });

      if (trial.frame_isi > 0) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          display_element.querySelector<HTMLElement>("#jspsych-animation-image").style.visibility =
            "hidden";
          current_stim = "blank";
          // record when blank image was shown
          animation_sequence.push({
            stimulus: "blank",
            time: Math.round(performance.now() - startTime),
          });
        }, trial.frame_time);
      }
    };

    var after_response = (info) => {
      responses.push({
        key_press: info.key,
        rt: info.rt,
        stimulus: current_stim,
      });

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector("#jspsych-animation-image").className += " responded";
    };

    // hold the jspsych response listener object in memory
    // so that we can turn off the response collection when
    // the trial ends
    var response_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: "performance",
      persist: true,
      allow_held_key: false,
    });

    // show the first frame immediately
    show_next_frame();
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
    const fake_animation_sequence = [];
    const fake_responses = [];
    let t = 0;
    const check_if_fake_response_generated: () => boolean = () => {
      return this.jsPsych.randomization.sampleWithReplacement([true, false], 1, [1, 10])[0];
    };
    for (let i = 0; i < trial.sequence_reps; i++) {
      for (const frame of trial.stimuli) {
        fake_animation_sequence.push({
          stimulus: frame,
          time: t,
        });
        if (check_if_fake_response_generated()) {
          fake_responses.push({
            key_press: this.jsPsych.pluginAPI.getValidKey(trial.choices),
            rt: t + this.jsPsych.randomization.randomInt(0, trial.frame_time - 1),
            current_stim: frame,
          });
        }
        t += trial.frame_time;
        if (trial.frame_isi > 0) {
          fake_animation_sequence.push({
            stimulus: "blank",
            time: t,
          });
          if (check_if_fake_response_generated()) {
            fake_responses.push({
              key_press: this.jsPsych.pluginAPI.getValidKey(trial.choices),
              rt: t + this.jsPsych.randomization.randomInt(0, trial.frame_isi - 1),
              current_stim: "blank",
            });
          }
          t += trial.frame_isi;
        }
      }
    }

    const default_data = {
      animation_sequence: fake_animation_sequence,
      response: fake_responses,
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

    for (const response of data.response) {
      this.jsPsych.pluginAPI.pressKey(response.key_press, response.rt);
    }
  }
}

export default AnimationPlugin;
