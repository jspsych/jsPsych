import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "browser-check";
    readonly version: string;
    readonly parameters: {
        /**
         * The list of browser features to record. The default value includes all of the available options.
         */
        readonly features: {
            readonly type: ParameterType.STRING;
            readonly array: true;
            readonly default: readonly ["width", "height", "webaudio", "browser", "browser_version", "mobile", "os", "fullscreen", "vsync_rate", "webcam", "microphone"];
        };
        /**
         * Any features listed here will be skipped, even if they appear in `features`. Use this when you want to run most of the defaults.
         */
        readonly skip_features: {
            readonly type: ParameterType.STRING;
            readonly array: true;
            readonly default: readonly [];
        };
        /**
         * The number of frames to sample when measuring the display refresh rate (`"vsync_rate"`).
         * Increasing the number will potenially improve the stability of the estimate at the cost of
         * increasing the amount of time the plugin takes during this test. On most devices, 60 frames takes
         * about 1 second to measure.
         */
        readonly vsync_frame_count: {
            readonly type: ParameterType.INT;
            readonly default: 60;
        };
        /**
         * Whether to allow the participant to resize the browser window if the window is smaller than `minimum_width`
         * and/or `minimum_height`. If `false`, then the `minimum_width` and `minimum_height` parameters are ignored
         * and you can validate the size in the `inclusion_function`.
         */
        readonly allow_window_resize: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /**
         * If `allow_window_resize` is `true`, then this is the minimum width of the window (in pixels)
         * that must be met before continuing.
         */
        readonly minimum_width: {
            readonly type: ParameterType.INT;
            readonly default: 0;
        };
        /**
         * If `allow_window_resize` is `true`, then this is the minimum height of the window (in pixels) that
         * must be met before continuing.
         */
        readonly minimum_height: {
            readonly type: ParameterType.INT;
            readonly default: 0;
        };
        /**
         * The message that will be displayed during the interactive resize when `allow_window_resize` is `true`
         * and the window is too small. If the message contains HTML elements with the special IDs `browser-check-min-width`,
         * `browser-check-min-height`, `browser-check-actual-height`, and/or `browser-check-actual-width`, then the
         * contents of those elements will be dynamically updated to reflect the `minimum_width`, `minimum_height` and
         * measured width and height of the browser.
         * The default message is:
         * `<p>Your browser window is too small to complete this experiment. Please maximize the size of your browser window. If your browser window is already maximized, you will not be able to complete this experiment.</p>
         * <p>The minimum window width is <span id="browser-check-min-width"></span> px.</p>
         * <p>Your current window width is <span id="browser-check-actual-width"></span> px.</p>
         * <p>The minimum window height is <span id="browser-check-min-height"></span> px.</p>
         * <p>Your current window height is <span id="browser-check-actual-height"></span> px.</p>`.
         */
        readonly window_resize_message: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "<p>Your browser window is too small to complete this experiment. Please maximize the size of your browser window. \n        If your browser window is already maximized, you will not be able to complete this experiment.</p>\n        <p>The minimum window width is <span id=\"browser-check-min-width\"></span> px.</p>\n        <p>Your current window width is <span id=\"browser-check-actual-width\"></span> px.</p>\n        <p>The minimum window height is <span id=\"browser-check-min-height\"></span> px.</p>\n        <p>Your current window height is <span id=\"browser-check-actual-height\"></span> px.</p>";
        };
        /**
         * During the interactive resize, a button with this text will be displayed below the
         * `window_resize_message` for the participant to click if the window cannot meet the
         * minimum size needed. When the button is clicked, the experiment will end and
         * `exclusion_message` will be displayed.
         */
        readonly resize_fail_button_text: {
            readonly type: ParameterType.STRING;
            readonly default: "I cannot make the window any larger";
        };
        /**
         * A function that evaluates to `true` if the browser meets all of the inclusion criteria
         * for the experiment, and `false` otherwise. The first argument to the function will be
         * an object containing key value pairs with the measured features of the browser. The
         * keys will be the same as those listed in `features`.
         */
        readonly inclusion_function: {
            readonly type: ParameterType.FUNCTION;
            readonly default: () => boolean;
        };
        /**
         * A function that returns the message to display if `inclusion_function` evaluates to `false` or if the participant
         * clicks on the resize fail button during the interactive resize. In order to allow customization of the message,
         * the first argument to the function will be an object containing key value pairs with the measured features of the
         * browser. The keys will be the same as those listed in `features`. See example below.
         */
        readonly exclusion_message: {
            readonly type: ParameterType.FUNCTION;
            readonly default: () => string;
        };
    };
    readonly data: {
        /** The width of the browser window in pixels. If interactive resizing happens, this is the width *after* resizing. */
        readonly width: {
            readonly type: ParameterType.INT;
        };
        /** The height of the browser window in pixels. If interactive resizing happens, this is the height *after* resizing.*/
        readonly height: {
            readonly type: ParameterType.INT;
        };
        /** The browser used. */
        readonly browser: {
            readonly type: ParameterType.STRING;
        };
        /** The version of the browser used. */
        readonly browser_version: {
            readonly type: ParameterType.STRING;
        };
        /** The operating system used. */
        readonly os: {
            readonly type: ParameterType.STRING;
        };
        /** Whether the browser is a mobile device. */
        readonly mobile: {
            readonly type: ParameterType.BOOL;
        };
        /** Whether the browser supports the WebAudio API. */
        readonly webaudio: {
            readonly type: ParameterType.BOOL;
        };
        /** Whether the browser supports the Fullscreen API. */
        readonly fullscreen: {
            readonly type: ParameterType.BOOL;
        };
        /** An estimate of the refresh rate of the screen, in frames per second. */
        readonly vsync_rate: {
            readonly type: ParameterType.FLOAT;
        };
        /** Whether there is a webcam device available. Note that the participant still must grant permission to access the device before it can be used. */
        readonly webcam: {
            readonly type: ParameterType.BOOL;
        };
        /** Whether there is an audio input device available. Note that the participant still must grant permission to access the device before it can be used. */
        readonly microphone: {
            readonly type: ParameterType.BOOL;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin measures and records various features of the participant's browser and can end the experiment if defined inclusion criteria are not met.
 *
 * The plugin currently can record the following features:
 *
 * The width and height of the browser window in pixels.
 * The type of browser used (e.g., Chrome, Firefox, Edge, etc.) and the version number of the browser.*
 * Whether the participant is using a mobile device.*
 * The operating system.*
 * Support for the WebAudio API.
 * Support for the Fullscreen API, e.g., through the [fullscreen plugin](../plugins/fullscreen.md).
 * The display refresh rate in frames per second.
 * Whether the device has a webcam and microphone. Note that this only reveals whether a webcam/microphone exists. The participant still needs to grant permission in order for the experiment to use these devices.
 *
 * !!! warning
 *     Features with an * are recorded by parsing the [user agent string](https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent).
 *     This method is accurate most of the time, but is not guaranteed to be correct.
 *     The plugin uses the [detect-browser package](https://github.com/DamonOehlman/detect-browser) to perform user agent parsing.
 *     You can find a list of supported browsers and OSes in the [source file](https://github.com/DamonOehlman/detect-browser/blob/master/src/index.ts).
 *
 * The plugin begins by measuring the set of features requested.
 * An inclusion function is evaluated to see if the paricipant passes the inclusion criteria.
 * If they do, then the trial ends and the experiment continues.
 * If they do not, then the experiment ends immediately.
 * If a minimum width and/or minimum height is desired, the plugin will optionally display a message to participants whose browser windows are too small to give them an opportunity to make the window larger if possible.
 * See the examples below for more guidance.
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/browser-check/ browser-check plugin documentation on jspsych.org}
 */
declare class BrowserCheckPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "browser-check";
        readonly version: string;
        readonly parameters: {
            /**
             * The list of browser features to record. The default value includes all of the available options.
             */
            readonly features: {
                readonly type: ParameterType.STRING;
                readonly array: true;
                readonly default: readonly ["width", "height", "webaudio", "browser", "browser_version", "mobile", "os", "fullscreen", "vsync_rate", "webcam", "microphone"];
            };
            /**
             * Any features listed here will be skipped, even if they appear in `features`. Use this when you want to run most of the defaults.
             */
            readonly skip_features: {
                readonly type: ParameterType.STRING;
                readonly array: true;
                readonly default: readonly [];
            };
            /**
             * The number of frames to sample when measuring the display refresh rate (`"vsync_rate"`).
             * Increasing the number will potenially improve the stability of the estimate at the cost of
             * increasing the amount of time the plugin takes during this test. On most devices, 60 frames takes
             * about 1 second to measure.
             */
            readonly vsync_frame_count: {
                readonly type: ParameterType.INT;
                readonly default: 60;
            };
            /**
             * Whether to allow the participant to resize the browser window if the window is smaller than `minimum_width`
             * and/or `minimum_height`. If `false`, then the `minimum_width` and `minimum_height` parameters are ignored
             * and you can validate the size in the `inclusion_function`.
             */
            readonly allow_window_resize: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /**
             * If `allow_window_resize` is `true`, then this is the minimum width of the window (in pixels)
             * that must be met before continuing.
             */
            readonly minimum_width: {
                readonly type: ParameterType.INT;
                readonly default: 0;
            };
            /**
             * If `allow_window_resize` is `true`, then this is the minimum height of the window (in pixels) that
             * must be met before continuing.
             */
            readonly minimum_height: {
                readonly type: ParameterType.INT;
                readonly default: 0;
            };
            /**
             * The message that will be displayed during the interactive resize when `allow_window_resize` is `true`
             * and the window is too small. If the message contains HTML elements with the special IDs `browser-check-min-width`,
             * `browser-check-min-height`, `browser-check-actual-height`, and/or `browser-check-actual-width`, then the
             * contents of those elements will be dynamically updated to reflect the `minimum_width`, `minimum_height` and
             * measured width and height of the browser.
             * The default message is:
             * `<p>Your browser window is too small to complete this experiment. Please maximize the size of your browser window. If your browser window is already maximized, you will not be able to complete this experiment.</p>
             * <p>The minimum window width is <span id="browser-check-min-width"></span> px.</p>
             * <p>Your current window width is <span id="browser-check-actual-width"></span> px.</p>
             * <p>The minimum window height is <span id="browser-check-min-height"></span> px.</p>
             * <p>Your current window height is <span id="browser-check-actual-height"></span> px.</p>`.
             */
            readonly window_resize_message: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "<p>Your browser window is too small to complete this experiment. Please maximize the size of your browser window. \n        If your browser window is already maximized, you will not be able to complete this experiment.</p>\n        <p>The minimum window width is <span id=\"browser-check-min-width\"></span> px.</p>\n        <p>Your current window width is <span id=\"browser-check-actual-width\"></span> px.</p>\n        <p>The minimum window height is <span id=\"browser-check-min-height\"></span> px.</p>\n        <p>Your current window height is <span id=\"browser-check-actual-height\"></span> px.</p>";
            };
            /**
             * During the interactive resize, a button with this text will be displayed below the
             * `window_resize_message` for the participant to click if the window cannot meet the
             * minimum size needed. When the button is clicked, the experiment will end and
             * `exclusion_message` will be displayed.
             */
            readonly resize_fail_button_text: {
                readonly type: ParameterType.STRING;
                readonly default: "I cannot make the window any larger";
            };
            /**
             * A function that evaluates to `true` if the browser meets all of the inclusion criteria
             * for the experiment, and `false` otherwise. The first argument to the function will be
             * an object containing key value pairs with the measured features of the browser. The
             * keys will be the same as those listed in `features`.
             */
            readonly inclusion_function: {
                readonly type: ParameterType.FUNCTION;
                readonly default: () => boolean;
            };
            /**
             * A function that returns the message to display if `inclusion_function` evaluates to `false` or if the participant
             * clicks on the resize fail button during the interactive resize. In order to allow customization of the message,
             * the first argument to the function will be an object containing key value pairs with the measured features of the
             * browser. The keys will be the same as those listed in `features`. See example below.
             */
            readonly exclusion_message: {
                readonly type: ParameterType.FUNCTION;
                readonly default: () => string;
            };
        };
        readonly data: {
            /** The width of the browser window in pixels. If interactive resizing happens, this is the width *after* resizing. */
            readonly width: {
                readonly type: ParameterType.INT;
            };
            /** The height of the browser window in pixels. If interactive resizing happens, this is the height *after* resizing.*/
            readonly height: {
                readonly type: ParameterType.INT;
            };
            /** The browser used. */
            readonly browser: {
                readonly type: ParameterType.STRING;
            };
            /** The version of the browser used. */
            readonly browser_version: {
                readonly type: ParameterType.STRING;
            };
            /** The operating system used. */
            readonly os: {
                readonly type: ParameterType.STRING;
            };
            /** Whether the browser is a mobile device. */
            readonly mobile: {
                readonly type: ParameterType.BOOL;
            };
            /** Whether the browser supports the WebAudio API. */
            readonly webaudio: {
                readonly type: ParameterType.BOOL;
            };
            /** Whether the browser supports the Fullscreen API. */
            readonly fullscreen: {
                readonly type: ParameterType.BOOL;
            };
            /** An estimate of the refresh rate of the screen, in frames per second. */
            readonly vsync_rate: {
                readonly type: ParameterType.FLOAT;
            };
            /** Whether there is a webcam device available. Note that the participant still must grant permission to access the device before it can be used. */
            readonly webcam: {
                readonly type: ParameterType.BOOL;
            };
            /** Whether there is an audio input device available. Note that the participant still must grant permission to access the device before it can be used. */
            readonly microphone: {
                readonly type: ParameterType.BOOL;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    private end_flag;
    private t;
    constructor(jsPsych: JsPsych);
    private delay;
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
    private run_trial;
    private create_feature_fn_map;
    private measure_features;
    private inclusion_check;
    private check_allow_resize;
    private end_trial;
    private end_experiment;
    simulate(trial: TrialType<Info>, simulation_mode: any, simulation_options: any, load_callback: () => void): void;
    private create_simulation_data;
    private simulate_data_only;
    private simulate_visual;
}

export { BrowserCheckPlugin as default };
