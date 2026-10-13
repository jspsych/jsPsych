import { JsPsychExtension, JsPsychExtensionInfo, JsPsych } from 'jspsych';

interface InitializeParameters {
    /**
     * The minimum time between samples for `mousemove` events in milliseconds.
     * If `mousemove` events occur more rapidly than this limit, they will not be recorded.
     * Use this if you want to keep the data files smaller and don't need high resolution
     * tracking data. The default value of 0 means that all events will be recorded.
     * @default 0
     */
    minimum_sample_time: number;
}
interface OnStartParameters {
    /**
     * An array of string selectors. The selectors should identify one unique element on the page.
     * The DOMRect of the element will be stored in the data.
     */
    targets?: Array<string>;
    /**
     * An array of mouse events to track. Can include `"mousemove"`, `"mousedown"`, and `"mouseup"`.
     * @default ['mousemove']
     */
    events?: Array<string>;
}
/**
 * https://www.jspsych.org/latest/extensions/mouse-tracking/
 */
declare class MouseTrackingExtension implements JsPsychExtension {
    private jsPsych;
    static info: JsPsychExtensionInfo;
    constructor(jsPsych: JsPsych);
    private domObserver;
    private currentTrialData;
    private currentTrialTargets;
    private currentTrialSelectors;
    private currentTrialStartTime;
    private minimumSampleTime;
    private lastSampleTime;
    private eventsToTrack;
    initialize: ({ minimum_sample_time }: InitializeParameters) => Promise<void>;
    on_start: (params: OnStartParameters) => void;
    on_load: () => void;
    on_finish: () => {
        mouse_tracking_data: object[];
        mouse_tracking_targets: {
            [k: string]: DOMRect;
        };
    };
    private mouseMoveEventHandler;
    private mouseUpEventHandler;
    private mouseDownEventHandler;
    private mutationObserverCallback;
}

export { MouseTrackingExtension as default };
