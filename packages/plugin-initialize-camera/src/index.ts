import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "initialize-camera",
  parameters: {
    /** Message to display with the selection box */
    device_select_message: {
      type: ParameterType.HTML_STRING,
      default: `<p>Please select the camera you would like to use.</p>`,
    },
    /** Label to use for the button that confirms selection */
    button_label: {
      type: ParameterType.STRING,
      default: "Use this camera",
    },
    /** Set to `true` to include audio in the recording */
    include_audio: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** Desired width of the camera stream */
    width: {
      type: ParameterType.INT,
      default: null,
    },
    /** Desired height of the camera stream */
    height: {
      type: ParameterType.INT,
      default: null,
    },
    /** MIME type of the recording. Set as a full string, e.g., 'video/webm; codecs="vp8, vorbis"'. */
    mime_type: {
      type: ParameterType.STRING,
      default: null,
    },
  },
};

type Info = typeof info;

/**
 * **initialize-camera**
 *
 * jsPsych plugin for getting permission to initialize a camera and setting properties of the recording.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-initialize-camera/ initialize-camera plugin documentation on jspsych.org}
 */
class InitializeCameraPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.run_trial(display_element, trial).then((id) => {
      display_element.innerHTML = "";
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
