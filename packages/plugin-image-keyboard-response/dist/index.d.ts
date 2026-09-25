import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "image-keyboard-response";
    readonly version: string;
    readonly parameters: {
        /** The path of the image file to be displayed. */
        readonly stimulus: {
            readonly type: ParameterType.IMAGE;
            readonly default: any;
        };
        /** Set the height of the image in pixels. If left null (no value specified), then the image will display at its natural height. */
        readonly stimulus_height: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** Set the width of the image in pixels. If left null (no value specified), then the image will display at its natural width. */
        readonly stimulus_width: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** If setting *only* the width or *only* the height and this parameter is true, then the other dimension will be scaled
         * to maintain the image's aspect ratio. */
        readonly maintain_aspect_ratio: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /**his array contains the key(s) that the participant is allowed to press in order to respond to the stimulus. Keys should
         * be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see
         * [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and
         * [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/)
         * for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"`
         * means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed. */
        readonly choices: {
            readonly type: ParameterType.KEYS;
            readonly default: "ALL_KEYS";
        };
        /**This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can
         * be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /** How long to show the stimulus for in milliseconds. If the value is `null`, then the stimulus will be shown until the
         * participant makes a response. */
        readonly stimulus_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant
         * fails to make a response before this timer is reached, the participant's response will be recorded as null for the
         * trial and the trial will end. If the value of this parameter is `null`, then the trial will wait for a response indefinitely. */
        readonly trial_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** If true, then the trial will end whenever the participant makes a response (assuming they make their response before
         * the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for
         * `trial_duration` is reached. You can set this parameter to `false` to force the participant to view a stimulus for a
         * fixed amount of time, even if they respond before the time is complete.  */
        readonly response_ends_trial: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /**
         * If `true`, the image will be drawn onto a canvas element. This prevents a blank screen (white flash) between consecutive image trials in some browsers, like Firefox and Edge.
         * If `false`, the image will be shown via an img element, as in previous versions of jsPsych. If the stimulus is an **animated gif**, you must set this parameter to false, because the canvas rendering method will only present static images.
         */
        readonly render_on_canvas: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
    };
    readonly data: {
        /** The path of the image that was displayed. */
        readonly stimulus: {
            readonly type: ParameterType.STRING;
        };
        /**  Indicates which key the participant pressed. */
        readonly response: {
            readonly type: ParameterType.STRING;
        };
        /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus
         * first appears on the screen until the participant's response. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin displays an image and records responses generated with the keyboard. The stimulus can be displayed until a
 * response is given, or for a pre-determined amount of time. The trial can be ended automatically if the participant has
 * failed to respond within a fixed length of time.
 *
 * Image files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md). However, if you are using
 * timeline variables or another dynamic method to specify the image stimulus, you will need to
 * [manually preload](../overview/media-preloading.md#manual-preloading) the images.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/image-keyboard-response/ image-keyboard-response plugin documentation on jspsych.org}
 */
declare class ImageKeyboardResponsePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "image-keyboard-response";
        readonly version: string;
        readonly parameters: {
            /** The path of the image file to be displayed. */
            readonly stimulus: {
                readonly type: ParameterType.IMAGE;
                readonly default: any;
            };
            /** Set the height of the image in pixels. If left null (no value specified), then the image will display at its natural height. */
            readonly stimulus_height: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** Set the width of the image in pixels. If left null (no value specified), then the image will display at its natural width. */
            readonly stimulus_width: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** If setting *only* the width or *only* the height and this parameter is true, then the other dimension will be scaled
             * to maintain the image's aspect ratio. */
            readonly maintain_aspect_ratio: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /**his array contains the key(s) that the participant is allowed to press in order to respond to the stimulus. Keys should
             * be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see
             * [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and
             * [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/)
             * for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"`
             * means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed. */
            readonly choices: {
                readonly type: ParameterType.KEYS;
                readonly default: "ALL_KEYS";
            };
            /**This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can
             * be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /** How long to show the stimulus for in milliseconds. If the value is `null`, then the stimulus will be shown until the
             * participant makes a response. */
            readonly stimulus_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant
             * fails to make a response before this timer is reached, the participant's response will be recorded as null for the
             * trial and the trial will end. If the value of this parameter is `null`, then the trial will wait for a response indefinitely. */
            readonly trial_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** If true, then the trial will end whenever the participant makes a response (assuming they make their response before
             * the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for
             * `trial_duration` is reached. You can set this parameter to `false` to force the participant to view a stimulus for a
             * fixed amount of time, even if they respond before the time is complete.  */
            readonly response_ends_trial: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /**
             * If `true`, the image will be drawn onto a canvas element. This prevents a blank screen (white flash) between consecutive image trials in some browsers, like Firefox and Edge.
             * If `false`, the image will be shown via an img element, as in previous versions of jsPsych. If the stimulus is an **animated gif**, you must set this parameter to false, because the canvas rendering method will only present static images.
             */
            readonly render_on_canvas: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
        };
        readonly data: {
            /** The path of the image that was displayed. */
            readonly stimulus: {
                readonly type: ParameterType.STRING;
            };
            /**  Indicates which key the participant pressed. */
            readonly response: {
                readonly type: ParameterType.STRING;
            };
            /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus
             * first appears on the screen until the participant's response. */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
    simulate(trial: TrialType<Info>, simulation_mode: any, simulation_options: any, load_callback: () => void): void;
    private simulate_data_only;
    private simulate_visual;
    private create_simulation_data;
}

export { ImageKeyboardResponsePlugin as default };
