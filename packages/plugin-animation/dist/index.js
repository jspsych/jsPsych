import { ParameterType } from 'jspsych';

var version = "2.1.0";

const info = {
  name: "animation",
  version,
  parameters: {
    /** Each element of the array is a path to an image file. */
    stimuli: {
      type: ParameterType.IMAGE,
      default: void 0,
      array: true
    },
    /** How long to display each image in milliseconds. */
    frame_time: {
      type: ParameterType.INT,
      default: 250
    },
    /** If greater than 0, then a gap will be shown between each image in the sequence. This parameter
     * specifies the length of the gap in milliseconds.
     */
    frame_isi: {
      type: ParameterType.INT,
      default: 0
    },
    /** How many times to show the entire sequence. There will be no gap (other than the gap specified by `frame_isi`)
     * between repetitions. */
    sequence_reps: {
      type: ParameterType.INT,
      default: 1
    },
    /** This array contains the key(s) that the participant is allowed to press in order to respond to the stimulus.
     * Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see
     * [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and
     * [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/)
     * for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"`
     * means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed. */
    choices: {
      type: ParameterType.KEYS,
      default: "ALL_KEYS"
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that
     * it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key(s) to press). */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null
    },
    /**
     * If true, the images will be drawn onto a canvas element. This prevents a blank screen (white flash) between consecutive
     * images in some browsers, like Firefox and Edge. If false, the image will be shown via an img element, as in previous
     * versions of jsPsych.
     */
    render_on_canvas: {
      type: ParameterType.BOOL,
      default: true
    }
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
      nested: {
        stimulus: {
          type: ParameterType.STRING
        },
        time: {
          type: ParameterType.INT
        }
      }
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
      nested: {
        stimulus: {
          type: ParameterType.STRING
        },
        rt: {
          type: ParameterType.INT
        },
        key_press: {
          type: ParameterType.STRING
        }
      }
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class AnimationPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    var interval_time = trial.frame_time + trial.frame_isi;
    var animate_frame = 0;
    var reps = 0;
    var startTime = performance.now();
    var animation_sequence = [];
    var responses = [];
    var current_stim = "";
    if (trial.render_on_canvas) {
      if (display_element.hasChildNodes()) {
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
        animation_sequence,
        response: responses
      };
      this.jsPsych.finishTrial(trial_data);
    };
    var animate_interval = setInterval(() => {
      var showImage = true;
      if (!trial.render_on_canvas) {
        display_element.innerHTML = "";
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
        display_element.querySelector("#jspsych-animation-image").style.visibility = "visible";
        var img = new Image();
        img.src = trial.stimuli[animate_frame];
        canvas.height = img.naturalHeight;
        canvas.width = img.naturalWidth;
        ctx.drawImage(img, 0, 0);
        if (trial.prompt !== null && animate_frame == 0 && reps == 0) {
          display_element.insertAdjacentHTML("beforeend", trial.prompt);
        }
      } else {
        display_element.innerHTML = '<img src="' + trial.stimuli[animate_frame] + '" id="jspsych-animation-image"></img>';
        if (trial.prompt !== null) {
          display_element.innerHTML += trial.prompt;
        }
      }
      current_stim = trial.stimuli[animate_frame];
      animation_sequence.push({
        stimulus: trial.stimuli[animate_frame],
        time: Math.round(performance.now() - startTime)
      });
      if (trial.frame_isi > 0) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          display_element.querySelector("#jspsych-animation-image").style.visibility = "hidden";
          current_stim = "blank";
          animation_sequence.push({
            stimulus: "blank",
            time: Math.round(performance.now() - startTime)
          });
        }, trial.frame_time);
      }
    };
    var after_response = (info2) => {
      responses.push({
        key_press: info2.key,
        rt: info2.rt,
        stimulus: current_stim
      });
      display_element.querySelector("#jspsych-animation-image").className += " responded";
    };
    var response_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: "performance",
      persist: true,
      allow_held_key: false
    });
    show_next_frame();
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
    const fake_animation_sequence = [];
    const fake_responses = [];
    let t = 0;
    const check_if_fake_response_generated = () => {
      return this.jsPsych.randomization.sampleWithReplacement([true, false], 1, [1, 10])[0];
    };
    for (let i = 0; i < trial.sequence_reps; i++) {
      for (const frame of trial.stimuli) {
        fake_animation_sequence.push({
          stimulus: frame,
          time: t
        });
        if (check_if_fake_response_generated()) {
          fake_responses.push({
            key_press: this.jsPsych.pluginAPI.getValidKey(trial.choices),
            rt: t + this.jsPsych.randomization.randomInt(0, trial.frame_time - 1),
            current_stim: frame
          });
        }
        t += trial.frame_time;
        if (trial.frame_isi > 0) {
          fake_animation_sequence.push({
            stimulus: "blank",
            time: t
          });
          if (check_if_fake_response_generated()) {
            fake_responses.push({
              key_press: this.jsPsych.pluginAPI.getValidKey(trial.choices),
              rt: t + this.jsPsych.randomization.randomInt(0, trial.frame_isi - 1),
              current_stim: "blank"
            });
          }
          t += trial.frame_isi;
        }
      }
    }
    const default_data = {
      animation_sequence: fake_animation_sequence,
      response: fake_responses
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
    for (const response of data.response) {
      this.jsPsych.pluginAPI.pressKey(response.key_press, response.rt);
    }
  }
}

export { AnimationPlugin as default };
//# sourceMappingURL=index.js.map
