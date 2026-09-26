import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "survey-likert";
    readonly version: string;
    readonly parameters: {
        /** Array containing one or more objects with parameters for the question(s) that should be shown on the page. */
        readonly questions: {
            readonly type: ParameterType.COMPLEX;
            readonly array: true;
            readonly nested: {
                /** Question prompt. */
                readonly prompt: {
                    readonly type: ParameterType.HTML_STRING;
                    readonly default: any;
                };
                /** Array of likert labels to display for this question. */
                readonly labels: {
                    readonly type: ParameterType.STRING;
                    readonly array: true;
                    readonly default: any;
                };
                /** Whether or not a response to this question must be given in order to continue. */
                readonly required: {
                    readonly type: ParameterType.BOOL;
                    readonly default: false;
                };
                /** Name of the question in the trial data. If no name is given, the questions are named Q0, Q1, etc. */
                readonly name: {
                    readonly type: ParameterType.STRING;
                    readonly default: "";
                };
                /** Default response value for this question (0-based index of labels array). */
                readonly default_response: {
                    readonly type: ParameterType.INT;
                    readonly default: any;
                };
            };
        };
        /** If true, the order of the questions in the 'questions' array will be randomized. */
        readonly randomize_question_order: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** HTML-formatted string to display at top of the page above all of the questions. */
        readonly preamble: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /** Width of the likert scales in pixels. */
        readonly scale_width: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** Label of the button to submit responses. */
        readonly button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Continue";
        };
        /** Setting this to true will enable browser auto-complete or auto-fill for the form. */
        readonly autocomplete: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
    };
    readonly data: {
        /** An object containing the response for each question. The object will have a separate key (variable) for each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. The responses are recorded as integers, representing the position selected on the likert scale for that question. If the `name` parameter is defined for the question, then the response object will use the value of `name` as the key for each question. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
        readonly response: {
            readonly type: ParameterType.OBJECT;
        };
        /** The response time in milliseconds for the participant to make a response. The time is measured from when the questions first appear on the screen until the participant's response(s) are submitted. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
        /** An array with the order of questions. For example `[2,0,1]` would indicate that the first question was `trial.questions[2]` (the third item in the `questions` parameter), the second question was `trial.questions[0]`, and the final question was `trial.questions[1]`. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
        readonly question_order: {
            readonly type: ParameterType.INT;
            readonly array: true;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * The survey-likert plugin displays a set of questions with Likert scale responses. The participant responds
 * by selecting a radio button.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/survey-likert/ survey-likert plugin documentation on jspsych.org}
 */
declare class SurveyLikertPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "survey-likert";
        readonly version: string;
        readonly parameters: {
            /** Array containing one or more objects with parameters for the question(s) that should be shown on the page. */
            readonly questions: {
                readonly type: ParameterType.COMPLEX;
                readonly array: true;
                readonly nested: {
                    /** Question prompt. */
                    readonly prompt: {
                        readonly type: ParameterType.HTML_STRING;
                        readonly default: any;
                    };
                    /** Array of likert labels to display for this question. */
                    readonly labels: {
                        readonly type: ParameterType.STRING;
                        readonly array: true;
                        readonly default: any;
                    };
                    /** Whether or not a response to this question must be given in order to continue. */
                    readonly required: {
                        readonly type: ParameterType.BOOL;
                        readonly default: false;
                    };
                    /** Name of the question in the trial data. If no name is given, the questions are named Q0, Q1, etc. */
                    readonly name: {
                        readonly type: ParameterType.STRING;
                        readonly default: "";
                    };
                    /** Default response value for this question (0-based index of labels array). */
                    readonly default_response: {
                        readonly type: ParameterType.INT;
                        readonly default: any;
                    };
                };
            };
            /** If true, the order of the questions in the 'questions' array will be randomized. */
            readonly randomize_question_order: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** HTML-formatted string to display at top of the page above all of the questions. */
            readonly preamble: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /** Width of the likert scales in pixels. */
            readonly scale_width: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** Label of the button to submit responses. */
            readonly button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Continue";
            };
            /** Setting this to true will enable browser auto-complete or auto-fill for the form. */
            readonly autocomplete: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
        };
        readonly data: {
            /** An object containing the response for each question. The object will have a separate key (variable) for each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. The responses are recorded as integers, representing the position selected on the likert scale for that question. If the `name` parameter is defined for the question, then the response object will use the value of `name` as the key for each question. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
            readonly response: {
                readonly type: ParameterType.OBJECT;
            };
            /** The response time in milliseconds for the participant to make a response. The time is measured from when the questions first appear on the screen until the participant's response(s) are submitted. */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
            /** An array with the order of questions. For example `[2,0,1]` would indicate that the first question was `trial.questions[2]` (the third item in the `questions` parameter), the second question was `trial.questions[0]`, and the final question was `trial.questions[1]`. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
            readonly question_order: {
                readonly type: ParameterType.INT;
                readonly array: true;
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

export { SurveyLikertPlugin as default };
