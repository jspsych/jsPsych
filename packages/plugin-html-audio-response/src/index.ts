import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "html-audio-response",
  version: version,
  parameters: {
    /** The HTML content to be displayed. */
    stimulus: {
      type: ParameterType.HTML_STRING,
      default: undefined,
    },
    /** How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends. */
    stimulus_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** The maximum length of the recording, in milliseconds. The default value is intentionally set low because of the potential to accidentally record very large data files if left too high. You can set this to `null` to allow the participant to control the length of the recording via the done button, but be careful with this option as it can lead to crashing the browser if the participant waits too long to stop the recording.  */
    recording_duration: {
      type: ParameterType.INT,
      default: 2000,
    },
    /** Whether to show a button on the screen that the participant can click to finish the recording. */
    show_done_button: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** The label for the done button. */
    done_button_label: {
      type: ParameterType.STRING,
      default: "Continue",
    },
    /** The label for the record again button enabled when `allow_playback: true`.
     */
    record_again_button_label: {
      type: ParameterType.STRING,
      default: "Record again",
    },
    /** The label for the accept button enabled when `allow_playback: true`. */
    accept_button_label: {
      type: ParameterType.STRING,
      default: "Continue",
    },
    /** Whether to allow the participant to listen to their recording and decide whether to rerecord or not. If `true`, then the participant will be shown an interface to play their recorded audio and click one of two buttons to either accept the recording or rerecord. If rerecord is selected, then stimulus will be shown again, as if the trial is starting again from the beginning. */
    allow_playback: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** If `true`, then an [Object URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) will be generated and stored for the recorded audio. Only set this to `true` if you plan to reuse the recorded audio later in the experiment, as it is a potentially memory-intensive feature. */
    save_audio_url: {
      type: ParameterType.BOOL,
      default: false,
    },
  },
  data: {
    /** The time, since the onset of the stimulus, for the participant to click the done button. If the button is not clicked (or not enabled), then `rt` will be `null`. */
    rt: {
      type: ParameterType.INT,
    },
    /** The base64-encoded audio data. */
    response: {
      type: ParameterType.STRING,
    },
    /** The HTML content that was displayed on the screen. */
    stimulus: {
      type: ParameterType.HTML_STRING,
    },
    /** This is an estimate of when the stimulus appeared relative to the start of the audio recording. The plugin is configured so that the recording should start prior to the display of the stimulus. We have not yet been able to verify the accuracy of this estimate with external measurement devices. */
    estimated_stimulus_onset: {
      type: ParameterType.INT,
    },
    /** A URL to a copy of the audio data. */
    audio_url: {
      type: ParameterType.STRING,
    },
  },
};

type Info = typeof info;

/**
 * This plugin displays HTML content and records audio from the participant via a microphone.
 *
 * In order to get access to the microphone, you need to use the [initialize-microphone plugin](initialize-microphone.md) on your timeline prior to using this plugin.
 * Once access is granted for an experiment you do not need to get permission again.
 *
 * This plugin records audio data in [base 64 format](https://developer.mozilla.org/en-US/docs/Glossary/Base64).
 * This is a text-based representation of the audio which can be coverted to various audio formats using a variety of [online tools](https://www.google.com/search?q=base64+audio+decoder) as well as in languages like python and R.
 *
 * **This plugin will generate a large amount of data, and you will need to be careful about how you handle this data.**
 * Even a few seconds of audio recording will add 10s of kB to jsPsych's data.
 * Multiply this by a handful (or more) of trials, and the data objects will quickly get large.
 * If you need to record a lot of audio, either many trials worth or just a few trials with longer responses, we recommend that you save the data to your server immediately after the trial and delete the data in jsPsych's data object.
 * See below for an example of how to do this.
 *
 * This plugin also provides the option to store the recorded audio files as [Object URLs](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) via `save_audio_url: true`.
 * This will generate a URL that is storing a copy of the recorded audio, which can be used for subsequent playback.
 * See below for an example where the recorded audio is used as the stimulus in a subsequent trial.
 * This feature is turned off by default because it uses a relatively large amount of memory compared to most jsPsych features.
 * If you are running an experiment where you need this feature and you are recording lots of audio snippets, you may want to manually revoke the URLs when you no longer need them using [`URL.revokeObjectURL(objectURL)`](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL).
 *
 * !!! warning
 *     When recording from a microphone your experiment will need to be running over `https://` protocol. If you try to run the experiment locally using the `file://` protocol or over `http://` protocol you will not be able to access the microphone because of [potential security problems](https://blog.mozilla.org/webrtc/camera-microphone-require-https-in-firefox-68/).
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/html-audio-response/ html-audio-response plugin documentation on jspsych.org}
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

    // move on to the next trial
    this.jsPsych.finishTrial(trial_data);
  }
}

export default HtmlAudioResponsePlugin;
