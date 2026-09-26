import { ParameterType } from 'jspsych';

var version = "2.1.0";

const info = {
  name: "initialize-camera",
  version,
  parameters: {
    /** The message to display when the user is presented with a dropdown list of available devices. */
    device_select_message: {
      type: ParameterType.HTML_STRING,
      default: `<p>Please select the camera you would like to use.</p>`
    },
    /** The label for the select button. */
    button_label: {
      type: ParameterType.STRING,
      default: "Use this camera"
    },
    /** Set to `true` to include an audio track in the recordings. */
    include_audio: {
      type: ParameterType.BOOL,
      default: false
    },
    /** Request a specific width for the recording. This is not a guarantee that this width will be used, as it
     * depends on the capabilities of the participant's device. Learn more about `MediaRecorder` constraints
     * [here](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API/Constraints#requesting_a_specific_value_for_a_setting). */
    width: {
      type: ParameterType.INT,
      default: null
    },
    /** Request a specific height for the recording. This is not a guarantee that this height will be used, as it
     * depends on the capabilities of the participant's device. Learn more about `MediaRecorder` constraints
     * [here](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API/Constraints#requesting_a_specific_value_for_a_setting). */
    height: {
      type: ParameterType.INT,
      default: null
    },
    /** Set this to use a specific [MIME type](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/mimeType) for the
     * recording. Set the entire type, e.g., `'video/mp4; codecs="avc1.424028, mp4a.40.2"'`. */
    mime_type: {
      type: ParameterType.STRING,
      default: null
    }
  },
  data: {
    /** The [device ID](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo/deviceId) of the selected camera. */
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
class InitializeCameraPlugin {
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
    await this.askForPermission(trial);
    this.showCameraSelection(display_element, trial);
    this.updateDeviceList(display_element);
    navigator.mediaDevices.ondevicechange = (e) => {
      this.updateDeviceList(display_element);
    };
    const camera_id = await this.waitForSelection(display_element);
    const constraints = { video: { deviceId: camera_id } };
    if (trial.width) {
      constraints.video.width = trial.width;
    }
    if (trial.height) {
      constraints.video.height = trial.height;
    }
    if (trial.include_audio) {
      constraints.audio = true;
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const recorder_options = {};
    if (trial.mime_type) {
      recorder_options.mimeType = trial.mime_type;
    }
    this.jsPsych.pluginAPI.initializeCameraRecorder(stream, recorder_options);
    return camera_id;
  }
  async askForPermission(trial) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: trial.include_audio,
      video: true
    });
    return stream;
  }
  showCameraSelection(display_element, trial) {
    let html = `
      ${trial.device_select_message}
      <select name="camera" id="which-camera" style="font-size:14px; font-family: 'Open Sans', 'Arial', sans-serif; padding: 4px;">
      </select>
      <p><button class="jspsych-btn" id="btn-select-camera">${trial.button_label}</button></p>`;
    display_element.innerHTML = html;
  }
  waitForSelection(display_element) {
    return new Promise((resolve) => {
      display_element.querySelector("#btn-select-camera").addEventListener("click", () => {
        const camera = display_element.querySelector("#which-camera").value;
        resolve(camera);
      });
    });
  }
  updateDeviceList(display_element) {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cams = devices.filter(
        (d) => d.kind === "videoinput" && d.deviceId !== "default" && d.deviceId !== "communications"
      );
      const unique_cameras = cams.filter(
        (cam, index, arr) => arr.findIndex((v) => v.groupId == cam.groupId) == index
      );
      display_element.querySelector("#which-camera").innerHTML = "";
      unique_cameras.forEach((d) => {
        let el = document.createElement("option");
        el.value = d.deviceId;
        el.innerHTML = d.label;
        display_element.querySelector("#which-camera").appendChild(el);
      });
    });
  }
}

export { InitializeCameraPlugin as default };
//# sourceMappingURL=index.js.map
