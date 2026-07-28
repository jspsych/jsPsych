import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "virtual-chinrest";
    readonly version: string;
    readonly parameters: {
        /**
         * Units to resize the jsPsych content to after the trial is over: `"none"` `"cm"` `"inch"` or `"deg"`.
         * If `"none"`, no resizing will be done to the jsPsych content after the virtual-chinrest trial ends.
         */
        readonly resize_units: {
            readonly type: ParameterType.SELECT;
            readonly options: readonly ["none", "cm", "inch", "deg"];
            readonly default: "none";
        };
        /**
         * After the scaling factor is applied, this many pixels will equal one unit of measurement, where
         * the units are indicated by `resize_units`. This is only used when resizing is done after the
         * trial ends (i.e. the `resize_units` parameter is not "none").
         */
        readonly pixels_per_unit: {
            readonly type: ParameterType.INT;
            readonly default: 100;
        };
        /** This string can contain HTML markup. Any content here will be displayed
         * **below the card stimulus** during the resizing phase.
         */
        readonly adjustment_prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "\n          <div style=\"text-align: left;\">\n          <p>Click and drag the lower right corner of the image until it is the same size as a credit card held up to the screen.</p>\n          <p>You can use any card that is the same size as a credit card, like a membership card or driver's license.</p>\n          <p>If you do not have access to a real card you can use a ruler to measure the image width to 3.37 inches or 85.6 mm.</p>\n          </div>";
        };
        /** Content of the button displayed below the card stimulus during the resizing phase. */
        readonly adjustment_button_prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "Click here when the image is the correct size";
        };
        /** Path of the item to be presented in the card stimulus during the resizing phase. If `null` then no
         * image is shown, and a solid color background is used instead. _An example image is available in
         * `/examples/img/card.png`_
         */
        readonly item_path: {
            readonly type: ParameterType.IMAGE;
            readonly default: any;
            readonly preload: false;
        };
        /** The known height of the physical item (e.g. credit card) to be measured, in mm. */
        readonly item_height_mm: {
            readonly type: ParameterType.FLOAT;
            readonly default: 53.98;
        };
        /** The known width of the physical item (e.g. credit card) to be measured, in mm. */
        readonly item_width_mm: {
            readonly type: ParameterType.FLOAT;
            readonly default: 85.6;
        };
        /** The initial size of the card stimulus, in pixels, along its largest dimension. */
        readonly item_init_size: {
            readonly type: ParameterType.INT;
            readonly default: 250;
        };
        /** How many times to measure the blindspot location. If `0`, blindspot will not be detected, and viewing distance and degree data will not be computed. */
        readonly blindspot_reps: {
            readonly type: ParameterType.INT;
            readonly default: 5;
        };
        /** This string can contain HTML markup. Any content here will be displayed **above the blindspot task**. */
        readonly blindspot_prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly pretty_name: "Blindspot prompt";
            readonly default: "\n          <p>Now we will quickly measure how far away you are sitting.</p>\n          <div style=\"text-align: left\">\n            <ol>\n              <li>Put your left hand on the <b>space bar</b>.</li>\n              <li>Cover your right eye with your right hand.</li>\n              <li>Using your left eye, focus on the black square. Keep your focus on the black square.</li>\n              <li>The <span style=\"color: red; font-weight: bold;\">red ball</span> will disappear as it moves from right to left. Press the space bar as soon as the ball disappears.</li>\n            </ol>\n          </div>\n          <p>Press the space bar when you are ready to begin.</p>\n          ";
        };
        /** Content of the start button for the blindspot tasks. */
        /** Text accompanying the remaining measurements counter that appears below the blindspot task. */
        readonly blindspot_measurements_prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "Remaining measurements: ";
        };
        /** Estimated viewing distance data displayed after blindspot task. If `"none"` is given, viewing distance will not be reported to the participant. The HTML `span` element with `id = distance-estimate` returns the distance. */
        readonly viewing_distance_report: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "<p>Based on your responses, you are sitting about <span id='distance-estimate' style='font-weight: bold;'></span> from the screen.</p><p>Does that seem about right?</p>";
        };
        /** Text for the button on the viewing distance report page to re-do the viewing distance estimate. If the participant click this button, the blindspot task starts again. */
        readonly redo_measurement_button_label: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "No, that is not close. Try again.";
        };
        /** Text for the button on the viewing distance report page that can be clicked to accept the viewing distance estimate. */
        readonly blindspot_done_prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "Yes";
        };
    };
    readonly data: {
        /** The response time in milliseconds. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
        /** The height in millimeters of the item to be measured. */
        readonly item_height_mm: {
            readonly type: ParameterType.FLOAT;
        };
        /** The width in millimeters of the item to be measured. */
        readonly item_width_mm: {
            readonly type: ParameterType.FLOAT;
        };
        /** Final height of the resizable div container, in degrees. */
        readonly item_height_deg: {
            readonly type: ParameterType.FLOAT;
        };
        /** Final width of the resizable div container, in degrees. */
        readonly item_width_deg: {
            readonly type: ParameterType.FLOAT;
        };
        /** Final width of the resizable div container, in pixels. */
        readonly item_width_px: {
            readonly type: ParameterType.FLOAT;
        };
        /** Pixels to degrees conversion factor. */
        readonly px2deg: {
            readonly type: ParameterType.INT;
        };
        /** Pixels to millimeters conversion factor. */
        readonly px2mm: {
            readonly type: ParameterType.FLOAT;
        };
        /** Scaling factor that will be applied to the div containing jsPsych content. */
        readonly scale_factor: {
            readonly type: ParameterType.FLOAT;
        };
        /** The interior width of the window in degrees. */
        readonly win_width_deg: {
            readonly type: ParameterType.FLOAT;
        };
        /** The interior height of the window in degrees. */
        readonly win_height_deg: {
            readonly type: ParameterType.FLOAT;
        };
        /** Estimated distance to the screen in millimeters. */
        readonly view_dist_mm: {
            readonly type: ParameterType.FLOAT;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
declare global {
    interface Window {
        ball: any;
        moveX: number;
    }
    interface Math {
        radians: (degrees: number) => number;
    }
}
/**
 *
 * This plugin provides a "virtual chinrest" that can measure the distance between the participant and the screen. It
 * can also standardize the jsPsych page content to a known physical dimension (e.g., ensuring that a 200px wide stimulus
 * is 2.2cm wide on the participant's monitor). This is based on the work of [Li, Joo, Yeatman, and Reinecke
 * (2020)](https://doi.org/10.1038/s41598-019-57204-1), and the plugin code is a modified version of
 * [their implementation](https://github.com/QishengLi/virtual_chinrest). We recommend citing their work in any paper
 * that makes use of this plugin.
 *
 * !!! note "Citation"
 *     Li, Q., Joo, S. J., Yeatman, J. D., & Reinecke, K. (2020). Controlling for Participants’ Viewing Distance in Large-Scale, Psychophysical Online Experiments Using a Virtual Chinrest. _Scientific Reports, 10_(1), 1-11. doi: [10.1038/s41598-019-57204-1](https://doi.org/10.1038/s41598-019-57204-1)
 *
 * The plugin works in two phases.
 *
 * **Phase 1**. To calculate the pixel-to-cm conversion rate for a participant’s display, participants are asked to place
 * a credit card or other item of the same size on the screen and resize an image until it is the same size as the credit
 * card. Since we know the physical dimensions of the card, we can find the conversion rate for the participant's display.
 *
 * **Phase 2**. To measure the participant's viewing distance from their screen we use a [blind spot](<https://en.wikipedia.org/wiki/Blind_spot_(vision)>) task. Participants are asked to focus on a black square on the screen with their right eye closed, while a red dot repeatedly sweeps from right to left. They press the spacebar on their keyboard whenever they perceive that the red dot has disappeared. This part allows the plugin to use the distance between the black square and the red dot when it disappears from eyesight to estimate how far the participant is from the monitor. This estimation assumes that the blind spot is located at 13.5° temporally.
 *
 *
 * @author Gustavo Juantorena
 * 08/2020 // https://github.com/GEJ1
 * Contributions from Peter J. Kohler: https://github.com/pjkohler
 * @see {@link https://www.jspsych.org/latest/plugins/virtual-chinrest/ virtual-chinrest plugin documentation on jspsych.org}
 */
declare class VirtualChinrestPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "virtual-chinrest";
        readonly version: string;
        readonly parameters: {
            /**
             * Units to resize the jsPsych content to after the trial is over: `"none"` `"cm"` `"inch"` or `"deg"`.
             * If `"none"`, no resizing will be done to the jsPsych content after the virtual-chinrest trial ends.
             */
            readonly resize_units: {
                readonly type: ParameterType.SELECT;
                readonly options: readonly ["none", "cm", "inch", "deg"];
                readonly default: "none";
            };
            /**
             * After the scaling factor is applied, this many pixels will equal one unit of measurement, where
             * the units are indicated by `resize_units`. This is only used when resizing is done after the
             * trial ends (i.e. the `resize_units` parameter is not "none").
             */
            readonly pixels_per_unit: {
                readonly type: ParameterType.INT;
                readonly default: 100;
            };
            /** This string can contain HTML markup. Any content here will be displayed
             * **below the card stimulus** during the resizing phase.
             */
            readonly adjustment_prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "\n          <div style=\"text-align: left;\">\n          <p>Click and drag the lower right corner of the image until it is the same size as a credit card held up to the screen.</p>\n          <p>You can use any card that is the same size as a credit card, like a membership card or driver's license.</p>\n          <p>If you do not have access to a real card you can use a ruler to measure the image width to 3.37 inches or 85.6 mm.</p>\n          </div>";
            };
            /** Content of the button displayed below the card stimulus during the resizing phase. */
            readonly adjustment_button_prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "Click here when the image is the correct size";
            };
            /** Path of the item to be presented in the card stimulus during the resizing phase. If `null` then no
             * image is shown, and a solid color background is used instead. _An example image is available in
             * `/examples/img/card.png`_
             */
            readonly item_path: {
                readonly type: ParameterType.IMAGE;
                readonly default: any;
                readonly preload: false;
            };
            /** The known height of the physical item (e.g. credit card) to be measured, in mm. */
            readonly item_height_mm: {
                readonly type: ParameterType.FLOAT;
                readonly default: 53.98;
            };
            /** The known width of the physical item (e.g. credit card) to be measured, in mm. */
            readonly item_width_mm: {
                readonly type: ParameterType.FLOAT;
                readonly default: 85.6;
            };
            /** The initial size of the card stimulus, in pixels, along its largest dimension. */
            readonly item_init_size: {
                readonly type: ParameterType.INT;
                readonly default: 250;
            };
            /** How many times to measure the blindspot location. If `0`, blindspot will not be detected, and viewing distance and degree data will not be computed. */
            readonly blindspot_reps: {
                readonly type: ParameterType.INT;
                readonly default: 5;
            };
            /** This string can contain HTML markup. Any content here will be displayed **above the blindspot task**. */
            readonly blindspot_prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly pretty_name: "Blindspot prompt";
                readonly default: "\n          <p>Now we will quickly measure how far away you are sitting.</p>\n          <div style=\"text-align: left\">\n            <ol>\n              <li>Put your left hand on the <b>space bar</b>.</li>\n              <li>Cover your right eye with your right hand.</li>\n              <li>Using your left eye, focus on the black square. Keep your focus on the black square.</li>\n              <li>The <span style=\"color: red; font-weight: bold;\">red ball</span> will disappear as it moves from right to left. Press the space bar as soon as the ball disappears.</li>\n            </ol>\n          </div>\n          <p>Press the space bar when you are ready to begin.</p>\n          ";
            };
            /** Content of the start button for the blindspot tasks. */
            /** Text accompanying the remaining measurements counter that appears below the blindspot task. */
            readonly blindspot_measurements_prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "Remaining measurements: ";
            };
            /** Estimated viewing distance data displayed after blindspot task. If `"none"` is given, viewing distance will not be reported to the participant. The HTML `span` element with `id = distance-estimate` returns the distance. */
            readonly viewing_distance_report: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "<p>Based on your responses, you are sitting about <span id='distance-estimate' style='font-weight: bold;'></span> from the screen.</p><p>Does that seem about right?</p>";
            };
            /** Text for the button on the viewing distance report page to re-do the viewing distance estimate. If the participant click this button, the blindspot task starts again. */
            readonly redo_measurement_button_label: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "No, that is not close. Try again.";
            };
            /** Text for the button on the viewing distance report page that can be clicked to accept the viewing distance estimate. */
            readonly blindspot_done_prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "Yes";
            };
        };
        readonly data: {
            /** The response time in milliseconds. */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
            /** The height in millimeters of the item to be measured. */
            readonly item_height_mm: {
                readonly type: ParameterType.FLOAT;
            };
            /** The width in millimeters of the item to be measured. */
            readonly item_width_mm: {
                readonly type: ParameterType.FLOAT;
            };
            /** Final height of the resizable div container, in degrees. */
            readonly item_height_deg: {
                readonly type: ParameterType.FLOAT;
            };
            /** Final width of the resizable div container, in degrees. */
            readonly item_width_deg: {
                readonly type: ParameterType.FLOAT;
            };
            /** Final width of the resizable div container, in pixels. */
            readonly item_width_px: {
                readonly type: ParameterType.FLOAT;
            };
            /** Pixels to degrees conversion factor. */
            readonly px2deg: {
                readonly type: ParameterType.INT;
            };
            /** Pixels to millimeters conversion factor. */
            readonly px2mm: {
                readonly type: ParameterType.FLOAT;
            };
            /** Scaling factor that will be applied to the div containing jsPsych content. */
            readonly scale_factor: {
                readonly type: ParameterType.FLOAT;
            };
            /** The interior width of the window in degrees. */
            readonly win_width_deg: {
                readonly type: ParameterType.FLOAT;
            };
            /** The interior height of the window in degrees. */
            readonly win_height_deg: {
                readonly type: ParameterType.FLOAT;
            };
            /** Estimated distance to the screen in millimeters. */
            readonly view_dist_mm: {
                readonly type: ParameterType.FLOAT;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    private ball_size;
    private ball;
    private container;
    private reps_remaining;
    private ball_animation_frame_id;
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
}

export { VirtualChinrestPlugin as default };
