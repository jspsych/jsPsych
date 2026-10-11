import autoBind from "auto-bind";
// To work with citations
import { Class } from "type-fest";

import { version } from "../package.json";
import { ExtensionManager, ExtensionManagerDependencies } from "./ExtensionManager";
import { JsPsychData, JsPsychDataDependencies } from "./modules/data";
import { JsPsychExtension } from "./modules/extensions";
import { PluginAPI, createJointPluginAPIObject } from "./modules/plugin-api";
import { JsPsychPlugin } from "./modules/plugins";
import * as randomization from "./modules/randomization";
import { DEFAULT_BLOCK_MESSAGE, SessionRecorder, isPlainObject } from "./modules/resume";
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

/**
 * The seed that a `JsPsych` instance most recently applied on its own. `Math.random()` is global,
 * so this is tracked at the module level: it lets a second instance created in the same page tell a
 * seed that the user set apart from the one that a previous instance applied automatically.
 */
let lastAutoAppliedSeed: string | undefined;

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

  /** Records and replays the session when the `resume` option is used */
  private sessionRecorder?: SessionRecorder;

  /** The timeline description that `run()` was called with */
  private timelineDescription?: TimelineDescription | TimelineArray;

  /** Whether the experiment is currently being run by `runExperiment()` */
  private isRunning = false;

  /** Whether `resetSession()` has asked the experiment to start over */
  private isRestartRequested = false;

  /** Whether `prepareDom()` has set up the display element already */
  private isDomPrepared = false;

  /** Whether the extensions have been initialized already */
  private areExtensionsInitialized = false;

  /**
   * Discards the saved session and starts the experiment over from the beginning, without a page
   * reload.
   *
   * Everything that jsPsych controls is reset: the data, `jsPsych.state`, the experiment clock, the
   * progress bar, and the session that the `resume` option saves. The timeline is then run again
   * from its first trial. Variables in your own code, and the timeline arrays that your code has
   * already built, are not affected.
   *
   * The method can be called at any point: before `run()` (where it only discards the saved
   * session), while the experiment is running, on a page that the `resume` option blocked, and
   * after the experiment has ended. It returns immediately; the restart happens once the running
   * timeline has unwound.
   *
   * https://www.jspsych.org/latest/overview/resume/
   */
  resetSession() {
    if (this.isRunning) {
      // The rest of the reset is carried out by the run loop in `runExperiment()`, once the aborted
      // timeline has unwound and the trial that is in flight has finished. The saved session is
      // discarded right away, so that reloading the page immediately after this call (rather than
      // letting the experiment restart in place) does not resume the abandoned session.
      this.isRestartRequested = true;
      this.sessionRecorder?.clear();

      // There is no timeline to abort while the run is still being set up
      this.timeline?.abort();
      this.pluginAPI.cancelAllKeyboardResponses();
      this.pluginAPI.clearAllTimeouts();
      this.finishTrial();
      return;
    }

    if (!this.timelineDescription) {
      // `run()` has not been called yet, so there is no experiment to restart. Discarding the saved
      // session is all it takes for the upcoming run to start from the beginning and to record a
      // new session.
      if (this.sessionRecorder) {
        this.sessionRecorder.clear();
        this.resetState();
      }
      return;
    }

    // The experiment has ended, or it was blocked by the `resume` option and never started. Either
    // way, it is run again in place of the end screen or the block message.
    this.resetExperiment();
    void this.runExperiment();
  }

  /**
   * Resets everything that jsPsych controls to the state of a fresh run: the saved session,
   * `jsPsych.state`, the data, the experiment clock, and the progress bar. The display element,
   * the extensions, and the timeline description are left alone, because they are set up once per
   * page load.
   */
  private resetExperiment() {
    this.sessionRecorder?.clear();
    this.resetState();

    // Note that this keeps the properties added with `data.addProperties()`, which `state`'s
    // `_data_properties` key mirrors
    this.data.reset();

    this.experimentStartTime = new Date();
    this.progressBar?.setProgress(0);
    this.endMessage = undefined;
  }

  /**
   * Replaces `jsPsych.state` with the object that a fresh run starts out with. `_progress` and
   * `_resumes` describe the run that is being discarded, so they are dropped; the two other
   * reserved keys have to survive.
   */
  private resetState() {
    const state: Record<string, any> = {};

    // The seed is deliberately kept as it is rather than being regenerated: the timeline that the
    // restarted run executes was built with the draws of this seed, so it has to stay the seed that
    // a later page reload applies. That reload then rebuilds an identical timeline, which is what
    // the replay of the newly recorded session has to line up with.
    if (typeof this.state._rng_seed === "string") {
      state._rng_seed = this.state._rng_seed;
    }

    // `data.reset()` does not discard the properties added with `data.addProperties()` (they are
    // page-load configuration, such as a participant ID, that the experiment cannot apply again),
    // so their mirror in the state is preserved along with them
    if (isPlainObject(this.state._data_properties)) {
      state._data_properties = this.state._data_properties;
    }

    this.state = state;
  }

  /** The state object that is used when the `resume` option is not set */
  private inMemoryState: Record<string, any> = {};

  /**
   * A JSON-serializable object for storing the state of the experiment. When the `resume` option is
   * used, it is persisted with the session and restored when the session is resumed; otherwise it
   * is an ordinary in-memory store. jsPsych itself writes the reserved `_rng_seed`,
   * `_data_properties`, `_progress`, and `_resumes` keys.
   *
   * https://www.jspsych.org/latest/overview/resume/
   */
  get state(): Record<string, any> {
    return this.sessionRecorder?.state ?? this.inMemoryState;
  }

  set state(state: Record<string, any>) {
    if (this.sessionRecorder) {
      this.sessionRecorder.state = state;
    } else {
      this.inMemoryState = state;
    }
  }

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
      resume: undefined,
      ...options,
    };
    this.options = options;

    if (options.resume) {
      this.sessionRecorder = new SessionRecorder({
        ...options.resume,
        getElapsedTime: () => this.getTotalTime(),
        onReplayComplete: () => {
          options.resume.on_resume?.(this.data.get());
        },
      });

      // Loading here rather than in `run()` makes the saved state (including the seed below)
      // available while the user's code builds the timeline
      this.sessionRecorder.load();
    }

    this.initializeSeed();

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

  /**
   * Seeds the random number generator and stores the seed in `state._rng_seed`, so that a page that
   * is reloaded reproduces the random draws of the interrupted session.
   *
   * Seeding happens at construction, before the user's code builds the timeline, because that is
   * the only way to make build-time randomization (a shuffled array of timeline variables, for
   * instance) come out the same way twice. A reloaded page therefore reconstructs an identical
   * timeline and the replay of the saved session stays aligned with it.
   *
   * Note that this replaces `Math.random()` for the whole page, and that it happens whether or not
   * the `resume` option is used.
   */
  private initializeSeed() {
    const trackedSeed = randomization.getSeed();

    if (typeof trackedSeed === "string" && trackedSeed !== lastAutoAppliedSeed) {
      // The user seeded the generator themselves before creating this instance; adopt their seed
      // instead of overriding it
      this.state._rng_seed = trackedSeed;
    } else if (typeof this.state._rng_seed === "string") {
      // Restored from a saved session
      randomization.setSeed(this.state._rng_seed);
    } else {
      this.state._rng_seed = randomization.setSeed();
    }

    lastAutoAppliedSeed = this.state._rng_seed;
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

    // Stored so that `resetSession()` can run the timeline again at any later point, including
    // after a blocked run has returned without running anything
    this.timelineDescription = timeline;

    if (this.sessionRecorder?.isBlocked()) {
      // A saved session that the `incomplete_session` or `completed_session` policy blocks was found,
      // so the experiment is not run at all. `resetSession()` can still start it later.
      await this.prepareDom();
      this.getDisplayElement().innerHTML =
        this.options.resume.block_message ?? DEFAULT_BLOCK_MESSAGE;
      return;
    }

    await this.runExperiment();
  }

  /**
   * Runs the timeline description that `run()` was called with, and applies the effects that end a
   * run once it is done. A `resetSession()` call that is made while the timeline runs starts the
   * loop over instead of ending the run.
   */
  private async runExperiment() {
    // Set before the first `await` so that a `resetSession()` call that is made while the run is
    // being set up is recognized as one that happens during a run
    this.isRunning = true;

    await this.prepareDom();

    if (!this.areExtensionsInitialized) {
      this.areExtensionsInitialized = true;
      await this.extensionManager.initializeExtensions();
    }

    document.documentElement.setAttribute("jspsych", "present");

    this.data.createInteractionListeners();

    do {
      this.isRestartRequested = false;

      // create experiment timeline
      this.timeline = new Timeline(this.timelineDependencies, this.timelineDescription);

      this.experimentStartTime = new Date();

      if (this.sessionRecorder) {
        if (
          this.progressBar &&
          !this.options.auto_update_progress_bar &&
          typeof this.state._progress === "number"
        ) {
          // Restore a position that was set manually before the session was interrupted
          this.progressBar.setProgress(this.state._progress);
        }

        const restoredElapsedTime = this.sessionRecorder.getRestoredElapsedTime();
        if (restoredElapsedTime > 0) {
          // Continue the experiment clock where the interrupted session left off
          this.experimentStartTime = new Date(Date.now() - restoredElapsedTime);
        }
      }

      await this.timeline.run();

      if (this.isRestartRequested) {
        // `resetSession()` was called while the experiment was running, so none of the effects that
        // end a run apply. Everything jsPsych controls is reset and the timeline is run again.
        this.resetExperiment();
      }
    } while (this.isRestartRequested);

    this.isRunning = false;

    if (this.sessionRecorder) {
      // In case the saved session ended exactly at the end of the experiment
      this.sessionRecorder.checkReplayTransition();
      this.sessionRecorder.end();
    }

    await Promise.resolve(this.options.on_finish(this.data.get()));

    if (this.isRunning) {
      // `on_finish` called `resetSession()`, so the experiment is running again and this run must
      // not clean up after itself anymore
      return;
    }

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
    if (this.isDomPrepared) {
      // The display element is set up once per page load and reused by a restarted experiment
      return;
    }

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

    // add event for closing window
    window.addEventListener("beforeunload", options.on_close);

    if (this.options.show_progress_bar) {
      const progressBarContainer = document.createElement("div");
      progressBarContainer.id = "jspsych-progressbar-container";

      this.progressBar = new ProgressBar(
        progressBarContainer,
        this.options.message_progress_bar,
        (progress) => {
          this.state._progress = progress;
        }
      );

      this.getDisplayContainerElement().insertAdjacentElement("afterbegin", progressBarContainer);
    }

    this.isDomPrepared = true;
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
        if (!trial.wasResultReplayed()) {
          // Replayed results carry the `time_elapsed` value of the original run. Re-stamping it
          // would replace the actual trial timing with the time it took to replay the session.
          result.time_elapsed = this.getTotalTime();
        }
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
        // `setProgress()` instead of the `progress` setter: automatic updates are recomputed from
        // the timeline after a resume, so there is no need to persist them
        this.progressBar.setProgress(this.timeline.getNaiveProgress());
      }

      // Persisted here (rather than in `onTrialResultAvailable`) so that data added by extensions
      // and `on_finish` callbacks is part of the saved result. A pending `resetSession()` discards
      // the session that this trial belongs to, so recording it would write the session that is
      // about to be deleted back to storage.
      if (this.sessionRecorder && !this.isRestartRequested) {
        this.sessionRecorder.recordTrial(result ?? null, trial.getRerunLogIndex());
        this.sessionRecorder.persist();
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

    getSessionRecorder: () => this.sessionRecorder,
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

    getInitialDataProperties: () =>
      isPlainObject(this.state._data_properties) ? this.state._data_properties : {},

    onDataPropertiesChanged: (properties) => {
      this.state._data_properties = { ...properties };
    },
  };
}
