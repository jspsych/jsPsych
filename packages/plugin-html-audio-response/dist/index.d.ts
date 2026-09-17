import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "html-audio-response";
    readonly version: string;
    readonly parameters: {
        /** The HTML content to be displayed. */
        readonly stimulus: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /** How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends. */
        readonly stimulus_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** The maximum length of the recording, in milliseconds. The default value is intentionally set low because of the potential to accidentally record very large data files if left too high. You can set this to `null` to allow the participant to control the length of the recording via the done button, but be careful with this option as it can lead to crashing the browser if the participant waits too long to stop the recording.  */
        readonly recording_duration: {
            readonly type: ParameterType.INT;
            readonly default: 2000;
        };
        /** Whether to show a button on the screen that the participant can click to finish the recording. */
        readonly show_done_button: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /** The label for the done button. */
        readonly done_button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Continue";
        };
        /** The label for the record again button enabled when `allow_playback: true`.
         */
        readonly record_again_button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Record again";
        };
        /** The label for the accept button enabled when `allow_playback: true`. */
        readonly accept_button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Continue";
        };
        /** Whether to allow the participant to listen to their recording and decide whether to rerecord or not. If `true`, then the participant will be shown an interface to play their recorded audio and click one of two buttons to either accept the recording or rerecord. If rerecord is selected, then stimulus will be shown again, as if the trial is starting again from the beginning. */
        readonly allow_playback: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** If `true`, then an [Object URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) will be generated and stored for the recorded audio. Only set this to `true` if you plan to reuse the recorded audio later in the experiment, as it is a potentially memory-intensive feature. */
        readonly save_audio_url: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
    };
    readonly data: {
        /** The time, since the onset of the stimulus, for the participant to click the done button. If the button is not clicked (or not enabled), then `rt` will be `null`. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
        /** The base64-encoded audio data. */
        readonly response: {
            readonly type: ParameterType.STRING;
        };
        /** The HTML content that was displayed on the screen. */
        readonly stimulus: {
            readonly type: ParameterType.HTML_STRING;
        };
        /** This is an estimate of when the stimulus appeared relative to the start of the audio recording. The plugin is configured so that the recording should start prior to the display of the stimulus. We have not yet been able to verify the accuracy of this estimate with external measurement devices. */
        readonly estimated_stimulus_onset: {
            readonly type: ParameterType.INT;
        };
        /** A URL to a copy of the audio data. */
        readonly audio_url: {
            readonly type: ParameterType.STRING;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin displays HTML content and records audio from the participant via a microphone.
 *
 * In order to get access to the microphone, you need to use the [initialize-microphone plugin](initialize-microphone.md) on your timeline prior to using this plugin.
 * Once access is granted for an experiment you do not need to get permission again.
 *
 * This plugin records audio data in [base 64 format](https://developer.mozilla.org/en-US/docs/Glossary/Base64).
 * This is a text-based representation of the audio which can be coverted to various audio formats using a variety of [online tools](https://www.google.com/search?q=base64+audio+decoder) as well as in languages like python and R.
 *
 * **This plugin will generate a large amount of data, and you will need to be careful about how you handle this data.**
 * Even a few seconds of audio recording will add 10s of kB to jsPsych's data.
 * Multiply this by a handful (or more) of trials, and the data objects will quickly get large.
 * If you need to record a lot of audio, either many trials worth or just a few trials with longer responses, we recommend that you save the data to your server immediately after the trial and delete the data in jsPsych's data object.
 * See below for an example of how to do this.
 *
 * This plugin also provides the option to store the recorded audio files as [Object URLs](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) via `save_audio_url: true`.
 * This will generate a URL that is storing a copy of the recorded audio, which can be used for subsequent playback.
 * See below for an example where the recorded audio is used as the stimulus in a subsequent trial.
 * This feature is turned off by default because it uses a relatively large amount of memory compared to most jsPsych features.
 * If you are running an experiment where you need this feature and you are recording lots of audio snippets, you may want to manually revoke the URLs when you no longer need them using [`URL.revokeObjectURL(objectURL)`](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL).
 *
 * !!! warning
 *     When recording from a microphone your experiment will need to be running over `https://` protocol. If you try to run the experiment locally using the `file://` protocol or over `http://` protocol you will not be able to access the microphone because of [potential security problems](https://blog.mozilla.org/webrtc/camera-microphone-require-https-in-firefox-68/).
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/html-audio-response/ html-audio-response plugin documentation on jspsych.org}
 */
declare class HtmlAudioResponsePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "html-audio-response";
        readonly version: string;
        readonly parameters: {
            /** The HTML content to be displayed. */
            readonly stimulus: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /** How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends. */
            readonly stimulus_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** The maximum length of the recording, in milliseconds. The default value is intentionally set low because of the potential to accidentally record very large data files if left too high. You can set this to `null` to allow the participant to control the length of the recording via the done button, but be careful with this option as it can lead to crashing the browser if the participant waits too long to stop the recording.  */
            readonly recording_duration: {
                readonly type: ParameterType.INT;
                readonly default: 2000;
            };
            /** Whether to show a button on the screen that the participant can click to finish the recording. */
            readonly show_done_button: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /** The label for the done button. */
            readonly done_button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Continue";
            };
            /** The label for the record again button enabled when `allow_playback: true`.
             */
            readonly record_again_button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Record again";
            };
            /** The label for the accept button enabled when `allow_playback: true`. */
            readonly accept_button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Continue";
            };
            /** Whether to allow the participant to listen to their recording and decide whether to rerecord or not. If `true`, then the participant will be shown an interface to play their recorded audio and click one of two buttons to either accept the recording or rerecord. If rerecord is selected, then stimulus will be shown again, as if the trial is starting again from the beginning. */
            readonly allow_playback: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** If `true`, then an [Object URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) will be generated and stored for the recorded audio. Only set this to `true` if you plan to reuse the recorded audio later in the experiment, as it is a potentially memory-intensive feature. */
            readonly save_audio_url: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
        };
        readonly data: {
            /** The time, since the onset of the stimulus, for the participant to click the done button. If the button is not clicked (or not enabled), then `rt` will be `null`. */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
            /** The base64-encoded audio data. */
            readonly response: {
                readonly type: ParameterType.STRING;
            };
            /** The HTML content that was displayed on the screen. */
            readonly stimulus: {
                readonly type: ParameterType.HTML_STRING;
            };
            /** This is an estimate of when the stimulus appeared relative to the start of the audio recording. The plugin is configured so that the recording should start prior to the display of the stimulus. We have not yet been able to verify the accuracy of this estimate with external measurement devices. */
            readonly estimated_stimulus_onset: {
                readonly type: ParameterType.INT;
            };
            /** A URL to a copy of the audio data. */
            readonly audio_url: {
                readonly type: ParameterType.STRING;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    private stimulus_start_time;
    private recorder_start_time;
    private recorder;
    private audio_url;
    private response;
    private load_resolver;
    private rt;
    private start_event_handler;
    private stop_event_handler;
    private data_available_handler;
    private recorded_data_chunks;
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
    private showDisplay;
    private hideStimulus;
    private addButtonEvent;
    private setupRecordingEvents;
    private startRecording;
    private stopRecording;
    private showPlaybackControls;
    private endTrial;
}

export { HtmlAudioResponsePlugin as default };
