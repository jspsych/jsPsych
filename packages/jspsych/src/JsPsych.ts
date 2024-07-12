import autoBind from "auto-bind";

import { version } from "../package.json";
import { ExtensionManager, ExtensionManagerDependencies } from "./ExtensionManager";
import { JsPsychData, JsPsychDataDependencies } from "./modules/data";
import { PluginAPI, createJointPluginAPIObject } from "./modules/plugin-api";
import * as randomization from "./modules/randomization";
import * as turk from "./modules/turk";
import * as utils from "./modules/utils";
import { ProgressBar } from "./ProgressBar";
import {
  SimulationMode,
  SimulationOptionsParameter,
  TimelineArray,
  TimelineDescription,
  TimelineNodeDependencies,
  TimelineVariable,
  TrialResult,
} from "./timeline";
import { Timeline } from "./timeline/Timeline";
import { Trial } from "./timeline/Trial";
import { PromiseWrapper } from "./timeline/util";

export class JsPsych {
  turk = turk;
  randomization = randomization;
  utils = utils;
  data: JsPsychData;
  pluginAPI: PluginAPI;

  version() {
    return version;
  }

  /** Options */
  private options: any = {};

  /** Experiment timeline */
  private timeline?: Timeline;

  /** Target DOM element */
  private displayContainerElement: HTMLElement;
  private displayElement: HTMLElement;

  /** Time that the experiment began */
  private experimentStartTime: Date;

  /**
   * Whether the page is retrieved directly via the `file://` protocol (true) or hosted on a web
   * server (false)
   */
  private isFileProtocolUsed = false;

  /** The simulation mode (if the experiment is being simulated) */
  private simulationMode?: SimulationMode;

  /** Simulation options passed in via `simulate()` */
  private simulationOptions: Record<string, SimulationOptionsParameter>;

  private extensionManager: ExtensionManager;

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
    this.options = options;

    autoBind(this); // so we can pass JsPsych methods as callbacks and `this` remains the JsPsych instance

    // detect whether page is running in browser as a local file, and if so, disable web audio and
    // video preloading to prevent CORS issues
    if (
      window.location.protocol == "file:" &&
      (options.override_safe_mode === false || typeof options.override_safe_mode === "undefined")
    ) {
      options.use_webaudio = false;
      this.isFileProtocolUsed = true;
      console.warn(
        "jsPsych detected that it is running via the file:// protocol and not on a web server. " +
          "To prevent issues with cross-origin requests, Web Audio and video preloading have been disabled. " +
          "If you would like to override this setting, you can set 'override_safe_mode' to 'true' in initJsPsych. " +
          "For more information, see: https://www.jspsych.org/overview/running-experiments"
      );
    }

    // initialize modules
    this.data = new JsPsychData(this.dataDependencies);
    this.pluginAPI = createJointPluginAPIObject(this);

