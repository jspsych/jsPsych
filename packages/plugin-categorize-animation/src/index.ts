import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "categorize-animation",
  parameters: {
    /** Array of paths to image files. */
    stimuli: {
      type: ParameterType.IMAGE,
      pretty_name: "Stimuli",
      default: undefined,
      array: true,
    },
    /** The key to indicate correct response */
    key_answer: {
      type: ParameterType.KEY,
      pretty_name: "Key answer",
      default: undefined,
    },
    /** Array containing the key(s) the subject is allowed to press to respond to the stimuli. */
    choices: {
      type: ParameterType.KEYS,
      pretty_name: "Choices",
      default: "ALL_KEYS",
    },
    /** Text to describe correct answer. */
    text_answer: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Text answer",
      default: null,
    },
    /** String to show when subject gives correct answer */
    correct_text: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Correct text",
      default: "Correct.",
    },
    /** String to show when subject gives incorrect answer. */
    incorrect_text: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Incorrect text",
      default: "Wrong.",
    },
    /** Duration to display each image. */
    frame_time: {
      type: ParameterType.INT,
      pretty_name: "Frame time",
      default: 500,
    },
    /** How many times to display entire sequence. */
    sequence_reps: {
      type: ParameterType.INT,
      pretty_name: "Sequence repetitions",
      default: 1,
    },
    /** If true, subject can response before the animation sequence finishes */
    allow_response_before_complete: {
      type: ParameterType.BOOL,
      pretty_name: "Allow response before complete",
      default: false,
    },
    /** How long to show feedback */
    feedback_duration: {
      type: ParameterType.INT,
      pretty_name: "Feedback duration",
      default: 2000,
    },
    /** Any content here will be displayed below the stimulus. */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null,
    },
    /**
     * If true, the images will be drawn onto a canvas element (prevents blank screen between consecutive images in some browsers).
     * If false, the image will be shown via an img element.
     */
    render_on_canvas: {
      type: ParameterType.BOOL,
      pretty_name: "Render on canvas",
      default: true,
    },
  },
};

type Info = typeof info;

/**
 * **categorize-animation**
 *
 * jsPsych plugin for categorization trials with feedback and animated stimuli
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-categorize-animation/ categorize-animation plugin documentation on jspsych.org}
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
      display_element.innerHTML = ""; // clear everything
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
