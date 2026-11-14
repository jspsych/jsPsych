import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "same-different-image";
    readonly version: string;
    readonly parameters: {
        /** A pair of stimuli, represented as an array with two entries,
         * one for each stimulus. The stimulus is a path to an image file.
         * Stimuli will be shown in the order that they are defined in the array. */
        readonly stimuli: {
            readonly type: ParameterType.IMAGE;
            readonly default: any;
            readonly array: true;
        };
        /** Either `'same'` or `'different'`. */
        readonly answer: {
            readonly type: ParameterType.SELECT;
            readonly options: readonly ["same", "different"];
            readonly default: any;
        };
        /** The key that subjects should press to indicate that the two stimuli are the same. */
        readonly same_key: {
            readonly type: ParameterType.KEY;
            readonly default: "q";
        };
        /** The key that subjects should press to indicate that the two stimuli are different. */
        readonly different_key: {
            readonly type: ParameterType.KEY;
            readonly default: "p";
        };
        /** How long to show the first stimulus for in milliseconds. If the value of this parameter is null then the stimulus will be shown until the participant presses any key. */
        readonly first_stim_duration: {
            readonly type: ParameterType.INT;
            readonly default: 1000;
        };
        /** How long to show a blank screen in between the two stimuli */
        readonly gap_duration: {
            readonly type: ParameterType.INT;
            readonly default: 500;
        };
        /** How long to show the second stimulus for in milliseconds. If null, then the stimulus will remain on the screen until a valid response is made. */
        readonly second_stim_duration: {
            readonly type: ParameterType.INT;
            readonly default: 1000;
        };
        /** This string can contain HTML markup. Any content here will be displayed
         * below the stimulus. The intention is that it can be used to provide a
         * reminder about the action the participant is supposed to take
         * (e.g., which key to press). */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
    };
    readonly data: {
        /** An array of length 2 containing the paths to the image files that the participant saw for each trial.
         * This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
        readonly stimulus: {
            readonly type: ParameterType.STRING;
            readonly array: true;
        };
        /** Indicates which key the participant pressed.  */
        readonly response: {
            readonly type: ParameterType.STRING;
        };
        /** The response time in milliseconds for the participant to make a response. The time is measured from when the second stimulus first appears on the screen until the participant's response. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
        /** `true` if the participant's response matched the `answer` for this trial. */
        readonly correct: {
            readonly type: ParameterType.BOOL;
        };
        /** The correct answer to the trial, either `'same'` or `'different'`. */
        readonly answer: {
            readonly type: ParameterType.STRING;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * The same-different-image plugin displays two stimuli sequentially. Stimuli are images.
 * The participant responds using the keyboard, and indicates whether the stimuli were the
 * same or different. Same does not necessarily mean identical; a category judgment could be
 * made, for example.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/same-different-image/ same-different-image plugin documentation on jspsych.org}
 */
declare class SameDifferentImagePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "same-different-image";
        readonly version: string;
        readonly parameters: {
            /** A pair of stimuli, represented as an array with two entries,
             * one for each stimulus. The stimulus is a path to an image file.
             * Stimuli will be shown in the order that they are defined in the array. */
            readonly stimuli: {
                readonly type: ParameterType.IMAGE;
                readonly default: any;
                readonly array: true;
            };
            /** Either `'same'` or `'different'`. */
            readonly answer: {
                readonly type: ParameterType.SELECT;
                readonly options: readonly ["same", "different"];
                readonly default: any;
            };
            /** The key that subjects should press to indicate that the two stimuli are the same. */
            readonly same_key: {
                readonly type: ParameterType.KEY;
                readonly default: "q";
            };
            /** The key that subjects should press to indicate that the two stimuli are different. */
            readonly different_key: {
                readonly type: ParameterType.KEY;
                readonly default: "p";
            };
            /** How long to show the first stimulus for in milliseconds. If the value of this parameter is null then the stimulus will be shown until the participant presses any key. */
            readonly first_stim_duration: {
                readonly type: ParameterType.INT;
                readonly default: 1000;
            };
            /** How long to show a blank screen in between the two stimuli */
            readonly gap_duration: {
                readonly type: ParameterType.INT;
                readonly default: 500;
            };
            /** How long to show the second stimulus for in milliseconds. If null, then the stimulus will remain on the screen until a valid response is made. */
            readonly second_stim_duration: {
                readonly type: ParameterType.INT;
                readonly default: 1000;
            };
            /** This string can contain HTML markup. Any content here will be displayed
             * below the stimulus. The intention is that it can be used to provide a
             * reminder about the action the participant is supposed to take
             * (e.g., which key to press). */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
        };
        readonly data: {
            /** An array of length 2 containing the paths to the image files that the participant saw for each trial.
             * This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
            readonly stimulus: {
                readonly type: ParameterType.STRING;
                readonly array: true;
            };
            /** Indicates which key the participant pressed.  */
            readonly response: {
                readonly type: ParameterType.STRING;
            };
            /** The response time in milliseconds for the participant to make a response. The time is measured from when the second stimulus first appears on the screen until the participant's response. */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
            /** `true` if the participant's response matched the `answer` for this trial. */
            readonly correct: {
                readonly type: ParameterType.BOOL;
            };
            /** The correct answer to the trial, either `'same'` or `'different'`. */
            readonly answer: {
                readonly type: ParameterType.STRING;
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

export { SameDifferentImagePlugin as default };
