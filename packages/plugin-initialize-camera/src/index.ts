import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "initialize-camera",
  version: version,
  parameters: {
    /** The message to display when the user is presented with a dropdown list of available devices. */
    device_select_message: {
      type: ParameterType.HTML_STRING,
      default: `<p>Please select the camera you would like to use.</p>`,
    },
    /** The label for the select button. */
    button_label: {
      type: ParameterType.STRING,
      default: "Use this camera",
    },
    /** Set to `true` to include an audio track in the recordings. */
    include_audio: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** Request a specific width for the recording. This is not a guarantee that this width will be used, as it
     * depends on the capabilities of the participant's device. Learn more about `MediaRecorder` constraints
     * [here](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API/Constraints#requesting_a_specific_value_for_a_setting). */
    width: {
      type: ParameterType.INT,
      default: null,
    },
    /** Request a specific height for the recording. This is not a guarantee that this height will be used, as it
     * depends on the capabilities of the participant's device. Learn more about `MediaRecorder` constraints
     * [here](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API/Constraints#requesting_a_specific_value_for_a_setting). */
    height: {
      type: ParameterType.INT,
      default: null,
    },
    /** Set this to use a specific [MIME type](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/mimeType) for the
     * recording. Set the entire type, e.g., `'video/mp4; codecs="avc1.424028, mp4a.40.2"'`. */
    mime_type: {
      type: ParameterType.STRING,
      default: null,
    },
  },
  data: {
    /** The [device ID](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo/deviceId) of the selected camera. */
    device_id: {
      type: ParameterType.STRING,
    },
  },
};

type Info = typeof info;

/**
 * This plugin asks the participant to grant permission to access a camera.
 * If multiple cameras are connected to the participant's device, then it allows the participant to pick which device to use.
 * Once access is granted for an experiment you do not need to get permission again.
 *
 * Once the camera is selected with this plugin it can be accessed with
 * [`jsPsych.pluginAPI.getCameraRecorder()`](../reference/jspsych-pluginAPI.md#getcamerarecorder).
 *
 * !!! warning
 *     When recording from a camera your experiment will need to be running over `https://` protocol. If you try to
 *  run the experiment locally using the `file://` protocol or over `http://` protocol you will not be able to access
 * the microphone because of [potential security problems](https://blog.mozilla.org/webrtc/camera-microphone-require-https-in-firefox-68/).
 *
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/initialize-camera/ initialize-camera plugin documentation on jspsych.org}
 */
class InitializeCameraPlugin implements JsPsychPlugin<Info> {
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
    await this.askForPermission(trial);

    this.showCameraSelection(display_element, trial);

    this.updateDeviceList(display_element);

    navigator.mediaDevices.ondevicechange = (e) => {
      this.updateDeviceList(display_element);
    };

    const camera_id = await this.waitForSelection(display_element);

    const constraints: any = { video: { deviceId: camera_id } };

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

    const recorder_options: MediaRecorderOptions = {};
    if (trial.mime_type) {
      recorder_options.mimeType = trial.mime_type;
    }

    this.jsPsych.pluginAPI.initializeCameraRecorder(stream, recorder_options);

    return camera_id;
  }

  private async askForPermission(trial: TrialType<Info>) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: trial.include_audio,
      video: true,
    });
    return stream;
  }

  private showCameraSelection(display_element, trial: TrialType<Info>) {
    let html = `
      ${trial.device_select_message}
      <select name="camera" id="which-camera" style="font-size:14px; font-family: 'Open Sans', 'Arial', sans-serif; padding: 4px;">
      </select>
      <p><button class="jspsych-btn" id="btn-select-camera">${trial.button_label}</button></p>`;
    display_element.innerHTML = html;
  }

  private waitForSelection(display_element) {
    return new Promise((resolve) => {
      display_element.querySelector("#btn-select-camera").addEventListener("click", () => {
        const camera = display_element.querySelector("#which-camera").value;
        resolve(camera);
      });
    });
  }

  private updateDeviceList(display_element) {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cams = devices.filter(
        (d) =>
          d.kind === "videoinput" && d.deviceId !== "default" && d.deviceId !== "communications"
      );

      // remove entries with duplicate groupID
      const unique_cameras = cams.filter(
        (cam, index, arr) => arr.findIndex((v) => v.groupId == cam.groupId) == index
      );

      // reset the list by clearing all current options
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

export default InitializeCameraPlugin;
