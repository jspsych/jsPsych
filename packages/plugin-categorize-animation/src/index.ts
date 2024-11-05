import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "categorize-animation",
  version: version,
  parameters: {
    /** Each element of the array is a path to an image file. */
    stimuli: {
      type: ParameterType.IMAGE,
      default: undefined,
      array: true,
    },
    /** The key character indicating the correct response. */
    key_answer: {
      type: ParameterType.KEY,
      default: undefined,
    },
    /** This array contains the key(s) that the participant is allowed to press in order to respond to the stimulus. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/) for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"` means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed. */
    choices: {
      type: ParameterType.KEYS,
      default: "ALL_KEYS",
    },
    /** A text label that describes the correct answer. Used in conjunction with the `correct_text` and `incorrect_text` parameters. */
    text_answer: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** String to show when the correct answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below). */
    correct_text: {
      type: ParameterType.HTML_STRING,
      default: "Correct.",
    },
    /** String to show when the wrong answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below). */
    incorrect_text: {
      type: ParameterType.HTML_STRING,
      default: "Wrong.",
    },
    /** How long to display each image (in milliseconds). */
    frame_time: {
      type: ParameterType.INT,
      default: 500,
    },
    /** How many times to show the entire sequence. */
    sequence_reps: {
      type: ParameterType.INT,
      default: 1,
    },
    /** If true, the participant can respond before the animation sequence finishes. */
    allow_response_before_complete: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** How long to show the feedback (milliseconds). */
    feedback_duration: {
      type: ParameterType.INT,
      default: 2000,
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus or the end of the animation depending on the allow_response_before_complete parameter. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /**
     * If true, the images will be drawn onto a canvas element. This prevents a blank screen (white flash) between consecutive images in some browsers, like Firefox and Edge.
     * If false, the image will be shown via an img element, as in previous versions of jsPsych.
     */
    render_on_canvas: {
      type: ParameterType.BOOL,
      default: true,
    },
  },
  data: {
    /** Array of stimuli displayed in the trial. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
    stimulus: {
      type: ParameterType.STRING,
      array: true,
    },
    /** Indicates which key the participant pressed.  */
    response: {
      type: ParameterType.STRING,
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
    rt: {
      type: ParameterType.INT,
    },
    /** `true` if the participant got the correct answer, `false` otherwise. */
    correct: {
      type: ParameterType.BOOL,
    },
  },
};

type Info = typeof info;

/**
 * The categorize animation plugin shows a sequence of images at a specified frame rate. The participant responds by pressing a key. Feedback indicating the correctness of the response is given.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/categorize-animation/ categorize-animation plugin documentation on jspsych.org}
 */
class CategorizeAnimationPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var animate_frame = 0;
    var reps = 0;

    var showAnimation = true;

    var responded = false;
    var timeoutSet = false;
    var correct;

    if (trial.render_on_canvas) {
      // first clear the display element (because the render_on_canvas method appends to display_element instead of overwriting it with .innerHTML)
      if (display_element.hasChildNodes()) {
        // can't loop through child list because the list will be modified by .removeChild()
        while (display_element.firstChild) {
          display_element.removeChild(display_element.firstChild);
        }
      }
      var canvas = document.createElement("canvas");
      canvas.id = "jspsych-categorize-animation-stimulus";
      canvas.style.margin = "0";
      canvas.style.padding = "0";
      display_element.insertBefore(canvas, null);
      var ctx = canvas.getContext("2d");
      if (trial.prompt !== null) {
        var prompt_div = document.createElement("div");
        prompt_div.id = "jspsych-categorize-animation-prompt";
        prompt_div.style.visibility = "hidden";
        prompt_div.innerHTML = trial.prompt;
        display_element.insertBefore(prompt_div, canvas.nextElementSibling);
      }
      var feedback_div = document.createElement("div");
      display_element.insertBefore(feedback_div, display_element.nextElementSibling);
    }

    const update_display = () => {
      if (showAnimation) {
        if (trial.render_on_canvas) {
          display_element.querySelector<HTMLElement>(
            "#jspsych-categorize-animation-stimulus"
          ).style.visibility = "visible";
          var img = new Image();
          img.src = trial.stimuli[animate_frame];
          canvas.height = img.naturalHeight;
          canvas.width = img.naturalWidth;
          ctx.drawImage(img, 0, 0);
        } else {
          display_element.innerHTML +=
            '<img src="' +
            trial.stimuli[animate_frame] +
            '" class="jspsych-categorize-animation-stimulus"></img>';
        }
      }

      if (!responded && trial.allow_response_before_complete) {
        // in here if the user can respond before the animation is done
        if (trial.prompt !== null) {
          if (trial.render_on_canvas) {
            prompt_div.style.visibility = "visible";
          } else {
            display_element.innerHTML += trial.prompt;
          }
        }
        if (trial.render_on_canvas) {
          if (!showAnimation) {
            canvas.remove();
          }
        }
      } else if (!responded) {
        // in here if the user has to wait to respond until animation is done.
        // if this is the case, don't show the prompt until the animation is over.
        if (!showAnimation) {
          if (trial.prompt !== null) {
            if (trial.render_on_canvas) {
              prompt_div.style.visibility = "visible";
            } else {
              display_element.innerHTML += trial.prompt;
            }
          }
          if (trial.render_on_canvas) {
            canvas.remove();
          }
        }
      } else {
        // user has responded if we get here.

        // show feedback
        var feedback_text = "";
        if (correct) {
          feedback_text = trial.correct_text.replace("%ANS%", trial.text_answer);
        } else {
          feedback_text = trial.incorrect_text.replace("%ANS%", trial.text_answer);
        }
        if (trial.render_on_canvas) {
          if (trial.prompt !== null) {
            prompt_div.remove();
          }
          feedback_div.innerHTML = feedback_text;
        } else {
          display_element.innerHTML += feedback_text;
        }

        // set timeout to clear feedback
        if (!timeoutSet) {
          timeoutSet = true;
          this.jsPsych.pluginAPI.setTimeout(() => {
            endTrial();
          }, trial.feedback_duration);
        }
      }
    };

    // show animation
    var animate_interval = setInterval(() => {
      if (!trial.render_on_canvas) {
        display_element.innerHTML = ""; // clear everything
      }
      animate_frame++;
      if (animate_frame == trial.stimuli.length) {
        animate_frame = 0;
        reps++;
        // check if reps complete //
        if (trial.sequence_reps != -1 && reps >= trial.sequence_reps) {
          // done with animation
          showAnimation = false;
        }
      }

      update_display();
    }, trial.frame_time);

    update_display();

    const endTrial = () => {
      clearInterval(animate_interval); // stop animation!
      this.jsPsych.finishTrial(trial_data);
    };

    var keyboard_listener;
    var trial_data = {};

    // @ts-expect-error Error is: Unreachable code detected: Not all code paths return a value
    const after_response = (info: { key: string; rt: number }) => {
      // ignore the response if animation is playing and subject
      // not allowed to respond before it is complete
      if (!trial.allow_response_before_complete && showAnimation) {
        return false;
      }

      correct = false;
      if (this.jsPsych.pluginAPI.compareKeys(trial.key_answer, info.key)) {
        correct = true;
      }

      responded = true;

      trial_data = {
        stimulus: trial.stimuli,
        rt: info.rt,
        correct: correct,
        response: info.key,
      };

      this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_listener);
    };

    keyboard_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: "performance",
      persist: true,
      allow_held_key: false,
    });
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
    const animation_length = trial.sequence_reps * trial.frame_time * trial.stimuli.length;
    const key = this.jsPsych.pluginAPI.getValidKey(trial.choices);

    const default_data = {
      stimulus: trial.stimuli,
      rt: animation_length + this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      response: key,
      correct: key == trial.key_answer,
    };

    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);

    this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);

    return data;
  }

  private simulate_data_only(trial: TrialType<Info>, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);

    if (data.rt == null || data.response == null) {
      throw new Error(`
        Simulated response for categorize-animation plugin was invalid. 
        This could be because the response RT was too fast and generated
        before the animation finished when the allow_response_before_complete
        parameter is false. In a real experiment this would cause the experiment
        to pause indefinitely.`);
    } else {
      this.jsPsych.finishTrial(data);
    }
  }

  private simulate_visual(trial: TrialType<Info>, simulation_options, load_callback: () => void) {
    const data = this.create_simulation_data(trial, simulation_options);

    const display_element = this.jsPsych.getDisplayElement();

    this.trial(display_element, trial);
    load_callback();

    if (data.rt !== null) {
      this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
    } else {
      throw new Error(`
        Simulated response for categorize-animation plugin was invalid. 
        This could be because the response RT was too fast and generated
        before the animation finished when the allow_response_before_complete
        parameter is false. In a real experiment this would cause the experiment
        to pause indefinitely.`);
    }
  }
}

export default CategorizeAnimationPlugin;
