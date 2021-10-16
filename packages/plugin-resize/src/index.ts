import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "resize",
  parameters: {
    /** The height of the item to be measured. */
    item_height: {
      type: ParameterType.INT,
      pretty_name: "Item height",
      default: 1,
    },
    /** The width of the item to be measured. */
    item_width: {
      type: ParameterType.INT,
      pretty_name: "Item width",
      default: 1,
    },
    /** The content displayed below the resizable box and above the button. */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null,
    },
    /** After the scaling factor is applied, this many pixels will equal one unit of measurement. */
    pixels_per_unit: {
      type: ParameterType.INT,
      pretty_name: "Pixels per unit",
      default: 100,
    },
    /** The initial size of the box, in pixels, along the larget dimension. */
    starting_size: {
      type: ParameterType.INT,
      pretty_name: "Starting size",
      default: 100,
    },
    /** Label to display on the button to complete calibration. */
    button_label: {
      type: ParameterType.STRING,
      pretty_name: "Button label",
      default: "Continue",
    },
  },
};

type Info = typeof info;

/**
 * **resize**
 *
 * jsPsych plugin for controlling the real world size of the display
 *
 * @author Steve Chao
 * @see {@link https://www.jspsych.org/plugins/jspsych-resize/ resize plugin documentation on jspsych.org}
 */
class ResizePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var aspect_ratio = trial.item_width / trial.item_height;

    // variables to determine div size
    if (trial.item_width >= trial.item_height) {
      var start_div_width = trial.starting_size as number;
      var start_div_height = Math.round(trial.starting_size / aspect_ratio);
    } else {
      var start_div_height = trial.starting_size as number;
      var start_div_width = Math.round(trial.starting_size * aspect_ratio);
    }

    // create html for display
    var html =
      '<div id="jspsych-resize-div" style="border: 2px solid steelblue; height: ' +
      start_div_height +
      "px; width:" +
      start_div_width +
      'px; margin: 7px auto; background-color: lightsteelblue; position: relative;">';
    html +=
      '<div id="jspsych-resize-handle" style="cursor: nwse-resize; background-color: steelblue; width: 10px; height: 10px; border: 2px solid lightsteelblue; position: absolute; bottom: 0; right: 0;"></div>';
    html += "</div>";
    if (trial.prompt !== null) {
      html += trial.prompt;
    }
    html += '<a class="jspsych-btn" id="jspsych-resize-btn">' + trial.button_label + "</a>";

    // render
    display_element.innerHTML = html;

    // function to end trial
    const end_trial = () => {
      // clear document event listeners
      document.removeEventListener("mousemove", resizeevent);
      document.removeEventListener("mouseup", mouseupevent);

      // clear the screen
      display_element.innerHTML = "";

      // finishes trial

      var trial_data = {
        final_height_px: final_height_px,
        final_width_px: final_width_px,
        scale_factor: scale_factor,
      };

      this.jsPsych.finishTrial(trial_data);
    };

    // listens for the click
    document.getElementById("jspsych-resize-btn").addEventListener("click", () => {
      scale();
      end_trial();
    });

    var dragging = false;
    var origin_x, origin_y;
    var cx, cy;

    var mousedownevent = (e) => {
      e.preventDefault();
      dragging = true;
      origin_x = e.pageX;
      origin_y = e.pageY;
      cx = parseInt(scale_div.style.width);
      cy = parseInt(scale_div.style.height);
    };

    display_element
      .querySelector("#jspsych-resize-handle")
      .addEventListener("mousedown", mousedownevent);

    var mouseupevent = (e) => {
      dragging = false;
    };

    document.addEventListener("mouseup", mouseupevent);

    var scale_div: HTMLDivElement = display_element.querySelector("#jspsych-resize-div");

    var resizeevent = (e) => {
      if (dragging) {
        var dx = e.pageX - origin_x;
        var dy = e.pageY - origin_y;

        if (Math.abs(dx) >= Math.abs(dy)) {
          scale_div.style.width = Math.round(Math.max(20, cx + dx * 2)) + "px";
          scale_div.style.height = Math.round(Math.max(20, cx + dx * 2) / aspect_ratio) + "px";
        } else {
          scale_div.style.height = Math.round(Math.max(20, cy + dy * 2)) + "px";
          scale_div.style.width = Math.round(aspect_ratio * Math.max(20, cy + dy * 2)) + "px";
        }
      }
    };

    document.addEventListener("mousemove", resizeevent);

    // scales the stimulus
    var scale_factor;
    var final_height_px, final_width_px;
    function scale() {
      final_width_px = scale_div.offsetWidth;
      //final_height_px = scale_div.offsetHeight;

      var pixels_unit_screen = final_width_px / trial.item_width;

      scale_factor = pixels_unit_screen / trial.pixels_per_unit;
      document.getElementById("jspsych-content").style.transform = "scale(" + scale_factor + ")";
    }
  }
}

export default ResizePlugin;
