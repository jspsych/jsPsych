import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "free-sort";
    readonly version: string;
    readonly parameters: {
        /** Each element of this array is an image path. */
        readonly stimuli: {
            readonly type: ParameterType.IMAGE;
            readonly default: any;
            readonly array: true;
        };
        /** The height of the images in pixels. */
        readonly stim_height: {
            readonly type: ParameterType.INT;
            readonly default: 100;
        };
        /** The width of the images in pixels. */
        readonly stim_width: {
            readonly type: ParameterType.INT;
            readonly default: 100;
        };
        /** How much larger to make the stimulus while moving (1 = no scaling). */
        readonly scale_factor: {
            readonly type: ParameterType.FLOAT;
            readonly default: 1.5;
        };
        /** The height of the container that participants can move the stimuli in. Stimuli will be constrained to this area. */
        readonly sort_area_height: {
            readonly type: ParameterType.INT;
            readonly default: 700;
        };
        /** The width of the container that participants can move the stimuli in. Stimuli will be constrained to this area. */
        readonly sort_area_width: {
            readonly type: ParameterType.INT;
            readonly default: 700;
        };
        /** The shape of the sorting area, can be "ellipse" or "square". */
        readonly sort_area_shape: {
            readonly type: ParameterType.SELECT;
            readonly options: readonly ["square", "ellipse"];
            readonly default: "ellipse";
        };
        /** This string can contain HTML markup. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).  */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "";
        };
        /** Indicates whether to show the prompt `"above"` or `"below"` the sorting area. */
        readonly prompt_location: {
            readonly type: ParameterType.SELECT;
            readonly options: readonly ["above", "below"];
            readonly default: "above";
        };
        /** The text that appears on the button to continue to the next trial. */
        readonly button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Continue";
        };
        /**
         * If true, the sort area border color will change while items are being moved in and out of the sort area,
         * and the background color will change once all items have been moved into the sort area.
         * If false, the border will remain black and the background will remain white throughout the trial.
         */
        readonly change_border_background_color: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /**
         * If change_border_background_color is true, the sort area border will change to this color
         * when an item is being moved into the sort area, and the background will change to this color
         * when all of the items have been moved into the sort area.
         */
        readonly border_color_in: {
            readonly type: ParameterType.STRING;
            readonly default: "#a1d99b";
        };
        /**
         * If change_border_background_color is true, this will be the color of the sort area border
         * when there are one or more items that still need to be moved into the sort area.
         */
        readonly border_color_out: {
            readonly type: ParameterType.STRING;
            readonly default: "#fc9272";
        };
        /** The width in pixels of the border around the sort area. If null, the border width defaults to 3% of the sort area height. */
        readonly border_width: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /**
         * Text to display when there are one or more items that still need to be placed in the sort area.
         * If "%n%" is included in the string, it will be replaced with the number of items that still need to be moved inside.
         * If "%s%" is included in the string, a "s" will be included when the number of items remaining is greater than one.
         * */
        readonly counter_text_unfinished: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "You still need to place %n% item%s% inside the sort area.";
        };
        /** Text that will take the place of the counter_text_unfinished text when all items have been moved inside the sort area. */
        readonly counter_text_finished: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "All items placed. Feel free to reposition items if necessary.";
        };
        /**
         * If false, the images will be positioned to the left and right of the sort area when the trial loads.
         * If true, the images will be positioned at random locations inside the sort area when the trial loads.
         */
        readonly stim_starts_inside: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /**
         * When the images appear outside the sort area, this determines the x-axis spread of the image columns.
         * Default value is 1. Values less than 1 will compress the image columns along the x-axis, and values greater than 1 will spread them farther apart.
         */
        readonly column_spread_factor: {
            readonly type: ParameterType.FLOAT;
            readonly default: 1;
        };
    };
    readonly data: {
        /**  An array containing objects representing the initial locations of all the stimuli in the sorting area. Each element in the array represents a stimulus, and has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions.  */
        readonly init_locations: {
            readonly type: ParameterType.STRING;
            readonly array: true;
        };
        /** An array containing objects representing all of the moves the participant made when sorting. Each object represents a move. Each element in the array has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location after the move. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
        readonly moves: {
            readonly type: ParameterType.COMPLEX;
            readonly array: true;
            readonly nested: {
                readonly src: {
                    readonly type: ParameterType.STRING;
                };
                readonly x: {
                    readonly type: ParameterType.INT;
                };
                readonly y: {
                    readonly type: ParameterType.INT;
                };
            };
        };
        /** An array containing objects representing the final locations of all the stimuli in the sorting area. Each element in the array represents a stimulus, and has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
        readonly final_locations: {
            readonly type: ParameterType.COMPLEX;
            readonly array: true;
            readonly nested: {
                readonly src: {
                    readonly type: ParameterType.STRING;
                };
                readonly x: {
                    readonly type: ParameterType.INT;
                };
                readonly y: {
                    readonly type: ParameterType.INT;
                };
            };
        };
        /** The response time in milliseconds for the participant to finish all sorting. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * The free-sort plugin displays one or more images on the screen that the participant can interact with by clicking and dragging with a mouse, or touching and dragging with a touchscreen device. When the trial starts, the images can be positioned outside or inside the sort area. All images must be moved into the sorting area before the participant can click a button to end the trial. All of the moves that the participant performs are recorded, as well as the final positions of all images. This plugin could be useful when asking participants to position images based on similarity to one another, or to recall image spatial locations.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/free-sort/ free-sort plugin documentation on jspsych.org}
 */
declare class FreeSortPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "free-sort";
        readonly version: string;
        readonly parameters: {
            /** Each element of this array is an image path. */
            readonly stimuli: {
                readonly type: ParameterType.IMAGE;
                readonly default: any;
                readonly array: true;
            };
            /** The height of the images in pixels. */
            readonly stim_height: {
                readonly type: ParameterType.INT;
                readonly default: 100;
            };
            /** The width of the images in pixels. */
            readonly stim_width: {
                readonly type: ParameterType.INT;
                readonly default: 100;
            };
            /** How much larger to make the stimulus while moving (1 = no scaling). */
            readonly scale_factor: {
                readonly type: ParameterType.FLOAT;
                readonly default: 1.5;
            };
            /** The height of the container that participants can move the stimuli in. Stimuli will be constrained to this area. */
            readonly sort_area_height: {
                readonly type: ParameterType.INT;
                readonly default: 700;
            };
            /** The width of the container that participants can move the stimuli in. Stimuli will be constrained to this area. */
            readonly sort_area_width: {
                readonly type: ParameterType.INT;
                readonly default: 700;
            };
            /** The shape of the sorting area, can be "ellipse" or "square". */
            readonly sort_area_shape: {
                readonly type: ParameterType.SELECT;
                readonly options: readonly ["square", "ellipse"];
                readonly default: "ellipse";
            };
            /** This string can contain HTML markup. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).  */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "";
            };
            /** Indicates whether to show the prompt `"above"` or `"below"` the sorting area. */
            readonly prompt_location: {
                readonly type: ParameterType.SELECT;
                readonly options: readonly ["above", "below"];
                readonly default: "above";
            };
            /** The text that appears on the button to continue to the next trial. */
            readonly button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Continue";
            };
            /**
             * If true, the sort area border color will change while items are being moved in and out of the sort area,
             * and the background color will change once all items have been moved into the sort area.
             * If false, the border will remain black and the background will remain white throughout the trial.
             */
            readonly change_border_background_color: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /**
             * If change_border_background_color is true, the sort area border will change to this color
             * when an item is being moved into the sort area, and the background will change to this color
             * when all of the items have been moved into the sort area.
             */
            readonly border_color_in: {
                readonly type: ParameterType.STRING;
                readonly default: "#a1d99b";
            };
            /**
             * If change_border_background_color is true, this will be the color of the sort area border
             * when there are one or more items that still need to be moved into the sort area.
             */
            readonly border_color_out: {
                readonly type: ParameterType.STRING;
                readonly default: "#fc9272";
            };
            /** The width in pixels of the border around the sort area. If null, the border width defaults to 3% of the sort area height. */
            readonly border_width: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /**
             * Text to display when there are one or more items that still need to be placed in the sort area.
             * If "%n%" is included in the string, it will be replaced with the number of items that still need to be moved inside.
             * If "%s%" is included in the string, a "s" will be included when the number of items remaining is greater than one.
             * */
            readonly counter_text_unfinished: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "You still need to place %n% item%s% inside the sort area.";
            };
            /** Text that will take the place of the counter_text_unfinished text when all items have been moved inside the sort area. */
            readonly counter_text_finished: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "All items placed. Feel free to reposition items if necessary.";
            };
            /**
             * If false, the images will be positioned to the left and right of the sort area when the trial loads.
             * If true, the images will be positioned at random locations inside the sort area when the trial loads.
             */
            readonly stim_starts_inside: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /**
             * When the images appear outside the sort area, this determines the x-axis spread of the image columns.
             * Default value is 1. Values less than 1 will compress the image columns along the x-axis, and values greater than 1 will spread them farther apart.
             */
            readonly column_spread_factor: {
                readonly type: ParameterType.FLOAT;
                readonly default: 1;
            };
        };
        readonly data: {
            /**  An array containing objects representing the initial locations of all the stimuli in the sorting area. Each element in the array represents a stimulus, and has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions.  */
            readonly init_locations: {
                readonly type: ParameterType.STRING;
                readonly array: true;
            };
            /** An array containing objects representing all of the moves the participant made when sorting. Each object represents a move. Each element in the array has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location after the move. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
            readonly moves: {
                readonly type: ParameterType.COMPLEX;
                readonly array: true;
                readonly nested: {
                    readonly src: {
                        readonly type: ParameterType.STRING;
                    };
                    readonly x: {
                        readonly type: ParameterType.INT;
                    };
                    readonly y: {
                        readonly type: ParameterType.INT;
                    };
                };
            };
            /** An array containing objects representing the final locations of all the stimuli in the sorting area. Each element in the array represents a stimulus, and has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
            readonly final_locations: {
                readonly type: ParameterType.COMPLEX;
                readonly array: true;
                readonly nested: {
                    readonly src: {
                        readonly type: ParameterType.STRING;
                    };
                    readonly x: {
                        readonly type: ParameterType.INT;
                    };
                    readonly y: {
                        readonly type: ParameterType.INT;
                    };
                };
            };
            /** The response time in milliseconds for the participant to finish all sorting. */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
}

export { FreeSortPlugin as default };
