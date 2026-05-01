import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "preload";
    readonly version: string;
    readonly parameters: {
        /** If `true`, the plugin will preload any files that can be automatically preloaded based on the main experiment
         * timeline that is passed to `jsPsych.run`. If `false`, any file(s) to be preloaded should be specified by passing
         * a timeline array to the `trials` parameter and/or an array of file paths to the `images`, `audio`, and/or `video`
         * parameters. Setting this parameter to `false` is useful when you plan to preload your files in smaller batches
         * throughout the experiment. */
        readonly auto_preload: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** An array containing one or more jsPsych trial or timeline objects. This parameter is useful when you want to
         * automatically preload stimuli files from a specific subset of the experiment. See [Creating an Experiment:
         * The Timeline](../overview/timeline.md) for information on constructing timelines. */
        readonly trials: {
            readonly type: ParameterType.TIMELINE;
            readonly default: readonly [];
        };
        /**
         * Array with one or more image files to load. This parameter is often used in cases where media files cannot
         * be automatically preloaded based on the timeline, e.g. because the media files are passed into an image plugin/parameter with
         * timeline variables or dynamic parameters, or because the image is embedded in an HTML string.
         */
        readonly images: {
            readonly type: ParameterType.STRING;
            readonly default: readonly [];
            readonly array: true;
        };
        /**
         * Array with one or more audio files to load. This parameter is often used in cases where media files cannot
         * be automatically preloaded based on the timeline, e.g. because the media files are passed into an audio plugin/parameter with
         * timeline variables or dynamic parameters, or because the audio is embedded in an HTML string.
         */
        readonly audio: {
            readonly type: ParameterType.STRING;
            readonly default: readonly [];
            readonly array: true;
        };
        /**
         * Array with one or more video files to load. This parameter is often used in cases where media files cannot
         * be automatically preloaded based on the timeline, e.g. because the media files are passed into a video plugin/parameter with
         * timeline variables or dynamic parameters, or because the video is embedded in an HTML string.
         */
        readonly video: {
            readonly type: ParameterType.STRING;
            readonly default: readonly [];
            readonly array: true;
        };
        /** HTML-formatted message to show above the progress bar while the files are loading. If `null`, then no message is shown. */
        readonly message: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /** If `true`, a progress bar will be shown while the files are loading. If `false`, no progress bar is shown. */
        readonly show_progress_bar: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /**
         * Whether or not to continue with the experiment if a loading error occurs. If false, then if a loading error occurs,
         * the error_message will be shown on the page and the trial will not end. If true, then if if a loading error occurs, the trial will end
         * and preloading failure will be logged in the trial data.
         */
        readonly continue_after_error: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** HTML-formatted message to be shown on the page after loading fails or times out. Only applies when `continue_after_error` is `false`.*/
        readonly error_message: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "The experiment failed to load.";
        };
        /**
         * Whether or not to show a detailed error message on the page. If true, then detailed error messages will be shown on the
         * page for all files that failed to load, along with the general error_message. This parameter is only relevant when continue_after_error is false.
         */
        readonly show_detailed_errors: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /**
         * The maximum amount of time that the plugin should wait before stopping the preload and either ending the trial
         * (if continue_after_error is true) or stopping the experiment with an error message (if continue_after_error is false).
         * If null, the plugin will wait indefintely for the files to load.
         */
        readonly max_load_time: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** Function to be called after a file fails to load. The function takes the file name as its only argument. */
        readonly on_error: {
            readonly type: ParameterType.FUNCTION;
            readonly default: any;
        };
        /** Function to be called after a file loads successfully. The function takes the file name as its only argument. */
        readonly on_success: {
            readonly type: ParameterType.FUNCTION;
            readonly default: any;
        };
    };
    readonly data: {
        /**  If `true`, then all files loaded successfully within the `max_load_time`. If `false`, then one or
         * more file requests returned a failure and/or the file loading did not complete within the `max_load_time` duration.*/
        readonly success: {
            readonly type: ParameterType.BOOL;
        };
        /** If `true`, then the files did not finish loading within the `max_load_time` duration.
         * If `false`, then the file loading did not timeout. Note that when the preload trial does not timeout
         * (`timeout: false`), it is still possible for loading to fail (`success: false`). This happens if
         * one or more files fails to load and all file requests trigger either a success or failure event before
         * the `max_load_time` duration. */
        readonly timeout: {
            readonly type: ParameterType.BOOL;
        };
        /** One or more image file paths that produced a loading failure before the trial ended. */
        readonly failed_images: {
            readonly type: ParameterType.STRING;
            readonly array: true;
        };
        /** One or more audio file paths that produced a loading failure before the trial ended. */
        readonly failed_audio: {
            readonly type: ParameterType.STRING;
            readonly array: true;
        };
        /** One or more video file paths that produced a loading failure before the trial ended. */
        readonly failed_video: {
            readonly type: ParameterType.STRING;
            readonly array: true;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin loads images, audio, and video files. It is used for loading files into the browser's memory before they are
 * needed in the experiment, in order to improve stimulus and response timing, and avoid disruption to the experiment flow.
 * We recommend using this plugin anytime you are loading media files, and especially when your experiment requires large
 * and/or many media files. See the [Media Preloading page](../overview/media-preloading.md) for more information.
 *
 * The preload trial will end as soon as all files have loaded successfully. The trial will end or stop with an error
 * message when one of these two scenarios occurs (whichever comes first): (a) all files have not finished loading
 * when the `max_load_time` duration is reached, or (b) all file requests have responded with either a load or fail
 * event, and one or more files has failed to load. The `continue_after_error` parameter determines whether the trial
 * will stop with an error message or end (allowing the experiment to continue) when preloading is not successful.
 *
 * @author Becky Gilbert
 * @see {@link https://www.jspsych.org/latest/plugins/preload/ preload plugin documentation on jspsych.org}
 */
declare class PreloadPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "preload";
        readonly version: string;
        readonly parameters: {
            /** If `true`, the plugin will preload any files that can be automatically preloaded based on the main experiment
             * timeline that is passed to `jsPsych.run`. If `false`, any file(s) to be preloaded should be specified by passing
             * a timeline array to the `trials` parameter and/or an array of file paths to the `images`, `audio`, and/or `video`
             * parameters. Setting this parameter to `false` is useful when you plan to preload your files in smaller batches
             * throughout the experiment. */
            readonly auto_preload: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** An array containing one or more jsPsych trial or timeline objects. This parameter is useful when you want to
             * automatically preload stimuli files from a specific subset of the experiment. See [Creating an Experiment:
             * The Timeline](../overview/timeline.md) for information on constructing timelines. */
            readonly trials: {
                readonly type: ParameterType.TIMELINE;
                readonly default: readonly [];
            };
            /**
             * Array with one or more image files to load. This parameter is often used in cases where media files cannot
             * be automatically preloaded based on the timeline, e.g. because the media files are passed into an image plugin/parameter with
             * timeline variables or dynamic parameters, or because the image is embedded in an HTML string.
             */
            readonly images: {
                readonly type: ParameterType.STRING;
                readonly default: readonly [];
                readonly array: true;
            };
            /**
             * Array with one or more audio files to load. This parameter is often used in cases where media files cannot
             * be automatically preloaded based on the timeline, e.g. because the media files are passed into an audio plugin/parameter with
             * timeline variables or dynamic parameters, or because the audio is embedded in an HTML string.
             */
            readonly audio: {
                readonly type: ParameterType.STRING;
                readonly default: readonly [];
                readonly array: true;
            };
            /**
             * Array with one or more video files to load. This parameter is often used in cases where media files cannot
             * be automatically preloaded based on the timeline, e.g. because the media files are passed into a video plugin/parameter with
             * timeline variables or dynamic parameters, or because the video is embedded in an HTML string.
             */
            readonly video: {
                readonly type: ParameterType.STRING;
                readonly default: readonly [];
                readonly array: true;
            };
            /** HTML-formatted message to show above the progress bar while the files are loading. If `null`, then no message is shown. */
            readonly message: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /** If `true`, a progress bar will be shown while the files are loading. If `false`, no progress bar is shown. */
            readonly show_progress_bar: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /**
             * Whether or not to continue with the experiment if a loading error occurs. If false, then if a loading error occurs,
             * the error_message will be shown on the page and the trial will not end. If true, then if if a loading error occurs, the trial will end
             * and preloading failure will be logged in the trial data.
             */
            readonly continue_after_error: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** HTML-formatted message to be shown on the page after loading fails or times out. Only applies when `continue_after_error` is `false`.*/
            readonly error_message: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "The experiment failed to load.";
            };
            /**
             * Whether or not to show a detailed error message on the page. If true, then detailed error messages will be shown on the
             * page for all files that failed to load, along with the general error_message. This parameter is only relevant when continue_after_error is false.
             */
            readonly show_detailed_errors: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /**
             * The maximum amount of time that the plugin should wait before stopping the preload and either ending the trial
             * (if continue_after_error is true) or stopping the experiment with an error message (if continue_after_error is false).
             * If null, the plugin will wait indefintely for the files to load.
             */
            readonly max_load_time: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** Function to be called after a file fails to load. The function takes the file name as its only argument. */
            readonly on_error: {
                readonly type: ParameterType.FUNCTION;
                readonly default: any;
            };
            /** Function to be called after a file loads successfully. The function takes the file name as its only argument. */
            readonly on_success: {
                readonly type: ParameterType.FUNCTION;
                readonly default: any;
            };
        };
        readonly data: {
            /**  If `true`, then all files loaded successfully within the `max_load_time`. If `false`, then one or
             * more file requests returned a failure and/or the file loading did not complete within the `max_load_time` duration.*/
            readonly success: {
                readonly type: ParameterType.BOOL;
            };
            /** If `true`, then the files did not finish loading within the `max_load_time` duration.
             * If `false`, then the file loading did not timeout. Note that when the preload trial does not timeout
             * (`timeout: false`), it is still possible for loading to fail (`success: false`). This happens if
             * one or more files fails to load and all file requests trigger either a success or failure event before
             * the `max_load_time` duration. */
            readonly timeout: {
                readonly type: ParameterType.BOOL;
            };
            /** One or more image file paths that produced a loading failure before the trial ended. */
            readonly failed_images: {
                readonly type: ParameterType.STRING;
                readonly array: true;
            };
            /** One or more audio file paths that produced a loading failure before the trial ended. */
            readonly failed_audio: {
                readonly type: ParameterType.STRING;
                readonly array: true;
            };
            /** One or more video file paths that produced a loading failure before the trial ended. */
            readonly failed_video: {
                readonly type: ParameterType.STRING;
                readonly array: true;
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

export { PreloadPlugin as default };
