import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "mirror-camera",
  version: version,
  parameters: {
    /** HTML-formatted content to display below the camera feed. */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** The label of the button to advance to the next trial. */
    button_label: {
      type: ParameterType.STRING,
      default: "Continue",
    },
    /** The height of the video playback element. If left `null` then it will match the size of the recording. */
    height: {
      type: ParameterType.INT,
      default: null,
    },
    /** The width of the video playback element. If left `null` then it will match the size of the recording. */
    width: {
      type: ParameterType.INT,
      default: null,
    },
    /**  Whether to mirror the video image. */
    mirror_camera: {
      type: ParameterType.BOOL,
      default: true,
    },
  },
  data: {
    /** The length of time the participant viewed the video playback. */
    rt: {
      type: ParameterType.INT,
    },
  },
};

type Info = typeof info;

/**
 * This plugin shows a live feed of the participant's camera. It can be useful in experiments that need to record video in order to give the participant a chance to see what is in the view of the camera.
 *
 * You must initialize the camera using the [initialize-camera plugin](initialize-camera.md) prior to running this plugin.
 *
 * !!! warning
 *     When recording from a camera your experiment will need to be running over `https://` protocol. If you try to run the experiment locally using the `file://` protocol or over `http://` protocol you will not be able to access the camera because of [potential security problems](https://blog.mozilla.org/webrtc/camera-microphone-require-https-in-firefox-68/).
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/mirror-camera/ mirror-camera plugin documentation on jspsych.org}
 */
class MirrorCameraPlugin implements JsPsychPlugin<Info> {
  static info = info;

  private stream: MediaStream;
  private start_time: number;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.stream = this.jsPsych.pluginAPI.getCameraStream();

    display_element.innerHTML = `
      <video autoplay playsinline id="jspsych-mirror-camera-video" width="${
        trial.width ? trial.width : "auto"
      }" height="${trial.height ? trial.height : "auto"}" ${
      trial.mirror_camera ? 'style="transform: rotateY(180deg);"' : ""
    }></video>
      ${trial.prompt ? `<div id="jspsych-mirror-camera-prompt">${trial.prompt}</div>` : ""}
      <p><button class="jspsych-btn" id="btn-continue">${trial.button_label}</button></p>
    `;

    (display_element.querySelector("#jspsych-mirror-camera-video") as HTMLVideoElement).srcObject =
      this.stream;

    display_element.querySelector("#btn-continue").addEventListener("click", () => {
      this.finish(display_element);
    });

    this.start_time = performance.now();
  }

  finish(display_element: HTMLElement) {
    this.jsPsych.finishTrial({
      rt: performance.now() - this.start_time,
    });
  }
}

export default MirrorCameraPlugin;
