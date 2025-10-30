import autoBind from "auto-bind";
// To work with citations
import { Class } from "type-fest";

import { version } from "../package.json";
import { ExtensionManager, ExtensionManagerDependencies } from "./ExtensionManager";
import { InteractionRecord, JsPsychData, JsPsychDataDependencies } from "./modules/data";
import { JsPsychExtension } from "./modules/extensions";
import { PluginAPI, createJointPluginAPIObject } from "./modules/plugin-api";
import { JsPsychPlugin } from "./modules/plugins";
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
  TrialDescription,
  TrialResult,
} from "./timeline";
import { Timeline } from "./timeline/Timeline";
import { Trial } from "./timeline/Trial";
import { PromiseWrapper } from "./timeline/util";
import { DataCollection } from "./modules/data/DataCollection";

export type PrepareDomResult = {
    displayContainerElement: HTMLElement;
    displayElement: HTMLElement;
    progressBar?: ProgressBar;
};

export type JsPsychConstructorOptions = {
  display_element?: HTMLElement,
  on_finish?: (arg: DataCollection) => void,
  on_trial_start?: (arg: TrialDescription) => void,
  on_trial_finish?: (arg: TrialResult) => void,
  on_data_update?: (arg: TrialResult) => void,
  on_interaction_data_update?: (d: InteractionRecord) => void,
  on_close?: () => void,
  use_webaudio?: boolean,
  show_progress_bar?: boolean,
  message_progress_bar?: string,
  auto_update_progress_bar?: boolean,
  default_iti?: number,
  minimum_valid_rt?: number,
  experiment_width?: number,
  override_safe_mode?: boolean,
  case_sensitive_responses?: boolean,
  extensions?: any[],
  prepareDom?: (jsPsych: JsPsych) => Promise<PrepareDomResult>,
  main_eventSource?: GlobalEventSource,
  [x: string | number | symbol]: unknown; // allow for additional unknown properties
};

export interface GlobalEventSource {
  addEventListener<K extends keyof GlobalEventHandlersEventMap>(type: K, listener: (this: GlobalEventSource, ev: GlobalEventHandlersEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof GlobalEventHandlersEventMap>(type: K, listener: (this: GlobalEventSource, ev: GlobalEventHandlersEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
}

export class JsPsych {
  turk = turk;
  randomization = randomization;
  utils = utils;
  data: JsPsychData;
  pluginAPI: PluginAPI;

  version() {
    return version;
  }

  // prettier-ignore
  private citation: any = '__CITATIONS__';

  /** Options */
  private options: JsPsychConstructorOptions = {};

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

  constructor(options?: JsPsychConstructorOptions) {
    // override default options if user specifies an option
    options = {
      display_element: undefined,
      main_eventSource: undefined, 
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

    if (this.options.prepareDom) {
      const pdResult = await this.options.prepareDom(this);
      this.displayContainerElement = pdResult.displayContainerElement;
      this.displayElement = pdResult.displayElement;
      this.progressBar = pdResult.progressBar;
    } else {
      await this.prepareDom();
    }
    await this.extensionManager.initializeExtensions();

    if (!this.options.prepareDom) document.documentElement.setAttribute("jspsych", "present");

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

  getMainEventSource(): GlobalEventSource {
    return this.options.main_eventSource || this.displayContainerElement;
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

  /**
   * Prints out a string containing citations for the jsPsych library and all input plugins/extensions in the specified format.
   * If called without input, prints citation for jsPsych library.
   *
   * @param plugins The plugins/extensions to generate citations for. Always prints the citation for the jsPsych library at the top.
   * @param format The desired output citation format. Currently supports "apa" and "bibtex".
   * @returns String containing citations separated with newline character.
   */
  getCitations(
    plugins: Array<Class<JsPsychPlugin<any>> | Class<JsPsychExtension>> = [],
    format: "apa" | "bibtex" = "apa"
  ) {
    const formatOptions = ["apa", "bibtex"];
    format = format.toLowerCase() as "apa" | "bibtex";
    // Check if plugins is an array
    if (!Array.isArray(plugins)) {
      throw new Error("Expected array of plugins/extensions");
    }
    // Check if format is supported
    else if (!formatOptions.includes(format)) {
      throw new Error("Unsupported citation format");
    }
    // Print citations
    else {
      const jsPsychCitation = this.citation[format];
      const citationSet = new Set([jsPsychCitation]);

      for (const plugin of plugins) {
        try {
          const pluginCitation = plugin["info"].citations[format];
          citationSet.add(pluginCitation);
        } catch {
          console.error(`${plugin} does not have citation in ${format} format.`);
        }
      }
      const citationList = Array.from(citationSet).join("\n");
      return citationList;
    }
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
        if (display instanceof HTMLElement)
          options.display_element = display;
        else
          throw new Error(`display not an HTMLElement`);
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
