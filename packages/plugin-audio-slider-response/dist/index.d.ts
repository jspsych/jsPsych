import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "audio-slider-response";
    readonly version: string;
    readonly parameters: {
        /** Audio file to be played. */
        readonly stimulus: {
            readonly type: ParameterType.AUDIO;
            readonly default: any;
        };
        /** Sets the minimum value of the slider. */
        readonly min: {
            readonly type: ParameterType.INT;
            readonly default: 0;
        };
        /** Sets the maximum value of the slider */
        readonly max: {
            readonly type: ParameterType.INT;
            readonly default: 100;
        };
        /** Sets the starting value of the slider */
        readonly slider_start: {
            readonly type: ParameterType.INT;
            readonly default: 50;
        };
        /** Sets the step of the slider. This is the smallest amount by which the slider can change. */
        readonly step: {
            readonly type: ParameterType.INT;
            readonly default: 1;
        };
        /** Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the
         * slider. Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the
         * other two will be at 33% and 67% of the slider width.
         */
        readonly labels: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: readonly [];
            readonly array: true;
        };
        /** Set the width of the slider in pixels. If left null, then the width will be equal to the widest element in the display. */
        readonly slider_width: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** Label of the button to end the trial. */
        readonly button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Continue";
            readonly array: false;
        };
        /** If true, the participant must move the slider before clicking the continue button. */
        readonly require_movement: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is
         * that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).
         */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /** How long to wait for the participant to make a response before ending the trial in milliseconds. If
         * the participant fails to make a response before this timer is reached, the participant's response will be
         * recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial
         * will wait for a response indefinitely.
         */
        readonly trial_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** If true, then the trial will end whenever the participant makes a response (assuming they make their response
         * before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the
         * value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to listen to
         * the stimulus for a fixed amount of time, even if they respond before the time is complete.
         */
        readonly response_ends_trial: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /** If true, then the trial will end as soon as the audio file finishes playing. */
        readonly trial_ends_after_audio: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** If true, then responses are allowed while the audio is playing. If false, then the audio must finish playing before
         * the slider is enabled and the trial can end via the next button click. Once the audio has played all the way through,
         * the slider is enabled and a response is allowed (including while the audio is being re-played via on-screen playback controls).
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
        /** The time in milliseconds for the participant to make a response. The time is measured from when the stimulus first
         * began playing until the participant's response.
         */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
        /** The path of the audio file that was played. */
        readonly stimulus: {
            readonly type: ParameterType.STRING;
        };
        /** The starting value of the slider. */
        readonly slider_start: {
            readonly type: ParameterType.INT;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin plays an audio file and allows the participant to respond by dragging a slider.
 *
 * If the browser supports it, audio files are played using the WebAudio API. This allows for reasonably precise timing of the
 * playback. The timing of responses generated is measured against the WebAudio specific clock, improving the measurement of
 * response times. If the browser does not support the WebAudio API, then the audio file is played with HTML5 audio.
 *
 * Audio files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md). However, if you are using
 * timeline variables or another dynamic method to specify the audio stimulus, then you will need
 * to [manually preload](../overview/media-preloading.md#manual-preloading) the audio.
 *
 * The trial can end when the participant responds, or if the participant has failed to respond within a fixed length of time. You can also prevent the slider response from being made before the audio has finished playing.
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/audio-slider-response/ audio-slider-response plugin documentation on jspsych.org}
 */
declare class AudioSliderResponsePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "audio-slider-response";
        readonly version: string;
        readonly parameters: {
            /** Audio file to be played. */
            readonly stimulus: {
                readonly type: ParameterType.AUDIO;
                readonly default: any;
            };
            /** Sets the minimum value of the slider. */
            readonly min: {
                readonly type: ParameterType.INT;
                readonly default: 0;
            };
            /** Sets the maximum value of the slider */
            readonly max: {
                readonly type: ParameterType.INT;
                readonly default: 100;
            };
            /** Sets the starting value of the slider */
            readonly slider_start: {
                readonly type: ParameterType.INT;
                readonly default: 50;
            };
            /** Sets the step of the slider. This is the smallest amount by which the slider can change. */
            readonly step: {
                readonly type: ParameterType.INT;
                readonly default: 1;
            };
            /** Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the
             * slider. Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the
             * other two will be at 33% and 67% of the slider width.
             */
            readonly labels: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: readonly [];
                readonly array: true;
            };
            /** Set the width of the slider in pixels. If left null, then the width will be equal to the widest element in the display. */
            readonly slider_width: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** Label of the button to end the trial. */
            readonly button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Continue";
                readonly array: false;
            };
            /** If true, the participant must move the slider before clicking the continue button. */
            readonly require_movement: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is
             * that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).
             */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /** How long to wait for the participant to make a response before ending the trial in milliseconds. If
             * the participant fails to make a response before this timer is reached, the participant's response will be
             * recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial
             * will wait for a response indefinitely.
             */
            readonly trial_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** If true, then the trial will end whenever the participant makes a response (assuming they make their response
             * before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the
             * value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to listen to
             * the stimulus for a fixed amount of time, even if they respond before the time is complete.
             */
            readonly response_ends_trial: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /** If true, then the trial will end as soon as the audio file finishes playing. */
            readonly trial_ends_after_audio: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** If true, then responses are allowed while the audio is playing. If false, then the audio must finish playing before
             * the slider is enabled and the trial can end via the next button click. Once the audio has played all the way through,
             * the slider is enabled and a response is allowed (including while the audio is being re-played via on-screen playback controls).
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
            /** The time in milliseconds for the participant to make a response. The time is measured from when the stimulus first
             * began playing until the participant's response.
             */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
            /** The path of the audio file that was played. */
            readonly stimulus: {
                readonly type: ParameterType.STRING;
            };
            /** The starting value of the slider. */
            readonly slider_start: {
                readonly type: ParameterType.INT;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    private audio;
    private context;
    private params;
    private display;
    private response;
    private startTime;
    private half_thumb_width;
    private trial_complete;
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void): Promise<unknown>;
    private enable_slider;
    private setupTrial;
    private end_trial;
    simulate(trial: TrialType<Info>, simulation_mode: any, simulation_options: any, load_callback: () => void): void;
    private create_simulation_data;
    private simulate_data_only;
    private simulate_visual;
}

export { AudioSliderResponsePlugin as default };
