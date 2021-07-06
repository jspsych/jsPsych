import { version } from "../package.json";
import * as data from "./data";
import * as pluginAPI from "./plugin-api";
import * as plugins from "./plugins";
import * as randomization from "./randomization";
import * as turk from "./turk";
import * as utils from "./utils";

const jsPsych = <any>{
  extensions: {},
  data,
  plugins,
  turk,
  randomization,
  pluginAPI,
  utils,
  version: () => version,
};

//
// private variables
//

// options
var opts = <any>{};
// experiment timeline
var timeline;
// flow control
var global_trial_index = 0;
var current_trial = <any>{};
var current_trial_finished = false;
// target DOM element
var DOM_container;
var DOM_target;
// time that the experiment began
var exp_start_time;
// is the experiment paused?
var paused = false;
var waiting = false;
// done loading?
var loaded = false;
var loadfail = false;
// is the page retrieved directly via file:// protocol (true) or hosted on a server (false)?
var file_protocol = false;

// storing a single webaudio context to prevent problems with multiple inits
// of jsPsych
jsPsych.webaudio_context = null;
// temporary patch for Safari
if (
  typeof window !== "undefined" &&
  window.hasOwnProperty("webkitAudioContext") &&
  !window.hasOwnProperty("AudioContext")
) {
  // @ts-expect-error
  window.AudioContext = webkitAudioContext;
}
// end patch
jsPsych.webaudio_context =
  typeof window !== "undefined" && typeof window.AudioContext !== "undefined"
    ? new AudioContext()
    : null;

// enumerated variables for special parameter types
jsPsych.ALL_KEYS = "allkeys";
jsPsych.NO_KEYS = "none";

//
// public methods
//

jsPsych.init = function (options) {
  function init() {
    if (typeof options.timeline === "undefined") {
      console.error("No timeline declared in jsPsych.init. Cannot start experiment.");
    }

    if (options.timeline.length == 0) {
      console.error(
        "No trials have been added to the timeline (the timeline is an empty array). Cannot start experiment."
      );
    }

    // reset variables
    timeline = null;
    global_trial_index = 0;
    current_trial = {};
    current_trial_finished = false;
    paused = false;
    waiting = false;
    loaded = false;
    loadfail = false;
    file_protocol = false;
    jsPsych.data.reset();

    var defaults = {
      display_element: undefined,
      on_finish: function (data) {
        return undefined;
      },
      on_trial_start: function (trial) {
        return undefined;
      },
      on_trial_finish: function () {
        return undefined;
      },
      on_data_update: function (data) {
        return undefined;
      },
      on_interaction_data_update: function (data) {
        return undefined;
      },
      on_close: function () {
        return undefined;
      },
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
    };

    // detect whether page is running in browser as a local file, and if so, disable web audio and video preloading to prevent CORS issues
    if (
      window.location.protocol == "file:" &&
      (options.override_safe_mode === false || typeof options.override_safe_mode == "undefined")
    ) {
      options.use_webaudio = false;
      file_protocol = true;
      console.warn(
        "jsPsych detected that it is running via the file:// protocol and not on a web server. " +
          "To prevent issues with cross-origin requests, Web Audio and video preloading have been disabled. " +
          "If you would like to override this setting, you can set 'override_safe_mode' to 'true' in jsPsych.init. " +
          "For more information, see: https://www.jspsych.org/overview/running-experiments"
      );
    }

    // override default options if user specifies an option
    opts = Object.assign({}, defaults, options);

    // set DOM element where jsPsych will render content
    // if undefined, then jsPsych will use the <body> tag and the entire page
    if (typeof opts.display_element == "undefined") {
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
      opts.display_element = document.querySelector("body");
    } else {
      // make sure that the display element exists on the page
      var display;
      if (opts.display_element instanceof Element) {
        var display = opts.display_element;
      } else {
        var display = document.querySelector("#" + opts.display_element) as any;
      }
      if (display === null) {
        console.error("The display_element specified in jsPsych.init() does not exist in the DOM.");
      } else {
        opts.display_element = display;
      }
    }
    opts.display_element.innerHTML =
      '<div class="jspsych-content-wrapper"><div id="jspsych-content"></div></div>';
    DOM_container = opts.display_element;
    DOM_target = document.querySelector("#jspsych-content");

    // add tabIndex attribute to scope event listeners
    opts.display_element.tabIndex = 0;

    // add CSS class to DOM_target
    if (opts.display_element.className.indexOf("jspsych-display-element") == -1) {
      opts.display_element.className += " jspsych-display-element";
    }
    DOM_target.className += "jspsych-content";

    // set experiment_width if not null
    if (opts.experiment_width !== null) {
      DOM_target.style.width = opts.experiment_width + "px";
    }

    // create experiment timeline
    timeline = new TimelineNode({
      timeline: opts.timeline,
    });

    // initialize audio context based on options and browser capabilities
    jsPsych.pluginAPI.initAudio();

    // below code resets event listeners that may have lingered from
    // a previous incomplete experiment loaded in same DOM.
    jsPsych.pluginAPI.reset(opts.display_element);
    // create keyboard event listeners
    jsPsych.pluginAPI.createKeyboardEventListeners(opts.display_element);
    // create listeners for user browser interaction
    jsPsych.data.createInteractionListeners();

    // add event for closing window
    window.addEventListener("beforeunload", opts.on_close);

    // check exclusions before continuing
    checkExclusions(
      opts.exclusions,
      function () {
        // success! user can continue...
        // start experiment
        loadExtensions();
      },
      function () {
        // fail. incompatible user.
      }
    );

    function loadExtensions() {
      // run the .initialize method of any extensions that are in use
      // these should return a Promise to indicate when loading is complete
      if (opts.extensions.length == 0) {
        startExperiment();
      } else {
        var loaded_extensions = 0;
        for (var i = 0; i < opts.extensions.length; i++) {
          var ext_params = opts.extensions[i].params;
          if (!ext_params) {
            ext_params = {};
          }
          jsPsych.extensions[opts.extensions[i].type]
            .initialize(ext_params)
            .then(() => {
              loaded_extensions++;
              if (loaded_extensions == opts.extensions.length) {
                startExperiment();
              }
            })
            .catch((error_message) => {
              console.error(error_message);
            });
        }
      }
    }
  }

  // execute init() when the document is ready
  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load", init);
  }
};

