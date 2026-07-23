import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "canvas-slider-response";
    readonly version: string;
    readonly parameters: {
        /** The function to draw on the canvas. This function automatically takes a canvas element as its only argument, e.g. `function(c) {...}` or `function drawStim(c) {...}`, where `c` refers to the canvas element. Note that the stimulus function will still generally need to set the correct context itself, using a line like `let ctx = c.getContext("2d")`. */
        readonly stimulus: {
            readonly type: ParameterType.FUNCTION;
            readonly default: any;
        };
        /** Sets the minimum value of the slider. */
        readonly min: {
            readonly type: ParameterType.INT;
            readonly default: 0;
        };
        /** Sets the maximum value of the slider */
        readonly max: {
            readonly type: ParameterType.INT;
            readonly default: 100;
        };
        /** Sets the starting value of the slider */
        readonly slider_start: {
            readonly type: ParameterType.INT;
            readonly default: 50;
        };
        /** Sets the step of the slider. This is the smallest amount by which the slider can change. */
        readonly step: {
            readonly type: ParameterType.INT;
            readonly default: 1;
        };
        /** Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the other two will be at 33% and 67% of the slider width. */
        readonly labels: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: readonly [];
            readonly array: true;
        };
        /** Set the width of the slider in pixels. If left null, then the width will be equal to the widest element in the display. */
        readonly slider_width: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** Label of the button to end the trial. */
        readonly button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Continue";
            readonly array: false;
        };
        /** If true, the participant must click the slider before clicking the continue button. */
        readonly require_movement: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., what question to answer). */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /** How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends. */
        readonly stimulus_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely. */
        readonly trial_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can use this parameter to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete.  */
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
        /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
        /** Indicates which key the participant pressed. */
        readonly response: {
            readonly type: ParameterType.STRING;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin can be used to draw a stimulus on a [HTML canvas element](https://www.w3schools.com/html/html5_canvas.asp) and collect a response within a range of values, which is made by dragging a slider. The canvas stimulus can be useful for displaying dynamic, parametrically-defined graphics, and for controlling the positioning of multiple graphical elements (shapes, text, images). The stimulus can be displayed until a response is given, or for a pre-determined amount of time. The trial can be ended automatically if the participant has failed to respond within a fixed length of time.
 *
 * @author Chris Jungerius (modified from Josh de Leeuw)
 * @see {@link https://www.jspsych.org/latest/plugins/canvas-slider-response/ canvas-slider-response plugin documentation on jspsych.org}
 */
declare class CanvasSliderResponsePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "canvas-slider-response";
        readonly version: string;
        readonly parameters: {
            /** The function to draw on the canvas. This function automatically takes a canvas element as its only argument, e.g. `function(c) {...}` or `function drawStim(c) {...}`, where `c` refers to the canvas element. Note that the stimulus function will still generally need to set the correct context itself, using a line like `let ctx = c.getContext("2d")`. */
            readonly stimulus: {
                readonly type: ParameterType.FUNCTION;
                readonly default: any;
            };
            /** Sets the minimum value of the slider. */
            readonly min: {
                readonly type: ParameterType.INT;
                readonly default: 0;
            };
            /** Sets the maximum value of the slider */
            readonly max: {
                readonly type: ParameterType.INT;
                readonly default: 100;
            };
            /** Sets the starting value of the slider */
            readonly slider_start: {
                readonly type: ParameterType.INT;
                readonly default: 50;
            };
            /** Sets the step of the slider. This is the smallest amount by which the slider can change. */
            readonly step: {
                readonly type: ParameterType.INT;
                readonly default: 1;
            };
            /** Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the other two will be at 33% and 67% of the slider width. */
            readonly labels: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: readonly [];
                readonly array: true;
            };
            /** Set the width of the slider in pixels. If left null, then the width will be equal to the widest element in the display. */
            readonly slider_width: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** Label of the button to end the trial. */
            readonly button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Continue";
                readonly array: false;
            };
            /** If true, the participant must click the slider before clicking the continue button. */
            readonly require_movement: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., what question to answer). */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /** How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends. */
            readonly stimulus_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely. */
            readonly trial_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can use this parameter to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete.  */
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
            /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
            /** Indicates which key the participant pressed. */
            readonly response: {
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

export { CanvasSliderResponsePlugin as default };
