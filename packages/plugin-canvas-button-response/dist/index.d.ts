import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "canvas-button-response";
    readonly version: string;
    readonly parameters: {
        /**
         * The function to draw on the canvas. This function automatically takes a canvas element as its only argument,
         * e.g. `function(c) {...}`  or `function drawStim(c) {...}`, where `c` refers to the canvas element. Note that
         * the stimulus function will still generally need to set the correct context itself, using a line like
         * `let ctx = c.getContext("2d")`.
         */
        readonly stimulus: {
            readonly type: ParameterType.FUNCTION;
            readonly default: any;
        };
        /** Labels for the buttons. Each different string in the array will generate a different button. */
        readonly choices: {
            readonly type: ParameterType.STRING;
            readonly default: any;
            readonly array: true;
        };
        /**
         * ``(choice: string, choice_index: number)=>`<button class="jspsych-btn">${choice}</button>``; | A
         * function that generates the HTML for each button in the `choices` array. The function gets the
         * string and index of the item in the `choices` array and should return valid HTML. If you want
         * to use different markup for each button, you can do that by using a conditional on either parameter.
         * The default parameter returns a button element with the text label of the choice.
         */
        readonly button_html: {
            readonly type: ParameterType.FUNCTION;
            readonly default: (choice: string, choice_index: number) => string;
        };
        /** This string can contain HTML markup. Any content here will be displayed below the stimulus.
         * The intention is that it can be used to provide a reminder about the action the participant is supposed
         * to take (e.g., what question to answer).
         */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /** How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be
         * set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until
         * the trial ends.
         */
        readonly stimulus_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** How long to wait for the participant to make a response before ending the trial in milliseconds.
         * If the participant fails to make a response before this timer is reached, the participant's response
         * will be recorded as null for the trial and the trial will end. If the value of this parameter is null,
         * the trial will wait for a response indefinitely.
         */
        readonly trial_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** Setting to `'grid'` will make the container element have the CSS property `display: grid` and enable
         * the use of `grid_rows` and `grid_columns`. Setting to `'flex'` will make the container element have the
         * CSS property `display: flex`. You can customize how the buttons are laid out by adding inline CSS in
         * the `button_html` parameter.
         */
        readonly button_layout: {
            readonly type: ParameterType.STRING;
            readonly default: "grid";
        };
        /**
         * The number of rows in the button grid. Only applicable when `button_layout` is set to `'grid'`.
         * If null, the number of rows will be determined automatically based on the number of buttons and the number of columns.
         */
        readonly grid_rows: {
            readonly type: ParameterType.INT;
            readonly default: 1;
        };
        /**
         * The number of columns in the button grid. Only applicable when `button_layout` is set to `'grid'`.
         * If null, the number of columns will be determined automatically based on the number of buttons and the number of rows.
         */
        readonly grid_columns: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** If true, then the trial will end whenever the participant makes a response (assuming they make their response
         * before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until
         * the value for `trial_duration` is reached. You can use this parameter to force the participant to view a
         * stimulus for a fixed amount of time, even if they respond before the time is complete.
         */
        readonly response_ends_trial: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /** Array that defines the size of the canvas element in pixels. First value is height, second value is width. */
        readonly canvas_size: {
            readonly type: ParameterType.INT;
            readonly array: true;
            readonly default: readonly [500, 500];
        };
    };
    readonly data: {
        /** Indicates which button the participant pressed. The first button in the `choices` array is 0, the second is 1, and so on. */
        readonly response: {
            readonly type: ParameterType.INT;
        };
        /** The response time in milliseconds for the participant to make a response. The time is measured from when the
         * stimulus first appears on the screen until the participant's response.
         */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin can be used to draw a stimulus on a [HTML canvas element](https://www.w3schools.com/html/html5_canvas.asp), and record
 * a button click response and response time. The canvas stimulus can be useful for displaying dynamic, parametrically-defined
 * graphics, and for controlling the positioning of multiple graphical elements (shapes, text, images). The stimulus can be
 * displayed until a response is given, or for a pre-determined amount of time. The trial can be ended automatically if the
 * participant has failed to respond within a fixed length of time. One or more button choices will be displayed under the canvas,
 * and the button style can be customized using HTML formatting.
 *
 * @author Chris Jungerius (modified from Josh de Leeuw)
 * @see {@link https://www.jspsych.org/latest/plugins/canvas-button-response/ canvas-button-response plugin documentation on jspsych.org}
 */
declare class CanvasButtonResponsePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "canvas-button-response";
        readonly version: string;
        readonly parameters: {
            /**
             * The function to draw on the canvas. This function automatically takes a canvas element as its only argument,
             * e.g. `function(c) {...}`  or `function drawStim(c) {...}`, where `c` refers to the canvas element. Note that
             * the stimulus function will still generally need to set the correct context itself, using a line like
             * `let ctx = c.getContext("2d")`.
             */
            readonly stimulus: {
                readonly type: ParameterType.FUNCTION;
                readonly default: any;
            };
            /** Labels for the buttons. Each different string in the array will generate a different button. */
            readonly choices: {
                readonly type: ParameterType.STRING;
                readonly default: any;
                readonly array: true;
            };
            /**
             * ``(choice: string, choice_index: number)=>`<button class="jspsych-btn">${choice}</button>``; | A
             * function that generates the HTML for each button in the `choices` array. The function gets the
             * string and index of the item in the `choices` array and should return valid HTML. If you want
             * to use different markup for each button, you can do that by using a conditional on either parameter.
             * The default parameter returns a button element with the text label of the choice.
             */
            readonly button_html: {
                readonly type: ParameterType.FUNCTION;
                readonly default: (choice: string, choice_index: number) => string;
            };
            /** This string can contain HTML markup. Any content here will be displayed below the stimulus.
             * The intention is that it can be used to provide a reminder about the action the participant is supposed
             * to take (e.g., what question to answer).
             */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /** How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be
             * set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until
             * the trial ends.
             */
            readonly stimulus_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** How long to wait for the participant to make a response before ending the trial in milliseconds.
             * If the participant fails to make a response before this timer is reached, the participant's response
             * will be recorded as null for the trial and the trial will end. If the value of this parameter is null,
             * the trial will wait for a response indefinitely.
             */
            readonly trial_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** Setting to `'grid'` will make the container element have the CSS property `display: grid` and enable
             * the use of `grid_rows` and `grid_columns`. Setting to `'flex'` will make the container element have the
             * CSS property `display: flex`. You can customize how the buttons are laid out by adding inline CSS in
             * the `button_html` parameter.
             */
            readonly button_layout: {
                readonly type: ParameterType.STRING;
                readonly default: "grid";
            };
            /**
             * The number of rows in the button grid. Only applicable when `button_layout` is set to `'grid'`.
             * If null, the number of rows will be determined automatically based on the number of buttons and the number of columns.
             */
            readonly grid_rows: {
                readonly type: ParameterType.INT;
                readonly default: 1;
            };
            /**
             * The number of columns in the button grid. Only applicable when `button_layout` is set to `'grid'`.
             * If null, the number of columns will be determined automatically based on the number of buttons and the number of rows.
             */
            readonly grid_columns: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** If true, then the trial will end whenever the participant makes a response (assuming they make their response
             * before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until
             * the value for `trial_duration` is reached. You can use this parameter to force the participant to view a
             * stimulus for a fixed amount of time, even if they respond before the time is complete.
             */
            readonly response_ends_trial: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /** Array that defines the size of the canvas element in pixels. First value is height, second value is width. */
            readonly canvas_size: {
                readonly type: ParameterType.INT;
                readonly array: true;
                readonly default: readonly [500, 500];
            };
        };
        readonly data: {
            /** Indicates which button the participant pressed. The first button in the `choices` array is 0, the second is 1, and so on. */
            readonly response: {
                readonly type: ParameterType.INT;
            };
            /** The response time in milliseconds for the participant to make a response. The time is measured from when the
             * stimulus first appears on the screen until the participant's response.
             */
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

export { CanvasButtonResponsePlugin as default };