jsPsych.progress = function () {
  var percent_complete = typeof timeline == "undefined" ? 0 : timeline.percentComplete();

  var obj = {
    total_trials: typeof timeline == "undefined" ? undefined : timeline.length(),
    current_trial_global: global_trial_index,
    percent_complete: percent_complete,
  };

  return obj;
};

jsPsych.startTime = function () {
  return exp_start_time;
};

jsPsych.totalTime = function () {
  if (typeof exp_start_time == "undefined") {
    return 0;
  }
  return new Date().getTime() - exp_start_time.getTime();
};

jsPsych.getDisplayElement = function () {
  return DOM_target;
};

jsPsych.getDisplayContainerElement = function () {
  return DOM_container;
};

jsPsych.finishTrial = function (data) {
  if (current_trial_finished) {
    return;
  }
  current_trial_finished = true;

  // remove any CSS classes that were added to the DOM via css_classes parameter
  if (
    typeof current_trial.css_classes !== "undefined" &&
    Array.isArray(current_trial.css_classes)
  ) {
    DOM_target.classList.remove(...current_trial.css_classes);
  }

  // write the data from the trial
  data = typeof data == "undefined" ? {} : data;
  jsPsych.data.write(data);

  // get back the data with all of the defaults in
  var trial_data = jsPsych.data.get().filter({ trial_index: global_trial_index });

  // for trial-level callbacks, we just want to pass in a reference to the values
  // of the DataCollection, for easy access and editing.
  var trial_data_values = trial_data.values()[0];

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
    for (var i = 0; i < current_trial.extensions.length; i++) {
      var ext_data_values = jsPsych.extensions[current_trial.extensions[i].type].on_finish(
        current_trial.extensions[i].params
      );
      Object.assign(trial_data_values, ext_data_values);
    }
  }

  // about to execute lots of callbacks, so switch context.
  jsPsych.internal.call_immediate = true;

  // handle callback at plugin level
  if (typeof current_trial.on_finish === "function") {
    current_trial.on_finish(trial_data_values);
  }

  // handle callback at whole-experiment level
  opts.on_trial_finish(trial_data_values);

  // after the above callbacks are complete, then the data should be finalized
  // for this trial. call the on_data_update handler, passing in the same
  // data object that just went through the trial's finish handlers.
  opts.on_data_update(trial_data_values);

  // done with callbacks
  jsPsych.internal.call_immediate = false;

  // wait for iti
  if (
    typeof current_trial.post_trial_gap === null ||
    typeof current_trial.post_trial_gap === "undefined"
  ) {
    if (opts.default_iti > 0) {
      setTimeout(nextTrial, opts.default_iti);
    } else {
      nextTrial();
    }
  } else {
    if (current_trial.post_trial_gap > 0) {
      setTimeout(nextTrial, current_trial.post_trial_gap);
    } else {
      nextTrial();
    }
  }
};

