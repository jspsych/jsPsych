'use strict';

var autoBind = require('auto-bind');
var jspsych = require('jspsych');

var version = "1.2.0";

class RecordVideoExtension {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
    this.recordedChunks = [];
    this.recorder = null;
    this.currentTrialData = null;
    this.trialComplete = false;
    this.onUpdateCallback = null;
    // todo: add option to stream data to server with timeslice?
    this.initialize = async () => {
    };
    this.on_start = () => {
      this.recorder = this.jsPsych.pluginAPI.getCameraRecorder();
      this.recordedChunks = [];
      this.trialComplete = false;
      this.currentTrialData = {};
      if (!this.recorder) {
        console.warn(
          "The record-video extension is trying to start but the camera is not initialized. Do you need to run the initialize-camera plugin?"
        );
        return;
      }
      this.recorder.addEventListener("dataavailable", this.handleOnDataAvailable);
    };
    this.on_load = () => {
      this.recorder.start();
    };
    this.on_finish = () => {
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
    autoBind(this);
  }
  static {
    this.info = {
      name: "record-video",
      version,
      data: {
        /** [Base 64 encoded](https://developer.mozilla.org/en-US/docs/Glossary/Base64) representation of the video data. */
        record_video_data: {
          type: jspsych.ParameterType.STRING
        }
      },
      // prettier-ignore
      citations: {
        "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
        "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
      }
    };
  }
  handleOnDataAvailable(event) {
    if (event.data.size > 0) {
      console.log("chunks added");
      this.recordedChunks.push(event.data);
      if (this.trialComplete) {
        this.updateData();
      }
    }
  }
  updateData() {
    const data = new Blob(this.recordedChunks, {
      type: this.recorder.mimeType
    });
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const base64 = reader.result.split(",")[1];
      this.currentTrialData.record_video_data = base64;
      if (this.onUpdateCallback) {
        this.onUpdateCallback();
      }
    });
    reader.readAsDataURL(data);
  }
}

module.exports = RecordVideoExtension;
//# sourceMappingURL=index.cjs.map
