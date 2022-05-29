import { JsPsych, JsPsychExtension, JsPsychExtensionInfo } from "jspsych";

class RecordVideoExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "record-video",
  };

  constructor(private jsPsych: JsPsych) {}

  private recordedChunks = [];
  private recorder = null;

  // todo: add option to stream data to server with timeslice?
  initialize = async () => {};

  on_start = (): void => {
    this.recorder = this.jsPsych.pluginAPI.getCameraRecorder();
    this.recordedChunks = [];

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
    this.recorder.stop();

    //this.recorder.ondataavailable = null;

    return {
      record_video_data: new Blob(this.recordedChunks, { type: 'video/webm;codecs="vp9"' }),
    };
  };

  private handleOnDataAvailable(event) {
    if (event.data.size > 0) {
      console.log("chunks added");
      this.recordedChunks.push(event.data);
    }
  }
}

export default RecordVideoExtension;
