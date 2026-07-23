import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "categorize-animation";
    readonly version: string;
    readonly parameters: {
        /** Each element of the array is a path to an image file. */
        readonly stimuli: {
            readonly type: ParameterType.IMAGE;
            readonly default: any;
            readonly array: true;
        };
        /** The key character indicating the correct response. */
        readonly key_answer: {
            readonly type: ParameterType.KEY;
            readonly default: any;
        };
        /** This array contains the key(s) that the participant is allowed to press in order to respond to the stimulus. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/) for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"` means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed. */
        readonly choices: {
            readonly type: ParameterType.KEYS;
            readonly default: "ALL_KEYS";
        };
        /** A text label that describes the correct answer. Used in conjunction with the `correct_text` and `incorrect_text` parameters. */
        readonly text_answer: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /** String to show when the correct answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below). */
        readonly correct_text: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "Correct.";
        };
        /** String to show when the wrong answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below). */
        readonly incorrect_text: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "Wrong.";
        };
        /** How long to display each image (in milliseconds). */
        readonly frame_time: {
            readonly type: ParameterType.INT;
            readonly default: 500;
        };
        /** How many times to show the entire sequence. */
        readonly sequence_reps: {
            readonly type: ParameterType.INT;
            readonly default: 1;
        };
        /** If true, the participant can respond before the animation sequence finishes. */
        readonly allow_response_before_complete: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** How long to show the feedback (milliseconds). */
        readonly feedback_duration: {
            readonly type: ParameterType.INT;
            readonly default: 2000;
        };
        /** This string can contain HTML markup. Any content here will be displayed below the stimulus or the end of the animation depending on the allow_response_before_complete parameter. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /**
         * If true, the images will be drawn onto a canvas element. This prevents a blank screen (white flash) between consecutive images in some browsers, like Firefox and Edge.
         * If false, the image will be shown via an img element, as in previous versions of jsPsych.
         */
        readonly render_on_canvas: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
    };
    readonly data: {
        /** Array of stimuli displayed in the trial. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
        readonly stimulus: {
            readonly type: ParameterType.STRING;
            readonly array: true;
        };
        /** Indicates which key the participant pressed.  */
        readonly response: {
            readonly type: ParameterType.STRING;
        };
        /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
        /** `true` if the participant got the correct answer, `false` otherwise. */
        readonly correct: {
            readonly type: ParameterType.BOOL;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * The categorize animation plugin shows a sequence of images at a specified frame rate. The participant responds by pressing a key. Feedback indicating the correctness of the response is given.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/categorize-animation/ categorize-animation plugin documentation on jspsych.org}
 */
declare class CategorizeAnimationPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "categorize-animation";
        readonly version: string;
        readonly parameters: {
            /** Each element of the array is a path to an image file. */
            readonly stimuli: {
                readonly type: ParameterType.IMAGE;
                readonly default: any;
                readonly array: true;
            };
            /** The key character indicating the correct response. */
            readonly key_answer: {
                readonly type: ParameterType.KEY;
                readonly default: any;
            };
            /** This array contains the key(s) that the participant is allowed to press in order to respond to the stimulus. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/) for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"` means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed. */
            readonly choices: {
                readonly type: ParameterType.KEYS;
                readonly default: "ALL_KEYS";
            };
            /** A text label that describes the correct answer. Used in conjunction with the `correct_text` and `incorrect_text` parameters. */
            readonly text_answer: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /** String to show when the correct answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below). */
            readonly correct_text: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "Correct.";
            };
            /** String to show when the wrong answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below). */
            readonly incorrect_text: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "Wrong.";
            };
            /** How long to display each image (in milliseconds). */
            readonly frame_time: {
                readonly type: ParameterType.INT;
                readonly default: 500;
            };
            /** How many times to show the entire sequence. */
            readonly sequence_reps: {
                readonly type: ParameterType.INT;
                readonly default: 1;
            };
            /** If true, the participant can respond before the animation sequence finishes. */
            readonly allow_response_before_complete: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** How long to show the feedback (milliseconds). */
            readonly feedback_duration: {
                readonly type: ParameterType.INT;
                readonly default: 2000;
            };
            /** This string can contain HTML markup. Any content here will be displayed below the stimulus or the end of the animation depending on the allow_response_before_complete parameter. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /**
             * If true, the images will be drawn onto a canvas element. This prevents a blank screen (white flash) between consecutive images in some browsers, like Firefox and Edge.
             * If false, the image will be shown via an img element, as in previous versions of jsPsych.
             */
            readonly render_on_canvas: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
        };
        readonly data: {
            /** Array of stimuli displayed in the trial. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
            readonly stimulus: {
                readonly type: ParameterType.STRING;
                readonly array: true;
            };
            /** Indicates which key the participant pressed.  */
            readonly response: {
                readonly type: ParameterType.STRING;
            };
            /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
            /** `true` if the participant got the correct answer, `false` otherwise. */
            readonly correct: {
                readonly type: ParameterType.BOOL;
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

export { CategorizeAnimationPlugin as default };
