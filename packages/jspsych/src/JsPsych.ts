import autoBind from "auto-bind";

import { version } from "../package.json";
import { JsPsychData } from "./modules/data";
import { PluginAPI, createJointPluginAPIObject } from "./modules/plugin-api";
import * as randomization from "./modules/randomization";
import * as turk from "./modules/turk";
import * as utils from "./modules/utils";
import { TimelineArray, TimelineDescription, TimelineVariable, TrialResult } from "./timeline";
import { Timeline } from "./timeline/Timeline";
import { PromiseWrapper } from "./timeline/util";

export class JsPsych {
  extensions = <any>{};
  turk = turk;
  randomization = randomization;
  utils = utils;
  data: JsPsychData;
  pluginAPI: PluginAPI;

  version() {
    return version;
  }

  //
  // private variables
  //

  /**
   * options
   */
  private opts: any = {};

  /**
   * experiment timeline
   */
  private timeline: Timeline;

  // flow control
  private global_trial_index = 0;
  private current_trial: any = {};

  // target DOM element
  private DOM_container: HTMLElement;
  private DOM_target: HTMLElement;

  /**
   * time that the experiment began
   */
  private exp_start_time;

  /**
   * is the page retrieved directly via file:// protocol (true) or hosted on a server (false)?
   */
  private file_protocol = false;

  /**
   * is the experiment running in `simulate()` mode
   */
  private simulation_mode: "data-only" | "visual" = null;

  /**
   * simulation options passed in via `simulate()`
   */
  private simulation_options;

  internal = {
    /**
     * this flag is used to determine whether we are in a scope where
     * jsPsych.timelineVariable() should be executed immediately or
     * whether it should return a function to access the variable later.
     *
     **/
    call_immediate: false,
  };

  constructor(options?) {
    // override default options if user specifies an option
    options = {
      display_element: undefined,
      on_finish: () => {},
      on_trial_start: () => {},
      on_trial_finish: () => {},
      on_data_update: () => {},
      on_interaction_data_update: () => {},
      on_close: () => {},
      use_webaudio: true,
      exclusions: {},
      show_progress_bar: false,
      message_progress_bar: "Completion Progress",
      auto_update_progress_bar: true,
      default_iti: 0,
      minimum_valid_rt: 0,
      experiment_width: null,
      override_safe_mode: false,
      case_sensitive_responses: false,
      extensions: [],
      ...options,
    };
    this.opts = options;

    autoBind(this); // so we can pass JsPsych methods as callbacks and `this` remains the JsPsych instance

    // detect whether page is running in browser as a local file, and if so, disable web audio and video preloading to prevent CORS issues
    if (
      window.location.protocol == "file:" &&
      (options.override_safe_mode === false || typeof options.override_safe_mode === "undefined")
    ) {
      options.use_webaudio = false;
      this.file_protocol = true;
      console.warn(
        "jsPsych detected that it is running via the file:// protocol and not on a web server. " +
          "To prevent issues with cross-origin requests, Web Audio and video preloading have been disabled. " +
          "If you would like to override this setting, you can set 'override_safe_mode' to 'true' in initJsPsych. " +
          "For more information, see: https://www.jspsych.org/overview/running-experiments"
      );
    }

    // initialize modules
    this.data = new JsPsychData(this);
    this.pluginAPI = createJointPluginAPIObject(this);

    // create instances of extensions
    for (const extension of options.extensions) {
      this.extensions[extension.type.info.name] = new extension.type(this);
    }
  }

  private endMessage?: string;

  /**
   * Starts an experiment using the provided timeline and returns a promise that is resolved when
   * the experiment is finished.
   *
   * @param timeline The timeline to be run
   */
  async run(timeline: TimelineDescription | TimelineArray) {
    if (typeof timeline === "undefined") {
      console.error("No timeline declared in jsPsych.run. Cannot start experiment.");
    }

    if (timeline.length === 0) {
      console.error(
        "No trials have been added to the timeline (the timeline is an empty array). Cannot start experiment."
      );
    }

    // create experiment timeline
    this.timeline = new Timeline(this, timeline);

    await this.prepareDom();
    await this.loadExtensions(this.opts.extensions);

    document.documentElement.setAttribute("jspsych", "present");

    await this.timeline.run();
    await Promise.resolve(this.opts.on_finish(this.data.get()));

    if (this.endMessage) {
      this.getDisplayElement().innerHTML = this.endMessage;
    }
  }

  async simulate(
    timeline: any[],
    simulation_mode: "data-only" | "visual" = "data-only",
    simulation_options = {}
  ) {
    this.simulation_mode = simulation_mode;
    this.simulation_options = simulation_options;
    await this.run(timeline);
  }

  getProgress() {
    return {
      total_trials: this.timeline?.getNaiveTrialCount(),
      current_trial_global: this.global_trial_index,
      percent_complete: this.timeline?.getProgress() * 100,
    };
  }

  getStartTime() {
    return this.exp_start_time;
  }

  getTotalTime() {
    if (typeof this.exp_start_time === "undefined") {
      return 0;
    }
    return new Date().getTime() - this.exp_start_time.getTime();
  }

  getDisplayElement() {
    return this.DOM_target;
  }

