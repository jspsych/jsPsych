import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "call-function";
    readonly version: string;
    readonly parameters: {
        /** The function to call. */
        readonly func: {
            readonly type: ParameterType.FUNCTION;
            readonly default: any;
        };
        /** Set to true if `func` is an asynchoronous function. If this is true, then the first argument passed to `func`
         * will be a callback that you should call when the async operation is complete. You can pass data to the callback.
         * See example below.
         */
        readonly async: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
    };
    readonly data: {
        /** The return value of the called function. */
        readonly value: {
            readonly type: ParameterType.COMPLEX;
            readonly default: any;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin executes a specified function. This allows the experimenter to run arbitrary code at any point during the experiment.
 *
 * The function cannot take any arguments. If arguments are needed, then an anonymous function should be used to wrap the function call (see examples below).
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/call-function/ call-function plugin documentation on jspsych.org}
 */
declare class CallFunctionPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "call-function";
        readonly version: string;
        readonly parameters: {
            /** The function to call. */
            readonly func: {
                readonly type: ParameterType.FUNCTION;
                readonly default: any;
            };
            /** Set to true if `func` is an asynchoronous function. If this is true, then the first argument passed to `func`
             * will be a callback that you should call when the async operation is complete. You can pass data to the callback.
             * See example below.
             */
            readonly async: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
        };
        readonly data: {
            /** The return value of the called function. */
            readonly value: {
                readonly type: ParameterType.COMPLEX;
                readonly default: any;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
}

export { CallFunctionPlugin as default };
