import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "audio-button-response";
    readonly version: string;
    readonly parameters: {
        /** Path to audio file to be played. */
        readonly stimulus: {
            readonly type: ParameterType.AUDIO;
            readonly default: any;
        };
        /** Labels for the buttons. Each different string in the array will generate a different button.  */
        readonly choices: {
            readonly type: ParameterType.STRING;
            readonly default: any;
            readonly array: true;
        };
        /**
         * A function that generates the HTML for each button in the `choices` array. The function gets the string
         * and index of the item in the `choices` array and should return valid HTML. If you want to use different
         * markup for each button, you can do that by using a conditional on either parameter. The default parameter
         * returns a button element with the text label of the choice.
         */
        readonly button_html: {
            readonly type: ParameterType.FUNCTION;
            readonly default: (choice: string, choice_index: number) => string;
        };
        /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention
         *  is that it can be used to provide a reminder about the action the participant is supposed to take
         * (e.g., which key to press). */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the
         * participant fails to make a response before this timer is reached, the participant's response will be
         * recorded as null for the trial and the trial will end. If the value of this parameter is null, the trial
         * will wait for a response indefinitely */
        readonly trial_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** Setting to `'grid'` will make the container element have the CSS property `display: grid` and enable the
         * use of `grid_rows` and `grid_columns`. Setting to `'flex'` will make the container element have the CSS
         * property `display: flex`. You can customize how the buttons are laid out by adding inline CSS in the `button_html` parameter.
         */
        readonly button_layout: {
            readonly type: ParameterType.STRING;
            readonly default: "grid";
        };
        /** The number of rows in the button grid. Only applicable when `button_layout` is set to `'grid'`. If null, the
         * number of rows will be determined automatically based on the number of buttons and the number of columns.
         */
        readonly grid_rows: {
            readonly type: ParameterType.INT;
            readonly default: 1;
        };
        /** The number of columns in the button grid. Only applicable when `button_layout` is set to `'grid'`.
         * If null, the number of columns will be determined automatically based on the number of buttons and the
         * number of rows.
         */
        readonly grid_columns: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** If true, then the trial will end whenever the participant makes a response (assuming they make their
         * response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will
         * continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force
         * the participant to listen to the stimulus for a fixed amount of time, even if they respond before the time is complete. */
        readonly response_ends_trial: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /** If true, then the trial will end as soon as the audio file finishes playing.  */
        readonly trial_ends_after_audio: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /**
         * If true, then responses are allowed while the audio is playing. If false, then the audio must finish
         * playing before the button choices are enabled and a response is accepted. Once the audio has played
         * all the way through, the buttons are enabled and a response is allowed (including while the audio is
         * being re-played via on-screen playback controls).
         */
        readonly response_allowed_while_playing: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /** How long the button will delay enabling in milliseconds. If `response_allowed_while_playing` is `true`,
         * the timer will start immediately. If it is `false`, the timer will start at the end of the audio. */
        readonly enable_button_after: {
            readonly type: ParameterType.INT;
            readonly default: 0;
        };
    };
    readonly data: {
        /** The path of the audio file that was played. */
        readonly stimulus: {
            readonly type: ParameterType.STRING;
        };
        /** The response time in milliseconds for the participant to make a response. The time is measured from
         * when the stimulus first began playing until the participant's response.*/
        readonly rt: {
            readonly type: ParameterType.INT;
        };
        /** Indicates which button the participant pressed. The first button in the `choices` array is 0, the second is 1, and so on. */
        readonly response: {
            readonly type: ParameterType.INT;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * If the browser supports it, audio files are played using the WebAudio API. This allows for reasonably precise
 * timing of the playback. The timing of responses generated is measured against the WebAudio specific clock,
 * improving the measurement of response times. If the browser does not support the WebAudio API, then the audio file is
 * played with HTML5 audio.

 * Audio files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md). However, if
 * you are using timeline variables or another dynamic method to specify the audio stimulus, you will need
 * to [manually preload](../overview/media-preloading.md#manual-preloading) the audio.

 * The trial can end when the participant responds, when the audio file has finished playing, or if the participant
 * has failed to respond within a fixed length of time. You can also prevent a button response from being made before the
 * audio has finished playing.
 *
 * @author Kristin Diep
 * @see {@link https://www.jspsych.org/latest/plugins/audio-button-response/ audio-button-response plugin documentation on jspsych.org}
 */
declare class AudioButtonResponsePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "audio-button-response";
        readonly version: string;
        readonly parameters: {
            /** Path to audio file to be played. */
            readonly stimulus: {
                readonly type: ParameterType.AUDIO;
                readonly default: any;
            };
            /** Labels for the buttons. Each different string in the array will generate a different button.  */
            readonly choices: {
                readonly type: ParameterType.STRING;
                readonly default: any;
                readonly array: true;
            };
            /**
             * A function that generates the HTML for each button in the `choices` array. The function gets the string
             * and index of the item in the `choices` array and should return valid HTML. If you want to use different
             * markup for each button, you can do that by using a conditional on either parameter. The default parameter
             * returns a button element with the text label of the choice.
             */
            readonly button_html: {
                readonly type: ParameterType.FUNCTION;
                readonly default: (choice: string, choice_index: number) => string;
            };
            /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention
             *  is that it can be used to provide a reminder about the action the participant is supposed to take
             * (e.g., which key to press). */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the
             * participant fails to make a response before this timer is reached, the participant's response will be
             * recorded as null for the trial and the trial will end. If the value of this parameter is null, the trial
             * will wait for a response indefinitely */
            readonly trial_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** Setting to `'grid'` will make the container element have the CSS property `display: grid` and enable the
             * use of `grid_rows` and `grid_columns`. Setting to `'flex'` will make the container element have the CSS
             * property `display: flex`. You can customize how the buttons are laid out by adding inline CSS in the `button_html` parameter.
             */
            readonly button_layout: {
                readonly type: ParameterType.STRING;
                readonly default: "grid";
            };
            /** The number of rows in the button grid. Only applicable when `button_layout` is set to `'grid'`. If null, the
             * number of rows will be determined automatically based on the number of buttons and the number of columns.
             */
            readonly grid_rows: {
                readonly type: ParameterType.INT;
                readonly default: 1;
            };
            /** The number of columns in the button grid. Only applicable when `button_layout` is set to `'grid'`.
             * If null, the number of columns will be determined automatically based on the number of buttons and the
             * number of rows.
             */
            readonly grid_columns: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** If true, then the trial will end whenever the participant makes a response (assuming they make their
             * response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will
             * continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force
             * the participant to listen to the stimulus for a fixed amount of time, even if they respond before the time is complete. */
            readonly response_ends_trial: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /** If true, then the trial will end as soon as the audio file finishes playing.  */
            readonly trial_ends_after_audio: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /**
             * If true, then responses are allowed while the audio is playing. If false, then the audio must finish
             * playing before the button choices are enabled and a response is accepted. Once the audio has played
             * all the way through, the buttons are enabled and a response is allowed (including while the audio is
             * being re-played via on-screen playback controls).
             */
            readonly response_allowed_while_playing: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /** How long the button will delay enabling in milliseconds. If `response_allowed_while_playing` is `true`,
             * the timer will start immediately. If it is `false`, the timer will start at the end of the audio. */
            readonly enable_button_after: {
                readonly type: ParameterType.INT;
                readonly default: 0;
            };
        };
        readonly data: {
            /** The path of the audio file that was played. */
            readonly stimulus: {
                readonly type: ParameterType.STRING;
            };
            /** The response time in milliseconds for the participant to make a response. The time is measured from
             * when the stimulus first began playing until the participant's response.*/
            readonly rt: {
                readonly type: ParameterType.INT;
            };
            /** Indicates which button the participant pressed. The first button in the `choices` array is 0, the second is 1, and so on. */
            readonly response: {
                readonly type: ParameterType.INT;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    private audio;
    private params;
    private buttonElements;
    private display;
    private response;
    private context;
    private startTime;
    private trial_complete;
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void): Promise<unknown>;
    private disable_buttons;
    private enable_buttons_without_delay;
    private enable_buttons_with_delay;
    private enable_buttons;
    private after_response;
    private end_trial;
    simulate(trial: TrialType<Info>, simulation_mode: any, simulation_options: any, load_callback: () => void): Promise<void>;
    private create_simulation_data;
    private simulate_data_only;
    private simulate_visual;
}

export { AudioButtonResponsePlugin as default };
