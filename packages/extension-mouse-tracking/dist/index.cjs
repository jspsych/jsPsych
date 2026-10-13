'use strict';

var jspsych = require('jspsych');

var version = "1.2.0";

class MouseTrackingExtension {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
    this.initialize = async ({ minimum_sample_time = 0 }) => {
      this.domObserver = new MutationObserver(this.mutationObserverCallback);
      this.minimumSampleTime = minimum_sample_time;
    };
    this.on_start = (params) => {
      params = params || {};
      this.currentTrialData = [];
      this.currentTrialTargets = /* @__PURE__ */ new Map();
      this.currentTrialSelectors = params.targets || [];
      this.lastSampleTime = null;
      this.eventsToTrack = params.events || ["mousemove"];
      this.domObserver.observe(this.jsPsych.getDisplayElement(), { childList: true });
    };
    this.on_load = () => {
      this.currentTrialStartTime = performance.now();
      if (this.eventsToTrack.includes("mousemove")) {
        window.addEventListener("mousemove", this.mouseMoveEventHandler);
      }
      if (this.eventsToTrack.includes("mousedown")) {
        window.addEventListener("mousedown", this.mouseDownEventHandler);
      }
      if (this.eventsToTrack.includes("mouseup")) {
        window.addEventListener("mouseup", this.mouseUpEventHandler);
      }
    };
    this.on_finish = () => {
      this.domObserver.disconnect();
      if (this.eventsToTrack.includes("mousemove")) {
        window.removeEventListener("mousemove", this.mouseMoveEventHandler);
      }
      if (this.eventsToTrack.includes("mousedown")) {
        window.removeEventListener("mousedown", this.mouseDownEventHandler);
      }
      if (this.eventsToTrack.includes("mouseup")) {
        window.removeEventListener("mouseup", this.mouseUpEventHandler);
      }
      return {
        mouse_tracking_data: this.currentTrialData,
        mouse_tracking_targets: Object.fromEntries(this.currentTrialTargets.entries())
      };
    };
    this.mouseMoveEventHandler = ({ clientX: x, clientY: y }) => {
      const event_time = performance.now();
      const t = Math.round(event_time - this.currentTrialStartTime);
      if (this.lastSampleTime === null || event_time - this.lastSampleTime >= this.minimumSampleTime) {
        this.lastSampleTime = event_time;
        this.currentTrialData.push({ x, y, t, event: "mousemove" });
      }
    };
    this.mouseUpEventHandler = ({ clientX: x, clientY: y }) => {
      const event_time = performance.now();
      const t = Math.round(event_time - this.currentTrialStartTime);
      this.currentTrialData.push({ x, y, t, event: "mouseup" });
    };
    this.mouseDownEventHandler = ({ clientX: x, clientY: y }) => {
      const event_time = performance.now();
      const t = Math.round(event_time - this.currentTrialStartTime);
      this.currentTrialData.push({ x, y, t, event: "mousedown" });
    };
    this.mutationObserverCallback = (mutationsList, observer) => {
      for (const selector of this.currentTrialSelectors) {
        if (!this.currentTrialTargets.has(selector)) {
          const target = this.jsPsych.getDisplayElement().querySelector(selector);
          if (target) {
            this.currentTrialTargets.set(selector, target.getBoundingClientRect());
          }
        }
      }
    };
  }
  static {
    this.info = {
      name: "mouse-tracking",
      version,
      data: {
        /**
         * An array of objects containing mouse movement data for the trial. Each object has an `x`, a `y`,  a `t`, and an
         * `event` property. The `x` and `y` properties specify the mouse coordinates in pixels relative to the top left
         * corner of the viewport and `t` specifies the time in milliseconds since the start of the trial. The `event`
         * will be either 'mousemove', 'mousedown', or 'mouseup' depending on which event was generated.
         */
        mouse_tracking_data: {
          type: jspsych.ParameterType.COMPLEX,
          array: true,
          nested: {
            x: {
              type: jspsych.ParameterType.INT
            },
            y: {
              type: jspsych.ParameterType.INT
            },
            t: {
              type: jspsych.ParameterType.INT
            },
            event: {
              type: jspsych.ParameterType.STRING
            }
          }
        },
        /**
         * An object contain the pixel coordinates of elements on the screen specified by the `.targets` parameter. Each key
         * in this object will be a `selector` property, containing the CSS selector string used to find the element. The object
         * corresponding to each key will contain `x` and `y` properties specifying the top-left corner of the object, `width`
         * and `height` values, plus `top`, `bottom`, `left`, and `right` parameters which specify the
         * [bounding rectangle](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) of the element.
         */
        mouse_tracking_targets: {
          type: jspsych.ParameterType.COMPLEX,
          nested: {
            x: {
              type: jspsych.ParameterType.INT
            },
            y: {
              type: jspsych.ParameterType.INT
            },
            width: {
              type: jspsych.ParameterType.INT
            },
            height: {
              type: jspsych.ParameterType.INT
            },
            top: {
              type: jspsych.ParameterType.INT
            },
            bottom: {
              type: jspsych.ParameterType.INT
            },
            left: {
              type: jspsych.ParameterType.INT
            },
            right: {
              type: jspsych.ParameterType.INT
            }
          }
        }
      },
      // prettier-ignore
      citations: {
        "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
        "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
      }
    };
  }
}

module.exports = MouseTrackingExtension;
//# sourceMappingURL=index.cjs.map
