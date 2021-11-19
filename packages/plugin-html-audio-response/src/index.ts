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
      default: null,
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

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const ro = new ResizeObserver((entries) => {
      console.log(`ro perf = ${performance.now()}`);
    });

    ro.observe(display_element);

    this.showDisplay(display_element, trial);
    this.addButtonEvent(display_element, trial);

    this.stimulus_start_time = performance.now();

    this.startRecording();

    // hide image if timing is set
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.querySelector<HTMLElement>(
          "#jspsych-html-audio-response-stimulus"
        ).style.visibility = "hidden";
      }, trial.stimulus_duration);
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        this.endTrial(display_element, trial);
      }, trial.trial_duration);
    }
  }

  private showDisplay(display_element, trial) {
    let html = `<div id="jspsych-html-audio-response-stimulus">${trial.stimulus}</div>`;

    html += `<p><button class="jspsych-btn" id="finish-trial">Done</button></p>`;

    display_element.innerHTML = html;
  }

  private addButtonEvent(display_element, trial) {
    display_element.querySelector("#finish-trial").addEventListener("click", () => {
      const end_time = performance.now();
      const rt = Math.round(end_time - this.stimulus_start_time);
      this.endTrial(display_element, trial, rt);
    });
  }

  private startRecording() {
    const recorder: MediaRecorder = this.jsPsych.pluginAPI.getMicrophoneRecorder();
    const recorded_data_chunks = [];

    recorder.addEventListener("dataavailable", (e) => {
      if (e.data.size > 0) {
        recorded_data_chunks.push(e.data);
      }
      console.log("dataavail event");
    });

    recorder.addEventListener("stop", () => {
      const url = new Blob(recorded_data_chunks, { type: "audio/webm" });
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const base64 = (reader.result as string).split(",")[1];
        console.log(base64);
      });
      reader.readAsDataURL(url);

      console.log(this.stimulus_start_time, this.recorder_start_time);
    });

    recorder.addEventListener("start", (e) => {
      this.recorder_start_time = e.timeStamp;
    });

    this.jsPsych.pluginAPI.setTimeout(() => {
      recorder.stop();
    }, 2000);
    recorder.start();
  }

  private endTrial(display_element, trial, rt: number = null) {
    // kill any remaining setTimeout handlers
    this.jsPsych.pluginAPI.clearAllTimeouts();

    // gather the data to store for the trial
    var trial_data = {
      rt: rt,
      stimulus: trial.stimulus,
    };

    // clear the display
    display_element.innerHTML = "";

    // move on to the next trial
    this.jsPsych.finishTrial(trial_data);
  }
}

export default HtmlAudioResponsePlugin;
