import autoBind from "auto-bind";

import { version } from "../package.json";
import { JsPsychData } from "./modules/data";
import { PluginAPI, createJointPluginAPIObject } from "./modules/plugin-api";
import { ParameterType, universalPluginParameters } from "./modules/plugins";
import * as randomization from "./modules/randomization";
import * as turk from "./modules/turk";
import * as utils from "./modules/utils";
import { TimelineNode } from "./TimelineNode";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  private timeline: TimelineNode;

  // flow control
  private global_trial_index = 0;
  private current_trial: any = {};
  private current_trial_finished = false;

  // target DOM element
  private DOM_container: HTMLElement;
  private DOM_target: HTMLElement;

  /**
   * time that the experiment began
   */
  private exp_start_time;

  /**
   * is the experiment paused?
   */
  private paused = false;
  private waiting = false;

  /**
   * is the page retrieved directly via file:// protocol (true) or hosted on a server (false)?
   */
  private file_protocol = false;

  /**
   * Promise that is resolved when `finishExperiment()` is called
   */
  private finished: Promise<void>;
  private resolveFinishedPromise: () => void;

  // storing a single webaudio context to prevent problems with multiple inits
  // of jsPsych
  webaudio_context: AudioContext = null;

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

    autoBind(this); // just in case people do weird things with JsPsych methods

    this.webaudio_context =
      typeof window !== "undefined" && typeof window.AudioContext !== "undefined"
        ? new AudioContext()
        : null;

    // detect whether page is running in browser as a local file, and if so, disable web audio and video preloading to prevent CORS issues
    if (
      window.location.protocol == "file:" &&
      (options.override_safe_mode === false || typeof options.override_safe_mode == "undefined")
    ) {
      options.use_webaudio = false;
      this.file_protocol = true;
      console.warn(
        "jsPsych detected that it is running via the file:// protocol and not on a web server. " +
          "To prevent issues with cross-origin requests, Web Audio and video preloading have been disabled. " +
          "If you would like to override this setting, you can set 'override_safe_mode' to 'true' in jsPsych.init. " +
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

    // initialize audio context based on options and browser capabilities
    this.pluginAPI.initAudio();
  }

  /**
   * Starts an experiment using the provided timeline and returns a promise that is resolved when
   * the experiment is finished.
   *
   * @param timeline The timeline to be run
   */
  async run(timeline: any[]) {
    if (typeof timeline === "undefined") {
      console.error("No timeline declared in jsPsych.run. Cannot start experiment.");
    }

    if (timeline.length == 0) {
      console.error(
        "No trials have been added to the timeline (the timeline is an empty array). Cannot start experiment."
      );
    }

    // create experiment timeline
    this.timeline = new TimelineNode(this, { timeline });

    await this.prepareDom();
    await this.checkExclusions(this.opts.exclusions);
    await this.loadExtensions(this.opts.extensions);

    document.documentElement.setAttribute("jspsych", "present");

    // Register preloading for the plugins referenced in the timeline
    for (const [pluginName, parameters] of this.timeline.extractPreloadParameters()) {
      for (const [parameter, type] of Object.entries(parameters)) {
        this.pluginAPI.registerPreload(pluginName, parameter, type);
      }
    }

    this.startExperiment();
    await this.finished;
  }

  progress() {
    return {
      total_trials: typeof this.timeline === "undefined" ? undefined : this.timeline.length(),
      current_trial_global: this.global_trial_index,
      percent_complete: typeof this.timeline === "undefined" ? 0 : this.timeline.percentComplete(),
    };
  }

  startTime() {
    return this.exp_start_time;
  }

  totalTime() {
    if (typeof this.exp_start_time == "undefined") {
      return 0;
    }
    return new Date().getTime() - this.exp_start_time.getTime();
  }

  getDisplayElement() {
    return this.DOM_target;
  }

  getDisplayContainerElement() {
    return this.DOM_container;
  }

  finishTrial(data = {}) {
    if (this.current_trial_finished) {
      return;
    }
    this.current_trial_finished = true;

    // remove any CSS classes that were added to the DOM via css_classes parameter
    if (
      typeof this.current_trial.css_classes !== "undefined" &&
      Array.isArray(this.current_trial.css_classes)
    ) {
      this.DOM_target.classList.remove(...this.current_trial.css_classes);
    }

    // write the data from the trial
    this.data.write(data);

    // get back the data with all of the defaults in
    var trial_data = this.data.get().filter({ trial_index: this.global_trial_index });

    // for trial-level callbacks, we just want to pass in a reference to the values
    // of the DataCollection, for easy access and editing.
    var trial_data_values = trial_data.values()[0];

    const current_trial = this.current_trial;

    if (typeof current_trial.save_trial_parameters == "object") {
      var keys = Object.keys(current_trial.save_trial_parameters);
      for (var i = 0; i < keys.length; i++) {
        var key_val = current_trial.save_trial_parameters[keys[i]];
        if (key_val === true) {
          if (typeof current_trial[keys[i]] == "undefined") {
            console.warn(
              `Invalid parameter specified in save_trial_parameters. Trial has no property called "${keys[i]}".`
            );
          } else if (typeof current_trial[keys[i]] == "function") {
            trial_data_values[keys[i]] = current_trial[keys[i]].toString();
          } else {
            trial_data_values[keys[i]] = current_trial[keys[i]];
          }
        }
        if (key_val === false) {
          // we don't allow internal_node_id or trial_index to be deleted because it would break other things
          if (keys[i] !== "internal_node_id" && keys[i] !== "trial_index") {
            delete trial_data_values[keys[i]];
          }
        }
      }
    }
    // handle extension callbacks
    if (Array.isArray(current_trial.extensions)) {
      for (const extension of current_trial.extensions) {
        var ext_data_values = this.extensions[extension.type.info.name].on_finish(extension.params);
        Object.assign(trial_data_values, ext_data_values);
      }
    }

    // about to execute lots of callbacks, so switch context.
    this.internal.call_immediate = true;

    // handle callback at plugin level
    if (typeof current_trial.on_finish === "function") {
      current_trial.on_finish(trial_data_values);
    }

    // handle callback at whole-experiment level
    this.opts.on_trial_finish(trial_data_values);

    // after the above callbacks are complete, then the data should be finalized
    // for this trial. call the on_data_update handler, passing in the same
    // data object that just went through the trial's finish handlers.
    this.opts.on_data_update(trial_data_values);

    // done with callbacks
    this.internal.call_immediate = false;

    // wait for iti
    if (
      typeof current_trial.post_trial_gap === null ||
      typeof current_trial.post_trial_gap === "undefined"
    ) {
      if (this.opts.default_iti > 0) {
        setTimeout(this.nextTrial, this.opts.default_iti);
      } else {
        this.nextTrial();
      }
    } else {
      if (current_trial.post_trial_gap > 0) {
        setTimeout(this.nextTrial, current_trial.post_trial_gap);
      } else {
        this.nextTrial();
      }
    }
  }

  endExperiment(end_message: string) {
    this.timeline.end_message = end_message;
    this.timeline.end();
    this.pluginAPI.cancelAllKeyboardResponses();
    this.pluginAPI.clearAllTimeouts();
    this.finishTrial();
  }

  endCurrentTimeline() {
    this.timeline.endActiveNode();
  }

  currentTrial() {
    return this.current_trial;
  }

  initSettings() {
    return this.opts;
  }

  currentTimelineNodeID() {
    return this.timeline.activeID();
  }

  timelineVariable(varname: string, immediate = false) {
    if (this.internal.call_immediate || immediate === true) {
      return this.timeline.timelineVariable(varname);
    } else {
      return () => this.timeline.timelineVariable(varname);
    }
  }

  allTimelineVariables() {
    return this.timeline.allTimelineVariables();
  }

  addNodeToEndOfTimeline(new_timeline, preload_callback?) {
    this.timeline.insert(new_timeline);
  }

  pauseExperiment() {
    this.paused = true;
  }

  resumeExperiment() {
    this.paused = false;
    if (this.waiting) {
      this.waiting = false;
      this.nextTrial();
    }
  }

  loadFail(message) {
    message = message || "<p>The experiment failed to load.</p>";
    this.DOM_target.innerHTML = message;
  }

  getSafeModeStatus() {
    return this.file_protocol;
  }

  getTimelineDescription() {
    var trials = [];
    function getTrialsFromTimelineNodes(timeline_node) {
      if (typeof timeline_node.timeline_parameters !== "undefined") {
        for (var i = 0; i < timeline_node.timeline_parameters.timeline.length; i++) {
          if (
            typeof timeline_node.timeline_parameters.timeline[i].trial_parameters !== "undefined"
          ) {
            trials.push(timeline_node.timeline_parameters.timeline[i].trial_parameters);
          } else {
            getTrialsFromTimelineNodes(timeline_node.timeline_parameters.timeline[i]);
          }
        }
      }
    }
    getTrialsFromTimelineNodes(this.timeline);
    return trials;
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
      var body = document.querySelector("body");
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
        console.error("The display_element specified in jsPsych.init() does not exist in the DOM.");
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
    if (options.display_element.className.indexOf("jspsych-display-element") == -1) {
      options.display_element.className += " jspsych-display-element";
    }
    this.DOM_target.className += "jspsych-content";

    // below code resets event listeners that may have lingered from
    // a previous incomplete experiment loaded in same DOM.
    this.pluginAPI.reset(options.display_element);
    // create keyboard event listeners
    this.pluginAPI.createKeyboardEventListeners(options.display_element);
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
          this.extensions[extension.type.info.name].initialize(extension.params || {})
        )
      );
    } catch (error_message) {
      console.error(error_message);
      throw new Error(error_message);
    }
  }

  private startExperiment() {
    this.finished = new Promise((resolve) => {
      this.resolveFinishedPromise = resolve;
    });

    // show progress bar if requested
    if (this.opts.show_progress_bar === true) {
      this.drawProgressBar(this.opts.message_progress_bar);
    }

    // record the start time
    this.exp_start_time = new Date();

    // begin!
    this.timeline.advance();
    this.doTrial(this.timeline.trial());
  }

  private finishExperiment() {
    if (typeof this.timeline.end_message !== "undefined") {
      this.DOM_target.innerHTML = this.timeline.end_message;
    }

    this.opts.on_finish(this.data.get());

    this.resolveFinishedPromise();
  }

  private nextTrial() {
    // if experiment is paused, don't do anything.
    if (this.paused) {
      this.waiting = true;
      return;
    }

    this.global_trial_index++;

    // advance timeline
    this.timeline.markCurrentTrialComplete();
    var complete = this.timeline.advance();

    // update progress bar if shown
    if (this.opts.show_progress_bar === true && this.opts.auto_update_progress_bar == true) {
      this.updateProgressBar();
    }

    // check if experiment is over
    if (complete) {
      this.finishExperiment();
      return;
    }

    this.doTrial(this.timeline.trial());
  }

  private doTrial(trial) {
    this.current_trial = trial;
    this.current_trial_finished = false;

    // process all timeline variables for this trial
    this.evaluateTimelineVariables(trial);

    // instantiate the plugin for this trial
    trial.type = {
      // this is a hack to internally keep the old plugin object structure and prevent touching more
      // of the core jspsych code
      ...autoBind(new trial.type(this)),
      info: trial.type.info,
    };

    // evaluate variables that are functions
    this.evaluateFunctionParameters(trial);

    // get default values for parameters
    this.setDefaultValues(trial);

    // about to execute callbacks
    this.internal.call_immediate = true;

    // call experiment wide callback
    this.opts.on_trial_start(trial);

    // call trial specific callback if it exists
    if (typeof trial.on_start == "function") {
      trial.on_start(trial);
    }

    // call any on_start functions for extensions
    if (Array.isArray(trial.extensions)) {
      for (const extension of trial.extensions) {
        this.extensions[extension.type.info.name].on_start(extension.params);
      }
    }

    // apply the focus to the element containing the experiment.
    this.DOM_container.focus();

    // reset the scroll on the DOM target
    this.DOM_target.scrollTop = 0;

    // add CSS classes to the DOM_target if they exist in trial.css_classes
    if (typeof trial.css_classes !== "undefined") {
      if (!Array.isArray(trial.css_classes) && typeof trial.css_classes == "string") {
        trial.css_classes = [trial.css_classes];
      }
      if (Array.isArray(trial.css_classes)) {
        this.DOM_target.classList.add(...trial.css_classes);
      }
    }

    // execute trial method
    trial.type.trial(this.DOM_target, trial);

    // call trial specific loaded callback if it exists
    if (typeof trial.on_load == "function") {
      trial.on_load();
    }

    // call any on_load functions for extensions
    if (Array.isArray(trial.extensions)) {
      for (const extension of trial.extensions) {
        this.extensions[extension.type.info.name].on_load(extension.params);
      }
    }

    // done with callbacks
    this.internal.call_immediate = false;
  }

  private evaluateTimelineVariables(trial) {
    for (const key of Object.keys(trial)) {
      if (key === "type") {
        // skip the `type` parameter as it contains a plugin
        continue;
      }
      // timeline variables on the root level
      if (
        typeof trial[key] == "function" &&
        trial[key].toString().replace(/\s/g, "") ==
          "function(){returntimeline.timelineVariable(varname);}"
      ) {
        trial[key] = trial[key].call();
      }
      // timeline variables that are nested in objects
      if (typeof trial[key] == "object" && trial[key] !== null) {
        this.evaluateTimelineVariables(trial[key]);
      }
    }
  }

  private evaluateFunctionParameters(trial) {
    // set a flag so that jsPsych.timelineVariable() is immediately executed in this context
    this.internal.call_immediate = true;

    // iterate over each parameter
    for (const key of Object.keys(trial)) {
      // check to make sure parameter is not "type", since that was eval'd above.
      if (key !== "type") {
        // this if statement is checking to see if the parameter type is expected to be a function, in which case we should NOT evaluate it.
        // the first line checks if the parameter is defined in the universalPluginParameters set
        // the second line checks the plugin-specific parameters
        if (
          typeof universalPluginParameters[key] !== "undefined" &&
          universalPluginParameters[key].type !== ParameterType.FUNCTION
        ) {
          trial[key] = this.replaceFunctionsWithValues(trial[key], null);
        }
        if (
          typeof trial.type.info.parameters[key] !== "undefined" &&
          trial.type.info.parameters[key].type !== ParameterType.FUNCTION
        ) {
          trial[key] = this.replaceFunctionsWithValues(trial[key], trial.type.info.parameters[key]);
        }
      }
    }
    // reset so jsPsych.timelineVariable() is no longer immediately executed
    this.internal.call_immediate = false;
  }

  private replaceFunctionsWithValues(obj, info) {
    // null typeof is 'object' (?!?!), so need to run this first!
    if (obj === null) {
      return obj;
    }
    // arrays
    else if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        obj[i] = this.replaceFunctionsWithValues(obj[i], info);
      }
    }
    // objects
    else if (typeof obj === "object") {
      var keys = Object.keys(obj);
      if (info == null || !info.nested) {
        for (var i = 0; i < keys.length; i++) {
          if (keys[i] === "type") {
            // Ignore the object's `type` field because it contains a plugin and we do not want to
            // call plugin functions
            continue;
          }
          obj[keys[i]] = this.replaceFunctionsWithValues(obj[keys[i]], null);
        }
      } else {
        for (var i = 0; i < keys.length; i++) {
          if (
            typeof info.nested[keys[i]] == "object" &&
            info.nested[keys[i]].type !== ParameterType.FUNCTION
          ) {
            obj[keys[i]] = this.replaceFunctionsWithValues(obj[keys[i]], info.nested[keys[i]]);
          }
        }
      }
    } else if (typeof obj === "function") {
      return obj();
    }
    return obj;
  }

  private setDefaultValues(trial) {
    for (var param in trial.type.info.parameters) {
      // check if parameter is complex with nested defaults
      if (trial.type.info.parameters[param].type == ParameterType.COMPLEX) {
        if (trial.type.info.parameters[param].array == true) {
          // iterate over each entry in the array
          trial[param].forEach(function (ip, i) {
            // check each parameter in the plugin description
            for (var p in trial.type.info.parameters[param].nested) {
              if (typeof trial[param][i][p] == "undefined" || trial[param][i][p] === null) {
                if (typeof trial.type.info.parameters[param].nested[p].default == "undefined") {
                  console.error(
                    "You must specify a value for the " +
                      p +
                      " parameter (nested in the " +
                      param +
                      " parameter) in the " +
                      trial.type +
                      " plugin."
                  );
                } else {
                  trial[param][i][p] = trial.type.info.parameters[param].nested[p].default;
                }
              }
            }
          });
        }
      }
      // if it's not nested, checking is much easier and do that here:
      else if (typeof trial[param] == "undefined" || trial[param] === null) {
        if (typeof trial.type.info.parameters[param].default == "undefined") {
          console.error(
            "You must specify a value for the " +
              param +
              " parameter in the " +
              trial.type.info.name +
              " plugin."
          );
        } else {
          trial[param] = trial.type.info.parameters[param].default;
        }
      }
    }
  }

  private async checkExclusions(exclusions) {
    // MINIMUM SIZE
    if (exclusions.min_width || exclusions.min_height) {
      const mw = exclusions.min_width || 0;
      const mh = exclusions.min_height || 0;

      if (window.innerWidth < mw || window.innerHeight < mh) {
        this.getDisplayElement().innerHTML =
          "<p>Your browser window is too small to complete this experiment. " +
          "Please maximize the size of your browser window. If your browser window is already maximized, " +
          "you will not be able to complete this experiment.</p>" +
          "<p>The minimum width is " +
          mw +
          "px. Your current width is " +
          window.innerWidth +
          "px.</p>" +
          "<p>The minimum height is " +
          mh +
          "px. Your current height is " +
          window.innerHeight +
          "px.</p>";

        // Wait for window size to increase
        while (window.innerWidth < mw || window.innerHeight < mh) {
          await delay(100);
        }

        this.getDisplayElement().innerHTML = "";
      }
    }

    // WEB AUDIO API
    if (typeof exclusions.audio !== "undefined" && exclusions.audio) {
      if (!window.hasOwnProperty("AudioContext") && !window.hasOwnProperty("webkitAudioContext")) {
        this.getDisplayElement().innerHTML =
          "<p>Your browser does not support the WebAudio API, which means that you will not " +
          "be able to complete the experiment.</p><p>Browsers that support the WebAudio API include " +
          "Chrome, Firefox, Safari, and Edge.</p>";
        throw new Error();
      }
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
    var progress = this.progress().percent_complete;
    this.setProgressBar(progress / 100);
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
}