  /**
   * Adds the provided css classes to the display element
   */
  addCssClasses(classes: string[]) {
    this.getDisplayElement().classList.add(...classes);
  }

  /**
   * Removes the provided css classes from the display element
   */
  removeCssClasses(classes: string[]) {
    this.getDisplayElement().classList.remove(...classes);
  }

  getDisplayContainerElement() {
    return this.DOM_container;
  }

  focusDisplayContainerElement() {
    // apply the focus to the element containing the experiment.
    this.getDisplayContainerElement().focus();
    // reset the scroll on the DOM target
    this.getDisplayElement().scrollTop = 0;
  }

  // TODO Should this be called `abortExperiment()`?
  endExperiment(endMessage?: string, data = {}) {
    this.endMessage = endMessage;
    this.timeline.abort();
    this.pluginAPI.cancelAllKeyboardResponses();
    this.pluginAPI.clearAllTimeouts();
    this.finishTrial(data);
  }

  endCurrentTimeline() {
    // this.timeline.endActiveNode();
  }

  getCurrentTrial() {
    return this.current_trial;
  }

  getInitSettings() {
    return this.opts;
  }

  timelineVariable(varname: string) {
    if (this.internal.call_immediate) {
      return undefined;
    } else {
      return new TimelineVariable(varname);
    }
  }

  pauseExperiment() {
    this.timeline.pause();
  }

  resumeExperiment() {
    this.timeline.resume();
  }

  private loadFail(message) {
    message = message || "<p>The experiment failed to load.</p>";
    this.DOM_target.innerHTML = message;
  }

  getSafeModeStatus() {
    return this.file_protocol;
  }

  getTimeline() {
    return this.timeline?.description;
  }

  private async prepareDom() {
    // Wait until the document is ready
    if (document.readyState !== "complete") {
      await new Promise((resolve) => {
        window.addEventListener("load", resolve);
      });
    }

    const options = this.opts;

    // set DOM element where jsPsych will render content
    // if undefined, then jsPsych will use the <body> tag and the entire page
    if (typeof options.display_element === "undefined") {
      // check if there is a body element on the page
      const body = document.querySelector("body");
      if (body === null) {
        document.documentElement.appendChild(document.createElement("body"));
      }
      // using the full page, so we need the HTML element to
      // have 100% height, and body to be full width and height with
      // no margin
      document.querySelector("html").style.height = "100%";
      document.querySelector("body").style.margin = "0px";
      document.querySelector("body").style.height = "100%";
      document.querySelector("body").style.width = "100%";
      options.display_element = document.querySelector("body");
    } else {
      // make sure that the display element exists on the page
      const display =
        options.display_element instanceof Element
          ? options.display_element
          : document.querySelector("#" + options.display_element);
      if (display === null) {
        console.error("The display_element specified in initJsPsych() does not exist in the DOM.");
      } else {
        options.display_element = display;
      }
    }

    options.display_element.innerHTML =
      '<div class="jspsych-content-wrapper"><div id="jspsych-content"></div></div>';
    this.DOM_container = options.display_element;
    this.DOM_target = document.querySelector("#jspsych-content");

    // set experiment_width if not null
    if (options.experiment_width !== null) {
      this.DOM_target.style.width = options.experiment_width + "px";
    }

    // add tabIndex attribute to scope event listeners
    options.display_element.tabIndex = 0;

    // add CSS class to DOM_target
    if (options.display_element.className.indexOf("jspsych-display-element") === -1) {
      options.display_element.className += " jspsych-display-element";
    }
    this.DOM_target.className += "jspsych-content";

    // create listeners for user browser interaction
    this.data.createInteractionListeners();

    // add event for closing window
    window.addEventListener("beforeunload", options.on_close);
  }

  private async loadExtensions(extensions) {
    // run the .initialize method of any extensions that are in use
    // these should return a Promise to indicate when loading is complete

    try {
      await Promise.all(
        extensions.map((extension) =>
          this.extensions[extension.type.info.name].initialize(extension.params ?? {})
        )
      );
    } catch (error_message) {
      throw new Error(error_message);
    }
  }

  private drawProgressBar(msg) {
    document
      .querySelector(".jspsych-display-element")
      .insertAdjacentHTML(
        "afterbegin",
        '<div id="jspsych-progressbar-container">' +
          "<span>" +
          msg +
          "</span>" +
          '<div id="jspsych-progressbar-outer">' +
          '<div id="jspsych-progressbar-inner"></div>' +
          "</div></div>"
      );
  }

  private updateProgressBar() {
    this.setProgressBar(this.getProgress().percent_complete / 100);
  }

  private progress_bar_amount = 0;

  setProgressBar(proportion_complete) {
    proportion_complete = Math.max(Math.min(1, proportion_complete), 0);
    document.querySelector<HTMLElement>("#jspsych-progressbar-inner").style.width =
      proportion_complete * 100 + "%";
    this.progress_bar_amount = proportion_complete;
  }

  getProgressBarCompleted() {
    return this.progress_bar_amount;
  }

  // New stuff as replacements for old methods:

  finishTrialPromise = new PromiseWrapper<TrialResult>();
  finishTrial(data?: TrialResult) {
    this.finishTrialPromise.resolve(data);
  }
}
