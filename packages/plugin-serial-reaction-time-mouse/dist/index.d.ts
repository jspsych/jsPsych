import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "serial-reaction-time-mouse";
    readonly version: string;
    readonly parameters: {
        /** This array represents the grid of boxes shown on the screen. Each inner array represents a single row. The entries in the inner arrays represent the columns. If an entry is `1` then a square will be drawn at that location on the grid. If an entry is `0` then the corresponding location on the grid will be empty. Thus, by mixing `1`s and `0`s it is possible to create many different grid-based arrangements. */
        readonly grid: {
            readonly type: ParameterType.BOOL;
            readonly array: true;
            readonly default: readonly [readonly [1, 1, 1, 1]];
        };
        /** The location of the target. The array should be the [row, column] of the target. */
        readonly target: {
            readonly type: ParameterType.INT;
            readonly array: true;
            readonly default: any;
        };
        /** The width and height in pixels of each square in the grid. */
        readonly grid_square_size: {
            readonly type: ParameterType.INT;
            readonly default: 100;
        };
        /** The color of the target square. */
        readonly target_color: {
            readonly type: ParameterType.STRING;
            readonly default: "#999";
        };
        /** If true, the trial ends after a click. Feedback is displayed if `show_response_feedback` is true. */
        readonly response_ends_trial: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /** The number of milliseconds to display the grid *before* the target changes color. */
        readonly pre_target_duration: {
            readonly type: ParameterType.INT;
            readonly default: 0;
        };
        /** How long to show the trial */
        /** The maximum length of time of the trial, not including feedback. */
        readonly trial_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** If true, show feedback indicating where the participant clicked and whether it was correct. */
        readonly show_response_feedback: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** The length of time in milliseconds to show the feedback. */
        readonly feedback_duration: {
            readonly type: ParameterType.INT;
            readonly default: 200;
        };
        /** If a positive number, the target will progressively change color at the start of the trial, with the transition lasting this many milliseconds. */
        readonly fade_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** If true, then user can make nontarget response. */
        readonly allow_nontarget_responses: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which keys to press). */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
            readonly no_function: false;
        };
    };
    readonly data: {
        /** The representation of the grid. This will be encoded as a JSON string when data is saved using
         * the `.json()` or `.csv()` functions.  */
        readonly grid: {
            readonly type: ParameterType.COMPLEX;
            readonly array: true;
        };
        /** The representation of the target location on the grid. This will be encoded
         * as a JSON string when data is saved using the `.json()` or `.csv()` functions */
        readonly target: {
            readonly type: ParameterType.COMPLEX;
            readonly array: true;
        };
        /** The `[row, column]` response location on the grid. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
        readonly response: {
            readonly type: ParameterType.INT;
            readonly array: true;
        };
        /** The response time in milliseconds for the participant to make a response. The time is measured from when the second stimulus first appears on the screen until the participant's response. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
        /** `true` if the participant's response matched the target.  */
        readonly correct: {
            readonly type: ParameterType.BOOL;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * The serial reaction time mouse plugin implements a generalized version of the SRT
 * task [(Nissen & Bullmer, 1987)](https://doi.org/10.1016%2F0010-0285%2887%2990002-8).
 * Squares are displayed in a grid-based system on the screen, and one square changes color.
 * The participant must click on the square that changes color.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/serial-reaction-time-mouse/ serial-reaction-time-mouse plugin documentation on jspsych.org}
 */
declare class SerialReactionTimeMousePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "serial-reaction-time-mouse";
        readonly version: string;
        readonly parameters: {
            /** This array represents the grid of boxes shown on the screen. Each inner array represents a single row. The entries in the inner arrays represent the columns. If an entry is `1` then a square will be drawn at that location on the grid. If an entry is `0` then the corresponding location on the grid will be empty. Thus, by mixing `1`s and `0`s it is possible to create many different grid-based arrangements. */
            readonly grid: {
                readonly type: ParameterType.BOOL;
                readonly array: true;
                readonly default: readonly [readonly [1, 1, 1, 1]];
            };
            /** The location of the target. The array should be the [row, column] of the target. */
            readonly target: {
                readonly type: ParameterType.INT;
                readonly array: true;
                readonly default: any;
            };
            /** The width and height in pixels of each square in the grid. */
            readonly grid_square_size: {
                readonly type: ParameterType.INT;
                readonly default: 100;
            };
            /** The color of the target square. */
            readonly target_color: {
                readonly type: ParameterType.STRING;
                readonly default: "#999";
            };
            /** If true, the trial ends after a click. Feedback is displayed if `show_response_feedback` is true. */
            readonly response_ends_trial: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /** The number of milliseconds to display the grid *before* the target changes color. */
            readonly pre_target_duration: {
                readonly type: ParameterType.INT;
                readonly default: 0;
            };
            /** How long to show the trial */
            /** The maximum length of time of the trial, not including feedback. */
            readonly trial_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** If true, show feedback indicating where the participant clicked and whether it was correct. */
            readonly show_response_feedback: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** The length of time in milliseconds to show the feedback. */
            readonly feedback_duration: {
                readonly type: ParameterType.INT;
                readonly default: 200;
            };
            /** If a positive number, the target will progressively change color at the start of the trial, with the transition lasting this many milliseconds. */
            readonly fade_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** If true, then user can make nontarget response. */
            readonly allow_nontarget_responses: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which keys to press). */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
                readonly no_function: false;
            };
        };
        readonly data: {
            /** The representation of the grid. This will be encoded as a JSON string when data is saved using
             * the `.json()` or `.csv()` functions.  */
            readonly grid: {
                readonly type: ParameterType.COMPLEX;
                readonly array: true;
            };
            /** The representation of the target location on the grid. This will be encoded
             * as a JSON string when data is saved using the `.json()` or `.csv()` functions */
            readonly target: {
                readonly type: ParameterType.COMPLEX;
                readonly array: true;
            };
            /** The `[row, column]` response location on the grid. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
            readonly response: {
                readonly type: ParameterType.INT;
                readonly array: true;
            };
            /** The response time in milliseconds for the participant to make a response. The time is measured from when the second stimulus first appears on the screen until the participant's response. */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
            /** `true` if the participant's response matched the target.  */
            readonly correct: {
                readonly type: ParameterType.BOOL;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
    stimulus(grid: any, square_size: number, target?: number[], target_color?: string, labels?: any): string;
    simulate(trial: TrialType<Info>, simulation_mode: any, simulation_options: any, load_callback: () => void): void;
    private create_simulation_data;
    private simulate_data_only;
    private simulate_visual;
}

export { SerialReactionTimeMousePlugin as default };
