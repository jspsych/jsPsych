import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "initialize-microphone";
    readonly version: string;
    readonly parameters: {
        /** The message to display when the user is presented with a dropdown list of available devices. */
        readonly device_select_message: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "<p>Please select the microphone you would like to use.</p>";
        };
        /** The label for the select button. */
        readonly button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Use this microphone";
        };
    };
    readonly data: {
        /**  The [device ID](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo/deviceId) of the selected microphone. */
        readonly device_id: {
            readonly type: ParameterType.STRING;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin asks the participant to grant permission to access a microphone.
 * If multiple microphones are connected to the participant's device, then it allows the participant to pick which device to use.
 * Once access is granted for an experiment you do not need to get permission again.
 *
 * Once the microphone is selected with this plugin it can be accessed with
 * [`jsPsych.pluginAPI.getMicrophoneRecorder()`](../reference/jspsych-pluginAPI.md#getmicrophonerecorder).
 *
 * !!! warning
 *     When recording from a microphone your experiment will need to be running over `https://` protocol.
 * If you try to run the experiment locally using the `file://` protocol or over `http://` protocol you will not
 * be able to access the microphone because of
 * [potential security problems](https://blog.mozilla.org/webrtc/camera-microphone-require-https-in-firefox-68/).
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/initialize-microphone/ initialize-microphone plugin documentation on jspsych.org}
 */
declare class InitializeMicrophonePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "initialize-microphone";
        readonly version: string;
        readonly parameters: {
            /** The message to display when the user is presented with a dropdown list of available devices. */
            readonly device_select_message: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "<p>Please select the microphone you would like to use.</p>";
            };
            /** The label for the select button. */
            readonly button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Use this microphone";
            };
        };
        readonly data: {
            /**  The [device ID](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo/deviceId) of the selected microphone. */
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
    private showMicrophoneSelection;
    private waitForSelection;
    private updateDeviceList;
}

export { InitializeMicrophonePlugin as default };
