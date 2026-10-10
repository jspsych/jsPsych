import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "animation";
    readonly version: string;
    readonly parameters: {
        /** Each element of the array is a path to an image file. */
        readonly stimuli: {
            readonly type: ParameterType.IMAGE;
            readonly default: any;
            readonly array: true;
        };
        /** How long to display each image in milliseconds. */
        readonly frame_time: {
            readonly type: ParameterType.INT;
            readonly default: 250;
        };
        /** If greater than 0, then a gap will be shown between each image in the sequence. This parameter
         * specifies the length of the gap in milliseconds.
         */
        readonly frame_isi: {
            readonly type: ParameterType.INT;
            readonly default: 0;
        };
        /** How many times to show the entire sequence. There will be no gap (other than the gap specified by `frame_isi`)
         * between repetitions. */
        readonly sequence_reps: {
            readonly type: ParameterType.INT;
            readonly default: 1;
        };
        /** This array contains the key(s) that the participant is allowed to press in order to respond to the stimulus.
         * Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see
         * [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and
         * [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/)
         * for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"`
         * means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed. */
        readonly choices: {
            readonly type: ParameterType.KEYS;
            readonly default: "ALL_KEYS";
        };
        /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that
         * it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key(s) to press). */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /**
         * If true, the images will be drawn onto a canvas element. This prevents a blank screen (white flash) between consecutive
         * images in some browsers, like Firefox and Edge. If false, the image will be shown via an img element, as in previous
         * versions of jsPsych.
         */
        readonly render_on_canvas: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
    };
    readonly data: {
        /** An array, where each element is an object that represents a stimulus in the animation sequence. Each object has
         * a `stimulus` property, which is the image that was displayed, and a `time` property, which is the time in ms,
         * measured from when the sequence began, that the stimulus was displayed. The array will be encoded in JSON format
         * when data is saved using either the `.json()` or `.csv()` functions.
         */
        readonly animation_sequence: {
            readonly type: ParameterType.COMPLEX;
            readonly array: true;
            readonly nested: {
                readonly stimulus: {
                    readonly type: ParameterType.STRING;
                };
                readonly time: {
                    readonly type: ParameterType.INT;
                };
            };
        };
        /** An array, where each element is an object representing a response given by the participant. Each object has a
         * `stimulus` property, indicating which image was displayed when the key was pressed, an `rt` property, indicating
         * the time of the key press relative to the start of the animation, and a `key_press` property, indicating which
         * key was pressed. The array will be encoded in JSON format when data is saved using either the `.json()` or `.csv()`
         * functions.
         */
        readonly response: {
            readonly type: ParameterType.COMPLEX;
            readonly array: true;
            readonly nested: {
                readonly stimulus: {
                    readonly type: ParameterType.STRING;
                };
                readonly rt: {
                    readonly type: ParameterType.INT;
                };
                readonly key_press: {
                    readonly type: ParameterType.STRING;
                };
            };
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin displays a sequence of images at a fixed frame rate. The sequence can be looped a specified number of times.
 * The participant is free to respond at any point during the animation, and the time of the response is recorded.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/animation/ animation plugin documentation on jspsych.org}
 */
declare class AnimationPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "animation";
        readonly version: string;
        readonly parameters: {
            /** Each element of the array is a path to an image file. */
            readonly stimuli: {
                readonly type: ParameterType.IMAGE;
                readonly default: any;
                readonly array: true;
            };
            /** How long to display each image in milliseconds. */
            readonly frame_time: {
                readonly type: ParameterType.INT;
                readonly default: 250;
            };
            /** If greater than 0, then a gap will be shown between each image in the sequence. This parameter
             * specifies the length of the gap in milliseconds.
             */
            readonly frame_isi: {
                readonly type: ParameterType.INT;
                readonly default: 0;
            };
            /** How many times to show the entire sequence. There will be no gap (other than the gap specified by `frame_isi`)
             * between repetitions. */
            readonly sequence_reps: {
                readonly type: ParameterType.INT;
                readonly default: 1;
            };
            /** This array contains the key(s) that the participant is allowed to press in order to respond to the stimulus.
             * Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see
             * [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and
             * [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/)
             * for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"`
             * means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed. */
            readonly choices: {
                readonly type: ParameterType.KEYS;
                readonly default: "ALL_KEYS";
            };
            /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that
             * it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key(s) to press). */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /**
             * If true, the images will be drawn onto a canvas element. This prevents a blank screen (white flash) between consecutive
             * images in some browsers, like Firefox and Edge. If false, the image will be shown via an img element, as in previous
             * versions of jsPsych.
             */
            readonly render_on_canvas: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
        };
        readonly data: {
            /** An array, where each element is an object that represents a stimulus in the animation sequence. Each object has
             * a `stimulus` property, which is the image that was displayed, and a `time` property, which is the time in ms,
             * measured from when the sequence began, that the stimulus was displayed. The array will be encoded in JSON format
             * when data is saved using either the `.json()` or `.csv()` functions.
             */
            readonly animation_sequence: {
                readonly type: ParameterType.COMPLEX;
                readonly array: true;
                readonly nested: {
                    readonly stimulus: {
                        readonly type: ParameterType.STRING;
                    };
                    readonly time: {
                        readonly type: ParameterType.INT;
                    };
                };
            };
            /** An array, where each element is an object representing a response given by the participant. Each object has a
             * `stimulus` property, indicating which image was displayed when the key was pressed, an `rt` property, indicating
             * the time of the key press relative to the start of the animation, and a `key_press` property, indicating which
             * key was pressed. The array will be encoded in JSON format when data is saved using either the `.json()` or `.csv()`
             * functions.
             */
            readonly response: {
                readonly type: ParameterType.COMPLEX;
                readonly array: true;
                readonly nested: {
                    readonly stimulus: {
                        readonly type: ParameterType.STRING;
                    };
                    readonly rt: {
                        readonly type: ParameterType.INT;
                    };
                    readonly key_press: {
                        readonly type: ParameterType.STRING;
                    };
                };
            };
        };
        readonly citations: "__CITATIONS__";
    };
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
    simulate(trial: TrialType<Info>, simulation_mode: any, simulation_options: any, load_callback: () => void): void;
    private create_simulation_data;
    private simulate_data_only;
    private simulate_visual;
}

export { AnimationPlugin as default };
