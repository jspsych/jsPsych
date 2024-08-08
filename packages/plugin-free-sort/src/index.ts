import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";
import { inside_ellipse, make_arr, random_coordinate, shuffle } from "./utils";

// import { parameterPathArrayToString } from "jspsych/src/timeline/util";

const info = <const>{
  name: "free-sort",
  version: version,
  parameters: {
    /** Each element of this array is an image path. */
    stimuli: {
      type: ParameterType.IMAGE,
      default: undefined,
      array: true,
    },
    /** The height of the images in pixels. */
    stim_height: {
      type: ParameterType.INT,
      default: 100,
    },
    /** The width of the images in pixels. */
    stim_width: {
      type: ParameterType.INT,
      default: 100,
    },
    /** How much larger to make the stimulus while moving (1 = no scaling). */
    scale_factor: {
      type: ParameterType.FLOAT,
      default: 1.5,
    },
    /** The height of the container that participants can move the stimuli in. Stimuli will be constrained to this area. */
    sort_area_height: {
      type: ParameterType.INT,
      default: 700,
    },
    /** The width of the container that participants can move the stimuli in. Stimuli will be constrained to this area. */
    sort_area_width: {
      type: ParameterType.INT,
      default: 700,
    },
    /** The shape of the sorting area, can be "ellipse" or "square". */
    sort_area_shape: {
      type: ParameterType.SELECT,
      options: ["square", "ellipse"],
      default: "ellipse",
    },
    /** This string can contain HTML markup. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).  */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: "",
    },
    /** Indicates whether to show the prompt `"above"` or `"below"` the sorting area. */
    prompt_location: {
      type: ParameterType.SELECT,
      options: ["above", "below"],
      default: "above",
    },
    /** The text that appears on the button to continue to the next trial. */
    button_label: {
      type: ParameterType.STRING,
      default: "Continue",
    },
    /**
     * If true, the sort area border color will change while items are being moved in and out of the sort area,
     * and the background color will change once all items have been moved into the sort area.
     * If false, the border will remain black and the background will remain white throughout the trial.
     */
    change_border_background_color: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * If change_border_background_color is true, the sort area border will change to this color
     * when an item is being moved into the sort area, and the background will change to this color
     * when all of the items have been moved into the sort area.
     */
    border_color_in: {
      type: ParameterType.STRING,
      default: "#a1d99b",
    },
    /**
     * If change_border_background_color is true, this will be the color of the sort area border
     * when there are one or more items that still need to be moved into the sort area.
     */
    border_color_out: {
      type: ParameterType.STRING,
      default: "#fc9272",
    },
    /** The width in pixels of the border around the sort area. If null, the border width defaults to 3% of the sort area height. */
    border_width: {
      type: ParameterType.INT,
      default: null,
    },
    /**
     * Text to display when there are one or more items that still need to be placed in the sort area.
     * If "%n%" is included in the string, it will be replaced with the number of items that still need to be moved inside.
     * If "%s%" is included in the string, a "s" will be included when the number of items remaining is greater than one.
     * */
    counter_text_unfinished: {
      type: ParameterType.HTML_STRING,
      default: "You still need to place %n% item%s% inside the sort area.",
    },
    /** Text that will take the place of the counter_text_unfinished text when all items have been moved inside the sort area. */
    counter_text_finished: {
      type: ParameterType.HTML_STRING,
      default: "All items placed. Feel free to reposition items if necessary.",
    },
    /**
     * If false, the images will be positioned to the left and right of the sort area when the trial loads.
     * If true, the images will be positioned at random locations inside the sort area when the trial loads.
     */
    stim_starts_inside: {
      type: ParameterType.BOOL,
      default: false,
    },
    /**
     * When the images appear outside the sort area, this determines the x-axis spread of the image columns.
     * Default value is 1. Values less than 1 will compress the image columns along the x-axis, and values greater than 1 will spread them farther apart.
     */
    column_spread_factor: {
      type: ParameterType.FLOAT,
      default: 1,
    },
  },
  data: {
    /**  An array containing objects representing the initial locations of all the stimuli in the sorting area. Each element in the array represents a stimulus, and has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions.  */
    init_locations: {
      type: ParameterType.STRING,
      array: true,
    },
    /** An array containing objects representing all of the moves the participant made when sorting. Each object represents a move. Each element in the array has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location after the move. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
    moves: {
      type: ParameterType.COMPLEX,
      array: true,
      parameters: {
        src: {
          type: ParameterType.STRING,
        },
        x: {
          type: ParameterType.INT,
        },
        y: {
          type: ParameterType.INT,
        },
      },
    },
    /** An array containing objects representing the final locations of all the stimuli in the sorting area. Each element in the array represents a stimulus, and has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
    final_locations: {
      type: ParameterType.COMPLEX,
      array: true,
      parameters: {
        src: {
          type: ParameterType.STRING,
        },
        x: {
          type: ParameterType.INT,
        },
        y: {
          type: ParameterType.INT,
        },
      },
    },
    /** The response time in milliseconds for the participant to finish all sorting. */
    rt: {
      type: ParameterType.INT,
    },
  },
};

