import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "webgazer-calibrate",
  parameters: {
    /** An array of calibration points, where each element is an array cointaining the coordinates for one calibration point: [x,y] */
    calibration_points: {
      type: ParameterType.INT, // TO DO: nested array, so different type?
      default: [
        [10, 10],
        [10, 50],
        [10, 90],
        [50, 10],
        [50, 50],
        [50, 90],
        [90, 10],
        [90, 50],
        [90, 90],
      ],
      array: true,
    },
    /** What should the subject do in response to the calibration point presentation? Options are 'click' and 'view'. */
    calibration_mode: {
      type: ParameterType.SELECT,
      options: ["click", "view"],
      default: "click",
    },
    /** Size of the calibration points, in pixels */
    point_size: {
      type: ParameterType.INT,
      default: 20,
    },
    /** Number of repetitions per calibration point */
    repetitions_per_point: {
      type: ParameterType.INT,
      default: 1,
    },
    /** Whether or not to randomize the calibration point order */
    randomize_calibration_order: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** If calibration_mode is view, then this is the delay before calibration after the point is shown */
    time_to_saccade: {
      type: ParameterType.INT,
      default: 1000,
    },
    /** If calibration_mode is view, then this is the length of time to show the point while calibrating */
    time_per_point: {
      type: ParameterType.INT,
      default: 1000,
    },
  },
};

type Info = typeof info;

/**
 * **webgazer-calibrate**
 *
 * jsPsych plugin for calibrating webcam eye gaze location estimation.
 * Intended for use with the WebGazer eye-tracking extension, after the webcam has been initialized with the `webgazer-init-camera` plugin.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-webgazer-calibrate/ webgazer-calibrate plugin} and
 * {@link https://www.jspsych.org/overview/eye-tracking/ eye-tracking overview} documentation on jspsych.org
 */
class WebgazerCalibratePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
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
      this.jsPsych.extensions["webgazer"].resume();
      if (trial.calibration_mode == "click") {
        this.jsPsych.extensions["webgazer"].startMouseCalibration();
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

      var pt_dom = wg_container.querySelector<HTMLElement>("#calibration-point");

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

        var pt_start_cal: number = performance.now() + trial.time_to_saccade;
        var pt_finish: number = performance.now() + trial.time_to_saccade + trial.time_per_point;

        const watch_dot = () => {
          if (performance.now() > pt_start_cal) {
            this.jsPsych.extensions["webgazer"].calibratePoint(x, y, "click");
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
        this.jsPsych.extensions["webgazer"].stopMouseCalibration();
      }
      wg_container.innerHTML = "";
      end_trial();
    };

    // function to end trial when it is time
    const end_trial = () => {
      this.jsPsych.extensions["webgazer"].pause();
      this.jsPsych.extensions["webgazer"].hidePredictions();
      this.jsPsych.extensions["webgazer"].hideVideo();

      // kill any remaining setTimeout handlers
      this.jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {};

      // clear the display
      display_element.innerHTML = "";

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    calibrate();
  }
}

export default WebgazerCalibratePlugin;
