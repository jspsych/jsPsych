import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "initialize-camera";
    readonly version: string;
    readonly parameters: {
        /** The message to display when the user is presented with a dropdown list of available devices. */
        readonly device_select_message: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "<p>Please select the camera you would like to use.</p>";
        };
        /** The label for the select button. */
        readonly button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Use this camera";
        };
        /** Set to `true` to include an audio track in the recordings. */
        readonly include_audio: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** Request a specific width for the recording. This is not a guarantee that this width will be used, as it
         * depends on the capabilities of the participant's device. Learn more about `MediaRecorder` constraints
         * [here](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API/Constraints#requesting_a_specific_value_for_a_setting). */
        readonly width: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** Request a specific height for the recording. This is not a guarantee that this height will be used, as it
         * depends on the capabilities of the participant's device. Learn more about `MediaRecorder` constraints
         * [here](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API/Constraints#requesting_a_specific_value_for_a_setting). */
        readonly height: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** Set this to use a specific [MIME type](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/mimeType) for the
         * recording. Set the entire type, e.g., `'video/mp4; codecs="avc1.424028, mp4a.40.2"'`. */
        readonly mime_type: {
            readonly type: ParameterType.STRING;
            readonly default: any;
        };
    };
    readonly data: {
        /** The [device ID](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo/deviceId) of the selected camera. */
        readonly device_id: {
            readonly type: ParameterType.STRING;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin asks the participant to grant permission to access a camera.
 * If multiple cameras are connected to the participant's device, then it allows the participant to pick which device to use.
 * Once access is granted for an experiment you do not need to get permission again.
 *
 * Once the camera is selected with this plugin it can be accessed with
 * [`jsPsych.pluginAPI.getCameraRecorder()`](../reference/jspsych-pluginAPI.md#getcamerarecorder).
 *
 * !!! warning
 *     When recording from a camera your experiment will need to be running over `https://` protocol. If you try to
 *  run the experiment locally using the `file://` protocol or over `http://` protocol you will not be able to access
 * the microphone because of [potential security problems](https://blog.mozilla.org/webrtc/camera-microphone-require-https-in-firefox-68/).
 *
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/initialize-camera/ initialize-camera plugin documentation on jspsych.org}
 */
declare class InitializeCameraPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "initialize-camera";
        readonly version: string;
        readonly parameters: {
            /** The message to display when the user is presented with a dropdown list of available devices. */
            readonly device_select_message: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "<p>Please select the camera you would like to use.</p>";
            };
            /** The label for the select button. */
            readonly button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Use this camera";
            };
            /** Set to `true` to include an audio track in the recordings. */
            readonly include_audio: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** Request a specific width for the recording. This is not a guarantee that this width will be used, as it
             * depends on the capabilities of the participant's device. Learn more about `MediaRecorder` constraints
             * [here](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API/Constraints#requesting_a_specific_value_for_a_setting). */
            readonly width: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** Request a specific height for the recording. This is not a guarantee that this height will be used, as it
             * depends on the capabilities of the participant's device. Learn more about `MediaRecorder` constraints
             * [here](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API/Constraints#requesting_a_specific_value_for_a_setting). */
            readonly height: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** Set this to use a specific [MIME type](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/mimeType) for the
             * recording. Set the entire type, e.g., `'video/mp4; codecs="avc1.424028, mp4a.40.2"'`. */
            readonly mime_type: {
                readonly type: ParameterType.STRING;
                readonly default: any;
            };
        };
        readonly data: {
            /** The [device ID](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo/deviceId) of the selected camera. */
            readonly device_id: {
                readonly type: ParameterType.STRING;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
    private run_trial;
    private askForPermission;
    private showCameraSelection;
    private waitForSelection;
    private updateDeviceList;
}

export { InitializeCameraPlugin as default };
