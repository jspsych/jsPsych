import { JsPsych, JsPsychExtension, JsPsychExtensionInfo } from "jspsych";

interface InitializeParameters {
  /**
   * The minimum time between mouse samples. If mouse events occur more rapidly than this limit, they will
   * not be recorded. Use this if you want to keep the data files smaller and don't need high resolution
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
  targets: Array<string>;
}

class MouseTrackingExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "mouse-tracking",
  };

  constructor(private jsPsych: JsPsych) {}

  private domObserver: MutationObserver;
  private currentTrialData: Array<object>;
  private currentTrialTargets: Map<string, DOMRect>;
  private currentTrialSelectors: Array<string>;
  private currentTrialStartTime: number;
  private minimumSampleTime: number;
  private lastSampleTime: number;

  initialize = ({ minimum_sample_time = 0 }: InitializeParameters): Promise<void> => {
    this.domObserver = new MutationObserver(this.mutationObserverCallback);
    this.minimumSampleTime = minimum_sample_time;

    return new Promise((resolve, reject) => {
      resolve();
    });
  };

  on_start = (params: OnStartParameters): void => {
    this.currentTrialData = [];
    this.currentTrialTargets = new Map();
    this.currentTrialSelectors = typeof params !== "undefined" ? params.targets : [];
    this.lastSampleTime = null;

    this.domObserver.observe(this.jsPsych.getDisplayElement(), { childList: true });
  };

  on_load = () => {
    // set current trial start time
    this.currentTrialStartTime = performance.now();

    // start data collection
    window.addEventListener("mousemove", this.mouseEventHandler);
  };

  on_finish = () => {
    this.domObserver.disconnect();

    window.removeEventListener("mousemove", this.mouseEventHandler);

    return {
      mouse_tracking_data: this.currentTrialData,
      mouse_tracking_targets: this.currentTrialTargets,
    };
  };

  private mouseEventHandler = (e) => {
    const x = e.clientX;
    const y = e.clientY;

    const event_time = performance.now();
    const t = Math.round(event_time - this.currentTrialStartTime);

    if (
      this.lastSampleTime === null ||
      event_time - this.lastSampleTime >= this.minimumSampleTime
    ) {
      this.lastSampleTime = event_time;
      this.currentTrialData.push({ x, y, t });
    }
  };

  private mutationObserverCallback = (mutationsList, observer) => {
    for (const selector of this.currentTrialSelectors) {
      if (!this.currentTrialTargets[selector]) {
        if (this.jsPsych.getDisplayElement().querySelector(selector)) {
          var coords = this.jsPsych
            .getDisplayElement()
            .querySelector(selector)
            .getBoundingClientRect();
          this.currentTrialTargets[selector] = coords;
        }
      }
    }
  };
}

export default MouseTrackingExtension;
