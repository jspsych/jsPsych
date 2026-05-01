import { ParameterType } from 'jspsych';

var version = "2.1.0";

const info = {
  name: "initialize-microphone",
  version,
  parameters: {
    /** The message to display when the user is presented with a dropdown list of available devices. */
    device_select_message: {
      type: ParameterType.HTML_STRING,
      default: `<p>Please select the microphone you would like to use.</p>`
    },
    /** The label for the select button. */
    button_label: {
      type: ParameterType.STRING,
      default: "Use this microphone"
    }
  },
  data: {
    /**  The [device ID](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo/deviceId) of the selected microphone. */
    device_id: {
      type: ParameterType.STRING
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class InitializeMicrophonePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    this.run_trial(display_element, trial).then((id) => {
      this.jsPsych.finishTrial({
        device_id: id
      });
    });
  }
  async run_trial(display_element, trial) {
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
  async askForPermission() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    return stream;
  }
  showMicrophoneSelection(display_element, trial) {
    let html = `
      ${trial.device_select_message}
      <select name="mic" id="which-mic" style="font-size:14px; font-family: 'Open Sans', 'Arial', sans-serif; padding: 4px;">
      </select>
      <p><button class="jspsych-btn" id="btn-select-mic">${trial.button_label}</button></p>`;
    display_element.innerHTML = html;
  }
  waitForSelection(display_element) {
    return new Promise((resolve) => {
      display_element.querySelector("#btn-select-mic").addEventListener("click", () => {
        const mic = display_element.querySelector("#which-mic").value;
        resolve(mic);
      });
    });
  }
  updateDeviceList(display_element) {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const mics = devices.filter(
        (d) => d.kind === "audioinput" && d.deviceId !== "default" && d.deviceId !== "communications"
      );
      const unique_mics = mics.filter(
        (mic, index, arr) => arr.findIndex((v) => v.groupId == mic.groupId) == index
      );
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

export { InitializeMicrophonePlugin as default };
//# sourceMappingURL=index.js.map
