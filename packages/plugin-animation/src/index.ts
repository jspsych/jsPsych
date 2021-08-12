import { JsPsych, JsPsychPlugin, TrialType, parameterType } from "jspsych";

//jsPsych.pluginAPI.registerPreload("animation", "stimuli", "image");  // TO DO

const info = <const>{
  name: "animation",
  parameters: {
    /* The images to be displayed */
    stimuli: {
      type: parameterType.STRING,
      pretty_name: "Stimuli",
      default: undefined,
      array: true
    },
    /* Duration to display each image. */
    frame_time: {
      type: parameterType.INT,
      pretty_name: "Frame time",
      default: 250
    },
    /* Length of gap to be shown between each image. */
    frame_isi: {
      type: parameterType.INT,
      pretty_name: "Frame gap",
      default: 0
    },
    /* Number of times to show entire sequence */
    sequence_reps: {
      type: parameterType.INT,
      pretty_name: "Sequence repetitions",
      default: 1
    },
    /* Keys subject uses to respond to stimuli. */
    choices: {
      type: parameterType.KEY,
      pretty_name: "Choices",
      default: "allkeys",
      array: true
    },
    /* Any content here will be displayed below stimulus. */
    prompt: {
      type: parameterType.STRING,
      pretty_name: "Prompt",
      default: null
    },
    /* If true, the images will be drawn onto a canvas element (prevents blank screen between consecutive images in some browsers).
    If false, the image will be shown via an img element. */
    render_on_canvas: {
      type: parameterType.BOOL,
      pretty_name: "Render on canvas",
      default: true
    },
  },
};

type Info = typeof info;

/**
 * jsPsych plugin for showing animations and recording keyboard responses
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 */

class AnimationPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var interval_time = trial.frame_time + trial.frame_isi;
    var animate_frame = -1;
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
        response: responses
      };

      this.jsPsych.finishTrial(trial_data);
    }

    var animate_interval = setInterval(function () {
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

    function show_next_frame() {
      if (trial.render_on_canvas) {
        display_element.querySelector<HTMLElement>("#jspsych-animation-image").style.visibility = "visible";
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
        time: performance.now() - startTime,
      });

      if (trial.frame_isi > 0) {
        this.jsPsych.pluginAPI.setTimeout(function () {
          display_element.querySelector<HTMLElement>("#jspsych-animation-image").style.visibility = "hidden";
          current_stim = "blank";
          // record when blank image was shown
          animation_sequence.push({
            stimulus: "blank",
            time: performance.now() - startTime,
          });
        }, trial.frame_time);
      }
    }

    var after_response = function (info) {
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
  }
}

export default AnimationPlugin;
