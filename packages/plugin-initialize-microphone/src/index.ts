import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "initialize-microphone",
  parameters: {
    /** The message that prompts the participant to select a microphone. */
    device_select_message: {
      type: ParameterType.HTML_STRING,
      default: `<p>Please select the microphone you would like to use.</p>`,
    },
    /** Label of the button that confirms selection of the microphone. */
    button_label: {
      type: ParameterType.STRING,
      default: "Use this microphone",
    },
    /** The message to display when permission to access the microphone is rejected. */
    rejection_message: {
      type: ParameterType.HTML_STRING,
      default: `<p>You must allow access to a microphone in order to participate in the experiment.</p>`,
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
    this.run_trial(display_element, trial).then((id) => {
      this.jsPsych.finishTrial({
        device_id: id,
      });
    });
  }

  private async run_trial(display_element: HTMLElement, trial: TrialType<Info>) {
    try {
      await this.askForPermission();
    } catch(e) {
      this.rejectPermission(trial);  
      return;
    }

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

  private rejectPermission(trial: TrialType<Info>) {
    this.jsPsych.getDisplayElement().innerHTML = "";

    this.jsPsych.endExperiment(trial.rejection_message, {});
  }
}

export default InitializeMicrophonePlugin;