jsPsych.endExperiment = function (end_message) {
  timeline.end_message = end_message;
  timeline.end();
  jsPsych.pluginAPI.cancelAllKeyboardResponses();
  jsPsych.pluginAPI.clearAllTimeouts();
  jsPsych.finishTrial();
};

jsPsych.endCurrentTimeline = function () {
  timeline.endActiveNode();
};

jsPsych.currentTrial = function () {
  return current_trial;
};

jsPsych.initSettings = function () {
  return opts;
};

jsPsych.currentTimelineNodeID = function () {
  return timeline.activeID();
};

jsPsych.timelineVariable = function (varname, immediate) {
  if (typeof immediate == "undefined") {
    immediate = false;
  }
  if (jsPsych.internal.call_immediate || immediate === true) {
    return timeline.timelineVariable(varname);
  } else {
    return function () {
      return timeline.timelineVariable(varname);
    };
  }
};

jsPsych.allTimelineVariables = function () {
  return timeline.allTimelineVariables();
};

jsPsych.addNodeToEndOfTimeline = function (new_timeline, preload_callback) {
  timeline.insert(new_timeline);
};

jsPsych.pauseExperiment = function () {
  paused = true;
};

jsPsych.resumeExperiment = function () {
  paused = false;
  if (waiting) {
    waiting = false;
    nextTrial();
  }
};

jsPsych.loadFail = function (message) {
  message = message || "<p>The experiment failed to load.</p>";
  loadfail = true;
  DOM_target.innerHTML = message;
};

jsPsych.getSafeModeStatus = function () {
  return file_protocol;
};

