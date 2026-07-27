import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import { version } from "../package.json";

const info = <const>{
  name: "plugin-initialize-media-recording",
  version: version,
  parameters: {
    /**
     * If true, prompts the participant to select a microphone and requests permission to use it.
     */
    initialize_microphone: {
      type: ParameterType.BOOL,
      default: false,
    },

    /**
     * HTML content displayed above the microphone device selector.
     */
    microphone_select_message: {
      type: ParameterType.HTML_STRING,
      default: `<p>Please select the microphone you would like to use.</p>`,
    },

    /**
     * Label for the confirmation button used after selecting a microphone device.
     */
    microphone_button_label: {
      type: ParameterType.STRING,
      default: "Use this microphone",
    },

    /**
     * If true, prompts the participant to select a camera and requests permission to use it.
     */
    initialize_camera: {
      type: ParameterType.BOOL,
      default: false,
    },

    /**
     * HTML content displayed above the camera device selector.
     */
    camera_select_message: {
      type: ParameterType.HTML_STRING,
      default: `<p>Please select the camera you would like to use.</p>`,
    },

    /**
     * Label for the confirmation button used after selecting a camera device.
     */
    camera_button_label: {
      type: ParameterType.STRING,
      default: "Use this camera",
    },

    /**
     * If true, includes audio recording from the camera device (if available) rather than from a separate microphone.
     * Only relevant when `initialize_camera` is true.
     */
    include_camera_audio: {
      type: ParameterType.BOOL,
      default: false,
    },

    /**
     * Desired width of the camera video frame in pixels. If null, default device width is used.
     */
    width: {
      type: ParameterType.INT,
      default: null,
    },

    /**
     * Desired height of the camera video frame in pixels. If null, default device height is used.
     */
    height: {
      type: ParameterType.INT,
      default: null,
    },

    /**
     * Minimum height (in pixels) to request for the video stream.
     * This helps avoid selecting very low-resolution devices.
     */
    min_height: {
      type: ParameterType.INT,
      default: 400,
    },

    /**
     * Maximum height (in pixels) allowed for the video stream.
     * If null, no maximum constraint is applied.
     */
    max_height: {
      type: ParameterType.INT,
      default: null,
    },

    /**
     * Minimum width (in pixels) to request for the video stream.
     * This helps avoid selecting very low-resolution devices.
     */
    min_width: {
      type: ParameterType.INT,
      default: 640,
    },

    /**
     * Maximum width (in pixels) allowed for the video stream.
     * If null, no maximum constraint is applied.
     */
    max_width: {
      type: ParameterType.INT,
      default: null,
    },

    /**
     * MIME type to request for the recording format.
     * Leave null to allow the browser to choose a supported type automatically.
     * Example values: "video/webm", "video/mp4".
     */
    mime_type: {
      type: ParameterType.STRING,
      default: null,
    },

    /**
     * Message shown to the participant if permission to use the microphone or camera is denied.
     * If null, no message is shown and the trial simply ends.
     */
    permission_reject_message: {
      type: ParameterType.STRING,
      default: null,
    },
  },

  data: {
    /**
     * The device ID of the selected microphone, useful for debugging or replicating device selection.
     */
    microphone_device_id: {
      type: ParameterType.STRING,
    },

    /**
     * The device ID of the selected camera, useful for debugging or replicating device selection.
     */
    camera_device_id: {
      type: ParameterType.STRING,
    },
  },

  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 *
 * NOTE: this plugin extends two existing jsPsych plugins: `initialize-camera` and `initialize-microphone`.
 * The intention is to combine these into a single plugin, enabling you to initialize either or both the camera and microphones at once.
 *
 * For reference here is the documentation for the plugins that this integrated one builds on (will create final docs later):
 *
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
 *  * This plugin asks the participant to grant permission to access a microphone.
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
 * @author Courtney B. Hilton
 */

class InitializeMediaRecordingPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  //////////////////////////
  // DOM CREATION HELPERS //
  //////////////////////////

  private async requestPermissions(trial: TrialType<Info>) {
    const constraints = {
      audio: trial.initialize_microphone,
      video: trial.initialize_camera,
    };
    try {
      await navigator.mediaDevices.getUserMedia(constraints);
      trial.permissionGranted = true;
    } catch (err: any) {
      trial.permissionGranted = false;
      console.error("Permission error:", err);
    }
  }

  private setupInteractiveSection(
    selectId: string,
    buttonId: string,
    sectionId: string
  ) {
    const button = document.querySelector(buttonId) as HTMLButtonElement;
    const section = document.querySelector(sectionId) as HTMLElement;
    const selector = document.querySelector(selectId) as HTMLSelectElement;

    const originalBackgroundColor = button.style.backgroundColor || "";
    const originalCursor = button.style.cursor || "";

    button.addEventListener("click", () => {
      button.disabled = true;
      button.style.backgroundColor = "#ccc";
      button.style.cursor = "not-allowed";
      section.style.opacity = "0.5";
    });

    selector.addEventListener("click", () => {
      if (button.disabled) {
        button.disabled = false;
        button.style.backgroundColor = originalBackgroundColor;
        button.style.cursor = originalCursor;
        section.style.opacity = "1";
      }
    });
  }

  private renderDeviceSelectionUI(
    display_element: HTMLElement,
    trial: TrialType<Info>
  ) {
    let html = "";

    if (trial.initialize_microphone) {
      html += `
      <div id="microphone-section">
        ${trial.microphone_select_message}
        <select name="mic" id="which-mic" style="font-size:14px; font-family: 'Open Sans', 'Arial', sans-serif; padding: 4px;"></select>
        <p>
          <button class="jspsych-btn" id="btn-select-mic" style="transition: background-color 0.3s;">
            ${trial.microphone_button_label}
          </button>
        </p>
      </div>
    `;
    }

    if (trial.initialize_camera) {
      html += `
      <div id="camera-section">
        ${trial.camera_select_message}
        <select name="camera" id="which-camera" style="font-size:14px; font-family: 'Open Sans', 'Arial', sans-serif; padding: 4px;"></select>
        <p>
          <button class="jspsych-btn" id="btn-select-camera" style="transition: background-color 0.3s;">
            ${trial.camera_button_label}
          </button>
        </p>
      </div>
    `;
    }

    display_element.innerHTML = html;

    // Add UX interactions for microphone section
    if (trial.initialize_microphone) {
      this.setupInteractiveSection(
        "#which-mic",
        "#btn-select-mic",
        "#microphone-section"
      );
    }

    // Add UX interactions for camera section
    if (trial.initialize_camera) {
      this.setupInteractiveSection(
        "#which-camera",
        "#btn-select-camera",
        "#camera-section"
      );
    }
  }

  private showPermissionRejectMessage(
    display: HTMLElement,
    trial: TrialType<Info>
  ) {
    display.innerHTML = `<div class="permission-reject-message"><p>${trial.permission_reject_message}</p></div>`;
  }

  private refreshDeviceLists(display: HTMLElement) {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      this.populateDeviceOptions(display, devices, "mic", "audioinput");
      this.populateDeviceOptions(display, devices, "camera", "videoinput");
    });
  }

  private populateDeviceOptions(
    display: HTMLElement,
    devices: MediaDeviceInfo[],
    type: "mic" | "camera",
    kind: MediaDeviceKind
  ) {
    const select = display.querySelector(`#which-${type}`) as HTMLSelectElement;
    if (!select) return;

    const filtered = devices.filter(
      (d) =>
        d.kind === kind &&
        d.deviceId !== "default" &&
        d.deviceId !== "communications"
    );
    const unique = filtered.filter(
      (d, i, arr) => arr.findIndex((v) => v.groupId === d.groupId) === i
    );

    select.innerHTML = "";
    unique.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d.deviceId;
      opt.textContent = d.label;
      select.appendChild(opt);
    });
  }

  private awaitSelection(
    display: HTMLElement,
    type: "mic" | "camera"
  ): Promise<string> {
    return new Promise((resolve) => {
      const button = display.querySelector(
        `#btn-select-${type}`
      ) as HTMLButtonElement;
      const select = display.querySelector(
        `#which-${type}`
      ) as HTMLSelectElement;

      button.addEventListener("click", () => resolve(select.value));
    });
  }

  ////////////////////////////////
  // MEDIA CONFIGURATION HELPER //
  ////////////////////////////////

  private async configureMediaRecording(
    display_element: HTMLElement,
    trial: TrialType<Info>
  ) {
    await this.requestPermissions(trial);
    if (!trial.permissionGranted) return null;

    this.renderDeviceSelectionUI(display_element, trial);
    this.refreshDeviceLists(display_element);

    navigator.mediaDevices.ondevicechange = () => {
      this.refreshDeviceLists(display_element);
    };

    let micId: string | null = null;
    let camId: string | null = null;

    if (trial.initialize_microphone) {
      micId = await this.awaitSelection(display_element, "mic");
    }
    if (trial.initialize_camera) {
      camId = await this.awaitSelection(display_element, "camera");
    }

    if (trial.initialize_microphone && micId) {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: micId },
        video: false,
      });
      this.jsPsych.pluginAPI.initializeMicrophoneRecorder(stream);
    }

    if (trial.initialize_camera && camId) {
      const constraints: any = { video: { deviceId: camId } };
      if (trial.width || trial.min_width || trial.max_width) {
        constraints.video.width = {};
        if (trial.width) constraints.video.width.ideal = trial.width;
        if (trial.min_width) constraints.video.width.min = trial.min_width;
        if (trial.max_width) constraints.video.width.max = trial.max_width;
      }
      if (trial.height || trial.min_height || trial.max_height) {
        constraints.video.height = {};
        if (trial.height) constraints.video.height.ideal = trial.height;
        if (trial.min_height) constraints.video.height.min = trial.min_height;
        if (trial.max_height) constraints.video.height.max = trial.max_height;
      }
      constraints.audio = trial.include_camera_audio;

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const options: MediaRecorderOptions = {};
      if (trial.mime_type) options.mimeType = trial.mime_type;
      this.jsPsych.pluginAPI.initializeCameraRecorder(stream, options);
    }

    return {
      microphone_device_id: trial.initialize_microphone ? micId : null,
      camera_device_id: trial.initialize_camera ? camId : null,
    };
  }

  ///////////////////////
  // MAIN TRIAL METHOD //
  ///////////////////////

  async trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const data = await this.configureMediaRecording(display_element, trial);
    if (data) {
      this.jsPsych.finishTrial(data);
    } else {
      this.showPermissionRejectMessage(display_element, trial);
    }
  }
}

export default InitializeMediaRecordingPlugin;
