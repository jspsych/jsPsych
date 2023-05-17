import autoBind from "auto-bind";

import { version } from "../package.json";
import { MigrationError } from "./migration";
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
  private timelineDescription: any[];

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

  /**
   * is the experiment running in `simulate()` mode
   */
  private simulation_mode: "data-only" | "visual" = null;

  /**
   * simulation options passed in via `simulate()`
   */
  private simulation_options;

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

    autoBind(this); // so we can pass JsPsych methods as callbacks and `this` remains the JsPsych instance

    this.webaudio_context =
      typeof window !== "undefined" && typeof window.AudioContext !== "undefined"
        ? new AudioContext()
        : null;

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

    if (timeline.length === 0) {
      console.error(
        "No trials have been added to the timeline (the timeline is an empty array). Cannot start experiment."
      );
    }

    // create experiment timeline
    this.timelineDescription = timeline;
    this.timeline = new TimelineNode(this, { timeline });

    await this.prepareDom();
    await this.checkExclusions(this.opts.exclusions);
    await this.loadExtensions(this.opts.extensions);

    document.documentElement.setAttribute("jspsych", "present");

    this.startExperiment();
    await this.finished;
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
      total_trials: typeof this.timeline === "undefined" ? undefined : this.timeline.length(),
      current_trial_global: this.global_trial_index,
      percent_complete: typeof this.timeline === "undefined" ? 0 : this.timeline.percentComplete(),
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
    const trial_data = this.data.getLastTrialData();

    // for trial-level callbacks, we just want to pass in a reference to the values
    // of the DataCollection, for easy access and editing.
    const trial_data_values = trial_data.values()[0];

    const current_trial = this.current_trial;

    if (typeof current_trial.save_trial_parameters === "object") {
      for (const key of Object.keys(current_trial.save_trial_parameters)) {
        const key_val = current_trial.save_trial_parameters[key];
        if (key_val === true) {
          if (typeof current_trial[key] === "undefined") {
            console.warn(
              `Invalid parameter specified in save_trial_parameters. Trial has no property called "${key}".`
            );
          } else if (typeof current_trial[key] === "function") {
            trial_data_values[key] = current_trial[key].toString();
          } else {
            trial_data_values[key] = current_trial[key];
          }
        }
        if (key_val === false) {
          // we don't allow internal_node_id or trial_index to be deleted because it would break other things
          if (key !== "internal_node_id" && key !== "trial_index") {
            delete trial_data_values[key];
          }
        }
      }
    }

    // handle extension callbacks

    const extensionCallbackResults = ((current_trial.extensions ?? []) as any[]).map((extension) =>
      this.extensions[extension.type.info.name].on_finish(extension.params)
    );

    const onExtensionCallbacksFinished = () => {
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
      if (this.simulation_mode === "data-only") {
        this.nextTrial();
      } else if (
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
    };

    // Strictly using Promise.resolve to turn all values into promises would be cleaner here, but it
    // would require user test code to make the event loop tick after every simulated key press even
    // if there are no async `on_finish` methods. Hence, in order to avoid a breaking change, we
    // only rely on the event loop if at least one `on_finish` method returns a promise.
    if (extensionCallbackResults.some((result) => typeof result.then === "function")) {
      Promise.all(
        extensionCallbackResults.map((result) =>
          Promise.resolve(result).then((ext_data_values) => {
            Object.assign(trial_data_values, ext_data_values);
          })
        )
      ).then(onExtensionCallbacksFinished);
    } else {
      for (const values of extensionCallbackResults) {
        Object.assign(trial_data_values, values);
      }
      onExtensionCallbacksFinished();
    }
  }

  endExperiment(end_message = "", data = {}) {
    this.timeline.end_message = end_message;
    this.timeline.end();
    this.pluginAPI.cancelAllKeyboardResponses();
    this.pluginAPI.clearAllTimeouts();
    this.finishTrial(data);
  }

  endCurrentTimeline() {
    this.timeline.endActiveNode();
  }

  getCurrentTrial() {
    return this.current_trial;
  }

  getInitSettings() {
    return this.opts;
  }

  getCurrentTimelineNodeID() {
    return this.timeline.activeID();
  }

  timelineVariable(varname: string, immediate = false) {
    if (this.internal.call_immediate || immediate === true) {
      return this.timeline.timelineVariable(varname);
    } else {
      return {
        timelineVariablePlaceholder: true,
        timelineVariableFunction: () => this.timeline.timelineVariable(varname),
      };
    }
  }

  getAllTimelineVariables() {
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

  getTimeline() {
    return this.timelineDescription;
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
    const finish_result = this.opts.on_finish(this.data.get());

    const done_handler = () => {
      if (typeof this.timeline.end_message !== "undefined") {
        this.DOM_target.innerHTML = this.timeline.end_message;
      }
      this.resolveFinishedPromise();
    };

    if (finish_result) {
      Promise.resolve(finish_result).then(done_handler);
    } else {
      done_handler();
    }
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
    const complete = this.timeline.advance();

    // update progress bar if shown
    if (this.opts.show_progress_bar === true && this.opts.auto_update_progress_bar === true) {
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

    if (typeof trial.type === "string") {
      throw new MigrationError(
        "A string was provided as the trial's `type` parameter. Since jsPsych v7, the `type` parameter needs to be a plugin object."
      );
    }

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
    if (typeof trial.on_start === "function") {
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
      if (!Array.isArray(trial.css_classes) && typeof trial.css_classes === "string") {
        trial.css_classes = [trial.css_classes];
      }
      if (Array.isArray(trial.css_classes)) {
        this.DOM_target.classList.add(...trial.css_classes);
      }
    }

    // setup on_load event callback
    const load_callback = () => {
      if (typeof trial.on_load === "function") {
        trial.on_load();
      }

      // call any on_load functions for extensions
      if (Array.isArray(trial.extensions)) {
        for (const extension of trial.extensions) {
          this.extensions[extension.type.info.name].on_load(extension.params);
        }
      }
    };

    let trial_complete;
    let trial_sim_opts;
    let trial_sim_opts_merged;
    if (!this.simulation_mode) {
      trial_complete = trial.type.trial(this.DOM_target, trial, load_callback);
    }
    if (this.simulation_mode) {
      // check if the trial supports simulation
      if (trial.type.simulate) {
        if (!trial.simulation_options) {
          trial_sim_opts = this.simulation_options.default;
        }
        if (trial.simulation_options) {
          if (typeof trial.simulation_options == "string") {
            if (this.simulation_options[trial.simulation_options]) {
              trial_sim_opts = this.simulation_options[trial.simulation_options];
            } else if (this.simulation_options.default) {
              console.log(
                `No matching simulation options found for "${trial.simulation_options}". Using "default" options.`
              );
              trial_sim_opts = this.simulation_options.default;
            } else {
              console.log(
                `No matching simulation options found for "${trial.simulation_options}" and no "default" options provided. Using the default values provided by the plugin.`
              );
              trial_sim_opts = {};
            }
          } else {
            trial_sim_opts = trial.simulation_options;
          }
        }
        // merge in default options that aren't overriden by the trial's simulation_options
        // including nested parameters in the simulation_options
        trial_sim_opts_merged = this.utils.deepMerge(
          this.simulation_options.default,
          trial_sim_opts
        );

        trial_sim_opts_merged = this.utils.deepCopy(trial_sim_opts_merged);
        trial_sim_opts_merged = this.replaceFunctionsWithValues(trial_sim_opts_merged, null);

        if (trial_sim_opts_merged?.simulate === false) {
          trial_complete = trial.type.trial(this.DOM_target, trial, load_callback);
        } else {
          trial_complete = trial.type.simulate(
            trial,
            trial_sim_opts_merged?.mode || this.simulation_mode,
            trial_sim_opts_merged,
            load_callback
          );
        }
      } else {
        // trial doesn't have a simulate method, so just run as usual
        trial_complete = trial.type.trial(this.DOM_target, trial, load_callback);
      }
    }

    // see if trial_complete is a Promise by looking for .then() function
    const is_promise = trial_complete && typeof trial_complete.then == "function";

    // in simulation mode we let the simulate function call the load_callback always,
    // so we don't need to call it here. however, if we are in simulation mode but not simulating
    // this particular trial we need to call it.
    if (
      !is_promise &&
      (!this.simulation_mode || (this.simulation_mode && trial_sim_opts_merged?.simulate === false))
    ) {
      load_callback();
    }

    // done with callbacks
    this.internal.call_immediate = false;
  }

  private evaluateTimelineVariables(trial) {
    for (const key of Object.keys(trial)) {
      if (
        typeof trial[key] === "object" &&
        trial[key] !== null &&
        typeof trial[key].timelineVariablePlaceholder !== "undefined"
      ) {
        trial[key] = trial[key].timelineVariableFunction();
      }
      // timeline variables that are nested in objects
      if (
        typeof trial[key] === "object" &&
        trial[key] !== null &&
        key !== "timeline" &&
        key !== "timeline_variables"
      ) {
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
      for (let i = 0; i < obj.length; i++) {
        obj[i] = this.replaceFunctionsWithValues(obj[i], info);
      }
    }
    // objects
    else if (typeof obj === "object") {
      if (info === null || !info.nested) {
        for (const key of Object.keys(obj)) {
          if (key === "type" || key === "timeline" || key === "timeline_variables") {
            // Ignore the object's `type` field because it contains a plugin and we do not want to
            // call plugin functions. Also ignore `timeline` and `timeline_variables` because they
            // are used in the `trials` parameter of the preload plugin and we don't want to actually
            // evaluate those in that context.
            continue;
          }
          obj[key] = this.replaceFunctionsWithValues(obj[key], null);
        }
      } else {
        for (const key of Object.keys(obj)) {
          if (
            typeof info.nested[key] === "object" &&
            info.nested[key].type !== ParameterType.FUNCTION
          ) {
            obj[key] = this.replaceFunctionsWithValues(obj[key], info.nested[key]);
          }
        }
      }
    } else if (typeof obj === "function") {
      return obj();
    }
    return obj;
  }

  private setDefaultValues(trial) {
    for (const param in trial.type.info.parameters) {
      // check if parameter is complex with nested defaults
      if (trial.type.info.parameters[param].type === ParameterType.COMPLEX) {
        // check if parameter is undefined and has a default value
        if (typeof trial[param] === "undefined" && trial.type.info.parameters[param].default) {
          trial[param] = trial.type.info.parameters[param].default;
        }
        // if parameter is an array, iterate over each entry after confirming that there are
        // entries to iterate over. this is common when some parameters in a COMPLEX type have
        // default values and others do not.
        if (trial.type.info.parameters[param].array === true && Array.isArray(trial[param])) {
          // iterate over each entry in the array
          trial[param].forEach(function (ip, i) {
            // check each parameter in the plugin description
            for (const p in trial.type.info.parameters[param].nested) {
              if (typeof trial[param][i][p] === "undefined" || trial[param][i][p] === null) {
                if (typeof trial.type.info.parameters[param].nested[p].default === "undefined") {
                  console.error(
                    `You must specify a value for the ${p} parameter (nested in the ${param} parameter) in the ${trial.type.info.name} plugin.`
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
      else if (typeof trial[param] === "undefined" || trial[param] === null) {
        if (typeof trial.type.info.parameters[param].default === "undefined") {
          console.error(
            `You must specify a value for the ${param} parameter in the ${trial.type.info.name} plugin.`
          );
        } else {
          trial[param] = trial.type.info.parameters[param].default;
        }
      }
    }
  }

  private async checkExclusions(exclusions) {
    if (exclusions.min_width || exclusions.min_height || exclusions.audio) {
      console.warn(
        "The exclusions option in `initJsPsych()` is deprecated and will be removed in a future version. We recommend using the browser-check plugin instead. See https://www.jspsych.org/latest/plugins/browser-check/."
      );
    }
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
}
