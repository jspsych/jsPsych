import { JsPsychExtension, JsPsychExtensionInfo, JsPsych } from 'jspsych';

declare global {
    interface Window {
        webgazer: any;
    }
}
interface InitializeParameters {
    /**
     * Whether to round WebGazer's predicted x, y coordinates to the nearest integer. Recommended
     * to leave this as `true` because it saves significant space in the data object and the
     * predictions aren't precise to the level of partial pixels.
     * @default true
     */
    round_predictions: boolean;
    /**
     * Whether to initialize WebGazer automatically when the plugin loads. Leave this as `false`
     * if you plan to initialize WebGazer later in the experiment using a plugin.
     * @default false
     */
    auto_initialize: boolean;
    /**
     * The number of milliseconds between each sample. Note that this is only a request, and the
     * actual interval will vary depending on processing time.
     * @default 34
     */
    sampling_interval: number;
    /**
     * An instance of WebGazer. If left undefined then the global window.webgazer object will be used
     * if it exists.
     */
    webgazer: any;
}
interface OnStartParameters {
    targets: Array<string>;
}
/**
 * https://www.jspsych.org/latest/extensions/webgazer/
 */
declare class WebGazerExtension implements JsPsychExtension {
    private jsPsych;
    static info: JsPsychExtensionInfo;
    constructor(jsPsych: JsPsych);
    private currentTrialData;
    private currentTrialTargets;
    private currentTrialSelectors;
    private domObserver;
    private webgazer;
    private initialized;
    private currentTrialStart;
    private activeTrial;
    private sampling_interval;
    private round_predictions;
    private gazeInterval;
    private gazeUpdateCallbacks;
    private currentGaze;
    initialize: ({ round_predictions, auto_initialize, sampling_interval, webgazer, }: InitializeParameters) => Promise<void>;
    on_start: (params: OnStartParameters) => void;
    on_load: () => void;
    on_finish: () => {
        webgazer_data: any[];
        webgazer_targets: {};
    };
    start: () => Promise<void>;
    startSampleInterval: (interval?: number) => void;
    stopSampleInterval: () => void;
    isInitialized: () => boolean;
    faceDetected: () => any;
    showPredictions: () => void;
    hidePredictions: () => void;
    showVideo: () => void;
    hideVideo: () => void;
    resume: () => void;
    pause: () => void;
    resetCalibration: () => void;
    stopMouseCalibration: () => void;
    startMouseCalibration: () => void;
    calibratePoint: (x: number, y: number) => void;
    setRegressionType: (regression_type: any) => void;
    getCurrentPrediction: () => any;
    onGazeUpdate: (callback: any) => () => void;
    private handleGazeDataUpdate;
    private mutationObserverCallback;
}

export { WebGazerExtension as default };
