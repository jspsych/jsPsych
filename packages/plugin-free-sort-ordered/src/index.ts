import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

// import * as FreeSortPluginUtils from "@jspsych/plugin-free-sort/src/utils";
import * as FreeSortPluginUtils from "../../plugin-free-sort/src/utils";
import { version } from "../package.json";
import * as Utils from "./utils";

const info = <const>{
  name: "plugin-free-sort-ordered",
  version: version,
  parameters: {
    /** Each element of this array is an image path or SVG code. */
    stimuli: {
      type: ParameterType.INT | ParameterType.HTML_STRING,
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
    /** The correct order of the stimuli. */
    stim_order: {
      type: ParameterType.INT,
      default: undefined,
      array: true,
    },
    /** How much larger to make the stimulus while moving (1 = no scaling). */
    scale_factor: {
      type: ParameterType.FLOAT,
      default: 1.5,
    },
    /** The height of the container that the stimuli start in. */
    holding_area_height: {
      type: ParameterType.INT,
      default: 700,
    },
    /** The width of the container that the stimuli start in. */
    holding_area_width: {
      type: ParameterType.INT,
      default: 700,
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
    /** Whether to display counter indicating how many items are left to be sorted. */
    include_counter: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * Text to display when there are one or more items that still need to be placed in a box.
     * If "%n%" is included in the string, it will be replaced with the number of items that still need to be moved inside.
     * If "%s%" is included in the string, a "s" will be included when the number of items remaining is greater than one.
     */
    counter_text_unfinished: {
      type: ParameterType.HTML_STRING,
      default: "You still need to place %n% item%s% in a box.",
    },
    /** Text that will take the place of the counter_text_unfinished text when all items have been moved inside a box. */
    counter_text_finished: {
      type: ParameterType.HTML_STRING,
      default: "All items placed. Feel free to reposition items if necessary.",
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
      nested: {
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
    final_locations: {
      type: ParameterType.COMPLEX,
      array: true,
      nested: {
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
  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 * **plugin-free-sort-ordered**
 *
 * The free sort core plugin, but the images have to be sorted by placing into ordered boxes.
 *
 * @author Cherrie Chang
 * @see {@link /packages/plugin-free-sort-ordered/README.md}}
 */
class FreeSortOrderedPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var start_time = performance.now();

    // holding area
    const holding_area_html = `
      <div
      id="jspsych-free-sort-ordered-holding-area"
      class="jspsych-free-sort-ordered-holding-area"
      style="position: relative; width: ${trial.holding_area_width}px; height: ${trial.holding_area_height}px; background-color: #CCCCCC; margin: auto;"
      />`;

    // counter text if included
    const counter_html = `
      <p id="jspsych-free-sort-ordered-counter" style="display: inline-block;">
      ${trial.include_counter ? get_counter_text(trial.stimuli.length) : ""}
      </p>`;

    // container for the boxes
    let box_grid_html = `
      <div
      id="jspsych-free-sort-ordered-box-grid"
      class="jspsych-free-sort-ordered-box-grid"
      style="position: relative; max-width: 80vw; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center; align-items: center; margin: auto; padding: 20px;"
      >`;

    // create boxes for each stimulus
    for (let i = 0; i < trial.stimuli.length; i++) {
      box_grid_html += `
        <div
        id="jspsych-free-sort-ordered-box-${i}"
        class="jspsych-free-sort-ordered-box"
        style="width: ${trial.stim_width}px; height: ${trial.stim_height}px; background-color: #FFFFFF; border: 2px solid #000000; margin: 5px;"
        ></div>`;
    }
    box_grid_html += "</div>";

    // prompt text (and counter if included)
    const prompt_counter_html = `
      <div style="line-height: 1.0em;">
      ${trial.prompt + (trial.include_counter ? counter_html : "")}
      </div>`;

    // button to continue
    const button_html = `
      <div><button id="jspsych-free-sort-ordered-done-btn" class="jspsych-btn" style="margin-top: 5px; margin-bottom: 15px; visibility: hidden;">
      ${trial.button_label}
      </button></div>`;

    // combine all HTML
    let html =
      trial.prompt_location === "above"
        ? prompt_counter_html + holding_area_html + box_grid_html + button_html
        : holding_area_html + box_grid_html + prompt_counter_html + button_html;

    display_element.innerHTML = html;

    // store initial locations of stimuli
    let init_locations = [];

    // store locations of the boxes
    let boxCoordinates = [];
    for (let i = 0; i < trial.stimuli.length; i++) {
      const box = document.getElementById(`jspsych-free-sort-ordered-box-${i}`);
      if (box) {
        const rect = box.getBoundingClientRect();
        boxCoordinates.push({
          x: rect.left, // no need to adjust for scrolling because getBoundingClientRect() accounts for it
          y: rect.top,
        });
      } else {
        console.error(`Box element with id jspsych-free-sort-ordered-box-${i} not found.`);
      }
    }

    // boxes as array of objects
    const boxAreas = [];
    boxCoordinates.forEach((boxCoord, i) => {
      boxAreas.push({
        id: i,
        left: boxCoord.x,
        top: boxCoord.y,
        width: trial.stim_width,
        height: trial.stim_height,
      });
    });

    // place each stimulus in initial locations
    for (let i = 0; i < trial.stimuli.length; i++) {
      var coords = FreeSortPluginUtils.random_coordinate(
        trial.holding_area_width - trial.stim_width,
        trial.holding_area_height - trial.stim_height
      );

      // add stimuli and their initial locations to the display
      display_element.querySelector("#jspsych-free-sort-ordered-holding-area").innerHTML +=
        "<img " +
        'src="' +
        trial.stimuli[i] +
        '" ' +
        'data-src="' +
        trial.stimuli[i] +
        '" ' +
        'class="jspsych-free-sort-ordered-draggable" ' +
        'draggable="false" ' +
        'id="jspsych-free-sort-ordered-draggable-' +
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

      // add initial locations to the init_locations array
      init_locations.push({
        src: trial.stimuli[i],
        x: coords.x,
        y: coords.y,
      });
    }

    // moves within a trial
    let moves = [];

    // are objects currently inside
    let inside = new Array(trial.stimuli.length).fill(false);

    // button to finish sorting
    const button: HTMLButtonElement = display_element.querySelector("#jspsych-free-sort-done-btn");

    // save draggable items as array
    const draggables = Array.prototype.slice.call(
      display_element.querySelectorAll<HTMLImageElement>(".jspsych-free-sort-ordered-draggable")
    );

    // make each stimulus draggable by adding event listeners for when they are dragged and dropped
    draggables.forEach((draggable, i) => {
      draggable.addEventListener("pointerdown", function ({ clientX: pageX, clientY: pageY }) {
        let x = pageX - this.offsetLeft;
        let y = pageY - this.offsetTop - window.scrollY;
        this.style.transform = "scale(" + trial.scale_factor + "," + trial.scale_factor + ")";

        // on pointer move, check if the stimulus is inside a box and update its position
        const on_pointer_move = ({ clientX, clientY }: PointerEvent) => {
          inside[i] = Utils.inside_box(clientX - x, clientY - y, boxAreas);
          this.style.top =
            Math.min(
              window.innerHeight - trial.stim_height, // Bottom boundary of the viewport
              Math.max(0, clientY - y) // Top boundary of the viewport
            ) + "px";

          this.style.left =
            Math.min(
              window.innerWidth - trial.stim_width, // Right boundary of the viewport
              Math.max(0, clientX - x) // Left boundary of the viewport
            ) + "px";

          // modify text and background if all items are inside
          if (inside.every(Boolean)) {
            button.style.visibility = "visible";
            display_element.querySelector("#jspsych-free-sort-ordered-counter").innerHTML =
              trial.counter_text_finished;
          } else {
            button.style.visibility = "hidden";
            display_element.querySelector("#jspsych-free-sort-ordered-counter").innerHTML =
              get_counter_text(inside.length - inside.filter(Boolean).length);
          }
        };
        document.addEventListener("pointermove", on_pointer_move);

        // on pointer up, remove the event listeners and save the move
        const on_pointer_up = (e) => {
          document.removeEventListener("pointermove", on_pointer_move);
          this.style.transform = "scale(1, 1)";
          moves.push({
            src: this.dataset.src,
            x: this.offsetLeft,
            y: this.offsetTop,
          });
          document.removeEventListener("pointerup", on_pointer_up);
        };
        document.addEventListener("pointerup", on_pointer_up);
      });
    });

    display_element
      .querySelector("#jspsych-free-sort-ordered-done-btn")
      .addEventListener("click", () => {
        if (inside.every(Boolean)) {
          const end_time = performance.now();
          const rt = Math.round(end_time - start_time);
          // gather data
          const items = display_element.querySelectorAll<HTMLElement>(
            ".jspsych-free-sort-ordered-draggable"
          );
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

export default FreeSortOrderedPlugin;
