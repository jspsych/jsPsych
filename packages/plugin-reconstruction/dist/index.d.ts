import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "reconstruction";
    readonly version: string;
    readonly parameters: {
        /** A function with a single parameter that returns an HTML-formatted string representing the stimulus. */
        readonly stim_function: {
            readonly type: ParameterType.FUNCTION;
            readonly default: any;
        };
        /** The starting value of the stimulus parameter. */
        readonly starting_value: {
            readonly type: ParameterType.FLOAT;
            readonly default: 0.5;
        };
        /** The change in the stimulus parameter caused by pressing one of the modification keys. */
        readonly step_size: {
            readonly type: ParameterType.FLOAT;
            readonly default: 0.05;
        };
        /** The key to press for increasing the parameter value. */
        readonly key_increase: {
            readonly type: ParameterType.KEY;
            readonly default: "h";
        };
        /** The key to press for decreasing the parameter value. */
        readonly key_decrease: {
            readonly type: ParameterType.KEY;
            readonly default: "g";
        };
        /** The text that appears on the button to finish the trial. */
        readonly button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Continue";
        };
    };
    readonly data: {
        /** The starting value of the stimulus parameter. */
        readonly start_value: {
            readonly type: ParameterType.INT;
        };
        /** The final value of the stimulus parameter. */
        readonly final_value: {
            readonly type: ParameterType.INT;
        };
        /** The length of time, in milliseconds, that the trial lasted. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin allows a participant to interact with a stimulus by modifying a parameter of the stimulus and observing
 * the change in the stimulus in real-time.
 *
 * The stimulus must be defined through a function that returns an HTML-formatted string. The function should take a
 * single value, which is the parameter that can be modified by the participant. The value can only range from 0 to 1.
 * See the example at the bottom of the page for a sample function.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/reconstruction/ reconstruction plugin documentation on jspsych.org}
 */
declare class ReconstructionPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "reconstruction";
        readonly version: string;
        readonly parameters: {
            /** A function with a single parameter that returns an HTML-formatted string representing the stimulus. */
            readonly stim_function: {
                readonly type: ParameterType.FUNCTION;
                readonly default: any;
            };
            /** The starting value of the stimulus parameter. */
            readonly starting_value: {
                readonly type: ParameterType.FLOAT;
                readonly default: 0.5;
            };
            /** The change in the stimulus parameter caused by pressing one of the modification keys. */
            readonly step_size: {
                readonly type: ParameterType.FLOAT;
                readonly default: 0.05;
            };
            /** The key to press for increasing the parameter value. */
            readonly key_increase: {
                readonly type: ParameterType.KEY;
                readonly default: "h";
            };
            /** The key to press for decreasing the parameter value. */
            readonly key_decrease: {
                readonly type: ParameterType.KEY;
                readonly default: "g";
            };
            /** The text that appears on the button to finish the trial. */
            readonly button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Continue";
            };
        };
        readonly data: {
            /** The starting value of the stimulus parameter. */
            readonly start_value: {
                readonly type: ParameterType.INT;
            };
            /** The final value of the stimulus parameter. */
            readonly final_value: {
                readonly type: ParameterType.INT;
            };
            /** The length of time, in milliseconds, that the trial lasted. */
            readonly rt: {
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

export { ReconstructionPlugin as default };