function TimelineNode(parameters, parent = undefined, relativeID = undefined) {
  // a unique ID for this node, relative to the parent
  var relative_id;

  // store the parent for this node
  var parent_node;

  // parameters for the trial if the node contains a trial
  var trial_parameters;

  // parameters for nodes that contain timelines
  var timeline_parameters;

  // stores trial information on a node that contains a timeline
  // used for adding new trials
  var node_trial_data;

  // track progress through the node
  var progress = <any>{
    current_location: -1, // where on the timeline (which timelinenode)
    current_variable_set: 0, // which set of variables to use from timeline_variables
    current_repetition: 0, // how many times through the variable set on this run of the node
    current_iteration: 0, // how many times this node has been revisited
    done: false,
  };

  // reference to self
  var self = this;

  // recursively get the next trial to run.
  // if this node is a leaf (trial), then return the trial.
  // otherwise, recursively find the next trial in the child timeline.
  this.trial = function () {
    if (typeof timeline_parameters == "undefined") {
      // returns a clone of the trial_parameters to
      // protect functions.
      return jsPsych.utils.deepCopy(trial_parameters);
    } else {
      if (progress.current_location >= timeline_parameters.timeline.length) {
        return null;
      } else {
        return timeline_parameters.timeline[progress.current_location].trial();
      }
    }
  };

  this.markCurrentTrialComplete = function () {
    if (typeof timeline_parameters == "undefined") {
      progress.done = true;
    } else {
      timeline_parameters.timeline[progress.current_location].markCurrentTrialComplete();
    }
  };

  this.nextRepetiton = function () {
    this.setTimelineVariablesOrder();
    progress.current_location = -1;
    progress.current_variable_set = 0;
    progress.current_repetition++;
    for (var i = 0; i < timeline_parameters.timeline.length; i++) {
      timeline_parameters.timeline[i].reset();
    }
  };

  // set the order for going through the timeline variables array
  this.setTimelineVariablesOrder = function () {
    // check to make sure this node has variables
    if (
      typeof timeline_parameters === "undefined" ||
      typeof timeline_parameters.timeline_variables === "undefined"
    ) {
      return;
    }

    var order = [];
    for (var i = 0; i < timeline_parameters.timeline_variables.length; i++) {
      order.push(i);
    }

    if (typeof timeline_parameters.sample !== "undefined") {
      if (timeline_parameters.sample.type == "custom") {
        order = timeline_parameters.sample.fn(order);
      } else if (timeline_parameters.sample.type == "with-replacement") {
        order = jsPsych.randomization.sampleWithReplacement(
          order,
          timeline_parameters.sample.size,
          timeline_parameters.sample.weights
        );
      } else if (timeline_parameters.sample.type == "without-replacement") {
        order = jsPsych.randomization.sampleWithoutReplacement(
          order,
          timeline_parameters.sample.size
        );
      } else if (timeline_parameters.sample.type == "fixed-repetitions") {
        order = jsPsych.randomization.repeat(order, timeline_parameters.sample.size, false);
      } else if (timeline_parameters.sample.type == "alternate-groups") {
        order = jsPsych.randomization.shuffleAlternateGroups(
          timeline_parameters.sample.groups,
          timeline_parameters.sample.randomize_group_order
        );
      } else {
        console.error(
          'Invalid type in timeline sample parameters. Valid options for type are "custom", "with-replacement", "without-replacement", "fixed-repetitions", and "alternate-groups"'
        );
      }
    }

    if (timeline_parameters.randomize_order) {
      order = jsPsych.randomization.shuffle(order);
    }

    progress.order = order;
  };

  // next variable set
  this.nextSet = function () {
    progress.current_location = -1;
    progress.current_variable_set++;
    for (var i = 0; i < timeline_parameters.timeline.length; i++) {
      timeline_parameters.timeline[i].reset();
    }
  };

  // update the current trial node to be completed
  // returns true if the node is complete after advance (all subnodes are also complete)
  // returns false otherwise
  this.advance = function () {
    // first check to see if done
    if (progress.done) {
      return true;
    }

    // if node has not started yet (progress.current_location == -1),
    // then try to start the node.
    if (progress.current_location == -1) {
      // check for on_timeline_start and conditonal function on nodes with timelines
      if (typeof timeline_parameters !== "undefined") {
        // only run the conditional function if this is the first repetition of the timeline when
        // repetitions > 1, and only when on the first variable set
        if (
          typeof timeline_parameters.conditional_function !== "undefined" &&
          progress.current_repetition == 0 &&
          progress.current_variable_set == 0
        ) {
          jsPsych.internal.call_immediate = true;
          var conditional_result = timeline_parameters.conditional_function();
          jsPsych.internal.call_immediate = false;
          // if the conditional_function() returns false, then the timeline
          // doesn't run and is marked as complete.
          if (conditional_result == false) {
            progress.done = true;
            return true;
          }
        }

        // if we reach this point then the node has its own timeline and will start
        // so we need to check if there is an on_timeline_start function if we are on the first variable set
        if (
          typeof timeline_parameters.on_timeline_start !== "undefined" &&
          progress.current_variable_set == 0
        ) {
          timeline_parameters.on_timeline_start();
        }
      }
      // if we reach this point, then either the node doesn't have a timeline of the
      // conditional function returned true and it can start
      progress.current_location = 0;
      // call advance again on this node now that it is pointing to a new location
      return this.advance();
    }

    // if this node has a timeline, propogate down to the current trial.
    if (typeof timeline_parameters !== "undefined") {
      var have_node_to_run = false;
      // keep incrementing the location in the timeline until one of the nodes reached is incomplete
      while (
        progress.current_location < timeline_parameters.timeline.length &&
        have_node_to_run == false
      ) {
        // check to see if the node currently pointed at is done
        var target_complete = timeline_parameters.timeline[progress.current_location].advance();
        if (!target_complete) {
          have_node_to_run = true;
          return false;
        } else {
          progress.current_location++;
        }
      }

      // if we've reached the end of the timeline (which, if the code is here, we have)

      // there are a few steps to see what to do next...

      // first, check the timeline_variables to see if we need to loop through again
      // with a new set of variables
      if (progress.current_variable_set < progress.order.length - 1) {
        // reset the progress of the node to be with the new set
        this.nextSet();
        // then try to advance this node again.
        return this.advance();
      }

      // if we're all done with the timeline_variables, then check to see if there are more repetitions
      else if (progress.current_repetition < timeline_parameters.repetitions - 1) {
        this.nextRepetiton();
        // check to see if there is an on_timeline_finish function
        if (typeof timeline_parameters.on_timeline_finish !== "undefined") {
          timeline_parameters.on_timeline_finish();
        }
        return this.advance();
      }

      // if we're all done with the repetitions...
      else {
        // check to see if there is an on_timeline_finish function
        if (typeof timeline_parameters.on_timeline_finish !== "undefined") {
          timeline_parameters.on_timeline_finish();
        }

        // if we're all done with the repetitions, check if there is a loop function.
        if (typeof timeline_parameters.loop_function !== "undefined") {
          jsPsych.internal.call_immediate = true;
          if (timeline_parameters.loop_function(this.generatedData())) {
            this.reset();
            jsPsych.internal.call_immediate = false;
            return parent_node.advance();
          } else {
            progress.done = true;
            jsPsych.internal.call_immediate = false;
            return true;
          }
        }
      }

      // no more loops on this timeline, we're done!
      progress.done = true;
      return true;
    }
  };

  // check the status of the done flag
  this.isComplete = function () {
    return progress.done;
  };

  // getter method for timeline variables
  this.getTimelineVariableValue = function (variable_name) {
    if (typeof timeline_parameters == "undefined") {
      return undefined;
    }
    var v =
      timeline_parameters.timeline_variables[progress.order[progress.current_variable_set]][
        variable_name
      ];
    return v;
  };

  // recursive upward search for timeline variables
  this.findTimelineVariable = function (variable_name) {
    var v = this.getTimelineVariableValue(variable_name);
    if (typeof v == "undefined") {
      if (typeof parent_node !== "undefined") {
        return parent_node.findTimelineVariable(variable_name);
      } else {
        return undefined;
      }
    } else {
      return v;
    }
  };

  // recursive downward search for active trial to extract timeline variable
  this.timelineVariable = function (variable_name) {
    if (typeof timeline_parameters == "undefined") {
      return this.findTimelineVariable(variable_name);
    } else {
      // if progress.current_location is -1, then the timeline variable is being evaluated
      // in a function that runs prior to the trial starting, so we should treat that trial
      // as being the active trial for purposes of finding the value of the timeline variable
      var loc = Math.max(0, progress.current_location);
      // if loc is greater than the number of elements on this timeline, then the timeline
      // variable is being evaluated in a function that runs after the trial on the timeline
      // are complete but before advancing to the next (like a loop_function).
      // treat the last active trial as the active trial for this purpose.
      if (loc == timeline_parameters.timeline.length) {
        loc = loc - 1;
      }
      // now find the variable
      return timeline_parameters.timeline[loc].timelineVariable(variable_name);
    }
  };

  // recursively get all the timeline variables for this trial
  this.allTimelineVariables = function () {
    var all_tvs = this.allTimelineVariablesNames();
    var all_tvs_vals = {};
    for (var i = 0; i < all_tvs.length; i++) {
      all_tvs_vals[all_tvs[i]] = this.timelineVariable(all_tvs[i]);
    }
    return all_tvs_vals;
  };

  // helper to get all the names at this stage.
  this.allTimelineVariablesNames = function (so_far) {
    if (typeof so_far == "undefined") {
      so_far = [];
    }
    if (typeof timeline_parameters !== "undefined") {
      so_far = so_far.concat(
        Object.keys(
          timeline_parameters.timeline_variables[progress.order[progress.current_variable_set]]
        )
      );
      // if progress.current_location is -1, then the timeline variable is being evaluated
      // in a function that runs prior to the trial starting, so we should treat that trial
      // as being the active trial for purposes of finding the value of the timeline variable
      var loc = Math.max(0, progress.current_location);
      // if loc is greater than the number of elements on this timeline, then the timeline
      // variable is being evaluated in a function that runs after the trial on the timeline
      // are complete but before advancing to the next (like a loop_function).
      // treat the last active trial as the active trial for this purpose.
      if (loc == timeline_parameters.timeline.length) {
        loc = loc - 1;
      }
      // now find the variable
      return timeline_parameters.timeline[loc].allTimelineVariablesNames(so_far);
    }
    if (typeof timeline_parameters == "undefined") {
      return so_far;
    }
  };

  // recursively get the number of **trials** contained in the timeline
  // assuming that while loops execute exactly once and if conditionals
  // always run
  this.length = function () {
    var length = 0;
    if (typeof timeline_parameters !== "undefined") {
      for (var i = 0; i < timeline_parameters.timeline.length; i++) {
        length += timeline_parameters.timeline[i].length();
      }
    } else {
      return 1;
    }
    return length;
  };

  // return the percentage of trials completed, grouped at the first child level
  // counts a set of trials as complete when the child node is done
  this.percentComplete = function () {
    var total_trials = this.length();
    var completed_trials = 0;
    for (var i = 0; i < timeline_parameters.timeline.length; i++) {
      if (timeline_parameters.timeline[i].isComplete()) {
        completed_trials += timeline_parameters.timeline[i].length();
      }
    }
    return (completed_trials / total_trials) * 100;
  };

  // resets the node and all subnodes to original state
  // but increments the current_iteration counter
  this.reset = function () {
    progress.current_location = -1;
    progress.current_repetition = 0;
    progress.current_variable_set = 0;
    progress.current_iteration++;
    progress.done = false;
    this.setTimelineVariablesOrder();
    if (typeof timeline_parameters != "undefined") {
      for (var i = 0; i < timeline_parameters.timeline.length; i++) {
        timeline_parameters.timeline[i].reset();
      }
    }
  };

  // mark this node as finished
  this.end = function () {
    progress.done = true;
  };

  // recursively end whatever sub-node is running the current trial
  this.endActiveNode = function () {
    if (typeof timeline_parameters == "undefined") {
      this.end();
      parent_node.end();
    } else {
      timeline_parameters.timeline[progress.current_location].endActiveNode();
    }
  };

  // get a unique ID associated with this node
  // the ID reflects the current iteration through this node.
  this.ID = function () {
    var id = "";
    if (typeof parent_node == "undefined") {
      return "0." + progress.current_iteration;
    } else {
      id += parent_node.ID() + "-";
      id += relative_id + "." + progress.current_iteration;
      return id;
    }
  };

  // get the ID of the active trial
  this.activeID = function () {
    if (typeof timeline_parameters == "undefined") {
      return this.ID();
    } else {
      return timeline_parameters.timeline[progress.current_location].activeID();
    }
  };

  // get all the data generated within this node
  this.generatedData = function () {
    return jsPsych.data.getDataByTimelineNode(this.ID());
  };

  // get all the trials of a particular type
  this.trialsOfType = function (type) {
    if (typeof timeline_parameters == "undefined") {
      if (trial_parameters.type == type) {
        return trial_parameters;
      } else {
        return [];
      }
    } else {
      var trials = [];
      for (var i = 0; i < timeline_parameters.timeline.length; i++) {
        var t = timeline_parameters.timeline[i].trialsOfType(type);
        trials = trials.concat(t);
      }
      return trials;
    }
  };

  // add new trials to end of this timeline
  this.insert = function (parameters) {
    if (typeof timeline_parameters == "undefined") {
      console.error("Cannot add new trials to a trial-level node.");
    } else {
      timeline_parameters.timeline.push(
        new TimelineNode(
          Object.assign({}, node_trial_data, parameters),
          self,
          timeline_parameters.timeline.length
        )
      );
    }
  };

  // constructor
  var _construct = (function () {
    // store a link to the parent of this node
    parent_node = parent;

    // create the ID for this node
    if (typeof parent == "undefined") {
      relative_id = 0;
    } else {
      relative_id = relativeID;
    }

    // check if there is a timeline parameter
    // if there is, then this node has its own timeline
    if (typeof parameters.timeline !== "undefined" || typeof trial_type == "function") {
      // create timeline properties
      timeline_parameters = {
        timeline: [],
        loop_function: parameters.loop_function,
        conditional_function: parameters.conditional_function,
        sample: parameters.sample,
        randomize_order:
          typeof parameters.randomize_order == "undefined" ? false : parameters.randomize_order,
        repetitions: typeof parameters.repetitions == "undefined" ? 1 : parameters.repetitions,
        timeline_variables:
          typeof parameters.timeline_variables == "undefined"
            ? [{}]
            : parameters.timeline_variables,
        on_timeline_finish: parameters.on_timeline_finish,
        on_timeline_start: parameters.on_timeline_start,
      };

      self.setTimelineVariablesOrder();

      // extract all of the node level data and parameters
      // but remove all of the timeline-level specific information
      // since this will be used to copy things down hierarchically
      var node_data = Object.assign({}, parameters);
      delete node_data.timeline;
      delete node_data.conditional_function;
      delete node_data.loop_function;
      delete node_data.randomize_order;
      delete node_data.repetitions;
      delete node_data.timeline_variables;
      delete node_data.sample;
      delete node_data.on_timeline_start;
      delete node_data.on_timeline_finish;
      node_trial_data = node_data; // store for later...

      // create a TimelineNode for each element in the timeline
      for (var i = 0; i < parameters.timeline.length; i++) {
        // merge parameters
        var merged_parameters = Object.assign({}, node_data, parameters.timeline[i]);
        // merge any data from the parent node into child nodes
        if (typeof node_data.data == "object" && typeof parameters.timeline[i].data == "object") {
          var merged_data = Object.assign({}, node_data.data, parameters.timeline[i].data);
          merged_parameters.data = merged_data;
        }
        timeline_parameters.timeline.push(new TimelineNode(merged_parameters, self, i));
      }
    }
    // if there is no timeline parameter, then this node is a trial node
    else {
      // check to see if a valid trial type is defined
      var trial_type = parameters.type;
      if (typeof trial_type == "undefined") {
        console.error(
          'Trial level node is missing the "type" parameter. The parameters for the node are: ' +
            JSON.stringify(parameters)
        );
      }
      // create a deep copy of the parameters for the trial
      trial_parameters = Object.assign({}, parameters);
    }
  })();
}

