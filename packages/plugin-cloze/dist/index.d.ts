import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "cloze";
    readonly version: string;
    readonly parameters: {
        /**
         * The cloze text to be displayed. Blanks are indicated by %% signs and automatically replaced by
         * input fields. If there is a correct answer you want the system to check against, it must be typed
         * between the two percentage signs (i.e. % correct solution %). If you would like to input multiple
         * solutions, type a slash between each responses (i.e. %1/2/3%).
         */
        readonly text: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /** Text of the button participants have to press for finishing the cloze test. */
        readonly button_text: {
            readonly type: ParameterType.STRING;
            readonly default: "OK";
        };
        /**
         * Boolean value indicating if the answers given by participants should be compared
         * against a correct solution given in `text` after the submit button was clicked.
         * If ```true```, answers are checked and in case of differences, the ```mistake_fn```
         * is called. In this case, the trial does not automatically finish. If ```false```,
         * no checks are performed and the trial ends when clicking the submit button.
         */
        readonly check_answers: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /**
         * Boolean value indicating if the answers given by participants should be checked for
         * completion after the button was clicked. If ```true```, answers are not checked for
         * completion and blank answers are allowed. The trial will then automatically finish
         * upon the clicking the button. If ```false```, answers are checked for completion,
         * and in case there are some fields with missing answers, the ```mistake_fn``` is called.
         * In this case, the trial does not automatically finish.
         */
        readonly allow_blanks: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /** Boolean value indicating if the solutions checker must be case sensitive. */
        readonly case_sensitivity: {
            readonly type: ParameterType.BOOL;
            readonly pretty_name: "Case sensitivity";
            readonly default: true;
        };
        /**
         * Function called if either `check_answers` is `true` or `allow_blanks` is `false`
         * and there is a discrepancy between the set answers and the answers provided, or
         * if all input fields aren't filled out, respectively.
         */
        readonly mistake_fn: {
            readonly type: ParameterType.FUNCTION;
            readonly default: () => void;
        };
        /**
         * Boolean value indicating if the first input field should be focused when the trial starts.
         * Enabled by default, but may be disabled especially if participants are using screen readers.
         */
        readonly autofocus: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
    };
    readonly data: {
        /** Answers the participant gave. */
        readonly response: {
            readonly type: ParameterType.STRING;
            readonly array: true;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin displays a text with certain words omitted. Participants are asked to replace the missing items. Responses are recorded when clicking a button. Responses can be evaluated and a function is called in case of either differences or incomplete answers, making it possible to inform participants about mistakes before proceeding.
 *
 * @author Philipp Sprengholz
 * @see {@link https://www.jspsych.org/latest/plugins/cloze/ cloze plugin documentation on jspsych.org}
 */
declare class ClozePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "cloze";
        readonly version: string;
        readonly parameters: {
            /**
             * The cloze text to be displayed. Blanks are indicated by %% signs and automatically replaced by
             * input fields. If there is a correct answer you want the system to check against, it must be typed
             * between the two percentage signs (i.e. % correct solution %). If you would like to input multiple
             * solutions, type a slash between each responses (i.e. %1/2/3%).
             */
            readonly text: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /** Text of the button participants have to press for finishing the cloze test. */
            readonly button_text: {
                readonly type: ParameterType.STRING;
                readonly default: "OK";
            };
            /**
             * Boolean value indicating if the answers given by participants should be compared
             * against a correct solution given in `text` after the submit button was clicked.
             * If ```true```, answers are checked and in case of differences, the ```mistake_fn```
             * is called. In this case, the trial does not automatically finish. If ```false```,
             * no checks are performed and the trial ends when clicking the submit button.
             */
            readonly check_answers: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /**
             * Boolean value indicating if the answers given by participants should be checked for
             * completion after the button was clicked. If ```true```, answers are not checked for
             * completion and blank answers are allowed. The trial will then automatically finish
             * upon the clicking the button. If ```false```, answers are checked for completion,
             * and in case there are some fields with missing answers, the ```mistake_fn``` is called.
             * In this case, the trial does not automatically finish.
             */
            readonly allow_blanks: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /** Boolean value indicating if the solutions checker must be case sensitive. */
            readonly case_sensitivity: {
                readonly type: ParameterType.BOOL;
                readonly pretty_name: "Case sensitivity";
                readonly default: true;
            };
            /**
             * Function called if either `check_answers` is `true` or `allow_blanks` is `false`
             * and there is a discrepancy between the set answers and the answers provided, or
             * if all input fields aren't filled out, respectively.
             */
            readonly mistake_fn: {
                readonly type: ParameterType.FUNCTION;
                readonly default: () => void;
            };
            /**
             * Boolean value indicating if the first input field should be focused when the trial starts.
             * Enabled by default, but may be disabled especially if participants are using screen readers.
             */
            readonly autofocus: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
        };
        readonly data: {
            /** Answers the participant gave. */
            readonly response: {
                readonly type: ParameterType.STRING;
                readonly array: true;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
    private getSolutions;
    simulate(trial: TrialType<Info>, simulation_mode: any, simulation_options: any, load_callback: () => void): void;
    private create_simulation_data;
    private simulate_data_only;
    private simulate_visual;
}

export { ClozePlugin as default };
