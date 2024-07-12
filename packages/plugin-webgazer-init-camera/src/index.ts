import type WebGazerExtension from "@jspsych/extension-webgazer";
import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "webgazer-init-camera",
  version: version,
  parameters: {
    /** Instructions for the participant to follow. */
    instructions: {
      type: ParameterType.HTML_STRING,
      default: `
            <p>Position your head so that the webcam has a good view of your eyes.</p>
            <p>Center your face in the box and look directly towards the camera.</p>
            <p>It is important that you try and keep your head reasonably still throughout the experiment, so please take a moment to adjust your setup to be comfortable.</p>
            <p>When your face is centered in the box and the box is green, you can click to continue.</p>`,
    },
    /** The text for the button that participants click to end the trial. */
    button_text: {
      type: ParameterType.STRING,
      default: "Continue",
    },
  },
  data: {
    /** The time it took for webgazer to initialize. This can be a long time in some situations, so this
     * value is recorded for troubleshooting when participants are reporting difficulty.
     */
    load_time: {
      type: ParameterType.INT,
    },
  },
};

type Info = typeof info;

/**
 * This plugin initializes the camera and helps the participant center their face in the camera view for
 * using the the [WebGazer extension](../extensions/webgazer.md). For a narrative description of eye
 * tracking with jsPsych, see the [eye tracking overview](../overview/eye-tracking.md).
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/webgazer-init-camera/ webgazer-init-camera plugin} and
 * {@link https://www.jspsych.org/latest/overview/eye-tracking/ eye-tracking overview} documentation on jspsych.org
 */
class WebgazerInitCameraPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void) {
    const extension = this.jsPsych.extensions.webgazer as WebGazerExtension;

    let trial_complete;

    var start_time = performance.now();
    var load_time: number;

    // function to end trial when it is time
    const end_trial = () => {
      extension.pause();
      extension.hideVideo();

      // gather the data to store for the trial
      var trial_data = {
        load_time: load_time,
      };

      document.querySelector("#webgazer-center-style").remove();

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);

      trial_complete();
    };

    const showTrial = () => {
      on_load();

      load_time = Math.round(performance.now() - start_time);

      var style = `
          <style id="webgazer-center-style">
            #webgazerVideoContainer { top: 20px !important; left: calc(50% - 160px) !important;}
          </style>
        `;
      document.querySelector("head").insertAdjacentHTML("beforeend", style);

      var html = `
          <div id='webgazer-init-container' style='position: relative; width:100vw; height:100vh'>
          </div>`;

      display_element.innerHTML = html;

      extension.showVideo();
      extension.resume();

      var wg_container = display_element.querySelector("#webgazer-init-container");

      wg_container.innerHTML = `
          <div style='position: absolute; top: max(260px, 40%); left: calc(50% - 400px); width:800px;'>
          ${trial.instructions}
          <button id='jspsych-wg-cont' class='jspsych-btn' disabled>${trial.button_text}</button>
          </div>`;

      if (is_face_detect_green()) {
        (document.querySelector("#jspsych-wg-cont") as HTMLButtonElement).disabled = false;
      } else {
        var observer = new MutationObserver(face_detect_event_observer);
        observer.observe(document, {
          attributes: true,
          attributeFilter: ["style"],
          subtree: true,
        });
      }

      document.querySelector("#jspsych-wg-cont").addEventListener("click", () => {
        if (observer) {
          observer.disconnect();
        }
        end_trial();
      });
    };

    if (!extension.isInitialized()) {
      extension
        .start()
        .then(() => {
          showTrial();
        })
        .catch((error) => {
          console.log(error);
          display_element.innerHTML = `<p>The experiment cannot continue because the eye tracker failed to start.</p>
              <p>This may be because of a technical problem or because you did not grant permission for the page to use your camera.</p>`;
        });
    } else {
      showTrial();
    }

    function is_face_detect_green() {
      if (document.querySelector("#webgazerFaceFeedbackBox")) {
        return (
          (document.querySelector("#webgazerFaceFeedbackBox") as HTMLElement).style.borderColor ==
          "green"
        );
      } else {
        return false;
      }
    }

    function face_detect_event_observer(mutationsList, observer) {
      if (mutationsList[0].target == document.querySelector("#webgazerFaceFeedbackBox")) {
        if (
          mutationsList[0].type == "attributes" &&
          mutationsList[0].target.style.borderColor == "green"
        ) {
          (document.querySelector("#jspsych-wg-cont") as HTMLButtonElement).disabled = false;
        }
        if (
          mutationsList[0].type == "attributes" &&
          mutationsList[0].target.style.borderColor == "red"
        ) {
          (document.querySelector("#jspsych-wg-cont") as HTMLButtonElement).disabled = true;
        }
      }
    }

    return new Promise((resolve) => {
      trial_complete = resolve;
    });
  }
}

export default WebgazerInitCameraPlugin;
