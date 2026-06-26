import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "instructions";
    readonly version: string;
    readonly parameters: {
        /** Each element of the array is the content for a single page. Each page should be an HTML-formatted string.  */
        readonly pages: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
            readonly array: true;
        };
        /** This is the key that the participant can press in order to advance to the next page. This key should be
         * specified as a string (e.g., `'a'`, `'ArrowLeft'`, `' '`, `'Enter'`). */
        readonly key_forward: {
            readonly type: ParameterType.KEY;
            readonly default: "ArrowRight";
        };
        /** This is the key that the participant can press to return to the previous page. This key should be specified as a
         * string (e.g., `'a'`, `'ArrowLeft'`, `' '`, `'Enter'`). */
        readonly key_backward: {
            readonly type: ParameterType.KEY;
            readonly default: "ArrowLeft";
        };
        /** If true, the participant can return to previous pages of the instructions. If false, they may only advace to the next page. */
        readonly allow_backward: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /** If `true`, the participant can use keyboard keys to navigate the pages. If `false`, they may not. */
        readonly allow_keys: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /** If true, then a `Previous` and `Next` button will be displayed beneath the instructions. Participants can
         * click the buttons to navigate. */
        readonly show_clickable_nav: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** If true, and clickable navigation is enabled, then Page x/y will be shown between the nav buttons. */
        readonly show_page_number: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** The text that appears before x/y pages displayed when show_page_number is true.*/
        readonly page_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Page";
        };
        /** The text that appears on the button to go backwards. */
        readonly button_label_previous: {
            readonly type: ParameterType.STRING;
            readonly default: "Previous";
        };
        /** The text that appears on the button to go forwards. */
        readonly button_label_next: {
            readonly type: ParameterType.STRING;
            readonly default: "Next";
        };
        /** The callback function when page changes */
        readonly on_page_change: {
            readonly type: ParameterType.FUNCTION;
            readonly pretty_name: "Page change callback";
            readonly default: (current_page: number) => void;
        };
    };
    readonly data: {
        /** An array containing the order of pages the participant viewed (including when the participant returned to previous pages)
         *  and the time spent viewing each page. Each object in the array represents a single page view,
         * and contains keys called `page_index` (the page number, starting with 0) and `viewing_time`
         * (duration of the page view). This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()`
         * functions.
         */
        readonly view_history: {
            readonly type: ParameterType.COMPLEX;
            readonly array: true;
            readonly nested: {
                readonly page_index: {
                    readonly type: ParameterType.INT;
                };
                readonly viewing_time: {
                    readonly type: ParameterType.INT;
                };
            };
        };
        /** The response time in milliseconds for the participant to view all of the pages. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin is for showing instructions to the participant. It allows participants to navigate through multiple pages
 * of instructions at their own pace, recording how long the participant spends on each page. Navigation can be done using
 *  the mouse or keyboard. participants can be allowed to navigate forwards and backwards through pages, if desired.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/instructions/ instructions plugin documentation on jspsych.org}
 */
declare class InstructionsPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "instructions";
        readonly version: string;
        readonly parameters: {
            /** Each element of the array is the content for a single page. Each page should be an HTML-formatted string.  */
            readonly pages: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
                readonly array: true;
            };
            /** This is the key that the participant can press in order to advance to the next page. This key should be
             * specified as a string (e.g., `'a'`, `'ArrowLeft'`, `' '`, `'Enter'`). */
            readonly key_forward: {
                readonly type: ParameterType.KEY;
                readonly default: "ArrowRight";
            };
            /** This is the key that the participant can press to return to the previous page. This key should be specified as a
             * string (e.g., `'a'`, `'ArrowLeft'`, `' '`, `'Enter'`). */
            readonly key_backward: {
                readonly type: ParameterType.KEY;
                readonly default: "ArrowLeft";
            };
            /** If true, the participant can return to previous pages of the instructions. If false, they may only advace to the next page. */
            readonly allow_backward: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /** If `true`, the participant can use keyboard keys to navigate the pages. If `false`, they may not. */
            readonly allow_keys: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /** If true, then a `Previous` and `Next` button will be displayed beneath the instructions. Participants can
             * click the buttons to navigate. */
            readonly show_clickable_nav: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** If true, and clickable navigation is enabled, then Page x/y will be shown between the nav buttons. */
            readonly show_page_number: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** The text that appears before x/y pages displayed when show_page_number is true.*/
            readonly page_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Page";
            };
            /** The text that appears on the button to go backwards. */
            readonly button_label_previous: {
                readonly type: ParameterType.STRING;
                readonly default: "Previous";
            };
            /** The text that appears on the button to go forwards. */
            readonly button_label_next: {
                readonly type: ParameterType.STRING;
                readonly default: "Next";
            };
            /** The callback function when page changes */
            readonly on_page_change: {
                readonly type: ParameterType.FUNCTION;
                readonly pretty_name: "Page change callback";
                readonly default: (current_page: number) => void;
            };
        };
        readonly data: {
            /** An array containing the order of pages the participant viewed (including when the participant returned to previous pages)
             *  and the time spent viewing each page. Each object in the array represents a single page view,
             * and contains keys called `page_index` (the page number, starting with 0) and `viewing_time`
             * (duration of the page view). This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()`
             * functions.
             */
            readonly view_history: {
                readonly type: ParameterType.COMPLEX;
                readonly array: true;
                readonly nested: {
                    readonly page_index: {
                        readonly type: ParameterType.INT;
                    };
                    readonly viewing_time: {
                        readonly type: ParameterType.INT;
                    };
                };
            };
            /** The response time in milliseconds for the participant to view all of the pages. */
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

export { InstructionsPlugin as default };
