import autoBind from "auto-bind";
import { JsPsych, JsPsychExtension, JsPsychExtensionInfo } from "jspsych";

class RecordVideoExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "record-video",
  };

  constructor(private jsPsych: JsPsych) {
    autoBind(this);
  }

  private recordedChunks = [];
  private recorder: MediaRecorder = null;
  private currentTrialData = null;
  private trialComplete = false;
  private onUpdateCallback: () => void = null;

  // todo: add option to stream data to server with timeslice?
  initialize = async () => {};

  on_start = (): void => {
    this.recorder = this.jsPsych.pluginAPI.getCameraRecorder();
    this.recordedChunks = [];
    this.trialComplete = false;
    this.currentTrialData = {};

    if (!this.recorder) {
      console.log("Camera not initialized. Do you need to run the initialize-camera plugin?");
      return;
    }

    this.recorder.addEventListener("dataavailable", this.handleOnDataAvailable);
  };

  on_load = () => {
    this.recorder.start();
  };

  on_finish = (): Promise<any> => {
    return new Promise((resolve) => {
      this.trialComplete = true;
      this.recorder.stop();

      if (!this.currentTrialData.record_video_data) {
        this.onUpdateCallback = () => {
          resolve(this.currentTrialData);
        };
      } else {
        resolve(this.currentTrialData);
      }
    });
  };

  private handleOnDataAvailable(event) {
    if (event.data.size > 0) {
      console.log("chunks added");
      this.recordedChunks.push(event.data);
      if (this.trialComplete) {
        this.updateData();
      }
    }
  }

  private updateData() {
    this.currentTrialData.record_video_data = new Blob(this.recordedChunks, {
      type: 'video/webm;codecs="vp9"',
    });
    if (this.onUpdateCallback) {
      this.onUpdateCallback();
    }
  }
}

export default RecordVideoExtension;
