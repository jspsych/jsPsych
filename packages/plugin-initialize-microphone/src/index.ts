import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "initialize-microphone",
  version: version,
  parameters: {
    /** The message to display when the user is presented with a dropdown list of available devices. */
    device_select_message: {
      type: ParameterType.HTML_STRING,
      default: `<p>Please select the microphone you would like to use.</p>`,
    },
    /** The label for the select button. */
    button_label: {
      type: ParameterType.STRING,
      default: "Use this microphone",
    },
  },
  data: {
    /**  The [device ID](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo/deviceId) of the selected microphone. */
    device_id: {
      type: ParameterType.STRING,
    },
  },
};

type Info = typeof info;

/**
 * This plugin asks the participant to grant permission to access a microphone.
 * If multiple microphones are connected to the participant's device, then it allows the participant to pick which device to use.
 * Once access is granted for an experiment you do not need to get permission again.
 *
 * Once the microphone is selected with this plugin it can be accessed with
 * [`jsPsych.pluginAPI.getMicrophoneRecorder()`](../reference/jspsych-pluginAPI.md#getmicrophonerecorder).
 *
 * !!! warning
 *     When recording from a microphone your experiment will need to be running over `https://` protocol.
 * If you try to run the experiment locally using the `file://` protocol or over `http://` protocol you will not
 * be able to access the microphone because of
 * [potential security problems](https://blog.mozilla.org/webrtc/camera-microphone-require-https-in-firefox-68/).
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/initialize-microphone/ initialize-microphone plugin documentation on jspsych.org}
 */
class InitializeMicrophonePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.run_trial(display_element, trial).then((id) => {
      this.jsPsych.finishTrial({
        device_id: id,
      });
    });
  }

  private async run_trial(display_element: HTMLElement, trial: TrialType<Info>) {
    await this.askForPermission();

    this.showMicrophoneSelection(display_element, trial);

    this.updateDeviceList(display_element);

    navigator.mediaDevices.ondevicechange = (e) => {
      this.updateDeviceList(display_element);
    };

    const mic_id = await this.waitForSelection(display_element);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: mic_id } });

    this.jsPsych.pluginAPI.initializeMicrophoneRecorder(stream);

    return mic_id;
  }

  private async askForPermission() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    return stream;
  }

  private showMicrophoneSelection(display_element, trial: TrialType<Info>) {
    let html = `
      ${trial.device_select_message}
      <select name="mic" id="which-mic" style="font-size:14px; font-family: 'Open Sans', 'Arial', sans-serif; padding: 4px;">
      </select>
      <p><button class="jspsych-btn" id="btn-select-mic">${trial.button_label}</button></p>`;
    display_element.innerHTML = html;
  }

  private waitForSelection(display_element) {
    return new Promise((resolve) => {
      display_element.querySelector("#btn-select-mic").addEventListener("click", () => {
        const mic = display_element.querySelector("#which-mic").value;
        resolve(mic);
      });
    });
  }

  private updateDeviceList(display_element) {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const mics = devices.filter(
        (d) =>
          d.kind === "audioinput" && d.deviceId !== "default" && d.deviceId !== "communications"
      );

      // remove entries with duplicate groupID
      const unique_mics = mics.filter(
        (mic, index, arr) => arr.findIndex((v) => v.groupId == mic.groupId) == index
      );

      // reset the list by clearing all current options
      display_element.querySelector("#which-mic").innerHTML = "";

      unique_mics.forEach((d) => {
        let el = document.createElement("option");
        el.value = d.deviceId;
        el.innerHTML = d.label;

        display_element.querySelector("#which-mic").appendChild(el);
      });
    });
  }
}

export default InitializeMicrophonePlugin;
