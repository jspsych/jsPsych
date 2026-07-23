import { ParameterType } from 'jspsych';

var version = "2.1.0";

const info = {
  name: "webgazer-calibrate",
  version,
  parameters: {
    /** Array of points in `[x,y]` coordinates. Specified as a percentage of the screen width and height, from the left and top edge. The default grid is 9 points. */
    calibration_points: {
      type: ParameterType.INT,
      // TO DO: nested array, so different type?
      default: [
        [10, 10],
        [10, 50],
        [10, 90],
        [50, 10],
        [50, 50],
        [50, 90],
        [90, 10],
        [90, 50],
        [90, 90]
      ],
      array: true
    },
    /** Can specify `click` to have participants click on calibration points or `view` to have participants passively watch calibration points.  */
    calibration_mode: {
      type: ParameterType.SELECT,
      options: ["click", "view"],
      default: "click"
    },
    /** Diameter of the calibration points in pixels. */
    point_size: {
      type: ParameterType.INT,
      default: 20
    },
    /** The number of times to repeat the sequence of calibration points. */
    repetitions_per_point: {
      type: ParameterType.INT,
      default: 1
    },
    /** Whether to randomize the order of the calibration points. */
    randomize_calibration_order: {
      type: ParameterType.BOOL,
      default: false
    },
    /** If `calibration_mode` is set to `view`, then this is the delay before calibrating after showing a point.
     * Gives the participant time to fixate on the new target before assuming that the participant is looking at the target. */
    time_to_saccade: {
      type: ParameterType.INT,
      default: 1e3
    },
    /**
     * If `calibration_mode` is set to `view`, then this is the length of time to show a point while calibrating. Note
     * that if `click` calibration is used then the point will remain on the screen until clicked.
     */
    time_per_point: {
      type: ParameterType.INT,
      default: 1e3
    }
  },
  data: {
    // no data collected
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class WebgazerCalibratePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    const extension = this.jsPsych.extensions.webgazer;
    var html = `
          <div id='webgazer-calibrate-container' style='position: relative; width:100vw; height:100vh'>
          </div>`;
    display_element.innerHTML = html;
    var wg_container = display_element.querySelector("#webgazer-calibrate-container");
    var reps_completed = 0;
    var points_completed = -1;
    var cal_points = null;
    const next_calibration_round = () => {
      if (trial.randomize_calibration_order) {
        cal_points = this.jsPsych.randomization.shuffle(trial.calibration_points);
      } else {
        cal_points = trial.calibration_points;
      }
      points_completed = -1;
      next_calibration_point();
    };
    const calibrate = () => {
      extension.resume();
      if (trial.calibration_mode == "click") {
        extension.startMouseCalibration();
      }
      next_calibration_round();
    };
    const next_calibration_point = () => {
      points_completed++;
      if (points_completed == cal_points.length) {
        reps_completed++;
        if (reps_completed == trial.repetitions_per_point) {
          calibration_done();
        } else {
          next_calibration_round();
        }
      } else {
        var pt = cal_points[points_completed];
        calibration_display_gaze_only(pt);
      }
    };
    const calibration_display_gaze_only = (pt) => {
      var pt_html = `<div id="calibration-point" style="width:${trial.point_size}px; height:${trial.point_size}px; border-radius:${trial.point_size}px; border: 1px solid #000; background-color: #333; position: absolute; left:${pt[0]}%; top:${pt[1]}%;"></div>`;
      wg_container.innerHTML = pt_html;
      var pt_dom = wg_container.querySelector("#calibration-point");
      if (trial.calibration_mode == "click") {
        pt_dom.style.cursor = "pointer";
        pt_dom.addEventListener("click", () => {
          next_calibration_point();
        });
      }
      if (trial.calibration_mode == "view") {
        var br = pt_dom.getBoundingClientRect();
        var x = br.left + br.width / 2;
        var y = br.top + br.height / 2;
        var pt_start_cal = performance.now() + trial.time_to_saccade;
        var pt_finish = performance.now() + trial.time_to_saccade + trial.time_per_point;
        const watch_dot = () => {
          if (performance.now() > pt_start_cal) {
            extension.calibratePoint(x, y);
          }
          if (performance.now() < pt_finish) {
            requestAnimationFrame(watch_dot);
          } else {
            next_calibration_point();
          }
        };
        requestAnimationFrame(watch_dot);
      }
    };
    const calibration_done = () => {
      if (trial.calibration_mode == "click") {
        extension.stopMouseCalibration();
      }
      wg_container.innerHTML = "";
      end_trial();
    };
    const end_trial = () => {
      extension.pause();
      extension.hidePredictions();
      extension.hideVideo();
      var trial_data = {};
      this.jsPsych.finishTrial(trial_data);
    };
    calibrate();
  }
}

export { WebgazerCalibratePlugin as default };
//# sourceMappingURL=index.js.map