function startExperiment() {
  loaded = true;

  // show progress bar if requested
  if (opts.show_progress_bar === true) {
    drawProgressBar(opts.message_progress_bar);
  }

  // record the start time
  exp_start_time = new Date();

  // begin!
  timeline.advance();
  doTrial(timeline.trial());
}

function finishExperiment() {
  if (typeof timeline.end_message !== "undefined") {
    DOM_target.innerHTML = timeline.end_message;
  }

  opts.on_finish(jsPsych.data.get());
}

function nextTrial() {
  // if experiment is paused, don't do anything.
  if (paused) {
    waiting = true;
    return;
  }

  global_trial_index++;

  // advance timeline
  timeline.markCurrentTrialComplete();
  var complete = timeline.advance();

  // update progress bar if shown
  if (opts.show_progress_bar === true && opts.auto_update_progress_bar == true) {
    updateProgressBar();
  }

  // check if experiment is over
  if (complete) {
    finishExperiment();
    return;
  }

  doTrial(timeline.trial());
}

function doTrial(trial) {
  current_trial = trial;
  current_trial_finished = false;

  // process all timeline variables for this trial
  evaluateTimelineVariables(trial);

  // evaluate variables that are functions
  evaluateFunctionParameters(trial);

  // get default values for parameters
  setDefaultValues(trial);

  // about to execute callbacks
  jsPsych.internal.call_immediate = true;

  // call experiment wide callback
  opts.on_trial_start(trial);

  // call trial specific callback if it exists
  if (typeof trial.on_start == "function") {
    trial.on_start(trial);
  }

  // call any on_start functions for extensions
  if (Array.isArray(trial.extensions)) {
    for (var i = 0; i < trial.extensions.length; i++) {
      jsPsych.extensions[trial.extensions[i].type].on_start(current_trial.extensions[i].params);
    }
  }

  // apply the focus to the element containing the experiment.
  DOM_container.focus();

  // reset the scroll on the DOM target
  DOM_target.scrollTop = 0;

  // add CSS classes to the DOM_target if they exist in trial.css_classes
  if (typeof trial.css_classes !== "undefined") {
    if (!Array.isArray(trial.css_classes) && typeof trial.css_classes == "string") {
      trial.css_classes = [trial.css_classes];
    }
    if (Array.isArray(trial.css_classes)) {
      DOM_target.classList.add(...trial.css_classes);
    }
  }

  // execute trial method
  trial.type.trial(DOM_target, trial);

  // call trial specific loaded callback if it exists
  if (typeof trial.on_load == "function") {
    trial.on_load();
  }

  // call any on_load functions for extensions
  if (Array.isArray(trial.extensions)) {
    for (var i = 0; i < trial.extensions.length; i++) {
      jsPsych.extensions[trial.extensions[i].type].on_load(current_trial.extensions[i].params);
    }
  }

  // done with callbacks
  jsPsych.internal.call_immediate = false;
}

