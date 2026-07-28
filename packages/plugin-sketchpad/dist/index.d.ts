import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "sketchpad";
    readonly version: string;
    readonly parameters: {
        /**
         * The shape of the canvas element. Accepts `'rectangle'` or `'circle'`
         */
        readonly canvas_shape: {
            readonly type: ParameterType.STRING;
            readonly default: "rectangle";
        };
        /**
         * Width of the canvas in pixels when `canvas_shape` is a `"rectangle"`.
         */
        readonly canvas_width: {
            readonly type: ParameterType.INT;
            readonly default: 500;
        };
        /**
         * Height of the canvas in pixels when `canvas_shape` is a `"rectangle"`.
         */
        readonly canvas_height: {
            readonly type: ParameterType.INT;
            readonly default: 500;
        };
        /**
         * Diameter of the canvas (when `canvas_shape` is `'circle'`) in pixels.
         */
        readonly canvas_diameter: {
            readonly type: ParameterType.INT;
            readonly default: 500;
        };
        /**
         * This width of the border around the canvas element
         */
        readonly canvas_border_width: {
            readonly type: ParameterType.INT;
            readonly default: 0;
        };
        /**
         * The color of the border around the canvas element.
         */
        readonly canvas_border_color: {
            readonly type: ParameterType.STRING;
            readonly default: "#000";
        };
        /**
         * Path to an image to render as the background of the canvas.
         */
        readonly background_image: {
            readonly type: ParameterType.IMAGE;
            readonly default: any;
        };
        /**
         * Color of the canvas background. Note that a `background_image` will render on top of the color.
         */
        readonly background_color: {
            readonly type: ParameterType.STRING;
            readonly default: "#ffffff";
        };
        /**
         * The width of the strokes on the canvas.
         */
        readonly stroke_width: {
            readonly type: ParameterType.INT;
            readonly default: 2;
        };
        /**
         * The color of the stroke on the canvas.
         */
        readonly stroke_color: {
            readonly type: ParameterType.STRING;
            readonly default: "#000000";
        };
        /**
         * Array of colors to render as a palette of choices for stroke color. Clicking on the corresponding color button will change the stroke color.
         */
        readonly stroke_color_palette: {
            readonly type: ParameterType.STRING;
            readonly array: true;
            readonly default: readonly [];
        };
        /**
         * HTML content to render above or below the canvas (use `prompt_location` parameter to change location).
         */
        readonly prompt: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: any;
        };
        /**
         * Location of the `prompt` content. Can be 'abovecanvas' or 'belowcanvas' or 'belowbutton'.
         */
        readonly prompt_location: {
            readonly type: ParameterType.STRING;
            readonly default: "abovecanvas";
        };
        /**
         * Whether to save the final image in the data as a base64 encoded data URL.
         */
        readonly save_final_image: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /**
         * Whether to save the individual stroke data that generated the final image.
         */
        readonly save_strokes: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /**
         * If this key is held down then it is like the mouse button being held down.
         * The "ink" will flow when the button is held and stop when it is lifted.
         * Pass in the string representation of the key, e.g., `'a'` for the A key
         * or `' '` for the spacebar.
         */
        readonly key_to_draw: {
            readonly type: ParameterType.KEY;
            readonly default: any;
        };
        /**
         * Whether to show the button that ends the trial.
         */
        readonly show_finished_button: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /**
         * The label for the button that ends the trial.
         */
        readonly finished_button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Finished";
        };
        /**
         * Whether to show the button that clears the entire drawing.
         */
        readonly show_clear_button: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /**
         * The label for the button that clears the entire drawing.
         */
        readonly clear_button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Clear";
        };
        /**
         * Whether to show the button that enables an undo action.
         */
        readonly show_undo_button: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /**
         * The label for the button that performs an undo action.
         */
        readonly undo_button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Undo";
        };
        /**
         * Whether to show the button that enables an redo action. `show_undo_button` must also
         * be `true` for the redo button to show.
         */
        readonly show_redo_button: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /**
         * The label for the button that performs an redo action.
         */
        readonly redo_button_label: {
            readonly type: ParameterType.STRING;
            readonly default: "Redo";
        };
        /**
         * This array contains the key(s) that the participant is allowed to press in order to end
         * the trial. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`,
         * `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)
         * and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/)
         * for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"NO_KEYS"`
         * means that no keys will be accepted as valid responses. Specifying `"ALL_KEYS"` will mean that all responses are allowed.
         */
        readonly choices: {
            readonly type: ParameterType.KEYS;
            readonly default: "NO_KEYS";
        };
        /**
         * Length of time before the trial ends. If `null` the trial will continue indefinitely
         * (until another way of ending the trial occurs).
         */
        readonly trial_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /**
         * Whether to show a timer that counts down until the end of the trial when `trial_duration` is not `null`.
         */
        readonly show_countdown_trial_duration: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /**
         * The HTML to use for rendering the countdown timer. The element with `id="sketchpad-timer"`
         * will have its content replaced by a countdown timer in the format `MM:SS`.
         */
        readonly countdown_timer_html: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "<span id=\"sketchpad-timer\"></span> remaining";
        };
    };
    readonly data: {
        /** The length of time from the start of the trial to the end of the trial. */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
        /** If the trial was ended by clicking the finished button, then `"button"`. If the trial was ended by pressing a key, then the key that was pressed. If the trial timed out, then `null`. */
        readonly response: {
            readonly type: ParameterType.STRING;
        };
        /** If `save_final_image` is true, then this will contain the base64 encoded data URL for the image, in png format. */
        readonly png: {
            readonly type: ParameterType.STRING;
        };
        /** If `save_strokes` is true, then this will contain an array of stroke objects. Objects have an `action` property that is either `"start"`, `"move"`, or `"end"`. If `action` is `"start"` or `"move"` it will have an `x` and `y` property that report the coordinates of the action relative to the upper-left corner of the canvas. If `action` is `"start"` then the object will also have a `t` and `color` property, specifying the time of the action relative to the onset of the trial (ms) and the color of the stroke. If `action` is `"end"` then it will only have a `t` property. */
        readonly strokes: {
            readonly type: ParameterType.COMPLEX;
            readonly array: true;
            readonly nested: {
                readonly action: {
                    readonly type: ParameterType.STRING;
                };
                readonly x: {
                    readonly type: ParameterType.INT;
                    readonly optional: true;
                };
                readonly y: {
                    readonly type: ParameterType.INT;
                    readonly optional: true;
                };
                readonly t: {
                    readonly type: ParameterType.INT;
                    readonly optional: true;
                };
                readonly color: {
                    readonly type: ParameterType.STRING;
                    readonly optional: true;
                };
            };
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin creates an interactive canvas that the participant can draw on using their mouse or touchscreen.
 * It can be used for sketching tasks, like asking the participant to draw a particular object.
 * It can also be used for some image segmentation or annotation tasks by setting the `background_image` parameter to render an image on the canvas.
 *
 * The plugin stores a [base 64 data URL representation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) of the final image.
 * This can be converted to an image file using [online tools](https://www.google.com/search?q=base64+image+decoder) or short programs in [R](https://stackoverflow.com/q/58604195/3726673), [python](https://stackoverflow.com/q/2323128/3726673), or another language of your choice.
 * It also records all of the individual strokes that the participant made during the trial.
 *
 * !!! warning
 *     This plugin generates **a lot** of data. Each trial can easily add 500kb+ of data to a final JSON output.
 *     You can reduce the amount of data generated by turning off storage of the individual stroke data (`save_strokes: false`) or storage of the final image (`save_final_image: false`) if your use case doesn't require that information.
 *     If you are going to be collecting a lot of data with this plugin you may want to save your data to your server after each trial and not wait until the end of the experiment to perform a single bulk upload.
 *     You can do this by putting data saving code inside the [`on_data_update` event handler](../overview/events.md#on_data_update).
 *
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/sketchpad/ sketchpad plugin documentation on jspsych.org}
 */
declare class SketchpadPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "sketchpad";
        readonly version: string;
        readonly parameters: {
            /**
             * The shape of the canvas element. Accepts `'rectangle'` or `'circle'`
             */
            readonly canvas_shape: {
                readonly type: ParameterType.STRING;
                readonly default: "rectangle";
            };
            /**
             * Width of the canvas in pixels when `canvas_shape` is a `"rectangle"`.
             */
            readonly canvas_width: {
                readonly type: ParameterType.INT;
                readonly default: 500;
            };
            /**
             * Height of the canvas in pixels when `canvas_shape` is a `"rectangle"`.
             */
            readonly canvas_height: {
                readonly type: ParameterType.INT;
                readonly default: 500;
            };
            /**
             * Diameter of the canvas (when `canvas_shape` is `'circle'`) in pixels.
             */
            readonly canvas_diameter: {
                readonly type: ParameterType.INT;
                readonly default: 500;
            };
            /**
             * This width of the border around the canvas element
             */
            readonly canvas_border_width: {
                readonly type: ParameterType.INT;
                readonly default: 0;
            };
            /**
             * The color of the border around the canvas element.
             */
            readonly canvas_border_color: {
                readonly type: ParameterType.STRING;
                readonly default: "#000";
            };
            /**
             * Path to an image to render as the background of the canvas.
             */
            readonly background_image: {
                readonly type: ParameterType.IMAGE;
                readonly default: any;
            };
            /**
             * Color of the canvas background. Note that a `background_image` will render on top of the color.
             */
            readonly background_color: {
                readonly type: ParameterType.STRING;
                readonly default: "#ffffff";
            };
            /**
             * The width of the strokes on the canvas.
             */
            readonly stroke_width: {
                readonly type: ParameterType.INT;
                readonly default: 2;
            };
            /**
             * The color of the stroke on the canvas.
             */
            readonly stroke_color: {
                readonly type: ParameterType.STRING;
                readonly default: "#000000";
            };
            /**
             * Array of colors to render as a palette of choices for stroke color. Clicking on the corresponding color button will change the stroke color.
             */
            readonly stroke_color_palette: {
                readonly type: ParameterType.STRING;
                readonly array: true;
                readonly default: readonly [];
            };
            /**
             * HTML content to render above or below the canvas (use `prompt_location` parameter to change location).
             */
            readonly prompt: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: any;
            };
            /**
             * Location of the `prompt` content. Can be 'abovecanvas' or 'belowcanvas' or 'belowbutton'.
             */
            readonly prompt_location: {
                readonly type: ParameterType.STRING;
                readonly default: "abovecanvas";
            };
            /**
             * Whether to save the final image in the data as a base64 encoded data URL.
             */
            readonly save_final_image: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /**
             * Whether to save the individual stroke data that generated the final image.
             */
            readonly save_strokes: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /**
             * If this key is held down then it is like the mouse button being held down.
             * The "ink" will flow when the button is held and stop when it is lifted.
             * Pass in the string representation of the key, e.g., `'a'` for the A key
             * or `' '` for the spacebar.
             */
            readonly key_to_draw: {
                readonly type: ParameterType.KEY;
                readonly default: any;
            };
            /**
             * Whether to show the button that ends the trial.
             */
            readonly show_finished_button: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /**
             * The label for the button that ends the trial.
             */
            readonly finished_button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Finished";
            };
            /**
             * Whether to show the button that clears the entire drawing.
             */
            readonly show_clear_button: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /**
             * The label for the button that clears the entire drawing.
             */
            readonly clear_button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Clear";
            };
            /**
             * Whether to show the button that enables an undo action.
             */
            readonly show_undo_button: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /**
             * The label for the button that performs an undo action.
             */
            readonly undo_button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Undo";
            };
            /**
             * Whether to show the button that enables an redo action. `show_undo_button` must also
             * be `true` for the redo button to show.
             */
            readonly show_redo_button: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /**
             * The label for the button that performs an redo action.
             */
            readonly redo_button_label: {
                readonly type: ParameterType.STRING;
                readonly default: "Redo";
            };
            /**
             * This array contains the key(s) that the participant is allowed to press in order to end
             * the trial. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`,
             * `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)
             * and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/)
             * for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"NO_KEYS"`
             * means that no keys will be accepted as valid responses. Specifying `"ALL_KEYS"` will mean that all responses are allowed.
             */
            readonly choices: {
                readonly type: ParameterType.KEYS;
                readonly default: "NO_KEYS";
            };
            /**
             * Length of time before the trial ends. If `null` the trial will continue indefinitely
             * (until another way of ending the trial occurs).
             */
            readonly trial_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /**
             * Whether to show a timer that counts down until the end of the trial when `trial_duration` is not `null`.
             */
            readonly show_countdown_trial_duration: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /**
             * The HTML to use for rendering the countdown timer. The element with `id="sketchpad-timer"`
             * will have its content replaced by a countdown timer in the format `MM:SS`.
             */
            readonly countdown_timer_html: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "<span id=\"sketchpad-timer\"></span> remaining";
            };
        };
        readonly data: {
            /** The length of time from the start of the trial to the end of the trial. */
            readonly rt: {
                readonly type: ParameterType.INT;
            };
            /** If the trial was ended by clicking the finished button, then `"button"`. If the trial was ended by pressing a key, then the key that was pressed. If the trial timed out, then `null`. */
            readonly response: {
                readonly type: ParameterType.STRING;
            };
            /** If `save_final_image` is true, then this will contain the base64 encoded data URL for the image, in png format. */
            readonly png: {
                readonly type: ParameterType.STRING;
            };
            /** If `save_strokes` is true, then this will contain an array of stroke objects. Objects have an `action` property that is either `"start"`, `"move"`, or `"end"`. If `action` is `"start"` or `"move"` it will have an `x` and `y` property that report the coordinates of the action relative to the upper-left corner of the canvas. If `action` is `"start"` then the object will also have a `t` and `color` property, specifying the time of the action relative to the onset of the trial (ms) and the color of the stroke. If `action` is `"end"` then it will only have a `t` property. */
            readonly strokes: {
                readonly type: ParameterType.COMPLEX;
                readonly array: true;
                readonly nested: {
                    readonly action: {
                        readonly type: ParameterType.STRING;
                    };
                    readonly x: {
                        readonly type: ParameterType.INT;
                        readonly optional: true;
                    };
                    readonly y: {
                        readonly type: ParameterType.INT;
                        readonly optional: true;
                    };
                    readonly t: {
                        readonly type: ParameterType.INT;
                        readonly optional: true;
                    };
                    readonly color: {
                        readonly type: ParameterType.STRING;
                        readonly optional: true;
                    };
                };
            };
        };
        readonly citations: "__CITATIONS__";
    };
    private display;
    private params;
    private sketchpad;
    private is_drawing;
    private ctx;
    private trial_finished_handler;
    private background_image;
    private strokes;
    private stroke;
    private undo_history;
    private current_stroke_color;
    private start_time;
    private mouse_position;
    private draw_key_held;
    private timer_interval;
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void): Promise<unknown>;
    private init_display;
    private setup_event_listeners;
    private add_css;
    private add_background_color;
    private add_background_image;
    private start_draw;
    private move_draw;
    private end_draw;
    private render_drawing;
    private undo;
    private redo;
    private clear;
    private set_undo_btn_state;
    private set_redo_btn_state;
    private set_clear_btn_state;
    private set_trial_duration_timer;
    private after_key_response;
    private end_trial;
}

export { SketchpadPlugin as default };
