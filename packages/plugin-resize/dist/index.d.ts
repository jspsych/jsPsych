import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "resize";
    readonly version: string;
    readonly parameters: {
        /** The height of the item to be measured. Any units can be used
         * as long as you are consistent with using the same units for
         * all parameters. */
        readonly item_height: {
            readonly type: ParameterType.INT;
            readonly default: 1;
        };
        /** The width of the item to be measured. */
        readonly item_width: {
            readonly type: ParameterType.INT;
            readonly default: 1;
        };
        /** The content displayed below the resizable box and above the button. */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /** After the scaling factor is applied, this many pixels will equal one unit of measurement. */
        readonly pixels_per_unit: {
            readonly type: ParameterType.INT;
            readonly default: 100;
        };
        /** The initial size of the box, in pixels, along the largest dimension.
         * The aspect ratio will be set automatically to match the item width and height. */
        readonly starting_size: {
            readonly type: ParameterType.INT;
            readonly default: 100;
        };
        /** Label to display on the button to complete calibration. */
        readonly button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Continue";
        };
    };
    readonly data: {
        /** Final width of the resizable div container, in pixels. */
        readonly final_width_px: {
            readonly type: ParameterType.INT;
        };
        /** Scaling factor that will be applied to the div containing jsPsych content. */
        readonly scale_factor: {
            readonly type: ParameterType.FLOAT;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 *
 * This plugin displays a resizable div container that allows the user to drag until the container is the same size as the
 * item being measured. Once the user measures the item as close as possible, clicking the button sets a scaling factor
 * for the div containing jsPsych content. This causes the stimuli that follow to have a known size, independent of monitor resolution.
 *
 * @author Steve Chao
 * @see {@link https://www.jspsych.org/latest/plugins/resize/ resize plugin documentation on jspsych.org}
 */
declare class ResizePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "resize";
        readonly version: string;
        readonly parameters: {
            /** The height of the item to be measured. Any units can be used
             * as long as you are consistent with using the same units for
             * all parameters. */
            readonly item_height: {
                readonly type: ParameterType.INT;
                readonly default: 1;
            };
            /** The width of the item to be measured. */
            readonly item_width: {
                readonly type: ParameterType.INT;
                readonly default: 1;
            };
            /** The content displayed below the resizable box and above the button. */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /** After the scaling factor is applied, this many pixels will equal one unit of measurement. */
            readonly pixels_per_unit: {
                readonly type: ParameterType.INT;
                readonly default: 100;
            };
            /** The initial size of the box, in pixels, along the largest dimension.
             * The aspect ratio will be set automatically to match the item width and height. */
            readonly starting_size: {
                readonly type: ParameterType.INT;
                readonly default: 100;
            };
            /** Label to display on the button to complete calibration. */
            readonly button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Continue";
            };
        };
        readonly data: {
            /** Final width of the resizable div container, in pixels. */
            readonly final_width_px: {
                readonly type: ParameterType.INT;
            };
            /** Scaling factor that will be applied to the div containing jsPsych content. */
            readonly scale_factor: {
                readonly type: ParameterType.FLOAT;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
}

export { ResizePlugin as default };
