import { ParameterType } from 'jspsych';

var version = "2.1.0";

const info = {
  name: "mirror-camera",
  version,
  parameters: {
    /** HTML-formatted content to display below the camera feed. */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null
    },
    /** The label of the button to advance to the next trial. */
    button_label: {
      type: ParameterType.STRING,
      default: "Continue"
    },
    /** The height of the video playback element. If left `null` then it will match the size of the recording. */
    height: {
      type: ParameterType.INT,
      default: null
    },
    /** The width of the video playback element. If left `null` then it will match the size of the recording. */
    width: {
      type: ParameterType.INT,
      default: null
    },
    /**  Whether to mirror the video image. */
    mirror_camera: {
      type: ParameterType.BOOL,
      default: true
    }
  },
  data: {
    /** The length of time the participant viewed the video playback. */
    rt: {
      type: ParameterType.INT
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class MirrorCameraPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    this.stream = this.jsPsych.pluginAPI.getCameraStream();
    display_element.innerHTML = `
      <video autoplay playsinline id="jspsych-mirror-camera-video" width="${trial.width ? trial.width : "auto"}" height="${trial.height ? trial.height : "auto"}" ${trial.mirror_camera ? 'style="transform: rotateY(180deg);"' : ""}></video>
      ${trial.prompt ? `<div id="jspsych-mirror-camera-prompt">${trial.prompt}</div>` : ""}
      <p><button class="jspsych-btn" id="btn-continue">${trial.button_label}</button></p>
    `;
    display_element.querySelector("#jspsych-mirror-camera-video").srcObject = this.stream;
    display_element.querySelector("#btn-continue").addEventListener("click", () => {
      this.finish(display_element);
    });
    this.start_time = performance.now();
  }
  finish(display_element) {
    this.jsPsych.finishTrial({
      rt: performance.now() - this.start_time
    });
  }
}

export { MirrorCameraPlugin as default };
//# sourceMappingURL=index.js.map