type Info = typeof info;

/**
 * The free-sort plugin displays one or more images on the screen that the participant can interact with by clicking and dragging with a mouse, or touching and dragging with a touchscreen device. When the trial starts, the images can be positioned outside or inside the sort area. All images must be moved into the sorting area before the participant can click a button to end the trial. All of the moves that the participant performs are recorded, as well as the final positions of all images. This plugin could be useful when asking participants to position images based on similarity to one another, or to recall image spatial locations.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/free-sort/ free-sort plugin documentation on jspsych.org}
 */
class FreeSortPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var start_time = performance.now();

    // can't change trial properties (const), so create new variables for properties that might need to be changed
    var border_color_out = trial.border_color_out;
    var border_width = trial.border_width;
    var stimuli = trial.stimuli;

    if (trial.change_border_background_color == false) {
      border_color_out = "#000000";
    }

    if (trial.border_width == null) {
      border_width = trial.sort_area_height * 0.03;
    }

    let html =
      "<div " +
      'id="jspsych-free-sort-arena" ' +
      'class="jspsych-free-sort-arena" ' +
      'style="position: relative; width:' +
      trial.sort_area_width +
      "px; height:" +
      trial.sort_area_height +
      'px; margin: auto;"</div>';

    // another div for border
    html +=
      "<div " +
      'id="jspsych-free-sort-border" ' +
      'class="jspsych-free-sort-border" ' +
      'style="position: relative; width:' +
      trial.sort_area_width * 0.94 +
      "px; height:" +
      trial.sort_area_height * 0.94 +
      "px; " +
      "border:" +
      border_width +
      "px solid " +
      border_color_out +
      "; margin: auto; line-height: 0em; ";

    if (trial.sort_area_shape == "ellipse") {
      html += 'webkit-border-radius: 50%; moz-border-radius: 50%; border-radius: 50%"></div>';
    } else {
      html += 'webkit-border-radius: 0%; moz-border-radius: 0%; border-radius: 0%"></div>';
    }

    // variable that has the prompt text and counter
    const html_text =
      '<div style="line-height: 1.0em;">' +
      trial.prompt +
      '<p id="jspsych-free-sort-counter" style="display: inline-block;">' +
      get_counter_text(stimuli.length) +
      "</p></div>";

    // position prompt above or below
    if (trial.prompt_location == "below") {
      html += html_text;
    } else {
      html = html_text + html;
    }
    // add button
    html +=
      '<div><button id="jspsych-free-sort-done-btn" class="jspsych-btn" ' +
      'style="margin-top: 5px; margin-bottom: 15px; visibility: hidden;">' +
      trial.button_label +
      "</button></div>";

    display_element.innerHTML = html;

    // store initial location data
    let init_locations = [];

    if (!trial.stim_starts_inside) {
      // determine number of rows and colums, must be a even number
      let num_rows = Math.ceil(Math.sqrt(stimuli.length));
      if (num_rows % 2 != 0) {
        num_rows = num_rows + 1;
      }

      // compute coords for left and right side of arena
      var r_coords = [];
      var l_coords = [];
      for (const x of make_arr(0, trial.sort_area_width - trial.stim_width, num_rows)) {
        for (const y of make_arr(0, trial.sort_area_height - trial.stim_height, num_rows)) {
          if (x > (trial.sort_area_width - trial.stim_width) * 0.5) {
            r_coords.push({
              x: x + trial.sort_area_width * (0.5 * trial.column_spread_factor),
              y,
            });
          } else {
            l_coords.push({
              x: x - trial.sort_area_width * (0.5 * trial.column_spread_factor),
              y,
            });
          }
        }
      }

      // repeat coordinates until you have enough coords (may be obsolete)
      while (r_coords.length + l_coords.length < stimuli.length) {
        r_coords = r_coords.concat(r_coords);
        l_coords = l_coords.concat(l_coords);
      }
      // reverse left coords, so that coords closest to arena is used first
      l_coords = l_coords.reverse();

      // shuffle stimuli, so that starting positions are random
      stimuli = shuffle(stimuli);
    }

    for (let i = 0; i < stimuli.length; i++) {
      var coords;
      if (trial.stim_starts_inside) {
        coords = random_coordinate(
          trial.sort_area_width - trial.stim_width,
          trial.sort_area_height - trial.stim_height
        );
      } else {
        if (i % 2 == 0) {
          coords = r_coords[Math.floor(i * 0.5)];
        } else {
          coords = l_coords[Math.floor(i * 0.5)];
        }
      }

      display_element.querySelector("#jspsych-free-sort-arena").innerHTML +=
        "<img " +
        'src="' +
        stimuli[i] +
        '" ' +
        'data-src="' +
        stimuli[i] +
        '" ' +
        'class="jspsych-free-sort-draggable" ' +
        'draggable="false" ' +
        'id="jspsych-free-sort-draggable-' +
        i +
        '" ' +
        'style="position: absolute; cursor: move; width:' +
        trial.stim_width +
        "px; height:" +
        trial.stim_height +
        "px; top:" +
        coords.y +
        "px; left:" +
        coords.x +
        'px;">' +
        "</img>";

      init_locations.push({
        src: stimuli[i],
        x: coords.x,
        y: coords.y,
      });
    }
    const inside = stimuli.map(() => trial.stim_starts_inside);

    // moves within a trial
    const moves = [];

    // are objects currently inside
    let cur_in = false;

    // draggable items
    const draggables = Array.prototype.slice.call(
      display_element.querySelectorAll<HTMLImageElement>(".jspsych-free-sort-draggable")
    );

    // button (will show when all items are inside) and border (will change color)
    const border: HTMLElement = display_element.querySelector("#jspsych-free-sort-border");
    const button: HTMLButtonElement = display_element.querySelector("#jspsych-free-sort-done-btn");

    // when trial starts, modify text and border/background if all items are inside (stim_starts_inside: true)
    if (inside.some(Boolean) && trial.change_border_background_color) {
      border.style.borderColor = trial.border_color_in;
    }
    if (inside.every(Boolean)) {
      if (trial.change_border_background_color) {
        border.style.background = trial.border_color_in;
      }
      button.style.visibility = "visible";
      display_element.querySelector("#jspsych-free-sort-counter").innerHTML =
        trial.counter_text_finished;
    }

    for (const draggable of draggables) {
      draggable.addEventListener("pointerdown", function ({ clientX: pageX, clientY: pageY }) {
        let x = pageX - this.offsetLeft;
        let y = pageY - this.offsetTop - window.scrollY;
        this.style.transform = "scale(" + trial.scale_factor + "," + trial.scale_factor + ")";

        const on_pointer_move = ({ clientX, clientY }: PointerEvent) => {
          cur_in = inside_ellipse(
            clientX - x,
            clientY - y,
            trial.sort_area_width * 0.5 - trial.stim_width * 0.5,
            trial.sort_area_height * 0.5 - trial.stim_height * 0.5,
            trial.sort_area_width * 0.5,
            trial.sort_area_height * 0.5,
            trial.sort_area_shape == "square"
          );
          this.style.top =
            Math.min(
              trial.sort_area_height - trial.stim_height * 0.5,
              Math.max(-trial.stim_height * 0.5, clientY - y)
            ) + "px";
          this.style.left =
            Math.min(
              trial.sort_area_width * 1.5 - trial.stim_width,
              Math.max(-trial.sort_area_width * 0.5, clientX - x)
            ) + "px";

          // modify border while items is being moved
          if (trial.change_border_background_color) {
            if (cur_in) {
              border.style.borderColor = trial.border_color_in;
              border.style.background = "None";
            } else {
              border.style.borderColor = border_color_out;
              border.style.background = "None";
            }
          }

          // replace in overall array, grab index from item id
          var elem_number = parseInt(this.id.split("jspsych-free-sort-draggable-")[1], 10);
          inside.splice(elem_number, 1, cur_in);

          // modify text and background if all items are inside
          if (inside.every(Boolean)) {
            if (trial.change_border_background_color) {
              border.style.background = trial.border_color_in;
            }
            button.style.visibility = "visible";
            display_element.querySelector("#jspsych-free-sort-counter").innerHTML =
              trial.counter_text_finished;
          } else {
            border.style.background = "none";
            button.style.visibility = "hidden";
            display_element.querySelector("#jspsych-free-sort-counter").innerHTML =
              get_counter_text(inside.length - inside.filter(Boolean).length);
          }
        };
        document.addEventListener("pointermove", on_pointer_move);

        const on_pointer_up = (e) => {
          document.removeEventListener("pointermove", on_pointer_move);
          this.style.transform = "scale(1, 1)";
          if (trial.change_border_background_color) {
            if (inside.every(Boolean)) {
              border.style.background = trial.border_color_in;
              border.style.borderColor = trial.border_color_in;
            } else {
              border.style.background = "none";
              border.style.borderColor = border_color_out;
            }
          }
          moves.push({
            src: this.dataset.src,
            x: this.offsetLeft,
            y: this.offsetTop,
          });
          document.removeEventListener("pointerup", on_pointer_up);
        };
        document.addEventListener("pointerup", on_pointer_up);
      });
    }

    display_element.querySelector("#jspsych-free-sort-done-btn").addEventListener("click", () => {
      if (inside.every(Boolean)) {
        const end_time = performance.now();
        const rt = Math.round(end_time - start_time);
        // gather data
        const items = display_element.querySelectorAll<HTMLElement>(".jspsych-free-sort-draggable");
        // get final position of all items
        let final_locations = [];
        for (let i = 0; i < items.length; i++) {
          final_locations.push({
            src: items[i].dataset.src,
            x: parseInt(items[i].style.left),
            y: parseInt(items[i].style.top),
          });
        }

        const trial_data = {
          init_locations: init_locations,
          moves: moves,
          final_locations: final_locations,
          rt: rt,
        };

        this.jsPsych.finishTrial(trial_data);
      }
    });

    function get_counter_text(n: number) {
      var text_out = "";
      var text_bits = trial.counter_text_unfinished.split("%");
      for (var i = 0; i < text_bits.length; i++) {
        if (i % 2 === 0) {
          text_out += text_bits[i];
        } else {
          if (text_bits[i] == "n") {
            text_out += n.toString();
          } else if (text_bits[i] == "s" && n > 1) {
            text_out += "s";
          }
        }
      }
      return text_out;
    }
  }
}

export default FreeSortPlugin;
