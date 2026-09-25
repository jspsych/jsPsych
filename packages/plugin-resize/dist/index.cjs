'use strict';

var jspsych = require('jspsych');

var version = "2.1.0";

const info = {
  name: "resize",
  version,
  parameters: {
    /** The height of the item to be measured. Any units can be used
     * as long as you are consistent with using the same units for
     * all parameters. */
    item_height: {
      type: jspsych.ParameterType.INT,
      default: 1
    },
    /** The width of the item to be measured. */
    item_width: {
      type: jspsych.ParameterType.INT,
      default: 1
    },
    /** The content displayed below the resizable box and above the button. */
    prompt: {
      type: jspsych.ParameterType.HTML_STRING,
      default: null
    },
    /** After the scaling factor is applied, this many pixels will equal one unit of measurement. */
    pixels_per_unit: {
      type: jspsych.ParameterType.INT,
      default: 100
    },
    /** The initial size of the box, in pixels, along the largest dimension.
     * The aspect ratio will be set automatically to match the item width and height. */
    starting_size: {
      type: jspsych.ParameterType.INT,
      default: 100
    },
    /** Label to display on the button to complete calibration. */
    button_label: {
      type: jspsych.ParameterType.STRING,
      default: "Continue"
    }
  },
  data: {
    /** Final width of the resizable div container, in pixels. */
    final_width_px: {
      type: jspsych.ParameterType.INT
    },
    /** Scaling factor that will be applied to the div containing jsPsych content. */
    scale_factor: {
      type: jspsych.ParameterType.FLOAT
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class ResizePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    var aspect_ratio = trial.item_width / trial.item_height;
    if (trial.item_width >= trial.item_height) {
      var start_div_width = trial.starting_size;
      var start_div_height = Math.round(trial.starting_size / aspect_ratio);
    } else {
      var start_div_height = trial.starting_size;
      var start_div_width = Math.round(trial.starting_size * aspect_ratio);
    }
    var html = '<div id="jspsych-resize-div" style="border: 2px solid steelblue; height: ' + start_div_height + "px; width:" + start_div_width + 'px; margin: 7px auto; background-color: lightsteelblue; position: relative;">';
    html += '<div id="jspsych-resize-handle" style="cursor: nwse-resize; background-color: steelblue; width: 10px; height: 10px; border: 2px solid lightsteelblue; position: absolute; bottom: 0; right: 0;"></div>';
    html += "</div>";
    if (trial.prompt !== null) {
      html += trial.prompt;
    }
    html += '<a class="jspsych-btn" id="jspsych-resize-btn">' + trial.button_label + "</a>";
    display_element.innerHTML = html;
    const end_trial = () => {
      document.removeEventListener("mousemove", resizeevent);
      document.removeEventListener("mouseup", mouseupevent);
      var trial_data = {
        final_height_px,
        final_width_px,
        scale_factor
      };
      this.jsPsych.finishTrial(trial_data);
    };
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
    display_element.querySelector("#jspsych-resize-handle").addEventListener("mousedown", mousedownevent);
    var mouseupevent = (e) => {
      dragging = false;
    };
    document.addEventListener("mouseup", mouseupevent);
    var scale_div = display_element.querySelector("#jspsych-resize-div");
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
    var scale_factor;
    var final_height_px, final_width_px;
    function scale() {
      final_width_px = scale_div.offsetWidth;
      var pixels_unit_screen = final_width_px / trial.item_width;
      scale_factor = pixels_unit_screen / trial.pixels_per_unit;
      document.getElementById("jspsych-content").style.transform = "scale(" + scale_factor + ")";
    }
  }
}

module.exports = ResizePlugin;
//# sourceMappingURL=index.cjs.map
