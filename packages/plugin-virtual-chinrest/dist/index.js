import { ParameterType } from 'jspsych';

var version = "3.1.0";

const info = {
  name: "virtual-chinrest",
  version,
  parameters: {
    /**
     * Units to resize the jsPsych content to after the trial is over: `"none"` `"cm"` `"inch"` or `"deg"`.
     * If `"none"`, no resizing will be done to the jsPsych content after the virtual-chinrest trial ends.
     */
    resize_units: {
      type: ParameterType.SELECT,
      options: ["none", "cm", "inch", "deg"],
      default: "none"
    },
    /**
     * After the scaling factor is applied, this many pixels will equal one unit of measurement, where
     * the units are indicated by `resize_units`. This is only used when resizing is done after the
     * trial ends (i.e. the `resize_units` parameter is not "none").
     */
    pixels_per_unit: {
      type: ParameterType.INT,
      default: 100
    },
    // mouse_adjustment: {
    //   type: ParameterType.BOOL,
    //   pretty_name: "Adjust Using Mouse?",
    //   default: true,
    // },
    /** This string can contain HTML markup. Any content here will be displayed
     * **below the card stimulus** during the resizing phase.
     */
    adjustment_prompt: {
      type: ParameterType.HTML_STRING,
      default: `
          <div style="text-align: left;">
          <p>Click and drag the lower right corner of the image until it is the same size as a credit card held up to the screen.</p>
          <p>You can use any card that is the same size as a credit card, like a membership card or driver's license.</p>
          <p>If you do not have access to a real card you can use a ruler to measure the image width to 3.37 inches or 85.6 mm.</p>
          </div>`
    },
    /** Content of the button displayed below the card stimulus during the resizing phase. */
    adjustment_button_prompt: {
      type: ParameterType.HTML_STRING,
      default: "Click here when the image is the correct size"
    },
    /** Path of the item to be presented in the card stimulus during the resizing phase. If `null` then no
     * image is shown, and a solid color background is used instead. _An example image is available in
     * `/examples/img/card.png`_
     */
    item_path: {
      type: ParameterType.IMAGE,
      default: null,
      preload: false
    },
    /** The known height of the physical item (e.g. credit card) to be measured, in mm. */
    item_height_mm: {
      type: ParameterType.FLOAT,
      default: 53.98
    },
    /** The known width of the physical item (e.g. credit card) to be measured, in mm. */
    item_width_mm: {
      type: ParameterType.FLOAT,
      default: 85.6
    },
    /** The initial size of the card stimulus, in pixels, along its largest dimension. */
    item_init_size: {
      type: ParameterType.INT,
      default: 250
    },
    /** How many times to measure the blindspot location. If `0`, blindspot will not be detected, and viewing distance and degree data will not be computed. */
    blindspot_reps: {
      type: ParameterType.INT,
      default: 5
    },
    /** This string can contain HTML markup. Any content here will be displayed **above the blindspot task**. */
    blindspot_prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Blindspot prompt",
      default: `
          <p>Now we will quickly measure how far away you are sitting.</p>
          <div style="text-align: left">
            <ol>
              <li>Put your left hand on the <b>space bar</b>.</li>
              <li>Cover your right eye with your right hand.</li>
              <li>Using your left eye, focus on the black square. Keep your focus on the black square.</li>
              <li>The <span style="color: red; font-weight: bold;">red ball</span> will disappear as it moves from right to left. Press the space bar as soon as the ball disappears.</li>
            </ol>
          </div>
          <p>Press the space bar when you are ready to begin.</p>
          `
    },
    /** Content of the start button for the blindspot tasks. */
    // blindspot_start_prompt: {
    //   type: ParameterType.HTML_STRING,
    //   pretty_name: "Blindspot start prompt",
    //   default: "Start"
    // },
    /** Text accompanying the remaining measurements counter that appears below the blindspot task. */
    blindspot_measurements_prompt: {
      type: ParameterType.HTML_STRING,
      default: "Remaining measurements: "
    },
    /** Estimated viewing distance data displayed after blindspot task. If `"none"` is given, viewing distance will not be reported to the participant. The HTML `span` element with `id = distance-estimate` returns the distance. */
    viewing_distance_report: {
      type: ParameterType.HTML_STRING,
      default: "<p>Based on your responses, you are sitting about <span id='distance-estimate' style='font-weight: bold;'></span> from the screen.</p><p>Does that seem about right?</p>"
    },
    /** Text for the button on the viewing distance report page to re-do the viewing distance estimate. If the participant click this button, the blindspot task starts again. */
    redo_measurement_button_label: {
      type: ParameterType.HTML_STRING,
      default: "No, that is not close. Try again."
    },
    /** Text for the button on the viewing distance report page that can be clicked to accept the viewing distance estimate. */
    blindspot_done_prompt: {
      type: ParameterType.HTML_STRING,
      default: "Yes"
    }
  },
  data: {
    /** The response time in milliseconds. */
    rt: {
      type: ParameterType.INT
    },
    /** The height in millimeters of the item to be measured. */
    item_height_mm: {
      type: ParameterType.FLOAT
    },
    /** The width in millimeters of the item to be measured. */
    item_width_mm: {
      type: ParameterType.FLOAT
    },
    /** Final height of the resizable div container, in degrees. */
    item_height_deg: {
      type: ParameterType.FLOAT
    },
    /** Final width of the resizable div container, in degrees. */
    item_width_deg: {
      type: ParameterType.FLOAT
    },
    /** Final width of the resizable div container, in pixels. */
    item_width_px: {
      type: ParameterType.FLOAT
    },
    /** Pixels to degrees conversion factor. */
    px2deg: {
      type: ParameterType.INT
    },
    /** Pixels to millimeters conversion factor. */
    px2mm: {
      type: ParameterType.FLOAT
    },
    /** Scaling factor that will be applied to the div containing jsPsych content. */
    scale_factor: {
      type: ParameterType.FLOAT
    },
    /** The interior width of the window in degrees. */
    win_width_deg: {
      type: ParameterType.FLOAT
    },
    /** The interior height of the window in degrees. */
    win_height_deg: {
      type: ParameterType.FLOAT
    },
    /** Estimated distance to the screen in millimeters. */
    view_dist_mm: {
      type: ParameterType.FLOAT
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class VirtualChinrestPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
    this.ball_size = 30;
    this.ball = null;
    this.container = null;
    this.reps_remaining = 0;
    this.ball_animation_frame_id = null;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    if (!(trial.blindspot_reps > 0) && (trial.resize_units == "deg" || trial.resize_units == "degrees")) {
      console.error(
        "Blindspot repetitions set to 0, so resizing to degrees of visual angle is not possible!"
      );
      return;
    }
    this.reps_remaining = trial.blindspot_reps;
    let trial_data = {
      item_width_mm: trial.item_width_mm,
      item_height_mm: trial.item_height_mm
      //card dimension: 85.60 × 53.98 mm (3.370 × 2.125 in)
    };
    let blindspot_config_data = {
      ball_pos: [],
      slider_clck: false
    };
    let aspect_ratio = trial.item_width_mm / trial.item_height_mm;
    const start_div_height = aspect_ratio < 1 ? trial.item_init_size : Math.round(trial.item_init_size / aspect_ratio);
    const start_div_width = aspect_ratio < 1 ? Math.round(trial.item_init_size * aspect_ratio) : trial.item_init_size;
    const adjust_size = Math.round(start_div_width * 0.1);
    let pagesize_content = `
        <div id="page-size">
          <div id="item" style="border: none; height: ${start_div_height}px; width: ${start_div_width}px; margin: 5px auto; background-color: #ddd; position: relative; ${trial.item_path === null ? "" : `background-image: url(${trial.item_path}); background-size: 100% auto; background-repeat: no-repeat;`}">
            <div id="jspsych-resize-handle" style="cursor: nwse-resize; background-color: none; width: ${adjust_size}px; height: ${adjust_size}px; border: 5px solid red; border-left: 0; border-top: 0; position: absolute; bottom: 0; right: 0;">
            </div>
          </div>
          ${trial.adjustment_prompt}
          <button id="end_resize_phase" class="jspsych-btn">
            ${trial.adjustment_button_prompt}
          </button>
        </div>
      `;
    let blindspot_content = `
        <div id="blind-spot">
          ${trial.blindspot_prompt}
          <div id="svgDiv" style="height:100px; position:relative;"></div>
          <button class="btn btn-primary" id="proceed" style="display:none;"> +
            ${trial.blindspot_done_prompt} +
          </button>
          ${trial.blindspot_measurements_prompt} 
          <div id="click" style="display:inline; color: red"> ${trial.blindspot_reps} </div>
        </div>`;
    let report_content = `
        <div id="distance-report">
          <div id="info-h">
            ${trial.viewing_distance_report}
          </div>
          <button id="redo_blindspot" class="jspsych-btn">${trial.redo_measurement_button_label}</button>
          <button id="proceed" class="jspsych-btn">${trial.blindspot_done_prompt}</button>
        </div>
      `;
    display_element.innerHTML = `<div id="content" style="width: 900px; margin: 0 auto;"></div>`;
    const start_time = performance.now();
    startResizePhase();
    function startResizePhase() {
      display_element.querySelector("#content").innerHTML = pagesize_content;
      let dragging = false;
      let origin_x, origin_y;
      let cx, cy;
      const scale_div = display_element.querySelector("#item");
      function mouseupevent() {
        dragging = false;
      }
      document.addEventListener("mouseup", mouseupevent);
      function mousedownevent(e) {
        e.preventDefault();
        dragging = true;
        origin_x = e.pageX;
        origin_y = e.pageY;
        cx = parseInt(scale_div.style.width);
        cy = parseInt(scale_div.style.height);
      }
      display_element.querySelector("#jspsych-resize-handle").addEventListener("mousedown", mousedownevent);
      function resizeevent(e) {
        if (dragging) {
          let dx = e.pageX - origin_x;
          let dy = e.pageY - origin_y;
          if (Math.abs(dx) >= Math.abs(dy)) {
            scale_div.style.width = Math.round(Math.max(20, cx + dx * 2)) + "px";
            scale_div.style.height = Math.round(Math.max(20, cx + dx * 2) / aspect_ratio) + "px";
          } else {
            scale_div.style.height = Math.round(Math.max(20, cy + dy * 2)) + "px";
            scale_div.style.width = Math.round(aspect_ratio * Math.max(20, cy + dy * 2)) + "px";
          }
        }
      }
      display_element.addEventListener("mousemove", resizeevent);
      display_element.querySelector("#end_resize_phase").addEventListener("click", finishResizePhase);
    }
    function finishResizePhase() {
      const item_width_px = document.querySelector("#item").getBoundingClientRect().width;
      trial_data["item_width_px"] = Math.round(item_width_px);
      const px2mm = convertPixelsToMM(item_width_px);
      trial_data["px2mm"] = accurateRound(px2mm, 2);
      if (trial.blindspot_reps > 0) {
        startBlindSpotPhase();
      } else {
        endTrial();
      }
    }
    const startBlindSpotPhase = () => {
      blindspot_config_data = {
        ball_pos: [],
        slider_clck: false
      };
      display_element.querySelector("#content").innerHTML = blindspot_content;
      this.container = display_element.querySelector("#svgDiv");
      drawBall();
      resetAndWaitForBallStart();
    };
    const resetAndWaitForBallStart = () => {
      const rectX = this.container.getBoundingClientRect().width - this.ball_size;
      const ballX = rectX * 0.85;
      this.ball.style.left = `${ballX}px`;
      this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: startBall,
        valid_responses: [" "],
        rt_method: "performance",
        allow_held_key: false,
        persist: false
      });
    };
    const startBall = () => {
      this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: recordPosition,
        valid_responses: [" "],
        rt_method: "performance",
        allow_held_key: false,
        persist: false
      });
      this.ball_animation_frame_id = requestAnimationFrame(animateBall);
    };
    const finishBlindSpotPhase = () => {
      const angle = 13.5;
      const sum = blindspot_config_data["ball_pos"].reduce((a, b) => a + b, 0);
      const ballPosLen = blindspot_config_data["ball_pos"].length;
      blindspot_config_data["avg_ball_pos"] = accurateRound(sum / ballPosLen, 2);
      const ball_sqr_distance = (blindspot_config_data["square_pos"] - blindspot_config_data["avg_ball_pos"]) / trial_data["px2mm"];
      const viewDistance = ball_sqr_distance / Math.tan(deg_to_radians(angle));
      trial_data["view_dist_mm"] = accurateRound(viewDistance, 2);
      if (trial.viewing_distance_report == "none") {
        endTrial();
      } else {
        showReport();
      }
    };
    function showReport() {
      display_element.querySelector("#content").innerHTML = report_content;
      display_element.querySelector("#distance-estimate").innerHTML = `
          ${Math.round(trial_data["view_dist_mm"] / 10)} cm (${Math.round(
        trial_data["view_dist_mm"] * 0.0393701
      )} inches)
        `;
      display_element.querySelector("#redo_blindspot").addEventListener("click", startBlindSpotPhase);
      display_element.querySelector("#proceed").addEventListener("click", endTrial);
    }
    function computeTransformation() {
      trial_data.item_width_deg = 2 * Math.atan(trial_data["item_width_mm"] / 2 / trial_data["view_dist_mm"]) * 180 / Math.PI;
      trial_data.px2deg = trial_data["item_width_px"] / trial_data.item_width_deg;
      let px2unit_scr = 0;
      switch (trial.resize_units) {
        case "cm":
        case "centimeters":
          px2unit_scr = trial_data["px2mm"] * 10;
          break;
        case "inch":
        case "inches":
          px2unit_scr = trial_data["px2mm"] * 25.4;
          break;
        case "deg":
        case "degrees":
          px2unit_scr = trial_data["px2deg"];
          break;
      }
      if (px2unit_scr > 0) {
        let scale_factor = px2unit_scr / trial.pixels_per_unit;
        document.getElementById("jspsych-content").style.transform = "scale(" + scale_factor + ")";
        trial_data.px2deg = trial_data.px2deg / scale_factor;
        trial_data.px2mm = trial_data.px2mm / scale_factor;
        trial_data.item_width_px = trial_data.item_width_px / scale_factor;
        trial_data.scale_factor = scale_factor;
      }
      if (trial.blindspot_reps > 0) {
        trial_data.win_width_deg = window.innerWidth / trial_data.px2deg;
        trial_data.win_height_deg = window.innerHeight / trial_data.px2deg;
      } else {
        delete trial_data.px2deg;
        delete trial_data.item_width_deg;
      }
    }
    const endTrial = () => {
      trial_data.rt = Math.round(performance.now() - start_time);
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
      computeTransformation();
      this.jsPsych.finishTrial(trial_data);
    };
    const drawBall = () => {
      this.container.innerHTML = `
        <div id="virtual-chinrest-circle" style="position: absolute; background-color: #f00; width: ${this.ball_size}px; height: ${this.ball_size}px; border-radius:${this.ball_size}px;"></div>
        <div id="virtual-chinrest-square" style="position: absolute; background-color: #000; width: ${this.ball_size}px; height: ${this.ball_size}px;"></div>
      `;
      const ball = this.container.querySelector("#virtual-chinrest-circle");
      const square = this.container.querySelector("#virtual-chinrest-square");
      const rectX = this.container.getBoundingClientRect().width - this.ball_size;
      const ballX = rectX * 0.85;
      ball.style.left = `${ballX}px`;
      square.style.left = `${rectX}px`;
      this.ball = ball;
      blindspot_config_data["square_pos"] = accurateRound(getElementCenter(square).x, 2);
    };
    const animateBall = () => {
      const dx = -2;
      const x = parseInt(this.ball.style.left);
      this.ball.style.left = `${x + dx}px`;
      this.ball_animation_frame_id = requestAnimationFrame(animateBall);
    };
    const recordPosition = () => {
      cancelAnimationFrame(this.ball_animation_frame_id);
      blindspot_config_data["ball_pos"].push(accurateRound(getElementCenter(this.ball).x, 2));
      this.reps_remaining--;
      document.querySelector("#click").textContent = Math.max(
        this.reps_remaining,
        0
      ).toString();
      if (this.reps_remaining <= 0) {
        finishBlindSpotPhase();
      } else {
        resetAndWaitForBallStart();
      }
    };
    function convertPixelsToMM(item_width_px) {
      const px2mm = item_width_px / trial_data["item_width_mm"];
      return px2mm;
    }
    function accurateRound(value, decimals) {
      return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
    }
    function getElementCenter(el) {
      const box = el.getBoundingClientRect();
      return {
        x: box.left + box.width / 2,
        y: box.top + box.height / 2
      };
    }
    const deg_to_radians = (degrees) => {
      return degrees * Math.PI / 180;
    };
  }
}

export { VirtualChinrestPlugin as default };
//# sourceMappingURL=index.js.map