    this.extensionManager = new ExtensionManager(
      this.extensionManagerDependencies,
      options.extensions
    );
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
      console.error("No timeline declared in jsPsych.run(). Cannot start experiment.");
    }

    if (timeline.length === 0) {
      console.error(
        "No trials have been added to the timeline (the timeline is an empty array). Cannot start experiment."
      );
    }

    // create experiment timeline
    this.timeline = new Timeline(this.timelineDependencies, timeline);

    await this.prepareDom();
    await this.extensionManager.initializeExtensions();

    document.documentElement.setAttribute("jspsych", "present");

    this.experimentStartTime = new Date();

    await this.timeline.run();
    await Promise.resolve(this.options.on_finish(this.data.get()));

    if (this.endMessage) {
      this.getDisplayElement().innerHTML = this.endMessage;
    }

    this.data.removeInteractionListeners();
  }

  async simulate(
    timeline: any[],
    simulation_mode: "data-only" | "visual" = "data-only",
    simulation_options = {}
  ) {
    this.simulationMode = simulation_mode;
    this.simulationOptions = simulation_options;
    await this.run(timeline);
  }

  public progressBar?: ProgressBar;

  getProgress() {
    return {
      total_trials: this.timeline?.getNaiveTrialCount(),
      current_trial_global: this.timeline?.getLatestNode().index ?? 0,
      percent_complete: this.timeline?.getNaiveProgress() * 100,
    };
  }

  getStartTime() {
    return this.experimentStartTime; // TODO This seems inconsistent, given that `getTotalTime()` returns a number, not a `Date`
  }

  getTotalTime() {
    if (!this.experimentStartTime) {
      return 0;
    }
    return new Date().getTime() - this.experimentStartTime.getTime();
  }

  getDisplayElement() {
    return this.displayElement;
  }

  getDisplayContainerElement() {
    return this.displayContainerElement;
  }

  abortExperiment(endMessage?: string, data = {}) {
    this.endMessage = endMessage;
    this.timeline.abort();
    this.pluginAPI.cancelAllKeyboardResponses();
    this.pluginAPI.clearAllTimeouts();
    this.finishTrial(data);
  }

  abortCurrentTimeline() {
    let currentTimeline = this.timeline?.getLatestNode();
    if (currentTimeline instanceof Trial) {
      currentTimeline = currentTimeline.parent;
    }
    if (currentTimeline instanceof Timeline) {
      currentTimeline.abort();
    }
  }

  /**
   * Aborts a named timeline. The timeline must be currently running in order to abort it.
   *
   * @param name The name of the timeline to abort. Timelines can be given names by setting the `name` parameter in the description of the timeline.
   */
  abortTimelineByName(name: string): void {
    const timeline = this.timeline?.getActiveTimelineByName(name);
    if (timeline) {
      timeline.abort();
    }
  }

  getCurrentTrial() {
    const activeNode = this.timeline?.getLatestNode();
    if (activeNode instanceof Trial) {
      return activeNode.description;
    }
    return undefined;
  }

  getInitSettings() {
    return this.options;
  }

  timelineVariable(variableName: string) {
    return new TimelineVariable(variableName);
  }

  evaluateTimelineVariable(variableName: string) {
    return this.timeline
      ?.getLatestNode()
      ?.evaluateTimelineVariable(new TimelineVariable(variableName));
  }

  pauseExperiment() {
    this.timeline?.pause();
  }

  resumeExperiment() {
    this.timeline?.resume();
  }

  getSafeModeStatus() {
    return this.isFileProtocolUsed;
  }

  getTimeline() {
    return this.timeline?.description.timeline;
  }

  get extensions() {
    return this.extensionManager?.extensions ?? {};
  }

  private async prepareDom() {
    // Wait until the document is ready
    if (document.readyState !== "complete") {
      await new Promise((resolve) => {
        window.addEventListener("load", resolve);
      });
    }

    const options = this.options;

    // set DOM element where jsPsych will render content
    // if undefined, then jsPsych will use the <body> tag and the entire page
    if (typeof options.display_element === "undefined") {
      // check if there is a body element on the page
      let body = document.body;
      if (!body) {
        body = document.createElement("body");
        document.documentElement.appendChild(body);
      }
      // using the full page, so we need the HTML element to have 100% height, and body to be full
      // width and height with no margin
      document.querySelector("html").style.height = "100%";

      body.style.margin = "0px";
      body.style.height = "100%";
      body.style.width = "100%";
      options.display_element = body;
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

    const contentElement = document.createElement("div");
    contentElement.id = "jspsych-content";

    const contentWrapperElement = document.createElement("div");
    contentWrapperElement.className = "jspsych-content-wrapper";
    contentWrapperElement.appendChild(contentElement);

    this.displayContainerElement = options.display_element;
    this.displayContainerElement.appendChild(contentWrapperElement);
    this.displayElement = contentElement;

    // set experiment_width if not null
    if (options.experiment_width !== null) {
      this.displayElement.style.width = options.experiment_width + "px";
    }

    // add tabIndex attribute to scope event listeners
    options.display_element.tabIndex = 0;

    // Add CSS classes to container and display elements
    this.displayContainerElement.classList.add("jspsych-display-element");
    this.displayElement.classList.add("jspsych-content");

    // create listeners for user browser interaction
    this.data.createInteractionListeners();

    // add event for closing window
    window.addEventListener("beforeunload", options.on_close);

    if (this.options.show_progress_bar) {
      const progressBarContainer = document.createElement("div");
      progressBarContainer.id = "jspsych-progressbar-container";

      this.progressBar = new ProgressBar(progressBarContainer, this.options.message_progress_bar);

      this.getDisplayContainerElement().insertAdjacentElement("afterbegin", progressBarContainer);
    }
  }

  private finishTrialPromise = new PromiseWrapper<TrialResult | void>();
  finishTrial(data?: TrialResult) {
    this.finishTrialPromise.resolve(data);
  }

  private timelineDependencies: TimelineNodeDependencies = {
    onTrialStart: (trial: Trial) => {
      this.options.on_trial_start(trial.trialObject);

      // apply the focus to the element containing the experiment.
      this.getDisplayContainerElement().focus();
      // reset the scroll on the DOM target
      this.getDisplayElement().scrollTop = 0;
    },

    onTrialResultAvailable: (trial: Trial) => {
      const result = trial.getResult();
      if (result) {
        result.time_elapsed = this.getTotalTime();
        this.data.write(trial);
      }
    },

    onTrialFinished: (trial: Trial) => {
      const result = trial.getResult();
      this.options.on_trial_finish(result);

      if (result) {
        this.options.on_data_update(result);
      }

      if (this.progressBar && this.options.auto_update_progress_bar) {
        this.progressBar.progress = this.timeline.getNaiveProgress();
      }
    },

    runOnStartExtensionCallbacks: (extensionsConfiguration) =>
      this.extensionManager.onStart(extensionsConfiguration),

    runOnLoadExtensionCallbacks: (extensionsConfiguration) =>
      this.extensionManager.onLoad(extensionsConfiguration),

    runOnFinishExtensionCallbacks: (extensionsConfiguration) =>
      this.extensionManager.onFinish(extensionsConfiguration),

    getSimulationMode: () => this.simulationMode,

    getGlobalSimulationOptions: () => this.simulationOptions,

    instantiatePlugin: (pluginClass) => new pluginClass(this),

    getDisplayElement: () => this.getDisplayElement(),

    getDefaultIti: () => this.getInitSettings().default_iti,

    finishTrialPromise: this.finishTrialPromise,

    clearAllTimeouts: () => this.pluginAPI.clearAllTimeouts(),
  };

  private extensionManagerDependencies: ExtensionManagerDependencies = {
    instantiateExtension: (extensionClass) => new extensionClass(this),
  };

  private dataDependencies: JsPsychDataDependencies = {
    getProgress: () => ({
      time: this.getTotalTime(),
      trial: this.timeline?.getLatestNode().index ?? 0,
    }),

    onInteractionRecordAdded: (record) => {
      this.options.on_interaction_data_update(record);
    },

    getDisplayElement: () => this.getDisplayElement(),
  };
}
