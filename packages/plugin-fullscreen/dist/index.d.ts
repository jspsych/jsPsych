import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "fullscreen";
    readonly version: string;
    readonly parameters: {
        /** A value of `true` causes the experiment to enter fullscreen mode. A value of `false` causes the browser to exit fullscreen mode. */
        readonly fullscreen_mode: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
            readonly array: false;
        };
        /** `<p>The experiment will switch to full screen mode when you press the button below</p>` | The HTML content to display above the button to enter fullscreen mode. */
        readonly message: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "<p>The experiment will switch to full screen mode when you press the button below</p>";
            readonly array: false;
        };
        /** The text that appears on the button to enter fullscreen mode. */
        readonly button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Continue";
            readonly array: false;
        };
        /** The length of time to delay after entering fullscreen mode before ending the trial. This can be useful because entering fullscreen is jarring and most browsers display some kind of message that the browser has entered fullscreen mode. */
        readonly delay_after: {
            readonly type: ParameterType.INT;
            readonly default: 1000;
            readonly array: false;
        };
    };
    readonly data: {
        /** true if the browser supports fullscreen mode (i.e., is not Safari) */
        readonly success: {
            readonly type: ParameterType.BOOL;
            readonly default: any;
            readonly description: "True if the user entered fullscreen mode, false if not.";
        };
        /** Response time to click the button that launches fullscreen mode */
        readonly rt: {
            readonly type: ParameterType.INT;
            readonly default: any;
            readonly description: "Time in milliseconds until the user entered fullscreen mode.";
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * The fullscreen plugin allows the experiment to enter or exit fullscreen mode. For security reasons, all browsers require that entry into fullscreen mode is triggered by a user action. To enter fullscreen mode, this plugin has the user click a button. Exiting fullscreen mode can be done without user input.
 *
 * !!! warning
 *     Safari does not support keyboard input when the browser is in fullscreen mode. Therefore, the function will not launch fullscreen mode on Safari. The experiment will ignore any trials using the fullscreen plugin in Safari.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/fullscreen/ fullscreen plugin documentation on jspsych.org}
 */
declare class FullscreenPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "fullscreen";
        readonly version: string;
        readonly parameters: {
            /** A value of `true` causes the experiment to enter fullscreen mode. A value of `false` causes the browser to exit fullscreen mode. */
            readonly fullscreen_mode: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
                readonly array: false;
            };
            /** `<p>The experiment will switch to full screen mode when you press the button below</p>` | The HTML content to display above the button to enter fullscreen mode. */
            readonly message: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "<p>The experiment will switch to full screen mode when you press the button below</p>";
                readonly array: false;
            };
            /** The text that appears on the button to enter fullscreen mode. */
            readonly button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Continue";
                readonly array: false;
            };
            /** The length of time to delay after entering fullscreen mode before ending the trial. This can be useful because entering fullscreen is jarring and most browsers display some kind of message that the browser has entered fullscreen mode. */
            readonly delay_after: {
                readonly type: ParameterType.INT;
                readonly default: 1000;
                readonly array: false;
            };
        };
        readonly data: {
            /** true if the browser supports fullscreen mode (i.e., is not Safari) */
            readonly success: {
                readonly type: ParameterType.BOOL;
                readonly default: any;
                readonly description: "True if the user entered fullscreen mode, false if not.";
            };
            /** Response time to click the button that launches fullscreen mode */
            readonly rt: {
                readonly type: ParameterType.INT;
                readonly default: any;
                readonly description: "Time in milliseconds until the user entered fullscreen mode.";
            };
        };
        readonly citations: "__CITATIONS__";
    };
    private rt;
    private start_time;
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
    private showDisplay;
    private endTrial;
    private enterFullScreen;
    private exitFullScreen;
    simulate(trial: TrialType<Info>, simulation_mode: any, simulation_options: any, load_callback: () => void): void;
    private create_simulation_data;
    private simulate_data_only;
    private simulate_visual;
}

export { FullscreenPlugin as default };
