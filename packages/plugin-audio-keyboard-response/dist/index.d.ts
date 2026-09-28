import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "audio-keyboard-response";
    readonly version: string;
    readonly parameters: {
        /** The audio file to be played. */
        readonly stimulus: {
            readonly type: ParameterType.AUDIO;
            readonly default: any;
        };
        /** This array contains the key(s) that the participant is allowed to press in order to respond to the stimulus.
         * Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) -
         * see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)
         * and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/)
         * for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"`
         * means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed.
         */
        readonly choices: {
            readonly type: ParameterType.KEYS;
            readonly default: "ALL_KEYS";
        };
        /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that
         * it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).
         */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly pretty_name: "Prompt";
            readonly default: any;
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
        /** If true, then the trial will end whenever the participant makes a response (assuming they make their
         * response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will
         * continue until the value for `trial_duration` is reached. You can use set this parameter to `false` to
         * force the participant to listen to the stimulus for a fixed amount of time, even if they respond before the time is complete
         */
        readonly response_ends_trial: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /** If true, then the trial will end as soon as the audio file finishes playing. */
        readonly trial_ends_after_audio: {
            readonly type: ParameterType.BOOL;
            readonly pretty_name: "Trial ends after audio";
            readonly default: false;
        };
        /** If true, then responses are allowed while the audio is playing. If false, then the audio must finish
         * playing before a keyboard response is accepted. Once the audio has played all the way through, a valid
         * keyboard response is allowed (including while the audio is being re-played via on-screen playback controls).
         */
        readonly response_allowed_while_playing: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
    };
    readonly data: {
        /** Indicates which key the participant pressed. If no key was pressed before the trial ended, then the value will be `null`. */
        readonly response: {
            readonly type: ParameterType.STRING;
        };
        /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus
         * first began playing until the participant made a key response. If no key was pressed before the trial ended, then the
         * value will be `null`.
         */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
        /** Path to the audio file that played during the trial. */
        readonly stimulus: {
            readonly type: ParameterType.STRING;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin plays audio files and records responses generated with the keyboard.
 *
 * If the browser supports it, audio files are played using the WebAudio API. This allows for reasonably precise timing of the
 * playback. The timing of responses generated is measured against the WebAudio specific clock, improving the measurement of
 * response times. If the browser does not support the WebAudio API, then the audio file is played with HTML5 audio.
 *
 * Audio files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md). However, if you are using
 * timeline variables or another dynamic method to specify the audio stimulus, then you will need to [manually preload](../overview/media-preloading.md#manual-preloading) the audio.
 *
 * The trial can end when the participant responds, when the audio file has finished playing, or if the participant has
 * failed to respond within a fixed length of time. You can also prevent a keyboard response from being recorded before
 * the audio has finished playing.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/audio-keyboard-response/ audio-keyboard-response plugin documentation on jspsych.org}
 */
declare class AudioKeyboardResponsePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "audio-keyboard-response";
        readonly version: string;
        readonly parameters: {
            /** The audio file to be played. */
            readonly stimulus: {
                readonly type: ParameterType.AUDIO;
                readonly default: any;
            };
            /** This array contains the key(s) that the participant is allowed to press in order to respond to the stimulus.
             * Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) -
             * see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)
             * and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/)
             * for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"`
             * means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed.
             */
            readonly choices: {
                readonly type: ParameterType.KEYS;
                readonly default: "ALL_KEYS";
            };
            /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that
             * it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).
             */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly pretty_name: "Prompt";
                readonly default: any;
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
            /** If true, then the trial will end whenever the participant makes a response (assuming they make their
             * response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will
             * continue until the value for `trial_duration` is reached. You can use set this parameter to `false` to
             * force the participant to listen to the stimulus for a fixed amount of time, even if they respond before the time is complete
             */
            readonly response_ends_trial: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /** If true, then the trial will end as soon as the audio file finishes playing. */
            readonly trial_ends_after_audio: {
                readonly type: ParameterType.BOOL;
                readonly pretty_name: "Trial ends after audio";
                readonly default: false;
            };
            /** If true, then responses are allowed while the audio is playing. If false, then the audio must finish
             * playing before a keyboard response is accepted. Once the audio has played all the way through, a valid
             * keyboard response is allowed (including while the audio is being re-played via on-screen playback controls).
             */
            readonly response_allowed_while_playing: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
        };
        readonly data: {
            /** Indicates which key the participant pressed. If no key was pressed before the trial ended, then the value will be `null`. */
            readonly response: {
                readonly type: ParameterType.STRING;
            };
            /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus
             * first began playing until the participant made a key response. If no key was pressed before the trial ended, then the
             * value will be `null`.
             */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
            /** Path to the audio file that played during the trial. */
            readonly stimulus: {
                readonly type: ParameterType.STRING;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    private audio;
    private params;
    private display;
    private response;
    private startTime;
    private finish;
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void): Promise<unknown>;
    private end_trial;
    private after_response;
    private setup_keyboard_listener;
    simulate(trial: TrialType<Info>, simulation_mode: any, simulation_options: any, load_callback: () => void): Promise<any>;
    private simulate_data_only;
    private simulate_visual;
    private create_simulation_data;
}

export { AudioKeyboardResponsePlugin as default };