function evaluateTimelineVariables(trial) {
  var keys = Object.keys(trial);

  for (var i = 0; i < keys.length; i++) {
    // timeline variables on the root level
    if (
      typeof trial[keys[i]] == "function" &&
      trial[keys[i]].toString().replace(/\s/g, "") ==
        "function(){returntimeline.timelineVariable(varname);}"
    ) {
      trial[keys[i]] = trial[keys[i]].call();
    }
    // timeline variables that are nested in objects
    if (typeof trial[keys[i]] == "object" && trial[keys[i]] !== null) {
      evaluateTimelineVariables(trial[keys[i]]);
    }
  }
}

function evaluateFunctionParameters(trial) {
  // set a flag so that jsPsych.timelineVariable() is immediately executed in this context
  jsPsych.internal.call_immediate = true;

  // first, eval the trial type if it is a function
  // this lets users set the plugin type with a function
  if (typeof trial.type === "function") {
    trial.type = trial.type.call();
  }

  // now eval the whole trial

  // start by getting a list of the parameters
  var keys = Object.keys(trial);

  // iterate over each parameter
  for (var i = 0; i < keys.length; i++) {
    // check to make sure parameter is not "type", since that was eval'd above.
    if (keys[i] !== "type") {
      // this if statement is checking to see if the parameter type is expected to be a function, in which case we should NOT evaluate it.
      // the first line checks if the parameter is defined in the universalPluginParameters set
      // the second line checks the plugin-specific parameters
      if (
        typeof jsPsych.plugins.universalPluginParameters[keys[i]] !== "undefined" &&
        jsPsych.plugins.universalPluginParameters[keys[i]].type !==
          jsPsych.plugins.parameterType.FUNCTION
      ) {
        trial[keys[i]] = replaceFunctionsWithValues(trial[keys[i]], null);
      }
      if (
        typeof trial.type.info.parameters[keys[i]] !== "undefined" &&
        trial.type.info.parameters[keys[i]].type !== jsPsych.plugins.parameterType.FUNCTION
      ) {
        trial[keys[i]] = replaceFunctionsWithValues(
          trial[keys[i]],
          trial.type.info.parameters[keys[i]]
        );
      }
    }
  }
  // reset so jsPsych.timelineVariable() is no longer immediately executed
  jsPsych.internal.call_immediate = false;
}

