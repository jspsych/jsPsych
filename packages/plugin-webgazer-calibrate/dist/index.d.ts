import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "webgazer-calibrate";
    readonly version: string;
    readonly parameters: {
        /** Array of points in `[x,y]` coordinates. Specified as a percentage of the screen width and height, from the left and top edge. The default grid is 9 points. */
        readonly calibration_points: {
            readonly type: ParameterType.INT;
            readonly default: readonly [readonly [10, 10], readonly [10, 50], readonly [10, 90], readonly [50, 10], readonly [50, 50], readonly [50, 90], readonly [90, 10], readonly [90, 50], readonly [90, 90]];
            readonly array: true;
        };
        /** Can specify `click` to have participants click on calibration points or `view` to have participants passively watch calibration points.  */
        readonly calibration_mode: {
            readonly type: ParameterType.SELECT;
            readonly options: readonly ["click", "view"];
            readonly default: "click";
        };
        /** Diameter of the calibration points in pixels. */
        readonly point_size: {
            readonly type: ParameterType.INT;
            readonly default: 20;
        };
        /** The number of times to repeat the sequence of calibration points. */
        readonly repetitions_per_point: {
            readonly type: ParameterType.INT;
            readonly default: 1;
        };
        /** Whether to randomize the order of the calibration points. */
        readonly randomize_calibration_order: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** If `calibration_mode` is set to `view`, then this is the delay before calibrating after showing a point.
         * Gives the participant time to fixate on the new target before assuming that the participant is looking at the target. */
        readonly time_to_saccade: {
            readonly type: ParameterType.INT;
            readonly default: 1000;
        };
        /**
         * If `calibration_mode` is set to `view`, then this is the length of time to show a point while calibrating. Note
         * that if `click` calibration is used then the point will remain on the screen until clicked.
         */
        readonly time_per_point: {
            readonly type: ParameterType.INT;
            readonly default: 1000;
        };
    };
    readonly data: {};
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 *
 * This plugin can be used to calibrate the [WebGazer extension](../extensions/webgazer.md). For a narrative
 * description of eye tracking with jsPsych, see the [eye tracking overview](../overview/eye-tracking.md).
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/webgazer-calibrate/ webgazer-calibrate plugin} and
 * {@link https://www.jspsych.org/latest/overview/eye-tracking/ eye-tracking overview} documentation on jspsych.org
 */
declare class WebgazerCalibratePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "webgazer-calibrate";
        readonly version: string;
        readonly parameters: {
            /** Array of points in `[x,y]` coordinates. Specified as a percentage of the screen width and height, from the left and top edge. The default grid is 9 points. */
            readonly calibration_points: {
                readonly type: ParameterType.INT;
                readonly default: readonly [readonly [10, 10], readonly [10, 50], readonly [10, 90], readonly [50, 10], readonly [50, 50], readonly [50, 90], readonly [90, 10], readonly [90, 50], readonly [90, 90]];
                readonly array: true;
            };
            /** Can specify `click` to have participants click on calibration points or `view` to have participants passively watch calibration points.  */
            readonly calibration_mode: {
                readonly type: ParameterType.SELECT;
                readonly options: readonly ["click", "view"];
                readonly default: "click";
            };
            /** Diameter of the calibration points in pixels. */
            readonly point_size: {
                readonly type: ParameterType.INT;
                readonly default: 20;
            };
            /** The number of times to repeat the sequence of calibration points. */
            readonly repetitions_per_point: {
                readonly type: ParameterType.INT;
                readonly default: 1;
            };
            /** Whether to randomize the order of the calibration points. */
            readonly randomize_calibration_order: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** If `calibration_mode` is set to `view`, then this is the delay before calibrating after showing a point.
             * Gives the participant time to fixate on the new target before assuming that the participant is looking at the target. */
            readonly time_to_saccade: {
                readonly type: ParameterType.INT;
                readonly default: 1000;
            };
            /**
             * If `calibration_mode` is set to `view`, then this is the length of time to show a point while calibrating. Note
             * that if `click` calibration is used then the point will remain on the screen until clicked.
             */
            readonly time_per_point: {
                readonly type: ParameterType.INT;
                readonly default: 1000;
            };
        };
        readonly data: {};
        readonly citations: "__CITATIONS__";
    };
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
}

export { WebgazerCalibratePlugin as default };
