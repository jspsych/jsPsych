import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "iat-image";
    readonly version: string;
    readonly parameters: {
        /** The stimulus to display. The path to an image. */
        readonly stimulus: {
            readonly type: ParameterType.IMAGE;
            readonly default: any;
        };
        /** Key press that is associated with the `left_category_label`. */
        readonly left_category_key: {
            readonly type: ParameterType.KEY;
            readonly default: "e";
        };
        /** Key press that is associated with the `right_category_label`. */
        readonly right_category_key: {
            readonly type: ParameterType.KEY;
            readonly default: "i";
        };
        /** An array that contains the words/labels associated with a certain stimulus. The labels are aligned to the left
         * side of the page. */
        readonly left_category_label: {
            readonly type: ParameterType.STRING;
            readonly array: true;
            readonly default: readonly ["left"];
        };
        /** An array that contains the words/labels associated with a certain stimulus. The labels are aligned to the right
         * side of the page. */
        readonly right_category_label: {
            readonly type: ParameterType.STRING;
            readonly array: true;
            readonly default: readonly ["right"];
        };
        /** This array contains the characters the participant is allowed to press to move on to the next trial if their key
         * press was incorrect and feedback was displayed. Can also have 'other key' as an option which will only allow the
         * user to select the right key to move forward.  */
        readonly key_to_move_forward: {
            readonly type: ParameterType.KEYS;
            readonly default: "ALL_KEYS";
        };
        /** If `true`, then `html_when_wrong` and `wrong_image_name` is required. If `false`, `trial_duration` is needed
         *  and trial will continue automatically. */
        readonly display_feedback: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** The content to display when a user presses the wrong key. */
        readonly html_when_wrong: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "<span style=\"color: red; font-size: 80px\">X</span>";
        };
        /** Instructions about making a wrong key press and whether another key press is needed to continue. */
        readonly bottom_instructions: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "<p>If you press the wrong key, a red X will appear. Press any key to continue.</p>";
        };
        /** If this is `true` and the user presses the wrong key then they have to press the other key to continue. An example
         * would be two keys 'e' and 'i'. If the key associated with the stimulus is 'e' and key 'i' was pressed, then
         * pressing 'e' is needed to continue the trial. When this is `true`, then parameter `key_to_move_forward`
         * is not used. If this is `true` and the user presses the wrong key then they have to press the other key to
         * continue. An example would be two keys 'e' and 'i'. If the key associated with the stimulus is 'e' and key
         * 'i' was pressed, then pressing 'e' is needed to continue the trial. When this is `true`, then parameter
         * `key_to_move_forward` is not used. */
        readonly force_correct_key_press: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
        /** Either 'left' or 'right'. This indicates whether the stimulus is associated with the key press and
         * category on the left or right side of the page (`left_category_key` or `right_category_key`). */
        readonly stim_key_association: {
            readonly type: ParameterType.SELECT;
            readonly options: readonly ["left", "right"];
            readonly default: any;
        };
        /** If true, then the trial will end whenever the participant makes a response (assuming they make their
         * response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will
         * continue until the value for `trial_duration` is reached. You can use this parameter to force the participant
         * to view a stimulus for a fixed amount of time, even if they respond before the time is complete. */
        readonly response_ends_trial: {
            readonly type: ParameterType.BOOL;
            readonly default: true;
        };
        /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the
         * participant fails to make a response before this timer is reached, the participant's response will be
         * recorded as `null` for the trial and the trial will end. If the value of this parameter is `null`, then
         * the trial will wait for a response indefinitely. */
        readonly trial_duration: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
    };
    readonly data: {
        /** The path to the image file that the participant saw on this trial. */
        readonly stimulus: {
            readonly type: ParameterType.STRING;
        };
        /** Indicates which key the participant pressed. */
        readonly response: {
            readonly type: ParameterType.STRING;
        };
        /** Boolean indicating whether the user's key press was correct or incorrect for the given stimulus. */
        readonly correct: {
            readonly type: ParameterType.BOOL;
        };
        /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response.  */
        readonly rt: {
            readonly type: ParameterType.INT;
        };
    };
    readonly citations: "__CITATIONS__";
};
type Info = typeof info;
/**
 * This plugin runs a single trial of the [implicit association test (IAT)](https://implicit.harvard.edu/implicit/iatdetails.html), using an image as the stimulus.
 *
 * @author Kristin Diep
 * @see {@link https://www.jspsych.org/latest/plugins/iat-image/ iat-image plugin documentation on jspsych.org}
 */
