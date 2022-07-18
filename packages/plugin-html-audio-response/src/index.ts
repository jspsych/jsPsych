import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "html-audio-response",
  parameters: {
    /** The HTML string to be displayed */
    stimulus: {
      type: ParameterType.HTML_STRING,
      default: undefined,
    },
    /** How long to show the stimulus. */
    stimulus_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** How long to show the trial. */
    recording_duration: {
      type: ParameterType.INT,
      default: 2000,
    },
    /** Whether or not to show a button to end the recording. If false, the recording_duration must be set. */
    show_done_button: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** Label for the done (stop recording) button. Only used if show_done_button is true. */
    done_button_label: {
      type: ParameterType.STRING,
      default: "Continue",
    },
    /** Label for the record again button (only used if allow_playback is true). */
    record_again_button_label: {
      type: ParameterType.STRING,
      default: "Record again",
    },
    /** Label for the button to accept the audio recording (only used if allow_playback is true). */
    accept_button_label: {
      type: ParameterType.STRING,
      default: "Continue",
    },
    /** Whether or not to allow the participant to playback the recording and either accept or re-record. */
    allow_playback: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** Whether or not to save the video URL to the trial data. */
    save_audio_url: {
      type: ParameterType.BOOL,
      default: false,
    },
  },
};

type Info = typeof info;

/**
 * html-audio-response
 * jsPsych plugin for displaying a stimulus and recording an audio response through a microphone
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-html-audio-response/ html-audio-response plugin documentation on jspsych.org}
 */
class HtmlAudioResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;
  private stimulus_start_time;
  private recorder_start_time;
  private recorder: MediaRecorder;
  private audio_url;
  private response;
  private load_resolver;
  private rt: number = null;
  private start_event_handler;
  private stop_event_handler;
  private data_available_handler;
  private recorded_data_chunks = [];

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.recorder = this.jsPsych.pluginAPI.getMicrophoneRecorder();

    this.setupRecordingEvents(display_element, trial);

    this.startRecording();
  }

  private showDisplay(display_element, trial) {
    const ro = new ResizeObserver((entries, observer) => {
      this.stimulus_start_time = performance.now();
      observer.unobserve(display_element);
      //observer.disconnect();
    });

    ro.observe(display_element);

    let html = `<div id="jspsych-html-audio-response-stimulus">${trial.stimulus}</div>`;

    if (trial.show_done_button) {
      html += `<p><button class="jspsych-btn" id="finish-trial">${trial.done_button_label}</button></p>`;
    }

    display_element.innerHTML = html;
  }

  private hideStimulus(display_element: HTMLElement) {
    const el: HTMLElement = display_element.querySelector("#jspsych-html-audio-response-stimulus");
    if (el) {
      el.style.visibility = "hidden";
    }
  }

  private addButtonEvent(display_element, trial) {
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

  private setupRecordingEvents(display_element, trial) {
    this.data_available_handler = (e) => {
      if (e.data.size > 0) {
        this.recorded_data_chunks.push(e.data);
      }
    };

    this.stop_event_handler = () => {
      const data = new Blob(this.recorded_data_chunks, { type: "audio/webm" });
      this.audio_url = URL.createObjectURL(data);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const base64 = (reader.result as string).split(",")[1];
        this.response = base64;
        this.load_resolver();
      });
      reader.readAsDataURL(data);
    };

    this.start_event_handler = (e) => {
      // resets the recorded data
      this.recorded_data_chunks.length = 0;

      this.recorder_start_time = e.timeStamp;
      this.showDisplay(display_element, trial);
      this.addButtonEvent(display_element, trial);

      // setup timer for hiding the stimulus
      if (trial.stimulus_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          this.hideStimulus(display_element);
        }, trial.stimulus_duration);
      }

      // setup timer for ending the trial
      if (trial.recording_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          // this check is necessary for cases where the
          // done_button is clicked before the timer expires
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

  private startRecording() {
    this.recorder.start();
  }

  private stopRecording() {
    this.recorder.stop();
    return new Promise((resolve) => {
      this.load_resolver = resolve;
    });
  }

  private showPlaybackControls(display_element, trial) {
    display_element.innerHTML = `
      <p><audio id="playback" src="${this.audio_url}" controls></audio></p>
      <button id="record-again" class="jspsych-btn">${trial.record_again_button_label}</button>
      <button id="continue" class="jspsych-btn">${trial.accept_button_label}</button>
    `;

    display_element.querySelector("#record-again").addEventListener("click", () => {
      // release object url to save memory
      URL.revokeObjectURL(this.audio_url);
      this.startRecording();
    });
    display_element.querySelector("#continue").addEventListener("click", () => {
      this.endTrial(display_element, trial);
    });

    // const audio = display_element.querySelector('#playback');
    // audio.src =
  }

  private endTrial(display_element, trial) {
    // clear recordering event handler

    this.recorder.removeEventListener("dataavailable", this.data_available_handler);
    this.recorder.removeEventListener("start", this.start_event_handler);
    this.recorder.removeEventListener("stop", this.stop_event_handler);

    // kill any remaining setTimeout handlers
    this.jsPsych.pluginAPI.clearAllTimeouts();

    // gather the data to store for the trial
    var trial_data: any = {
      rt: this.rt,
      stimulus: trial.stimulus,
      response: this.response,
      estimated_stimulus_onset: Math.round(this.stimulus_start_time - this.recorder_start_time),
    };

    if (trial.save_audio_url) {
      trial_data.audio_url = this.audio_url;
    } else {
      URL.revokeObjectURL(this.audio_url);
    }

    // clear the display
    display_element.innerHTML = "";

    // move on to the next trial
    this.jsPsych.finishTrial(trial_data);
  }
}

export default HtmlAudioResponsePlugin;
