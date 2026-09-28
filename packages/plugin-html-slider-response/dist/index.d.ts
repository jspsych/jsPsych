import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "html-slider-response";
    readonly version: string;
    readonly parameters: {
        /** The HTML string to be displayed */
        readonly stimulus: {
            readonly type: ParameterType.HTML_STRING;
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
        /** Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the other two will be at 33% and 67% of the slider width. */
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
        /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /** How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends. */
        readonly stimulus_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely. */
        readonly trial_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete. */
        readonly response_ends_trial: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
    };
    readonly data: {
        /** The time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
        /** The numeric value of the slider. */
        readonly response: {
            readonly type: ParameterType.INT;
        };
        /** The HTML content that was displayed on the screen. */
        readonly stimulus: {
            readonly type: ParameterType.HTML_STRING;
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
 * This plugin displays HTML content and allows the participant to respond by dragging a slider.
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/html-slider-response/ html-slider-response plugin documentation on jspsych.org}
 */
declare class HtmlSliderResponsePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "html-slider-response";
        readonly version: string;
        readonly parameters: {
            /** The HTML string to be displayed */
            readonly stimulus: {
                readonly type: ParameterType.HTML_STRING;
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
            /** Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the other two will be at 33% and 67% of the slider width. */
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
            /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /** How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends. */
            readonly stimulus_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely. */
            readonly trial_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete. */
            readonly response_ends_trial: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
        };
        readonly data: {
            /** The time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
            /** The numeric value of the slider. */
            readonly response: {
                readonly type: ParameterType.INT;
            };
            /** The HTML content that was displayed on the screen. */
            readonly stimulus: {
                readonly type: ParameterType.HTML_STRING;
            };
            /** The starting value of the slider. */
            readonly slider_start: {
                readonly type: ParameterType.INT;
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

export { HtmlSliderResponsePlugin as default };