declare class IatImagePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "iat-image";
        readonly version: string;
        readonly parameters: {
            /** The stimulus to display. The path to an image. */
            readonly stimulus: {
                readonly type: ParameterType.IMAGE;
                readonly default: any;
            };
            /** Key press that is associated with the `left_category_label`. */
            readonly left_category_key: {
                readonly type: ParameterType.KEY;
                readonly default: "e";
            };
            /** Key press that is associated with the `right_category_label`. */
            readonly right_category_key: {
                readonly type: ParameterType.KEY;
                readonly default: "i";
            };
            /** An array that contains the words/labels associated with a certain stimulus. The labels are aligned to the left
             * side of the page. */
            readonly left_category_label: {
                readonly type: ParameterType.STRING;
                readonly array: true;
                readonly default: readonly ["left"];
            };
            /** An array that contains the words/labels associated with a certain stimulus. The labels are aligned to the right
             * side of the page. */
            readonly right_category_label: {
                readonly type: ParameterType.STRING;
                readonly array: true;
                readonly default: readonly ["right"];
            };
            /** This array contains the characters the participant is allowed to press to move on to the next trial if their key
             * press was incorrect and feedback was displayed. Can also have 'other key' as an option which will only allow the
             * user to select the right key to move forward.  */
            readonly key_to_move_forward: {
                readonly type: ParameterType.KEYS;
                readonly default: "ALL_KEYS";
            };
            /** If `true`, then `html_when_wrong` and `wrong_image_name` is required. If `false`, `trial_duration` is needed
             *  and trial will continue automatically. */
            readonly display_feedback: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** The content to display when a user presses the wrong key. */
            readonly html_when_wrong: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "<span style=\"color: red; font-size: 80px\">X</span>";
            };
            /** Instructions about making a wrong key press and whether another key press is needed to continue. */
            readonly bottom_instructions: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "<p>If you press the wrong key, a red X will appear. Press any key to continue.</p>";
            };
            /** If this is `true` and the user presses the wrong key then they have to press the other key to continue. An example
             * would be two keys 'e' and 'i'. If the key associated with the stimulus is 'e' and key 'i' was pressed, then
             * pressing 'e' is needed to continue the trial. When this is `true`, then parameter `key_to_move_forward`
             * is not used. If this is `true` and the user presses the wrong key then they have to press the other key to
             * continue. An example would be two keys 'e' and 'i'. If the key associated with the stimulus is 'e' and key
             * 'i' was pressed, then pressing 'e' is needed to continue the trial. When this is `true`, then parameter
             * `key_to_move_forward` is not used. */
            readonly force_correct_key_press: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
            /** Either 'left' or 'right'. This indicates whether the stimulus is associated with the key press and
             * category on the left or right side of the page (`left_category_key` or `right_category_key`). */
            readonly stim_key_association: {
                readonly type: ParameterType.SELECT;
                readonly options: readonly ["left", "right"];
                readonly default: any;
            };
            /** If true, then the trial will end whenever the participant makes a response (assuming they make their
             * response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will
             * continue until the value for `trial_duration` is reached. You can use this parameter to force the participant
             * to view a stimulus for a fixed amount of time, even if they respond before the time is complete. */
            readonly response_ends_trial: {
                readonly type: ParameterType.BOOL;
                readonly default: true;
            };
            /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the
             * participant fails to make a response before this timer is reached, the participant's response will be
             * recorded as `null` for the trial and the trial will end. If the value of this parameter is `null`, then
             * the trial will wait for a response indefinitely. */
            readonly trial_duration: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
        };
        readonly data: {
            /** The path to the image file that the participant saw on this trial. */
            readonly stimulus: {
                readonly type: ParameterType.STRING;
            };
            /** Indicates which key the participant pressed. */
            readonly response: {
                readonly type: ParameterType.STRING;
            };
            /** Boolean indicating whether the user's key press was correct or incorrect for the given stimulus. */
            readonly correct: {
                readonly type: ParameterType.BOOL;
            };
            /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response.  */
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

export { IatImagePlugin as default };
