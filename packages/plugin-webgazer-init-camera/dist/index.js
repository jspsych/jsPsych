import { ParameterType } from 'jspsych';

var version = "2.1.0";

const info = {
  name: "webgazer-init-camera",
  version,
  parameters: {
    /** Instructions for the participant to follow. */
    instructions: {
      type: ParameterType.HTML_STRING,
      default: `
            <p>Position your head so that the webcam has a good view of your eyes.</p>
            <p>Center your face in the box and look directly towards the camera.</p>
            <p>It is important that you try and keep your head reasonably still throughout the experiment, so please take a moment to adjust your setup to be comfortable.</p>
            <p>When your face is centered in the box and the box is green, you can click to continue.</p>`
    },
    /** The text for the button that participants click to end the trial. */
    button_text: {
      type: ParameterType.STRING,
      default: "Continue"
    }
  },
  data: {
    /** The time it took for webgazer to initialize. This can be a long time in some situations, so this
     * value is recorded for troubleshooting when participants are reporting difficulty.
     */
    load_time: {
      type: ParameterType.INT
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class WebgazerInitCameraPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial, on_load) {
    const extension = this.jsPsych.extensions.webgazer;
    let trial_complete;
    var start_time = performance.now();
    var load_time;
    const end_trial = () => {
      extension.pause();
      extension.hideVideo();
      var trial_data = {
        load_time
      };
      document.querySelector("#webgazer-center-style").remove();
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
        document.querySelector("#jspsych-wg-cont").disabled = false;
      } else {
        var observer = new MutationObserver(face_detect_event_observer);
        observer.observe(document, {
          attributes: true,
          attributeFilter: ["style"],
          subtree: true
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
      extension.start().then(() => {
        showTrial();
      }).catch((error) => {
        console.log(error);
        display_element.innerHTML = `<p>The experiment cannot continue because the eye tracker failed to start.</p>
              <p>This may be because of a technical problem or because you did not grant permission for the page to use your camera.</p>`;
      });
    } else {
      showTrial();
    }
    function is_face_detect_green() {
      if (document.querySelector("#webgazerFaceFeedbackBox")) {
        return document.querySelector("#webgazerFaceFeedbackBox").style.borderColor == "green";
      } else {
        return false;
      }
    }
    function face_detect_event_observer(mutationsList, observer) {
      if (mutationsList[0].target == document.querySelector("#webgazerFaceFeedbackBox")) {
        if (mutationsList[0].type == "attributes" && mutationsList[0].target.style.borderColor == "green") {
          document.querySelector("#jspsych-wg-cont").disabled = false;
        }
        if (mutationsList[0].type == "attributes" && mutationsList[0].target.style.borderColor == "red") {
          document.querySelector("#jspsych-wg-cont").disabled = true;
        }
      }
    }
    return new Promise((resolve) => {
      trial_complete = resolve;
    });
  }
}

export { WebgazerInitCameraPlugin as default };
//# sourceMappingURL=index.js.map
