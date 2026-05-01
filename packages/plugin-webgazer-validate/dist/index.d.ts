import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "webgazer-validate";
    readonly version: string;
    readonly parameters: {
        /** Array of points in [x,y] coordinates */
        readonly validation_points: {
            readonly type: ParameterType.INT;
            readonly default: readonly [readonly [10, 10], readonly [10, 50], readonly [10, 90], readonly [50, 10], readonly [50, 50], readonly [50, 90], readonly [90, 10], readonly [90, 50], readonly [90, 90]];
            readonly array: true;
        };
        /**
         * Are the validation_points specified as percentages of screen width and height, or the distance in pixels from the center of the screen?
         * Options are 'percent' and 'center-offset-pixels'
         */
        readonly validation_point_coordinates: {
            readonly type: ParameterType.SELECT;
            readonly default: "percent";
            readonly options: readonly ["percent", "center-offset-pixels"];
        };
        /** Tolerance around validation point in pixels */
        readonly roi_radius: {
            readonly type: ParameterType.INT;
            readonly default: 200;
        };
        /** Whether or not to randomize the order of validation points */
        readonly randomize_validation_order: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** Delay before validating after showing a point */
        readonly time_to_saccade: {
            readonly type: ParameterType.INT;
            readonly default: 1000;
        };
        /** Length of time to show each point */
        readonly validation_duration: {
            readonly type: ParameterType.INT;
            readonly default: 2000;
        };
        /** Validation point size in pixels */
        readonly point_size: {
            readonly type: ParameterType.INT;
            readonly default: 20;
        };
        /** If true, then validation data will be shown on the screen after validation is complete */
        readonly show_validation_data: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
    };
    readonly data: {
        /** Raw gaze data for the trial. The array will contain a nested array for each validation point. Within each nested array will be a list of `{x,y,dx,dy}` values specifying the absolute x and y pixels, as well as the distance from the target for that gaze point. */
        readonly raw_gaze: {
            readonly type: ParameterType.COMPLEX;
            readonly array: true;
            readonly nested: {
                readonly x: {
                    readonly type: ParameterType.INT;
                };
                readonly y: {
                    readonly type: ParameterType.INT;
                };
                readonly dx: {
                    readonly type: ParameterType.INT;
                };
                readonly dy: {
                    readonly type: ParameterType.INT;
                };
            };
        };
        /** The percentage of samples within the `roi_radius` for each validation point. */
        readonly percent_in_roi: {
            readonly type: ParameterType.FLOAT;
            readonly array: true;
        };
        /** The average `x` and `y` distance from each validation point, plus the median distance `r` of the points from this average offset. */
        readonly average_offset: {
            readonly type: ParameterType.FLOAT;
            readonly array: true;
        };
        /** The average number of samples per second. Calculated by finding samples per second for each point and then averaging these estimates together. */
        readonly samples_per_sec: {
            readonly type: ParameterType.FLOAT;
        };
        /** The list of validation points, in the order that they appeared. */
        readonly validation_points: {
            readonly type: ParameterType.INT;
            readonly array: true;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin can be used to measure the accuracy and precision of gaze predictions made by the
 * [WebGazer extension](../extensions/webgazer.md). For a narrative description of eye tracking with jsPsych,
 * see the [eye tracking overview](../overview/eye-tracking.md).
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/webgazer-validate/ webgazer-validate plugin} and
 * {@link https://www.jspsych.org/latest/overview/eye-tracking/ eye-tracking overview} documentation on jspsych.org
 */
declare class WebgazerValidatePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "webgazer-validate";
        readonly version: string;
        readonly parameters: {
            /** Array of points in [x,y] coordinates */
            readonly validation_points: {
                readonly type: ParameterType.INT;
                readonly default: readonly [readonly [10, 10], readonly [10, 50], readonly [10, 90], readonly [50, 10], readonly [50, 50], readonly [50, 90], readonly [90, 10], readonly [90, 50], readonly [90, 90]];
                readonly array: true;
            };
            /**
             * Are the validation_points specified as percentages of screen width and height, or the distance in pixels from the center of the screen?
             * Options are 'percent' and 'center-offset-pixels'
             */
            readonly validation_point_coordinates: {
                readonly type: ParameterType.SELECT;
                readonly default: "percent";
                readonly options: readonly ["percent", "center-offset-pixels"];
            };
            /** Tolerance around validation point in pixels */
            readonly roi_radius: {
                readonly type: ParameterType.INT;
                readonly default: 200;
            };
            /** Whether or not to randomize the order of validation points */
            readonly randomize_validation_order: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** Delay before validating after showing a point */
            readonly time_to_saccade: {
                readonly type: ParameterType.INT;
                readonly default: 1000;
            };
            /** Length of time to show each point */
            readonly validation_duration: {
                readonly type: ParameterType.INT;
                readonly default: 2000;
            };
            /** Validation point size in pixels */
            readonly point_size: {
                readonly type: ParameterType.INT;
                readonly default: 20;
            };
            /** If true, then validation data will be shown on the screen after validation is complete */
            readonly show_validation_data: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
        };
        readonly data: {
            /** Raw gaze data for the trial. The array will contain a nested array for each validation point. Within each nested array will be a list of `{x,y,dx,dy}` values specifying the absolute x and y pixels, as well as the distance from the target for that gaze point. */
            readonly raw_gaze: {
                readonly type: ParameterType.COMPLEX;
                readonly array: true;
                readonly nested: {
                    readonly x: {
                        readonly type: ParameterType.INT;
                    };
                    readonly y: {
                        readonly type: ParameterType.INT;
                    };
                    readonly dx: {
                        readonly type: ParameterType.INT;
                    };
                    readonly dy: {
                        readonly type: ParameterType.INT;
                    };
                };
            };
            /** The percentage of samples within the `roi_radius` for each validation point. */
            readonly percent_in_roi: {
                readonly type: ParameterType.FLOAT;
                readonly array: true;
            };
            /** The average `x` and `y` distance from each validation point, plus the median distance `r` of the points from this average offset. */
            readonly average_offset: {
                readonly type: ParameterType.FLOAT;
                readonly array: true;
            };
            /** The average number of samples per second. Calculated by finding samples per second for each point and then averaging these estimates together. */
            readonly samples_per_sec: {
                readonly type: ParameterType.FLOAT;
            };
            /** The list of validation points, in the order that they appeared. */
            readonly validation_points: {
                readonly type: ParameterType.INT;
                readonly array: true;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
}

export { WebgazerValidatePlugin as default };
