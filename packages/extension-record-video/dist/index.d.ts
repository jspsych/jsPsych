import { JsPsychExtension, JsPsychExtensionInfo, JsPsych } from 'jspsych';

/**
 * https://www.jspsych.org/latest/extensions/record-video/
 */
declare class RecordVideoExtension implements JsPsychExtension {
    private jsPsych;
    static info: JsPsychExtensionInfo;
    constructor(jsPsych: JsPsych);
    private recordedChunks;
    private recorder;
    private currentTrialData;
    private trialComplete;
    private onUpdateCallback;
    initialize: () => Promise<void>;
    on_start: () => void;
    on_load: () => void;
    on_finish: () => Promise<any>;
    private handleOnDataAvailable;
    private updateData;
}

export { RecordVideoExtension as default };
