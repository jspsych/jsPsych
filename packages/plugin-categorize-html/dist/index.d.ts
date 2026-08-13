import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "categorize-html";
    readonly version: string;
    readonly parameters: {
        /** The HTML stimulus to display. */
        readonly stimulus: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
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
        /** A label that is associated with the correct answer. Used in conjunction with the `correct_text` and `incorrect_text` parameters. */
        readonly text_answer: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /** String to show when the correct answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the `%ANS%` string (see example below). */
        readonly correct_text: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "<p class='feedback'>Correct</p>";
        };
        /** String to show when the wrong answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the `%ANS%` string (see example below). */
        readonly incorrect_text: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "<p class='feedback'>Incorrect</p>";
        };
        /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /** If set to true, then the participant must press the correct response key after feedback is given in order to advance to the next trial. */
        readonly force_correct_button_press: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** If set to true, then the stimulus will be shown during feedback. If false, then only the text feedback will display during feedback. */
        readonly show_stim_with_feedback: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** If true, then category feedback will be displayed for an incorrect response after a timeout (trial_duration is exceeded). If false, then a timeout message will be shown. */
        readonly show_feedback_on_timeout: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** The message to show on a timeout non-response. */
        readonly timeout_message: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "<p>Please respond faster.</p>";
        };
        /** How long to show the stimulus for (milliseconds). If null, then the stimulus is shown until a response is given. */
        readonly stimulus_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** The maximum time allowed for a response. If null, then the experiment will wait indefinitely for a response. */
        readonly trial_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** How long to show the feedback for (milliseconds). */
        readonly feedback_duration: {
            readonly type: ParameterType.INT;
            readonly default: 2000;
        };
    };
    readonly data: {
        /** Either the path to the image file or the string containing the HTML formatted content that the participant saw on this trial. */
        readonly stimulus: {
            readonly type: ParameterType.STRING;
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
 * The categorize html plugin shows an HTML object on the screen. The participant responds by pressing a key. Feedback indicating the correctness of the response is given.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/categorize-html/ categorize-html plugin documentation on jspsych.org}
 */
declare class CategorizeHtmlPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "categorize-html";
        readonly version: string;
        readonly parameters: {
            /** The HTML stimulus to display. */
            readonly stimulus: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
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
            /** A label that is associated with the correct answer. Used in conjunction with the `correct_text` and `incorrect_text` parameters. */
            readonly text_answer: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /** String to show when the correct answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the `%ANS%` string (see example below). */
            readonly correct_text: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "<p class='feedback'>Correct</p>";
            };
            /** String to show when the wrong answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the `%ANS%` string (see example below). */
            readonly incorrect_text: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "<p class='feedback'>Incorrect</p>";
            };
            /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /** If set to true, then the participant must press the correct response key after feedback is given in order to advance to the next trial. */
            readonly force_correct_button_press: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** If set to true, then the stimulus will be shown during feedback. If false, then only the text feedback will display during feedback. */
            readonly show_stim_with_feedback: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** If true, then category feedback will be displayed for an incorrect response after a timeout (trial_duration is exceeded). If false, then a timeout message will be shown. */
            readonly show_feedback_on_timeout: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** The message to show on a timeout non-response. */
            readonly timeout_message: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "<p>Please respond faster.</p>";
            };
            /** How long to show the stimulus for (milliseconds). If null, then the stimulus is shown until a response is given. */
            readonly stimulus_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** The maximum time allowed for a response. If null, then the experiment will wait indefinitely for a response. */
            readonly trial_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** How long to show the feedback for (milliseconds). */
            readonly feedback_duration: {
                readonly type: ParameterType.INT;
                readonly default: 2000;
            };
        };
        readonly data: {
            /** Either the path to the image file or the string containing the HTML formatted content that the participant saw on this trial. */
            readonly stimulus: {
                readonly type: ParameterType.STRING;
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

export { CategorizeHtmlPlugin as default };
