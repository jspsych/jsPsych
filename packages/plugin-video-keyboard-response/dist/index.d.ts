import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "video-keyboard-response";
    readonly version: string;
    readonly parameters: {
        /** Array of the video file(s) to play. Video can be provided in multiple file formats for better cross-browser support. */
        readonly stimulus: {
            readonly type: ParameterType.VIDEO;
            readonly pretty_name: "Video";
            readonly default: any;
            readonly array: true;
        };
        /** Array containing the key(s) the subject is allowed to press to respond to the stimulus. */
        readonly choices: {
            readonly type: ParameterType.KEYS;
            readonly pretty_name: "Choices";
            readonly default: "ALL_KEYS";
        };
        /** Any content here will be displayed below the stimulus. */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly pretty_name: "Prompt";
            readonly default: any;
        };
        /** The width of the video display in pixels. If `null`, the video will take the original video's dimensions,
         * or properly scaled with the aspect ratio if the height is also specified.
         */
        readonly width: {
            readonly type: ParameterType.INT;
            readonly pretty_name: "Width";
            readonly default: "";
        };
        /** The height of the video display in pixels. If `null`, the video will take the original video's dimensions,
         * or properly scaled with the aspect ratio if the width is also specified.
         */
        readonly height: {
            readonly type: ParameterType.INT;
            readonly pretty_name: "Height";
            readonly default: "";
        };
        /** If true, the video will begin playing as soon as it has loaded. */
        readonly autoplay: {
            readonly type: ParameterType.BOOL;
            readonly pretty_name: "Autoplay";
            readonly default: true;
        };
        /** If true, the subject will be able to pause the video or move the playback to any point in the video. */
        readonly controls: {
            readonly type: ParameterType.BOOL;
            readonly pretty_name: "Controls";
            readonly default: false;
        };
        /** Time to start the clip. If null (default), video will start at the beginning of the file. */
        readonly start: {
            readonly type: ParameterType.FLOAT;
            readonly pretty_name: "Start";
            readonly default: any;
        };
        /** Time to stop the clip. If null (default), video will stop at the end of the file. */
        readonly stop: {
            readonly type: ParameterType.FLOAT;
            readonly pretty_name: "Stop";
            readonly default: any;
        };
        /** The playback rate of the video. 1 is normal, <1 is slower, >1 is faster. */
        readonly rate: {
            readonly type: ParameterType.FLOAT;
            readonly pretty_name: "Rate";
            readonly default: 1;
        };
        /** If true, the trial will end immediately after the video finishes playing. */
        readonly trial_ends_after_video: {
            readonly type: ParameterType.BOOL;
            readonly pretty_name: "End trial after video finishes";
            readonly default: false;
        };
        /** How long to show trial before it ends. */
        readonly trial_duration: {
            readonly type: ParameterType.INT;
            readonly pretty_name: "Trial duration";
            readonly default: any;
        };
        /** If true, the trial will end when subject makes a response. */
        readonly response_ends_trial: {
            readonly type: ParameterType.BOOL;
            readonly pretty_name: "Response ends trial";
            readonly default: true;
        };
        /** If true, then responses are allowed while the video is playing. If false, then the video must finish playing before a response is accepted. */
        readonly response_allowed_while_playing: {
            readonly type: ParameterType.BOOL;
            readonly pretty_name: "Response allowed while playing";
            readonly default: true;
        };
    };
    readonly data: {
        /** Indicates which key the participant pressed. */
        readonly response: {
            readonly type: ParameterType.STRING;
        };
        /** The response time in milliseconds for the participant to make a response. The time is measured from when the
         * stimulus first appears on the screen until the participant's response.
         */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
        /** The `stimulus` array. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
        readonly stimulus: {
            readonly type: ParameterType.STRING;
            readonly array: true;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin plays a video file and records a keyboard response. The stimulus can be displayed until a response is
 * given, or for a pre-determined amount of time. The trial can be ended automatically when the participant responds,
 * when the video file has finished playing, or if the participant has failed to respond within a fixed length of time.
 * You can also prevent a keyboard response from being recorded before the video has finished playing.
 *
 * Video files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md). However, if you are
 * using timeline variables or another dynamic method to specify the video stimulus, you will need to
 * [manually preload](../overview/media-preloading.md#manual-preloading) the videos. Also note that video preloading
 * is disabled when the experiment is running as a file (i.e. opened directly in the browser, rather than through a
 * server), in order to prevent CORS errors - see the section on [Running Experiments](../overview/running-experiments.md)
 * for more information.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/video-keyboard-response/ video-keyboard-response plugin documentation on jspsych.org}
 */
declare class VideoKeyboardResponsePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "video-keyboard-response";
        readonly version: string;
        readonly parameters: {
            /** Array of the video file(s) to play. Video can be provided in multiple file formats for better cross-browser support. */
            readonly stimulus: {
                readonly type: ParameterType.VIDEO;
                readonly pretty_name: "Video";
                readonly default: any;
                readonly array: true;
            };
            /** Array containing the key(s) the subject is allowed to press to respond to the stimulus. */
            readonly choices: {
                readonly type: ParameterType.KEYS;
                readonly pretty_name: "Choices";
                readonly default: "ALL_KEYS";
            };
            /** Any content here will be displayed below the stimulus. */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly pretty_name: "Prompt";
                readonly default: any;
            };
            /** The width of the video display in pixels. If `null`, the video will take the original video's dimensions,
             * or properly scaled with the aspect ratio if the height is also specified.
             */
            readonly width: {
                readonly type: ParameterType.INT;
                readonly pretty_name: "Width";
                readonly default: "";
            };
            /** The height of the video display in pixels. If `null`, the video will take the original video's dimensions,
             * or properly scaled with the aspect ratio if the width is also specified.
             */
            readonly height: {
                readonly type: ParameterType.INT;
                readonly pretty_name: "Height";
                readonly default: "";
            };
            /** If true, the video will begin playing as soon as it has loaded. */
            readonly autoplay: {
                readonly type: ParameterType.BOOL;
                readonly pretty_name: "Autoplay";
                readonly default: true;
            };
            /** If true, the subject will be able to pause the video or move the playback to any point in the video. */
            readonly controls: {
                readonly type: ParameterType.BOOL;
                readonly pretty_name: "Controls";
                readonly default: false;
            };
            /** Time to start the clip. If null (default), video will start at the beginning of the file. */
            readonly start: {
                readonly type: ParameterType.FLOAT;
                readonly pretty_name: "Start";
                readonly default: any;
            };
            /** Time to stop the clip. If null (default), video will stop at the end of the file. */
            readonly stop: {
                readonly type: ParameterType.FLOAT;
                readonly pretty_name: "Stop";
                readonly default: any;
            };
            /** The playback rate of the video. 1 is normal, <1 is slower, >1 is faster. */
            readonly rate: {
                readonly type: ParameterType.FLOAT;
                readonly pretty_name: "Rate";
                readonly default: 1;
            };
            /** If true, the trial will end immediately after the video finishes playing. */
            readonly trial_ends_after_video: {
                readonly type: ParameterType.BOOL;
                readonly pretty_name: "End trial after video finishes";
                readonly default: false;
            };
            /** How long to show trial before it ends. */
            readonly trial_duration: {
                readonly type: ParameterType.INT;
                readonly pretty_name: "Trial duration";
                readonly default: any;
            };
            /** If true, the trial will end when subject makes a response. */
            readonly response_ends_trial: {
                readonly type: ParameterType.BOOL;
                readonly pretty_name: "Response ends trial";
                readonly default: true;
            };
            /** If true, then responses are allowed while the video is playing. If false, then the video must finish playing before a response is accepted. */
            readonly response_allowed_while_playing: {
                readonly type: ParameterType.BOOL;
                readonly pretty_name: "Response allowed while playing";
                readonly default: true;
            };
        };
        readonly data: {
            /** Indicates which key the participant pressed. */
            readonly response: {
                readonly type: ParameterType.STRING;
            };
            /** The response time in milliseconds for the participant to make a response. The time is measured from when the
             * stimulus first appears on the screen until the participant's response.
             */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
            /** The `stimulus` array. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
            readonly stimulus: {
                readonly type: ParameterType.STRING;
                readonly array: true;
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

export { VideoKeyboardResponsePlugin as default };
