import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "video-slider-response";
    readonly version: string;
    readonly parameters: {
        /** An array of file paths to the video. You can specify multiple formats of the same video (e.g., .mp4, .ogg, .webm)
         * to maximize the [cross-browser compatibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats).
         * Usually .mp4 is a safe cross-browser option. The plugin does not reliably support .mov files. The player will use
         * the first source file in the array that is compatible with the browser, so specify the files in order of preference.
         */
        readonly stimulus: {
            readonly type: ParameterType.VIDEO;
            readonly default: any;
            readonly array: true;
        };
        /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that
         * it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).
         */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /** The width of the video display in pixels. If `null`, the video will take the original video's dimensions,
         * or properly scaled with the aspect ratio if the height is also specified.
         */
        readonly width: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** The height of the video display in pixels. If `null`, the video will take the original video's dimensions,
         * or properly scaled with the aspect ratio if the width is also specified.
         */
        readonly height: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** If true, the video will begin playing as soon as it has loaded. */
        readonly autoplay: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /** If true, controls for the video player will be available to the participant. They will be able to pause the
         * video or move the playback to any point in the video.
         */
        readonly controls: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** Time to start the clip. If null (default), video will start at the beginning of the file. */
        readonly start: {
            readonly type: ParameterType.FLOAT;
            readonly default: any;
        };
        /** Time to stop the clip. If null (default), video will stop at the end of the file. */
        readonly stop: {
            readonly type: ParameterType.FLOAT;
            readonly default: any;
        };
        /** The playback rate of the video. 1 is normal, <1 is slower, >1 is faster. */
        readonly rate: {
            readonly type: ParameterType.FLOAT;
            readonly default: 1;
        };
        /** Sets the minimum value of the slider. */
        readonly min: {
            readonly type: ParameterType.INT;
            readonly default: 0;
        };
        /** Sets the maximum value of the slider. */
        readonly max: {
            readonly type: ParameterType.INT;
            readonly default: 100;
        };
        /** Sets the starting value of the slider. */
        readonly slider_start: {
            readonly type: ParameterType.INT;
            readonly default: 50;
        };
        /** Sets the step of the slider. This is the smallest amount by which the slider can change. */
        readonly step: {
            readonly type: ParameterType.INT;
            readonly default: 1;
        };
        /**
         * Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends
         * of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the
         * ends, and the other two will be at 33% and 67% of the slider width.
         */
        readonly labels: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: readonly [];
            readonly array: true;
        };
        /** Set the width of the slider in pixels. If left null, then the width will be equal to the widest element in
         * the display.
         */
        readonly slider_width: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** Label of the button to end the trial. */
        readonly button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Continue";
        };
        /** If true, the participant must move the slider before clicking the continue button. */
        readonly require_movement: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** If true, the trial will end immediately after the video finishes playing. */
        readonly trial_ends_after_video: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the
         * participant fails to make a response before this timer is reached, the participant's response will be
         * recorded as null for the trial and the trial will end. If the value of this parameter is null, then the
         * trial will wait for a response indefinitely.
         */
        readonly trial_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** If true, then the trial will end whenever the participant makes a response (assuming they make their response
         * before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until
         * the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant
         * to view a stimulus for a fixed amount of time, even if they respond before the time is complete.
         */
        readonly response_ends_trial: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /**
         * If true, then responses are allowed while the video is playing. If false, then the video must finish playing
         * before the slider is enabled and the trial can end via the next button click. Once the video has played all
         * the way through, the slider is enabled and a response is allowed (including while the video is being re-played
         * via on-screen playback controls).
         */
        readonly response_allowed_while_playing: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
    };
    readonly data: {
        /** The numeric value of the slider. */
        readonly response: {
            readonly type: ParameterType.INT;
        };
        /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
        /** The `stimulus` array. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions.  */
        readonly stimulus: {
            readonly type: ParameterType.STRING;
            readonly array: true;
        };
        /** The starting value of the slider. */
        readonly slider_start: {
            readonly type: ParameterType.INT;
        };
        /** The start time of the video clip. */
        readonly start: {
            readonly type: ParameterType.FLOAT;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin plays a video and allows the participant to respond by dragging a slider. The stimulus can be displayed
 * until a response is given, or for a pre-determined amount of time. The trial can be ended automatically when the
 * participant responds, when the video file has finished playing, or if the participant has failed to respond within
 * a fixed length of time. You can also prevent the slider response from being made before the video has finished playing.
 *
 * Video files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md). However, if you are
 * using timeline variables or another dynamic method to specify the video stimulus, you will need to
 * [manually preload](../overview/media-preloading.md#manual-preloading) the videos. Also note that video preloading
 * is disabled when the experiment is running as a file (i.e. opened directly in the browser, rather than through a
 * server), in order to prevent CORS errors - see the section on [Running Experiments](../overview/running-experiments.md) for more information.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/video-slider-response/ video-slider-response plugin documentation on jspsych.org}
 */
declare class VideoSliderResponsePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "video-slider-response";
        readonly version: string;
        readonly parameters: {
            /** An array of file paths to the video. You can specify multiple formats of the same video (e.g., .mp4, .ogg, .webm)
             * to maximize the [cross-browser compatibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats).
             * Usually .mp4 is a safe cross-browser option. The plugin does not reliably support .mov files. The player will use
             * the first source file in the array that is compatible with the browser, so specify the files in order of preference.
             */
            readonly stimulus: {
                readonly type: ParameterType.VIDEO;
                readonly default: any;
                readonly array: true;
            };
            /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that
             * it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).
             */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /** The width of the video display in pixels. If `null`, the video will take the original video's dimensions,
             * or properly scaled with the aspect ratio if the height is also specified.
             */
            readonly width: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** The height of the video display in pixels. If `null`, the video will take the original video's dimensions,
             * or properly scaled with the aspect ratio if the width is also specified.
             */
            readonly height: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** If true, the video will begin playing as soon as it has loaded. */
            readonly autoplay: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /** If true, controls for the video player will be available to the participant. They will be able to pause the
             * video or move the playback to any point in the video.
             */
            readonly controls: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** Time to start the clip. If null (default), video will start at the beginning of the file. */
            readonly start: {
                readonly type: ParameterType.FLOAT;
                readonly default: any;
            };
            /** Time to stop the clip. If null (default), video will stop at the end of the file. */
            readonly stop: {
                readonly type: ParameterType.FLOAT;
                readonly default: any;
            };
            /** The playback rate of the video. 1 is normal, <1 is slower, >1 is faster. */
            readonly rate: {
                readonly type: ParameterType.FLOAT;
                readonly default: 1;
            };
            /** Sets the minimum value of the slider. */
            readonly min: {
                readonly type: ParameterType.INT;
                readonly default: 0;
            };
            /** Sets the maximum value of the slider. */
            readonly max: {
                readonly type: ParameterType.INT;
                readonly default: 100;
            };
            /** Sets the starting value of the slider. */
            readonly slider_start: {
                readonly type: ParameterType.INT;
                readonly default: 50;
            };
            /** Sets the step of the slider. This is the smallest amount by which the slider can change. */
            readonly step: {
                readonly type: ParameterType.INT;
                readonly default: 1;
            };
            /**
             * Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends
             * of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the
             * ends, and the other two will be at 33% and 67% of the slider width.
             */
            readonly labels: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: readonly [];
                readonly array: true;
            };
            /** Set the width of the slider in pixels. If left null, then the width will be equal to the widest element in
             * the display.
             */
            readonly slider_width: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** Label of the button to end the trial. */
            readonly button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Continue";
            };
            /** If true, the participant must move the slider before clicking the continue button. */
            readonly require_movement: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** If true, the trial will end immediately after the video finishes playing. */
            readonly trial_ends_after_video: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the
             * participant fails to make a response before this timer is reached, the participant's response will be
             * recorded as null for the trial and the trial will end. If the value of this parameter is null, then the
             * trial will wait for a response indefinitely.
             */
            readonly trial_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** If true, then the trial will end whenever the participant makes a response (assuming they make their response
             * before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until
             * the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant
             * to view a stimulus for a fixed amount of time, even if they respond before the time is complete.
             */
            readonly response_ends_trial: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /**
             * If true, then responses are allowed while the video is playing. If false, then the video must finish playing
             * before the slider is enabled and the trial can end via the next button click. Once the video has played all
             * the way through, the slider is enabled and a response is allowed (including while the video is being re-played
             * via on-screen playback controls).
             */
            readonly response_allowed_while_playing: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
        };
        readonly data: {
            /** The numeric value of the slider. */
            readonly response: {
                readonly type: ParameterType.INT;
            };
            /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
            /** The `stimulus` array. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions.  */
            readonly stimulus: {
                readonly type: ParameterType.STRING;
                readonly array: true;
            };
            /** The starting value of the slider. */
            readonly slider_start: {
                readonly type: ParameterType.INT;
            };
            /** The start time of the video clip. */
            readonly start: {
                readonly type: ParameterType.FLOAT;
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

export { VideoSliderResponsePlugin as default };
