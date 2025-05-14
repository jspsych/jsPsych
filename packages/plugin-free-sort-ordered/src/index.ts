import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

// import * as FreeSortPluginUtils from "@jspsych/plugin-free-sort/src/utils";
import * as FreeSortPluginUtils from "../../plugin-free-sort/src/utils";
import { version } from "../package.json";
import * as Utils from "./utils";

const info = <const>{
  name: "plugin-free-sort-ordered",
  version: version,
  parameters: {
    stimulus: {
      type: ParameterType.COMPLEX,
      default: undefined,
      array: true,
    },
    boxes: {
      type: ParameterType.COMPLEX,
      default: undefined,
      array: true,
    },
    /** How much larger to make the stimulus while moving (1 = no scaling). */
    scale_factor: {
      type: ParameterType.FLOAT,
      default: 1.25,
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
    /** Checks if the stimuli are placed in the correct order, as determined by box_colors. */
    use_correctness: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** Pairs of stimuli and their correct positions. */
    correctness_by: {
      type: ParameterType.STRING,
      default: null,
    },
    /** How close to the box does the drag need to be to snap. */
    snap_margin: {
      type: ParameterType.INT,
      default: 10,
    },
    /** The margin between the boxes in pixels. */
    box_margin: {
      type: ParameterType.INT,
      default: 20,
    },
    /** The colour the boxes go when the stimulus is nearby */
    box_hover_color: {
      type: ParameterType.STRING,
      default: "#90EE90",
    },
    /** Whether multiple stimuli can be placed in the same box. If true, items in a box with multiple occupants will be scaled down. */
    allow_multiple_per_box: {
      type: ParameterType.BOOL,
      default: false,
    },
    // TODO
    reject_wrong_moves: {
      type: ParameterType.BOOL,
      default: false,
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
    /** When to show the button */
    show_button: {
      type: ParameterType.BOOL,
      default: true,
    },
    use_criteria: {
      type: ParameterType.STRING,
      default: ["none"],
      array: true, // "none", "correct_answers", "all_items_sorted", "all_boxes_used"
    },
    /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, the trial will wait for a response indefinitely.  */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: false,
    },
    /**
     * Text to display when there are one or more items that still need to be placed in a box.
     * If "%n%" is included in the string, it will be replaced with the number of items that still need to be moved inside.
     * If "%s%" is included in the string, a "s" will be included when the number of items remaining is greater than one.
     */
    /** Whether to display counter indicating how many items are left to be sorted. */
    include_counter: {
      type: ParameterType.BOOL,
      default: true,
    },
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
    var boxes = trial.boxes;
    var stimuli = trial.stimulus;

    // holding area
    const holding_area_html = `
      <div
      id="jspsych-free-sort-ordered-holding-area"
      class="jspsych-free-sort-ordered-holding-area"
      style="position: relative; width: ${trial.holding_area_width}px; height: ${trial.holding_area_height}px; background-color: #CCCCCC; margin: auto;">
      </div>`;

    // counter text if included
    const counter_html = `
      <p id="jspsych-free-sort-ordered-counter" style="display: inline-block;">
      ${trial.include_counter ? get_counter_text(stimuli.length) : ""}
      </p>`;

    // container for the target boxes
    let box_container_html = `
      <div
      id="jspsych-free-sort-ordered-box-grid"
      class="jspsych-free-sort-ordered-box-grid"
      style="position: relative; max-width: 80vw; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center; align-items: center; margin: auto; padding: 20px;"
      >`;

    // create boxes for each stimulus
    let stim_order = boxes;
    if (trial.use_correctness === true && trial.correctness_by !== null) {
      // shuffle based on correctness_by
      stim_order = this.jsPsych.randomization.shuffle(
        boxes.map((box) => box[trial.correctness_by])
      );
    }
    for (let i = 0; i < boxes.length; i++) {
      box_container_html += `
        <div
        id="jspsych-free-sort-ordered-box-${i}"
        class="jspsych-free-sort-ordered-box"
        style="width: ${boxes[i].width}px; height: ${boxes[i].height}px; background-color: #FFFFFF; border: 2px solid #000000; margin: ${trial.box_margin}px;"
        ></div>`;
    }
    box_container_html += "</div>";

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
        ? prompt_counter_html + holding_area_html + box_container_html + button_html
        : holding_area_html + box_container_html + prompt_counter_html + button_html;

    display_element.innerHTML = html;

    // if we want people to match by color.
    if (trial.use_correctness && trial.correctness_by === "color") {
      for (let i = 0; i < boxes.length; i++) {
        const boxElement = document.getElementById(`jspsych-free-sort-ordered-box-${i}`);
        boxElement.style.borderColor = stim_order[i];
      }
    }

    // store initial locations of stimuli
    let init_locations = [];

    // store locations of the boxes
    let boxCoordinates = [];
    for (let i = 0; i < boxes.length; i++) {
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
    for (let i = 0; i < stimuli.length; i++) {
      var coords = FreeSortPluginUtils.random_coordinate(
        trial.holding_area_width - boxes[i].width,
        trial.holding_area_height - boxes[i].height
      );

      // add stimuli and their initial locations to the display
      display_element.querySelector("#jspsych-free-sort-ordered-holding-area").innerHTML +=
        "<img " +
        'src="' +
        stimuli[i].file +
        '" ' +
        'data-src="' +
        stimuli[i].file +
        '" ' +
        'class="jspsych-free-sort-ordered-draggable" ' +
        'draggable="false" ' +
        'id="jspsych-free-sort-ordered-draggable-' +
        i +
        '" ' +
        'style="position: absolute; cursor: move; width:' +
        stimuli[i].width +
        "px; height:" +
        stimuli[i].height +
        "px; top:" +
        coords.y +
        "px; left:" +
        coords.x +
        'px;">' +
        "</img>";

      // add initial locations to the init_locations array
      init_locations.push({
        src: stimuli[i].file,
        x: coords.x,
        y: coords.y,
      });
    }

    // moves within a trial
    let moves = [];

    // are objects currently inside
    let inside = new Array(stimuli.length).fill(false);

    // button to finish sorting
    const button: HTMLButtonElement = display_element.querySelector(
      "#jspsych-free-sort-ordered-done-btn"
    );

    // save draggable items as array
    const draggables = Array.prototype.slice.call(
      display_element.querySelectorAll<HTMLImageElement>(".jspsych-free-sort-ordered-draggable")
    );

    // make each stimulus draggable by adding event listeners for when they are dragged and dropped
    draggables.forEach((draggable, i) => {
      draggable.addEventListener("pointerdown", function ({ clientX: pageX, clientY: pageY }) {
        let x = pageX - this.offsetLeft;
        let y = pageY - this.offsetTop - window.scrollY;
        //this.style.transform = "scale(" + trial.scale_factor + "," + trial.scale_factor + ")";

        // on pointer move, check if the stimulus is inside a box and update its position
        const on_pointer_move = ({ clientX, clientY }: PointerEvent) => {
          for (let j = 0; j < inside.length; j++) {
            document.getElementById(`jspsych-free-sort-ordered-box-${j}`).style.backgroundColor =
              "white";
            document.getElementById(`jspsych-free-sort-ordered-box-${j}`).style.boxShadow = "none";
          }
          let position = Utils.getPosition(this);
          inside[i] = Utils.inside_box(position.x, position.y, trial.snap_margin, boxAreas);

          // Calculate new positions
          let newTop = clientY - y;
          let newLeft = clientX - x;
          const bottomOfBoxes = boxAreas.reduce(
            (max, box) => Math.max(max, box.top + box.height),
            0
          );
          const maxBoxHeight = Math.max(...boxAreas.map((box) => box.height));

          // left + right
          newLeft = Math.max(0, newLeft);
          newLeft = Math.min(newLeft, trial.holding_area_width - this.offsetWidth);
          // top + bottom
          newTop = Math.max(0, newTop);
          newTop = Math.min(newTop, bottomOfBoxes - maxBoxHeight);

          // Apply the constrained position
          this.style.top = newTop + "px";
          this.style.left = newLeft + "px";

          if (typeof inside[i] === "number") {
            // add colour to the box the stimulus is nearest to
            document.getElementById(
              `jspsych-free-sort-ordered-box-${inside[i]}`
            ).style.backgroundColor = trial.box_hover_color;
            // add shadow to the box
            document.getElementById(`jspsych-free-sort-ordered-box-${inside[i]}`).style.boxShadow =
              "0 0 10px rgba(0, 0, 0, 0.5)";
            // make stimulus slightly larger
            this.style.transform = "scale(" + trial.scale_factor + "," + trial.scale_factor + ")";
          }
        };
        document.addEventListener("pointermove", on_pointer_move);

        // on pointer up, remove the event listeners and save the move
        const on_pointer_up = () => {
          document.removeEventListener("pointermove", on_pointer_move);
          this.style.transform = "scale(1, 1)";
          if (typeof inside[i] === "number") {
            if (trial.allow_multiple_per_box && inside.includes(inside[i])) {
              // if multiple items are allowed, scale down the items in the box
              const boxes = document.querySelectorAll<HTMLElement>(
                ".jspsych-free-sort-ordered-box"
              );
              const items = document.querySelectorAll<HTMLElement>(
                ".jspsych-free-sort-ordered-draggable"
              );
            }
            const box = document.getElementById(`jspsych-free-sort-ordered-box-${inside[i]}`);
            if (box) {
              const box_rect = box.getBoundingClientRect();
              const holding_area = document.getElementById(
                "jspsych-free-sort-ordered-holding-area"
              );
              const holding_rect = holding_area.getBoundingClientRect();

              // Calculate position relative to the holding area
              const left_pos = box_rect.left - holding_rect.left + window.scrollX;
              const top_pos = box_rect.top - holding_rect.top + window.scrollY;

              // Center the image in the box if needed
              this.style.left = left_pos + "px";
              this.style.top = top_pos + "px";
              this.style.position = "absolute";

              // TODO: if there are multiple items in the box, scale them down

              // remove shadow from the box
              box.style.boxShadow = "none";
              document.getElementById(
                `jspsych-free-sort-ordered-box-${inside[i]}`
              ).style.backgroundColor = "white";
            }
          }
          moves.push({
            src: this.dataset.src,
            x: this.offsetLeft,
            y: this.offsetTop,
          });
          document.removeEventListener("pointerup", on_pointer_up);
          console.log(inside);
          // check if all stimuli are in correct boxes
          if (trial.use_correctness) {
            // if the item has been placed in the incorrect box, based on stim_order[stimBox] === boxes[stimNo][trial.correctness_by], put it back
            const allItemsInCorrectBoxes = inside.every((stimBox, stimNo) => {
              // If stimulus is not in any box, return false
              if (stimBox === false || stimBox === null) return false;
              // Return true if the colors match (stimulus is in correct box)
              return stim_order[stimBox] === boxes[stimNo][trial.correctness_by];
            });
            const isComplete = allItemsInCorrectBoxes;
            button.style.visibility = isComplete ? "visible" : "hidden";
            display_element.querySelector("#jspsych-free-sort-ordered-counter").innerHTML =
              isComplete
                ? trial.counter_text_finished
                : get_counter_text(inside.filter((value) => typeof value !== "number").length);
          } else {
            const allItemsInBoxes =
              inside.filter((value) => typeof value !== "number").length === 0;
            button.style.visibility = allItemsInBoxes ? "visible" : "hidden";
            display_element.querySelector("#jspsych-free-sort-ordered-counter").innerHTML =
              allItemsInBoxes
                ? trial.counter_text_finished
                : get_counter_text(inside.filter((value) => typeof value !== "number").length);
          }
        };
        document.addEventListener("pointerup", on_pointer_up);
      });
    });

    display_element
      .querySelector("#jspsych-free-sort-ordered-done-btn")
      .addEventListener("click", () => {
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
