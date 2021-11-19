import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "initialize-microphone",
  parameters: {
    /** Function to call */
    func: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** Is the function call asynchronous? */
    async: {
      type: ParameterType.BOOL,
      default: false,
    },
  },
};

type Info = typeof info;

/**
 * **initialize-microphone**
 *
 * jsPsych plugin for getting permission to initialize a microphone
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-initialize-microphone/ initialize-microphone plugin documentation on jspsych.org}
 */
class InitializeMicrophonePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.run_trial(display_element).then((id) => {
      this.jsPsych.finishTrial({
        device_id: id,
      });
    });
  }

  private async run_trial(display_element) {
    await this.askForPermission();

    const devices = await navigator.mediaDevices.enumerateDevices();
    const mics = devices.filter(
      (d) => d.kind === "audioinput" && d.deviceId !== "default" && d.deviceId !== "communications"
    );

    // remove entries with duplicate groupID
    const unique_mics = mics.filter(
      (mic, index, arr) => arr.findIndex((v) => v.groupId == mic.groupId) == index
    );

    const mic_id = await this.showMicrophoneSelection(display_element, unique_mics);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: mic_id } });

    this.jsPsych.pluginAPI.initializeMicrophoneRecorder(stream);

    return mic_id;
  }

  private async askForPermission() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    return stream;
  }

  private showMicrophoneSelection(display_element, devices: MediaDeviceInfo[]) {
    let html = `
      <p>Please select the microphone you would like to use.</p>
      <select name="mic" id="which-mic" style="font-size:14px; font-family: 'Open Sans', 'Arial', sans-serif; padding: 4px;">`;
    for (const d of devices) {
      html += `<option value="${d.deviceId}">${d.label}</option>`;
    }
    html += "</select>";
    html += '<p><button class="jspsych-btn" id="btn-select-mic">Use this microphone</button></p>';
    display_element.innerHTML = html;

    return new Promise((resolve) => {
      display_element.querySelector("#btn-select-mic").addEventListener("click", () => {
        const mic = display_element.querySelector("#which-mic").value;
        resolve(mic);
      });
    });
  }
}

export default InitializeMicrophonePlugin;
