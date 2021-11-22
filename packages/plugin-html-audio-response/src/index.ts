import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "html-audio-response",
  parameters: {
    /** The HTML string to be displayed */
    stimulus: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Stimulus",
      default: undefined,
    },
    /** How long to show the stimulus. */
    stimulus_duration: {
      type: ParameterType.INT,
      pretty_name: "Stimulus duration",
      default: null,
    },
    /** How long to show the trial. */
    trial_duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: 2000,
    },
    button_label: {
      type: ParameterType.STRING,
      default: "Continue",
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
  private response;
  private load_resolver;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.recorder = this.jsPsych.pluginAPI.getMicrophoneRecorder();

    this.setupRecordingEvents(display_element, trial);

    this.startRecording();

    // setup timer for hiding the stimulus
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        this.hideStimulus(display_element);
      }, trial.stimulus_duration);
    }

    // setup timer for ending the trial
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        this.stopRecording().then(() => {
          this.endTrial(display_element, trial);
        });
      }, trial.trial_duration);
    }
  }

  private showDisplay(display_element, trial) {
    const ro = new ResizeObserver((entries) => {
      this.stimulus_start_time = performance.now();
      console.log("ro event");
      ro.disconnect();
    });

    ro.observe(display_element);

    let html = `<div id="jspsych-html-audio-response-stimulus">${trial.stimulus}</div>`;

    html += `<p><button class="jspsych-btn" id="finish-trial">${trial.button_label}</button></p>`;

    display_element.innerHTML = html;
  }

  private hideStimulus(display_element: HTMLElement) {
    display_element.querySelector<HTMLElement>(
      "#jspsych-html-audio-response-stimulus"
    ).style.visibility = "hidden";
  }

  private addButtonEvent(display_element, trial) {
    display_element.querySelector("#finish-trial").addEventListener("click", () => {
      const end_time = performance.now();
      const rt = Math.round(end_time - this.stimulus_start_time);
      this.stopRecording().then(() => {
        this.endTrial(display_element, trial, rt);
      });
    });
  }

  private setupRecordingEvents(display_element, trial) {
    const recorded_data_chunks = [];

    this.recorder.addEventListener("dataavailable", (e) => {
      if (e.data.size > 0) {
        recorded_data_chunks.push(e.data);
      }
    });

    this.recorder.addEventListener("stop", () => {
      const url = new Blob(recorded_data_chunks, { type: "audio/webm" });
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const base64 = (reader.result as string).split(",")[1];
        this.response = base64;
        this.load_resolver();
      });
      reader.readAsDataURL(url);
    });

    this.recorder.addEventListener("start", (e) => {
      this.recorder_start_time = e.timeStamp;
      this.showDisplay(display_element, trial);
      this.addButtonEvent(display_element, trial);
    });
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

  private endTrial(display_element, trial, rt: number = null) {
    // kill any remaining setTimeout handlers
    this.jsPsych.pluginAPI.clearAllTimeouts();

    // gather the data to store for the trial
    var trial_data = {
      rt: rt,
      stimulus: trial.stimulus,
      response: this.response,
      estimated_stimulus_onset: Math.round(this.stimulus_start_time - this.recorder_start_time),
    };

    // clear the display
    display_element.innerHTML = "";

    // move on to the next trial
    this.jsPsych.finishTrial(trial_data);
  }
}

export default HtmlAudioResponsePlugin;
