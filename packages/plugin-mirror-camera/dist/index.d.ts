import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "mirror-camera";
    readonly version: string;
    readonly parameters: {
        /** HTML-formatted content to display below the camera feed. */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /** The label of the button to advance to the next trial. */
        readonly button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Continue";
        };
        /** The height of the video playback element. If left `null` then it will match the size of the recording. */
        readonly height: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** The width of the video playback element. If left `null` then it will match the size of the recording. */
        readonly width: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /**  Whether to mirror the video image. */
        readonly mirror_camera: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
    };
    readonly data: {
        /** The length of time the participant viewed the video playback. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin shows a live feed of the participant's camera. It can be useful in experiments that need to record video in order to give the participant a chance to see what is in the view of the camera.
 *
 * You must initialize the camera using the [initialize-camera plugin](initialize-camera.md) prior to running this plugin.
 *
 * !!! warning
 *     When recording from a camera your experiment will need to be running over `https://` protocol. If you try to run the experiment locally using the `file://` protocol or over `http://` protocol you will not be able to access the camera because of [potential security problems](https://blog.mozilla.org/webrtc/camera-microphone-require-https-in-firefox-68/).
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/mirror-camera/ mirror-camera plugin documentation on jspsych.org}
 */
declare class MirrorCameraPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "mirror-camera";
        readonly version: string;
        readonly parameters: {
            /** HTML-formatted content to display below the camera feed. */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /** The label of the button to advance to the next trial. */
            readonly button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Continue";
            };
            /** The height of the video playback element. If left `null` then it will match the size of the recording. */
            readonly height: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** The width of the video playback element. If left `null` then it will match the size of the recording. */
            readonly width: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /**  Whether to mirror the video image. */
            readonly mirror_camera: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
        };
        readonly data: {
            /** The length of time the participant viewed the video playback. */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    private stream;
    private start_time;
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
    finish(display_element: HTMLElement): void;
}

export { MirrorCameraPlugin as default };
