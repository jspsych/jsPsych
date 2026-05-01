import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "visual-search-circle";
    readonly version: string;
    readonly parameters: {
        /**
         * Path to image file that is the search target. This parameter must specified when the stimuli set is
         * defined using the `target`, `foil` and `set_size` parameters, but should NOT be specified when using
         * the `stimuli` parameter.
         */
        readonly target: {
            readonly type: ParameterType.IMAGE;
            readonly default: any;
        };
        /**
         * Path to image file that is the foil/distractor. This image will be repeated for all distractors up to
         * the `set_size` value. This parameter must specified when the stimuli set is defined using the `target`,
         * `foil` and `set_size` parameters, but should NOT be specified when using the `stimuli` parameter.
         */
        readonly foil: {
            readonly type: ParameterType.IMAGE;
            readonly default: any;
        };
        /**
         * How many items should be displayed, including the target when `target_present` is `true`. The foil
         * image will be repeated up to this value when `target_present` is `false`, or up to `set_size - 1`
         * when `target_present` is `true`. This parameter must specified when using the `target`, `foil` and
         * `set_size` parameters to define the stimuli set, but should NOT be specified when using the `stimuli`
         * parameter.
         */
        readonly set_size: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /**
         * Array containing all of the image files to be displayed. This parameter must be specified when NOT
         * using the `target`, `foil`, and `set_size` parameters to define the stimuli set.
         */
        readonly stimuli: {
            readonly type: ParameterType.IMAGE;
            readonly default: readonly [];
            readonly array: true;
        };
        /**
         * Is the target present? This parameter must always be specified. When using the `target`, `foil` and
         * `set_size` parameters, `false` means that the foil image will be repeated up to the set_size, and
         * `true` means that the target will be presented along with the foil image repeated up to set_size - 1.
         * When using the `stimuli` parameter, this parameter is only used to determine the response accuracy.
         */
        readonly target_present: {
            readonly type: ParameterType.BOOL;
            readonly default: any;
        };
        /**
         * Path to image file that is a fixation target. This parameter must always be specified.
         */
        readonly fixation_image: {
            readonly type: ParameterType.IMAGE;
            readonly default: any;
        };
        /** Two element array indicating the height and width of the search array element images. */
        readonly target_size: {
            readonly type: ParameterType.INT;
            readonly array: true;
            readonly default: readonly [50, 50];
        };
        /** Two element array indicating the height and width of the fixation image. */
        readonly fixation_size: {
            readonly type: ParameterType.INT;
            readonly array: true;
            readonly default: readonly [16, 16];
        };
        /** The diameter of the search array circle in pixels. */
        readonly circle_diameter: {
            readonly type: ParameterType.INT;
            readonly default: 250;
        };
        /** The key to press if the target is present in the search array. */
        readonly target_present_key: {
            readonly type: ParameterType.KEY;
            readonly default: "j";
        };
        /** The key to press if the target is not present in the search array. */
        readonly target_absent_key: {
            readonly type: ParameterType.KEY;
            readonly default: "f";
        };
        /** The maximum amount of time the participant is allowed to search before the trial will continue. A value
         * of null will allow the participant to search indefinitely.
         */
        readonly trial_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** How long to show the fixation image for before the search array (in milliseconds). */
        readonly fixation_duration: {
            readonly type: ParameterType.INT;
            readonly default: 1000;
        };
        /** Whether to use randomized locations on the circle for the items. If `false`, then the first item will always show at the location specified by `location_first_item`. */
        readonly randomize_item_locations: {
            readonly type: ParameterType.BOOL;
            readonly pretty_name: "Randomize item locations";
            readonly default: true;
        };
        /**
         * If `randomize_item_locations` is `false`, the location of the first item on the circle, in degrees.
         * 0 degrees is above the fixation, and moving clockwise in the positive direction.
        */
        readonly location_first_item: {
            readonly type: ParameterType.INT;
            readonly pretty_name: "Location first item";
            readonly default: 0;
        };
        /** If true, the trial will end when the participant makes a response. */
        readonly response_ends_trial: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
    };
    readonly data: {
        /** True if the participant gave the correct response. */
        readonly correct: {
            readonly type: ParameterType.BOOL;
        };
        /** Indicates which key the participant pressed. */
        readonly response: {
            readonly type: ParameterType.STRING;
        };
        /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
        /** The number of items in the search array. */
        readonly set_size: {
            readonly type: ParameterType.INT;
        };
        /** True if the target is present in the search array. */
        readonly target_present: {
            readonly type: ParameterType.BOOL;
        };
        /** Array where each element is the pixel value of the center of an image in the search array. If the target is present, then the first element will represent the location of the target. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
        readonly locations: {
            readonly type: ParameterType.INT;
            readonly array: true;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin presents a customizable visual-search task modelled after [Wang, Cavanagh, & Green (1994)](http://dx.doi.org/10.3758/BF03206946).
 * The participant indicates whether or not a target is present among a set of distractors. The stimuli are displayed in a circle, evenly-spaced,
 * equidistant from a fixation point.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/visual-search-circle/ visual-search-circle plugin documentation on jspsych.org}
 **/
declare class VisualSearchCirclePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "visual-search-circle";
        readonly version: string;
        readonly parameters: {
            /**
             * Path to image file that is the search target. This parameter must specified when the stimuli set is
             * defined using the `target`, `foil` and `set_size` parameters, but should NOT be specified when using
             * the `stimuli` parameter.
             */
            readonly target: {
                readonly type: ParameterType.IMAGE;
                readonly default: any;
            };
            /**
             * Path to image file that is the foil/distractor. This image will be repeated for all distractors up to
             * the `set_size` value. This parameter must specified when the stimuli set is defined using the `target`,
             * `foil` and `set_size` parameters, but should NOT be specified when using the `stimuli` parameter.
             */
            readonly foil: {
                readonly type: ParameterType.IMAGE;
                readonly default: any;
            };
            /**
             * How many items should be displayed, including the target when `target_present` is `true`. The foil
             * image will be repeated up to this value when `target_present` is `false`, or up to `set_size - 1`
             * when `target_present` is `true`. This parameter must specified when using the `target`, `foil` and
             * `set_size` parameters to define the stimuli set, but should NOT be specified when using the `stimuli`
             * parameter.
             */
            readonly set_size: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /**
             * Array containing all of the image files to be displayed. This parameter must be specified when NOT
             * using the `target`, `foil`, and `set_size` parameters to define the stimuli set.
             */
            readonly stimuli: {
                readonly type: ParameterType.IMAGE;
                readonly default: readonly [];
                readonly array: true;
            };
            /**
             * Is the target present? This parameter must always be specified. When using the `target`, `foil` and
             * `set_size` parameters, `false` means that the foil image will be repeated up to the set_size, and
             * `true` means that the target will be presented along with the foil image repeated up to set_size - 1.
             * When using the `stimuli` parameter, this parameter is only used to determine the response accuracy.
             */
            readonly target_present: {
                readonly type: ParameterType.BOOL;
                readonly default: any;
            };
            /**
             * Path to image file that is a fixation target. This parameter must always be specified.
             */
            readonly fixation_image: {
                readonly type: ParameterType.IMAGE;
                readonly default: any;
            };
            /** Two element array indicating the height and width of the search array element images. */
            readonly target_size: {
                readonly type: ParameterType.INT;
                readonly array: true;
                readonly default: readonly [50, 50];
            };
            /** Two element array indicating the height and width of the fixation image. */
            readonly fixation_size: {
                readonly type: ParameterType.INT;
                readonly array: true;
                readonly default: readonly [16, 16];
            };
            /** The diameter of the search array circle in pixels. */
            readonly circle_diameter: {
                readonly type: ParameterType.INT;
                readonly default: 250;
            };
            /** The key to press if the target is present in the search array. */
            readonly target_present_key: {
                readonly type: ParameterType.KEY;
                readonly default: "j";
            };
            /** The key to press if the target is not present in the search array. */
            readonly target_absent_key: {
                readonly type: ParameterType.KEY;
                readonly default: "f";
            };
            /** The maximum amount of time the participant is allowed to search before the trial will continue. A value
             * of null will allow the participant to search indefinitely.
             */
            readonly trial_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** How long to show the fixation image for before the search array (in milliseconds). */
            readonly fixation_duration: {
                readonly type: ParameterType.INT;
                readonly default: 1000;
            };
            /** Whether to use randomized locations on the circle for the items. If `false`, then the first item will always show at the location specified by `location_first_item`. */
            readonly randomize_item_locations: {
                readonly type: ParameterType.BOOL;
                readonly pretty_name: "Randomize item locations";
                readonly default: true;
            };
            /**
             * If `randomize_item_locations` is `false`, the location of the first item on the circle, in degrees.
             * 0 degrees is above the fixation, and moving clockwise in the positive direction.
            */
            readonly location_first_item: {
                readonly type: ParameterType.INT;
                readonly pretty_name: "Location first item";
                readonly default: 0;
            };
            /** If true, the trial will end when the participant makes a response. */
            readonly response_ends_trial: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
        };
        readonly data: {
            /** True if the participant gave the correct response. */
            readonly correct: {
                readonly type: ParameterType.BOOL;
            };
            /** Indicates which key the participant pressed. */
            readonly response: {
                readonly type: ParameterType.STRING;
            };
            /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
            /** The number of items in the search array. */
            readonly set_size: {
                readonly type: ParameterType.INT;
            };
            /** True if the target is present in the search array. */
            readonly target_present: {
                readonly type: ParameterType.BOOL;
            };
            /** Array where each element is the pixel value of the center of an image in the search array. If the target is present, then the first element will represent the location of the target. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
            readonly locations: {
                readonly type: ParameterType.INT;
                readonly array: true;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
    private generateFixationLoc;
    private generateDisplayLocs;
    private generatePresentationSet;
    private cosd;
    private sind;
    simulate(trial: TrialType<Info>, simulation_mode: any, simulation_options: any, load_callback: () => void): void;
    private create_simulation_data;
    private simulate_data_only;
    private simulate_visual;
}

export { VisualSearchCirclePlugin as default };
