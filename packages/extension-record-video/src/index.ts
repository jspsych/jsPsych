import { JsPsych, JsPsychExtension, JsPsychExtensionInfo } from "jspsych";

class RecordVideoExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "record-video",
  };

  constructor(private jsPsych: JsPsych) {}

  private recordedChunks = [];
  private recorder = null;
  private currentTrialData = null;
  private trialComplete = false;

  // todo: add option to stream data to server with timeslice?
  initialize = async () => {};

  on_start = (): void => {
    this.recorder = this.jsPsych.pluginAPI.getCameraRecorder();
    this.recordedChunks = [];
    this.trialComplete = false;
    this.currentTrialData = null;

    if (!this.recorder) {
      console.log("Camera not initialized. Do you need to run the initialize-camera plugin?");
      return;
    }

    this.recorder.ondataavailable = (event) => {
      this.handleOnDataAvailable(event);
    };
  };

  on_load = () => {
    this.recorder.start(10);
  };

  on_finish = () => {
    this.trialComplete = true;
    this.recorder.stop();

    //this.recorder.ondataavailable = null;

    const data = { record_video_data: null };

    this.currentTrialData = data;

    return data;
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
  }
}

export default RecordVideoExtension;
