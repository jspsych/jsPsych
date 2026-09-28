import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "survey-multi-select";
    readonly version: string;
    readonly parameters: {
        /**
         * An array of objects, each object represents a question that appears on the screen. Each object contains a prompt,
         * options, required, and horizontal parameter that will be applied to the question. See examples below for further
         * clarification.`prompt`: Type string, default value is *undefined*. The string is prompt/question that will be
         * associated with a group of options (radio buttons). All questions will get presented on the same page (trial).
         * `options`: Type array, defualt value is *undefined*. An array of strings. The array contains a set of options to
         * display for an individual question.`required`: Type boolean, default value is null. The boolean value indicates
         * if a question is required('true') or not ('false'), using the HTML5 `required` attribute. If this parameter is
         * undefined, the question will be optional. `horizontal`:Type boolean, default value is false. If true, then the
         * question is centered and the options are displayed horizontally. `name`: Name of the question. Used for storing
         * data. If left undefined then default names (`Q0`, `Q1`, `...`) will be used for the questions.
         */
        readonly questions: {
            readonly type: ParameterType.COMPLEX;
            readonly array: true;
            readonly nested: {
                /** Question prompt. */
                readonly prompt: {
                    readonly type: ParameterType.HTML_STRING;
                    readonly default: any;
                };
                /** Array of multiple select options for this question. */
                readonly options: {
                    readonly type: ParameterType.STRING;
                    readonly array: true;
                    readonly default: any;
                };
                /** If true, then the question will be centered and options will be displayed horizontally. */
                readonly horizontal: {
                    readonly type: ParameterType.BOOL;
                    readonly default: false;
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
            };
        };
        /**
         * If true, the display order of `questions` is randomly determined at the start of the trial. In the data
         * object, `Q0` will still refer to the first question in the array, regardless of where it was presented
         * visually.
         */
        readonly randomize_question_order: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** HTML formatted string to display at the top of the page above all the questions. */
        readonly preamble: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /** Label of the button to submit responses. */
        readonly button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Continue";
        };
        /** 'You must choose at least one response for this question' | Message to display if required response is not given. */
        readonly required_message: {
            readonly type: ParameterType.STRING;
            readonly default: "You must choose at least one response for this question";
        };
        /** This determines whether or not all of the input elements on the page should allow autocomplete.
         * Setting this to true will enable autocomplete or auto-fill for the form. */
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
 * The survey-multi-select plugin displays a set of questions with multiple select response fields. The participant can
 * select multiple answers.
 *
 * @see {@link https://www.jspsych.org/latest/plugins/survey-multi-select/ survey-multi-select plugin documentation on jspsych.org}
 */
declare class SurveyMultiSelectPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "survey-multi-select";
        readonly version: string;
        readonly parameters: {
            /**
             * An array of objects, each object represents a question that appears on the screen. Each object contains a prompt,
             * options, required, and horizontal parameter that will be applied to the question. See examples below for further
             * clarification.`prompt`: Type string, default value is *undefined*. The string is prompt/question that will be
             * associated with a group of options (radio buttons). All questions will get presented on the same page (trial).
             * `options`: Type array, defualt value is *undefined*. An array of strings. The array contains a set of options to
             * display for an individual question.`required`: Type boolean, default value is null. The boolean value indicates
             * if a question is required('true') or not ('false'), using the HTML5 `required` attribute. If this parameter is
             * undefined, the question will be optional. `horizontal`:Type boolean, default value is false. If true, then the
             * question is centered and the options are displayed horizontally. `name`: Name of the question. Used for storing
             * data. If left undefined then default names (`Q0`, `Q1`, `...`) will be used for the questions.
             */
            readonly questions: {
                readonly type: ParameterType.COMPLEX;
                readonly array: true;
                readonly nested: {
                    /** Question prompt. */
                    readonly prompt: {
                        readonly type: ParameterType.HTML_STRING;
                        readonly default: any;
                    };
                    /** Array of multiple select options for this question. */
                    readonly options: {
                        readonly type: ParameterType.STRING;
                        readonly array: true;
                        readonly default: any;
                    };
                    /** If true, then the question will be centered and options will be displayed horizontally. */
                    readonly horizontal: {
                        readonly type: ParameterType.BOOL;
                        readonly default: false;
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
                };
            };
            /**
             * If true, the display order of `questions` is randomly determined at the start of the trial. In the data
             * object, `Q0` will still refer to the first question in the array, regardless of where it was presented
             * visually.
             */
            readonly randomize_question_order: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** HTML formatted string to display at the top of the page above all the questions. */
            readonly preamble: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /** Label of the button to submit responses. */
            readonly button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Continue";
            };
            /** 'You must choose at least one response for this question' | Message to display if required response is not given. */
            readonly required_message: {
                readonly type: ParameterType.STRING;
                readonly default: "You must choose at least one response for this question";
            };
            /** This determines whether or not all of the input elements on the page should allow autocomplete.
             * Setting this to true will enable autocomplete or auto-fill for the form. */
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

export { SurveyMultiSelectPlugin as default };