function replaceFunctionsWithValues(obj, info) {
  // null typeof is 'object' (?!?!), so need to run this first!
  if (obj === null) {
    return obj;
  }
  // arrays
  else if (Array.isArray(obj)) {
    for (var i = 0; i < obj.length; i++) {
      obj[i] = replaceFunctionsWithValues(obj[i], info);
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
        obj[keys[i]] = replaceFunctionsWithValues(obj[keys[i]], null);
      }
    } else {
      for (var i = 0; i < keys.length; i++) {
        if (
          typeof info.nested[keys[i]] == "object" &&
          info.nested[keys[i]].type !== jsPsych.plugins.parameterType.FUNCTION
        ) {
          obj[keys[i]] = replaceFunctionsWithValues(obj[keys[i]], info.nested[keys[i]]);
        }
      }
    }
  } else if (typeof obj === "function") {
    return obj();
  }
  return obj;
}

function setDefaultValues(trial) {
  for (var param in trial.type.info.parameters) {
    // check if parameter is complex with nested defaults
    if (trial.type.info.parameters[param].type == jsPsych.plugins.parameterType.COMPLEX) {
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
            trial.type +
            " plugin."
        );
      } else {
        trial[param] = trial.type.info.parameters[param].default;
      }
    }
  }
}

function checkExclusions(exclusions, success, fail) {
  var clear = true;

  // MINIMUM SIZE
  if (typeof exclusions.min_width !== "undefined" || typeof exclusions.min_height !== "undefined") {
    var mw = typeof exclusions.min_width !== "undefined" ? exclusions.min_width : 0;
    var mh = typeof exclusions.min_height !== "undefined" ? exclusions.min_height : 0;
    var w = window.innerWidth;
    var h = window.innerHeight;
    if (w < mw || h < mh) {
      clear = false;
      var interval = setInterval(function () {
        var w = window.innerWidth;
        var h = window.innerHeight;
        if (w < mw || h < mh) {
          var msg =
            "<p>Your browser window is too small to complete this experiment. " +
            "Please maximize the size of your browser window. If your browser window is already maximized, " +
            "you will not be able to complete this experiment.</p>" +
            "<p>The minimum width is " +
            mw +
            "px. Your current width is " +
            w +
            "px.</p>" +
            "<p>The minimum height is " +
            mh +
            "px. Your current height is " +
            h +
            "px.</p>";
          jsPsych.getDisplayElement().innerHTML = msg;
        } else {
          clearInterval(interval);
          jsPsych.getDisplayElement().innerHTML = "";
          checkExclusions(exclusions, success, fail);
        }
      }, 100);
      return; // prevents checking other exclusions while this is being fixed
    }
  }

  // WEB AUDIO API
  if (typeof exclusions.audio !== "undefined" && exclusions.audio) {
    if (window.hasOwnProperty("AudioContext") || window.hasOwnProperty("webkitAudioContext")) {
      // clear
    } else {
      clear = false;
      var msg =
        "<p>Your browser does not support the WebAudio API, which means that you will not " +
        "be able to complete the experiment.</p><p>Browsers that support the WebAudio API include " +
        "Chrome, Firefox, Safari, and Edge.</p>";
      jsPsych.getDisplayElement().innerHTML = msg;
      fail();
      return;
    }
  }

  // GO?
  if (clear) {
    success();
  }
}

function drawProgressBar(msg) {
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

function updateProgressBar() {
  var progress = jsPsych.progress().percent_complete;
  jsPsych.setProgressBar(progress / 100);
}

var progress_bar_amount = 0;

jsPsych.setProgressBar = function (proportion_complete) {
  proportion_complete = Math.max(Math.min(1, proportion_complete), 0);
  document.querySelector<HTMLElement>("#jspsych-progressbar-inner").style.width =
    proportion_complete * 100 + "%";
  progress_bar_amount = proportion_complete;
};

jsPsych.getProgressBarCompleted = function () {
  return progress_bar_amount;
};

//Leave a trace in the DOM that jspsych was loaded
document.documentElement.setAttribute("jspsych", "present");

jsPsych.internal = {
  /**
   * this flag is used to determine whether we are in a scope where
   * jsPsych.timelineVariable() should be executed immediately or
   * whether it should return a function to access the variable later.
   *
   **/
  call_immediate: false,
};

export default jsPsych;
