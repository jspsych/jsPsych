import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "vsl-animate-occlusion",
  parameters: {
    /** Array containing path(s) to image file(s). */
    stimuli: {
      type: ParameterType.IMAGE,
      pretty_name: "Stimuli",
      default: undefined,
      array: true,
    },
    /** Array containing the key(s) that the subject is allowed to press in order to respond to the stimulus. */
    choices: {
      type: ParameterType.KEYS,
      pretty_name: "Choices",
      default: "ALL_KEYS",
    },
    /** Array specifying the width and height of the area that the animation will display in. */
    canvas_size: {
      type: ParameterType.INT,
      pretty_name: "Canvas size",
      array: true,
      default: [400, 400],
    },
    /** Array specifying the width and height of the images to show. */
    image_size: {
      type: ParameterType.INT,
      pretty_name: "Image size",
      array: true,
      default: [100, 100],
    },
    /** Which direction the stimulus should move first. */
    initial_direction: {
      type: ParameterType.SELECT,
      pretty_name: "Initial direction",
      choices: ["left", "right"],
      default: "left",
    },
    /** If true, display a rectangle in the center of the screen that is just wide enough to occlude the image completely as it passes behind. */
    occlude_center: {
      type: ParameterType.BOOL,
      pretty_name: "Occlude center",
      default: true,
    },
    /** How long it takes for a stimulus in the sequence to make a complete cycle. */
    cycle_duration: {
      type: ParameterType.INT,
      pretty_name: "Cycle duration",
      default: 1000,
    },
    /** How long to wait before the stimuli starts moving from behind the center rectangle. */
    pre_movement_duration: {
      type: ParameterType.INT,
      pretty_name: "Pre movement duration",
      default: 500,
    },
  },
};

type Info = typeof info;

/**
 * **vsl-animate-occlusion**
 *
 * jsPsych plugin for showing animations that mimic the experiment described in
 * Fiser, J., & Aslin, R. N. (2002). Statistical learning of higher-order
 * temporal structure from visual shape sequences. Journal of Experimental
 * Psychology: Learning, Memory, and Cognition, 28(3), 458.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-vsl-animate-occlusion/ vsl-animate-occlusion plugin documentation on jspsych.org}
 */
class VslAnimateOcclusionPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // variable to keep track of timing info and responses
    var start_time: number;
    var responses = [];

    var directions = [
      [
        {
          params: {
            x: trial.canvas_size[0] - trial.image_size[0],
          },
          ms: trial.cycle_duration / 2,
        },
        {
          params: {
            x: trial.canvas_size[0] / 2 - trial.image_size[0] / 2,
          },
          ms: trial.cycle_duration / 2,
        },
      ],
      [
        {
          params: {
            x: 0,
          },
          ms: trial.cycle_duration / 2,
        },
        {
          params: {
            x: trial.canvas_size[0] / 2 - trial.image_size[0] / 2,
          },
          ms: trial.cycle_duration / 2,
        },
      ],
    ];

    var which_image = 0;
    var next_direction = trial.initial_direction == "right" ? 0 : 1;

    function next_step() {
      if (trial.stimuli.length == which_image) {
        endTrial();
      } else {
        var d = directions[next_direction];
        next_direction === 0 ? (next_direction = 1) : (next_direction = 0);
        var i = trial.stimuli[which_image];
        which_image++;

        // @ts-expect-error What is `mina`?
        c.animate(d[0].params, d[0].ms, mina.linear, function () {
          // @ts-expect-error What is `mina`?
          c.animate(d[1].params, d[1].ms, mina.linear, function () {
            next_step();
          });
        });

        c.attr({
          href: i,
        });

        // start timer for this trial
        start_time = performance.now();
      }
    }

    display_element.innerHTML =
      "<svg id='jspsych-vsl-animate-occlusion-canvas' width=" +
      trial.canvas_size[0] +
      " height=" +
      trial.canvas_size[1] +
      "></svg>";

    // @ts-expect-error What is `Snap`?
    var paper = Snap("#jspsych-vsl-animate-occlusion-canvas");

    var c = paper
      .image(
        trial.stimuli[which_image],
        trial.canvas_size[0] / 2 - trial.image_size[0] / 2,
        trial.canvas_size[1] / 2 - trial.image_size[1] / 2,
        trial.image_size[0],
        trial.image_size[1]
      )
      .attr({
        id: "jspsych-vsl-animate-occlusion-moving-image",
      });

    display_element
      .querySelector("#jspsych-vsl-animate-occlusion-moving-image")
      .removeAttribute("preserveAspectRatio");

    if (trial.occlude_center) {
      paper
        .rect(
          trial.canvas_size[0] / 2 - trial.image_size[0] / 2,
          0,
          trial.image_size[0],
          trial.canvas_size[1]
        )
        .attr({
          fill: "#000",
        });
    }

    // add key listener
    var after_response = function (info: { key: string; rt: number }) {
      responses.push({
        key: info.key,
        stimulus: which_image - 1,
        rt: info.rt,
      });
    };

    var key_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: "performance",
      persist: true,
      allow_held_key: false,
    });

    if (trial.pre_movement_duration > 0) {
      this.jsPsych.pluginAPI.setTimeout(function () {
        next_step();
      }, trial.pre_movement_duration);
    } else {
      next_step();
    }

    const endTrial = () => {
      display_element.innerHTML = "";

      this.jsPsych.pluginAPI.cancelKeyboardResponse(key_listener);

      var trial_data = {
        stimuli: trial.stimuli,
        response: responses,
      };

      this.jsPsych.finishTrial(trial_data);
    };
  }
}

export default VslAnimateOcclusionPlugin;
