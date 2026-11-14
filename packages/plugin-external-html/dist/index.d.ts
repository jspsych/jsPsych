import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "external-html";
    readonly version: string;
    readonly parameters: {
        /** The URL of the page to display. */
        readonly url: {
            readonly type: ParameterType.STRING;
            readonly default: any;
        };
        /** The key character the participant can use to advance to the next trial. If left as null, then the participant will not be able to advance trials using the keyboard. */
        readonly cont_key: {
            readonly type: ParameterType.KEY;
            readonly default: any;
        };
        /** The ID of a clickable element on the page. When the element is clicked, the trial will advance. */
        readonly cont_btn: {
            readonly type: ParameterType.STRING;
            readonly default: any;
        };
        /** `function(){ return true; }` | This function is called with the jsPsych `display_element` as the only argument when the participant attempts to advance the trial. The trial will only advance if the function return `true`. This can be used to verify that the participant has correctly filled out a form before continuing, for example. */
        readonly check_fn: {
            readonly type: ParameterType.FUNCTION;
            readonly default: () => boolean;
        };
        /** If `true`, then the plugin will avoid using the cached version of the HTML page to load if one exists. */
        readonly force_refresh: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** If `true`, then scripts on the remote page will be executed. */
        readonly execute_script: {
            readonly type: ParameterType.BOOL;
            readonly pretty_name: "Execute scripts";
            readonly default: false;
        };
    };
    readonly data: {
        /** The url of the page. */
        readonly url: {
            readonly type: ParameterType.STRING;
        };
        /** The response time in milliseconds for the participant to finish the trial. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * The HTML plugin displays an external HTML document (often a consent form). Either a keyboard response or a button press can be used to continue to the next trial. It allows the experimenter to check if conditions are met (such as indicating informed consent) before continuing.
 *
 * @author Erik Weitnauer
 * @see {@link https://www.jspsych.org/latest/plugins/external-html/ external-html plugin documentation on jspsych.org}
 */
declare class ExternalHtmlPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "external-html";
        readonly version: string;
        readonly parameters: {
            /** The URL of the page to display. */
            readonly url: {
                readonly type: ParameterType.STRING;
                readonly default: any;
            };
            /** The key character the participant can use to advance to the next trial. If left as null, then the participant will not be able to advance trials using the keyboard. */
            readonly cont_key: {
                readonly type: ParameterType.KEY;
                readonly default: any;
            };
            /** The ID of a clickable element on the page. When the element is clicked, the trial will advance. */
            readonly cont_btn: {
                readonly type: ParameterType.STRING;
                readonly default: any;
            };
            /** `function(){ return true; }` | This function is called with the jsPsych `display_element` as the only argument when the participant attempts to advance the trial. The trial will only advance if the function return `true`. This can be used to verify that the participant has correctly filled out a form before continuing, for example. */
            readonly check_fn: {
                readonly type: ParameterType.FUNCTION;
                readonly default: () => boolean;
            };
            /** If `true`, then the plugin will avoid using the cached version of the HTML page to load if one exists. */
            readonly force_refresh: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** If `true`, then scripts on the remote page will be executed. */
            readonly execute_script: {
                readonly type: ParameterType.BOOL;
                readonly pretty_name: "Execute scripts";
                readonly default: false;
            };
        };
        readonly data: {
            /** The url of the page. */
            readonly url: {
                readonly type: ParameterType.STRING;
            };
            /** The response time in milliseconds for the participant to finish the trial. */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void): Promise<unknown>;
    simulate(trial: TrialType<Info>, simulation_mode: any, simulation_options: any, load_callback: () => void): void;
    private create_simulation_data;
    private simulate_data_only;
    private simulate_visual;
}

export { ExternalHtmlPlugin as default };
