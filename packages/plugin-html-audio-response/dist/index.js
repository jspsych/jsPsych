import { ParameterType } from 'jspsych';

var version = "2.1.1";

const info = {
  name: "html-audio-response",
  version,
  parameters: {
    /** The HTML content to be displayed. */
    stimulus: {
      type: ParameterType.HTML_STRING,
      default: void 0
    },
    /** How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends. */
    stimulus_duration: {
      type: ParameterType.INT,
      default: null
    },
    /** The maximum length of the recording, in milliseconds. The default value is intentionally set low because of the potential to accidentally record very large data files if left too high. You can set this to `null` to allow the participant to control the length of the recording via the done button, but be careful with this option as it can lead to crashing the browser if the participant waits too long to stop the recording.  */
    recording_duration: {
      type: ParameterType.INT,
      default: 2e3
    },
    /** Whether to show a button on the screen that the participant can click to finish the recording. */
    show_done_button: {
      type: ParameterType.BOOL,
      default: true
    },
    /** The label for the done button. */
    done_button_label: {
      type: ParameterType.STRING,
      default: "Continue"
    },
    /** The label for the record again button enabled when `allow_playback: true`.
     */
    record_again_button_label: {
      type: ParameterType.STRING,
      default: "Record again"
    },
    /** The label for the accept button enabled when `allow_playback: true`. */
    accept_button_label: {
      type: ParameterType.STRING,
      default: "Continue"
    },
    /** Whether to allow the participant to listen to their recording and decide whether to rerecord or not. If `true`, then the participant will be shown an interface to play their recorded audio and click one of two buttons to either accept the recording or rerecord. If rerecord is selected, then stimulus will be shown again, as if the trial is starting again from the beginning. */
    allow_playback: {
      type: ParameterType.BOOL,
      default: false
    },
    /** If `true`, then an [Object URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) will be generated and stored for the recorded audio. Only set this to `true` if you plan to reuse the recorded audio later in the experiment, as it is a potentially memory-intensive feature. */
    save_audio_url: {
      type: ParameterType.BOOL,
      default: false
    }
  },
  data: {
    /** The time, since the onset of the stimulus, for the participant to click the done button. If the button is not clicked (or not enabled), then `rt` will be `null`. */
    rt: {
      type: ParameterType.INT
    },
    /** The base64-encoded audio data. */
    response: {
      type: ParameterType.STRING
    },
    /** The HTML content that was displayed on the screen. */
    stimulus: {
      type: ParameterType.HTML_STRING
    },
    /** This is an estimate of when the stimulus appeared relative to the start of the audio recording. The plugin is configured so that the recording should start prior to the display of the stimulus. We have not yet been able to verify the accuracy of this estimate with external measurement devices. */
    estimated_stimulus_onset: {
      type: ParameterType.INT
    },
    /** A URL to a copy of the audio data. */
    audio_url: {
      type: ParameterType.STRING
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class HtmlAudioResponsePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
    this.rt = null;
    this.recorded_data_chunks = [];
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    this.recorder = this.jsPsych.pluginAPI.getMicrophoneRecorder();
    this.setupRecordingEvents(display_element, trial);
    this.startRecording();
  }
  showDisplay(display_element, trial) {
    const ro = new ResizeObserver((entries, observer) => {
      this.stimulus_start_time = performance.now();
      observer.unobserve(display_element);
    });
    ro.observe(display_element);
    let html = `<div id="jspsych-html-audio-response-stimulus">${trial.stimulus}</div>`;
    if (trial.show_done_button) {
      html += `<p><button class="jspsych-btn" id="finish-trial">${trial.done_button_label}</button></p>`;
    }
    display_element.innerHTML = html;
  }
  hideStimulus(display_element) {
    const el = display_element.querySelector("#jspsych-html-audio-response-stimulus");
    if (el) {
      el.style.visibility = "hidden";
    }
  }
  addButtonEvent(display_element, trial) {
    const btn = display_element.querySelector("#finish-trial");
    if (btn) {
      btn.addEventListener("click", () => {
        const end_time = performance.now();
        this.rt = Math.round(end_time - this.stimulus_start_time);
        this.stopRecording().then(() => {
          if (trial.allow_playback) {
            this.showPlaybackControls(display_element, trial);
          } else {
            this.endTrial(display_element, trial);
          }
        });
      });
    }
  }
  setupRecordingEvents(display_element, trial) {
    this.data_available_handler = (e) => {
      if (e.data.size > 0) {
        this.recorded_data_chunks.push(e.data);
      }
    };
    this.stop_event_handler = () => {
      const data = new Blob(this.recorded_data_chunks, { type: this.recorded_data_chunks[0].type });
      this.audio_url = URL.createObjectURL(data);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const base64 = reader.result.split(",")[1];
        this.response = base64;
        this.load_resolver();
      });
      reader.readAsDataURL(data);
    };
    this.start_event_handler = (e) => {
      this.recorded_data_chunks.length = 0;
      this.recorder_start_time = e.timeStamp;
      this.showDisplay(display_element, trial);
      this.addButtonEvent(display_element, trial);
      if (trial.stimulus_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          this.hideStimulus(display_element);
        }, trial.stimulus_duration);
      }
      if (trial.recording_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          if (this.recorder.state !== "inactive") {
            this.stopRecording().then(() => {
              if (trial.allow_playback) {
                this.showPlaybackControls(display_element, trial);
              } else {
                this.endTrial(display_element, trial);
              }
            });
          }
        }, trial.recording_duration);
      }
    };
    this.recorder.addEventListener("dataavailable", this.data_available_handler);
    this.recorder.addEventListener("stop", this.stop_event_handler);
    this.recorder.addEventListener("start", this.start_event_handler);
  }
  startRecording() {
    this.recorder.start();
  }
  stopRecording() {
    this.recorder.stop();
    return new Promise((resolve) => {
      this.load_resolver = resolve;
    });
  }
  showPlaybackControls(display_element, trial) {
    display_element.innerHTML = `
      <p><audio id="playback" src="${this.audio_url}" controls></audio></p>
      <button id="record-again" class="jspsych-btn">${trial.record_again_button_label}</button>
      <button id="continue" class="jspsych-btn">${trial.accept_button_label}</button>
    `;
    display_element.querySelector("#record-again").addEventListener("click", () => {
      URL.revokeObjectURL(this.audio_url);
      this.startRecording();
    });
    display_element.querySelector("#continue").addEventListener("click", () => {
      this.endTrial(display_element, trial);
    });
  }
  endTrial(display_element, trial) {
    this.recorder.removeEventListener("dataavailable", this.data_available_handler);
    this.recorder.removeEventListener("start", this.start_event_handler);
    this.recorder.removeEventListener("stop", this.stop_event_handler);
    var trial_data = {
      rt: this.rt,
      stimulus: trial.stimulus,
      response: this.response,
      estimated_stimulus_onset: Math.round(this.stimulus_start_time - this.recorder_start_time)
    };
    if (trial.save_audio_url) {
      trial_data.audio_url = this.audio_url;
    } else {
      URL.revokeObjectURL(this.audio_url);
    }
    this.jsPsych.finishTrial(trial_data);
  }
}

export { HtmlAudioResponsePlugin as default };
//# sourceMappingURL=index.js.map
