import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "webgazer-init-camera";
    readonly version: string;
    readonly parameters: {
        /** Instructions for the participant to follow. */
        readonly instructions: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "\n            <p>Position your head so that the webcam has a good view of your eyes.</p>\n            <p>Center your face in the box and look directly towards the camera.</p>\n            <p>It is important that you try and keep your head reasonably still throughout the experiment, so please take a moment to adjust your setup to be comfortable.</p>\n            <p>When your face is centered in the box and the box is green, you can click to continue.</p>";
        };
        /** The text for the button that participants click to end the trial. */
        readonly button_text: {
            readonly type: ParameterType.STRING;
            readonly default: "Continue";
        };
    };
    readonly data: {
        /** The time it took for webgazer to initialize. This can be a long time in some situations, so this
         * value is recorded for troubleshooting when participants are reporting difficulty.
         */
        readonly load_time: {
            readonly type: ParameterType.INT;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin initializes the camera and helps the participant center their face in the camera view for
 * using the the [WebGazer extension](../extensions/webgazer.md). For a narrative description of eye
 * tracking with jsPsych, see the [eye tracking overview](../overview/eye-tracking.md).
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/webgazer-init-camera/ webgazer-init-camera plugin} and
 * {@link https://www.jspsych.org/latest/overview/eye-tracking/ eye-tracking overview} documentation on jspsych.org
 */
declare class WebgazerInitCameraPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "webgazer-init-camera";
        readonly version: string;
        readonly parameters: {
            /** Instructions for the participant to follow. */
            readonly instructions: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "\n            <p>Position your head so that the webcam has a good view of your eyes.</p>\n            <p>Center your face in the box and look directly towards the camera.</p>\n            <p>It is important that you try and keep your head reasonably still throughout the experiment, so please take a moment to adjust your setup to be comfortable.</p>\n            <p>When your face is centered in the box and the box is green, you can click to continue.</p>";
            };
            /** The text for the button that participants click to end the trial. */
            readonly button_text: {
                readonly type: ParameterType.STRING;
                readonly default: "Continue";
            };
        };
        readonly data: {
            /** The time it took for webgazer to initialize. This can be a long time in some situations, so this
             * value is recorded for troubleshooting when participants are reporting difficulty.
             */
            readonly load_time: {
                readonly type: ParameterType.INT;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void): Promise<unknown>;
}

export { WebgazerInitCameraPlugin as default };
