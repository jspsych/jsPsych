import { JsPsych, JsPsychExtension, JsPsychExtensionInfo } from "jspsych";

class RecordVideoExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "record-video",
  };

  constructor(private jsPsych: JsPsych) {}

  private recordedChunks = [];
  private recorder = null;

  initialize = async () => {};

  on_start = (): void => {
    this.recorder = this.jsPsych.pluginAPI.getCameraRecorder();
    this.recordedChunks = [];

    if (!this.recorder) {
      console.log("Camera not initialized. Do you need to run the initialize-camera plugin?");
      return;
    }

    this.recorder.ondataavailable = this.handleOnDataAvailable;
  };

  on_load = () => {
    this.recorder.start();
  };

  on_finish = () => {
    this.recorder.stop();

    this.recorder.ondataavailable = null;

    return {
      record_video_data: new Blob(this.recordedChunks),
    };
  };

  private handleOnDataAvailable(event) {
    if (event.data.size > 0) {
      this.recordedChunks.push(event.data);
    }
  }
}

export default RecordVideoExtension;
