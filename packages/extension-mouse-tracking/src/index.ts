import { JsPsych, JsPsychExtension, JsPsychExtensionInfo, ParameterType } from "jspsych";

import { version } from "../package.json";

interface InitializeParameters {
  /**
   * The minimum time between samples for `mousemove` events in milliseconds.
   * If `mousemove` events occur more rapidly than this limit, they will not be recorded.
   * Use this if you want to keep the data files smaller and don't need high resolution
   * tracking data. The default value of 0 means that all events will be recorded.
   * @default 0
   */
  minimum_sample_time: number;
}

interface OnStartParameters {
  /**
   * An array of string selectors. The selectors should identify one unique element on the page.
   * The DOMRect of the element will be stored in the data.
   */
  targets?: Array<string>;
  /**
   * An array of mouse events to track. Can include `"mousemove"`, `"mousedown"`, and `"mouseup"`.
   * @default ['mousemove']
   */
  events?: Array<string>;
}

/**
 * https://www.jspsych.org/latest/extensions/mouse-tracking/
 */
class MouseTrackingExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "mouse-tracking",
    version: version,
    data: {
      /**
       * An array of objects containing mouse movement data for the trial. Each object has an `x`, a `y`,  a `t`, and an
       * `event` property. The `x` and `y` properties specify the mouse coordinates in pixels relative to the top left
       * corner of the viewport and `t` specifies the time in milliseconds since the start of the trial. The `event`
       * will be either 'mousemove', 'mousedown', or 'mouseup' depending on which event was generated.
       */
      mouse_tracking_data: {
        type: ParameterType.COMPLEX,
        array: true,
        nested: {
          x: {
            type: ParameterType.INT,
          },
          y: {
            type: ParameterType.INT,
          },
          t: {
            type: ParameterType.INT,
          },
          event: {
            type: ParameterType.STRING,
          },
        },
      },
      /**
       * An object contain the pixel coordinates of elements on the screen specified by the `.targets` parameter. Each key
       * in this object will be a `selector` property, containing the CSS selector string used to find the element. The object
       * corresponding to each key will contain `x` and `y` properties specifying the top-left corner of the object, `width`
       * and `height` values, plus `top`, `bottom`, `left`, and `right` parameters which specify the
       * [bounding rectangle](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) of the element.
       */
      mouse_tracking_targets: {
        type: ParameterType.COMPLEX,
        nested: {
          x: {
            type: ParameterType.INT,
          },
          y: {
            type: ParameterType.INT,
          },
          width: {
            type: ParameterType.INT,
          },
          height: {
            type: ParameterType.INT,
          },
          top: {
            type: ParameterType.INT,
          },
          bottom: {
            type: ParameterType.INT,
          },
          left: {
            type: ParameterType.INT,
          },
          right: {
            type: ParameterType.INT,
          },
        },
      },
    },
  };

  constructor(private jsPsych: JsPsych) {}

  private domObserver: MutationObserver;
  private currentTrialData: Array<object>;
  private currentTrialTargets: Map<string, DOMRect>;
  private currentTrialSelectors: Array<string>;
  private currentTrialStartTime: number;
  private minimumSampleTime: number;
  private lastSampleTime: number;
  private eventsToTrack: Array<string>;

  initialize = async ({ minimum_sample_time = 0 }: InitializeParameters) => {
    this.domObserver = new MutationObserver(this.mutationObserverCallback);
    this.minimumSampleTime = minimum_sample_time;
  };

  on_start = (params: OnStartParameters): void => {
    params = params || {};

    this.currentTrialData = [];
    this.currentTrialTargets = new Map();
    this.currentTrialSelectors = params.targets || [];
    this.lastSampleTime = null;
    this.eventsToTrack = params.events || ["mousemove"];

    this.domObserver.observe(this.jsPsych.getDisplayElement(), { childList: true });
  };

  on_load = () => {
    // set current trial start time
    this.currentTrialStartTime = performance.now();

    // start data collection
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

  on_finish = () => {
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
      mouse_tracking_targets: Object.fromEntries(this.currentTrialTargets.entries()),
    };
  };

  private mouseMoveEventHandler = ({ clientX: x, clientY: y }: MouseEvent) => {
    const event_time = performance.now();
    const t = Math.round(event_time - this.currentTrialStartTime);

    if (
      this.lastSampleTime === null ||
      event_time - this.lastSampleTime >= this.minimumSampleTime
    ) {
      this.lastSampleTime = event_time;
      this.currentTrialData.push({ x, y, t, event: "mousemove" });
    }
  };

  private mouseUpEventHandler = ({ clientX: x, clientY: y }: MouseEvent) => {
    const event_time = performance.now();
    const t = Math.round(event_time - this.currentTrialStartTime);

    this.currentTrialData.push({ x, y, t, event: "mouseup" });
  };

  private mouseDownEventHandler = ({ clientX: x, clientY: y }: MouseEvent) => {
    const event_time = performance.now();
    const t = Math.round(event_time - this.currentTrialStartTime);

    this.currentTrialData.push({ x, y, t, event: "mousedown" });
  };

  private mutationObserverCallback = (mutationsList, observer) => {
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

export default MouseTrackingExtension;
