/**
 * jspsych.js
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 **/
window.jsPsych = (function() {

  var core = {};

  //
  // private variables
  //

  // options
  var opts = {};
  // experiment timeline
  var timeline;
  // flow control
  var global_trial_index = 0;
  var current_trial = {};
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

  // storing a single webaudio context to prevent problems with multiple inits
  // of jsPsych
  core.webaudio_context = null;
  // temporary patch for Safari
  if (typeof window !== 'undefined' && window.hasOwnProperty('webkitAudioContext') && !window.hasOwnProperty('AudioContext')) {
    window.AudioContext = webkitAudioContext;
  }
  // end patch
  core.webaudio_context = (typeof window !== 'undefined' && typeof window.AudioContext !== 'undefined') ? new AudioContext() : null;

  // enumerated variables for special parameter types
  core.ALL_KEYS = 'allkeys';
  core.NO_KEYS = 'none';

  //
  // public methods
  //

  core.init = function(options) {

    if(typeof options.timeline === 'undefined'){
      console.error('No timeline declared in jsPsych.init. Cannot start experiment.')
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
    jsPsych.data.reset();

    var defaults = {
      'display_element': undefined,
      'on_finish': function(data) {
        return undefined;
      },
      'on_trial_start': function(trial) {
        return undefined;
      },
      'on_trial_finish': function() {
        return undefined;
      },
      'on_data_update': function(data) {
        return undefined;
      },
      'on_interaction_data_update': function(data){
        return undefined;
      },
      'preload_images': [],
      'preload_audio': [],
      'use_webaudio': true,
      'exclusions': {},
      'show_progress_bar': false,
      'auto_update_progress_bar': true,
      'auto_preload': true,
      'show_preload_progress_bar': true,
      'max_load_time': 60000,
      'max_preload_attempts': 10,
      'default_iti': 0
    };

    // override default options if user specifies an option
    opts = Object.assign({}, defaults, options);

    // set DOM element where jsPsych will render content
    // if undefined, then jsPsych will use the <body> tag and the entire page
    if(typeof opts.display_element == 'undefined'){
      // check if there is a body element on the page
      var body = document.querySelector('body');
      if (body === null) {
        document.documentElement.appendChild(document.createElement('body'));
      }
      // using the full page, so we need the HTML element to
      // have 100% height, and body to be full width and height with
      // no margin
      document.querySelector('html').style.height = '100%';
      document.querySelector('body').style.margin = '0px';
      document.querySelector('body').style.height = '100%';
      document.querySelector('body').style.width = '100%';
      opts.display_element = document.querySelector('body');
    } else {
      // make sure that the display element exists on the page
      var display;
      if (opts.display_element instanceof Element) {
        var display = opts.display_element;
      } else {
        var display = document.querySelector('#' + opts.display_element);
      }
      if(display === null) {
        console.error('The display_element specified in jsPsych.init() does not exist in the DOM.');
      } else {
        opts.display_element = display;
      }
    }
    opts.display_element.innerHTML = '<div class="jspsych-content-wrapper"><div id="jspsych-content"></div></div>';
    DOM_container = opts.display_element;
    DOM_target = document.querySelector('#jspsych-content');

    // add tabIndex attribute to scope event listeners
    opts.display_element.tabIndex = 0;

    // add CSS class to DOM_target
    if(opts.display_element.className.indexOf('jspsych-display-element') == -1){
      opts.display_element.className += ' jspsych-display-element';
    }
    DOM_target.className += 'jspsych-content';

    // create experiment timeline
    timeline = new TimelineNode({
      timeline: opts.timeline
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

    // check exclusions before continuing
    checkExclusions(opts.exclusions,
      function(){
        // success! user can continue...
        // start experiment, with or without preloading
        if(opts.auto_preload){
          jsPsych.pluginAPI.autoPreload(timeline, startExperiment, opts.preload_images, opts.preload_audio, opts.show_preload_progress_bar);
          if(opts.max_load_time > 0){
            setTimeout(function(){
              if(!loaded && !loadfail){
                core.loadFail();
              }
            }, opts.max_load_time);
          }
        } else {
          startExperiment();
        }
      },
      function(){
        // fail. incompatible user.

      }
    );
  };

  core.progress = function() {

    var percent_complete = typeof timeline == 'undefined' ? 0 : timeline.percentComplete();

    var obj = {
      "total_trials": typeof timeline == 'undefined' ? undefined : timeline.length(),
      "current_trial_global": global_trial_index,
      "percent_complete": percent_complete
    };

    return obj;
  };

  core.startTime = function() {
    return exp_start_time;
  };

  core.totalTime = function() {
    if(typeof exp_start_time == 'undefined'){ return 0; }
    return (new Date()).getTime() - exp_start_time.getTime();
  };

  core.getDisplayElement = function() {
    return DOM_target;
  };

  core.getDisplayContainerElement = function(){
    return DOM_container;
  }

  core.finishTrial = function(data) {

    if(current_trial_finished){ return; }
    current_trial_finished = true;

    // write the data from the trial
    data = typeof data == 'undefined' ? {} : data;
    jsPsych.data.write(data);

    // get back the data with all of the defaults in
    var trial_data = jsPsych.data.get().filter({trial_index: global_trial_index});

    // for trial-level callbacks, we just want to pass in a reference to the values
    // of the DataCollection, for easy access and editing.
    var trial_data_values = trial_data.values()[0];

    // handle callback at plugin level
    if (typeof current_trial.on_finish === 'function') {
      current_trial.on_finish(trial_data_values);
    }

    // handle callback at whole-experiment level
    opts.on_trial_finish(trial_data_values);

    // after the above callbacks are complete, then the data should be finalized
    // for this trial. call the on_data_update handler, passing in the same
    // data object that just went through the trial's finish handlers.
    opts.on_data_update(trial_data_values);

    // wait for iti
    if (typeof current_trial.post_trial_gap === null) {
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
  }

  core.endExperiment = function(end_message) {
    timeline.end_message = end_message;
    timeline.end();
    jsPsych.pluginAPI.cancelAllKeyboardResponses();
    jsPsych.pluginAPI.clearAllTimeouts();
    core.finishTrial();
  }

  core.endCurrentTimeline = function() {
    timeline.endActiveNode();
  }

  core.currentTrial = function() {
    return current_trial;
  };

  core.initSettings = function() {
    return opts;
  };

  core.currentTimelineNodeID = function() {
    return timeline.activeID();
  };

  core.timelineVariable = function(varname, execute){
    if(execute){
      return timeline.timelineVariable(varname);
    } else {
      return function() { return timeline.timelineVariable(varname); }
    }
  }

  core.addNodeToEndOfTimeline = function(new_timeline, preload_callback){
    timeline.insert(new_timeline);
    if(typeof preload_callback !== 'undefinded'){
      if(opts.auto_preload){
        jsPsych.pluginAPI.autoPreload(timeline, preload_callback);
      } else {
        preload_callback();
      }
    }
  }

  core.pauseExperiment = function(){
    paused = true;
  }

  core.resumeExperiment = function(){
    paused = false;
    if(waiting){
      waiting = false;
      nextTrial();
    }
  }

  core.loadFail = function(message){
    message = message || '<p>The experiment failed to load.</p>';
    loadfail = true;
    DOM_target.innerHTML = message;
  }

  function TimelineNode(parameters, parent, relativeID) {

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
    var progress = {
      current_location: -1, // where on the timeline (which timelinenode)
      current_variable_set: 0, // which set of variables to use from timeline_variables
      current_repetition: 0, // how many times through the variable set on this run of the node
      current_iteration: 0, // how many times this node has been revisited
      done: false
    }

    // reference to self
    var self = this;

    // recursively get the next trial to run.
    // if this node is a leaf (trial), then return the trial.
    // otherwise, recursively find the next trial in the child timeline.
    this.trial = function() {
      if (typeof timeline_parameters == 'undefined') {
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
    }

    this.markCurrentTrialComplete = function() {
      if(typeof timeline_parameters == 'undefined'){
        progress.done = true;
      } else {
        timeline_parameters.timeline[progress.current_location].markCurrentTrialComplete();
      }
    }

    this.nextRepetiton = function() {
      this.setTimelineVariablesOrder();
      progress.current_location = -1;
      progress.current_variable_set = 0;
      progress.current_repetition++;
      for (var i = 0; i < timeline_parameters.timeline.length; i++) {
        timeline_parameters.timeline[i].reset();
      }
    }

    // set the order for going through the timeline variables array
    // TODO: this is where all the sampling options can be implemented
    this.setTimelineVariablesOrder = function() {

      // check to make sure this node has variables
      if(typeof timeline_parameters === 'undefined' || typeof timeline_parameters.timeline_variables === 'undefined'){
        return;
      }

      var order = [];
      for(var i=0; i<timeline_parameters.timeline_variables.length; i++){
        order.push(i);
      }

      if(typeof timeline_parameters.sample !== 'undefined'){
        if(timeline_parameters.sample.type == 'custom'){
          order = timeline_parameters.sample.fn(order);
        } else if(timeline_parameters.sample.type == 'with-replacement'){
          order = jsPsych.randomization.sampleWithReplacement(order, timeline_parameters.sample.size, timeline_parameters.sample.weights);
        } else if(timeline_parameters.sample.type == 'without-replacement'){
          order = jsPsych.randomization.sampleWithoutReplacement(order, timeline_parameters.sample.size);
        } else if(timeline_parameters.sample.type == 'fixed-repetitions'){
          order = jsPsych.randomization.repeat(order, timeline_parameters.sample.size, false);
        }
      }

      if(timeline_parameters.randomize_order) {
        order = jsPsych.randomization.shuffle(order);
      }

      progress.order = order;
    }

    // next variable set
    this.nextSet = function() {
      progress.current_location = -1;
      progress.current_variable_set++;
      for (var i = 0; i < timeline_parameters.timeline.length; i++) {
        timeline_parameters.timeline[i].reset();
      }
    }

    // update the current trial node to be completed
    // returns true if the node is complete after advance (all subnodes are also complete)
    // returns false otherwise
    this.advance = function() {

      // first check to see if done
      if (progress.done) {
        return true;
      }

      // if node has not started yet (progress.current_location == -1),
      // then try to start the node.
      if (progress.current_location == -1) {
        // check for conditonal function on nodes with timelines
        if (typeof timeline_parameters != 'undefined') {
          if (typeof timeline_parameters.conditional_function !== 'undefined') {
            var conditional_result = timeline_parameters.conditional_function();
            // if the conditional_function() returns false, then the timeline
            // doesn't run and is marked as complete.
            if (conditional_result == false) {
              progress.done = true;
              return true;
            }
            // if the conditonal_function() returns true, then the node can start
            else {
              progress.current_location = 0;
            }
          }
          // if there is no conditional_function, then the node can start
          else {
            progress.current_location = 0;
          }
        }
        // if the node does not have a timeline, then it can start
        progress.current_location = 0;
        // call advance again on this node now that it is pointing to a new location
        return this.advance();
      }

      // if this node has a timeline, propogate down to the current trial.
      if (typeof timeline_parameters !== 'undefined') {

        var have_node_to_run = false;
        // keep incrementing the location in the timeline until one of the nodes reached is incomplete
        while (progress.current_location < timeline_parameters.timeline.length && have_node_to_run == false) {

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
          return this.advance();
        }

        // if we're all done with the repetitions, check if there is a loop function.
        else if (typeof timeline_parameters.loop_function !== 'undefined') {
          if (timeline_parameters.loop_function(this.generatedData())) {
            this.reset();
            return parent_node.advance();
          } else {
            progress.done = true;
            return true;
          }
        }

        // no more loops on this timeline, we're done!
        else {
          progress.done = true;
          return true;
        }

      }
    }

    // check the status of the done flag
    this.isComplete = function() {
      return progress.done;
    }

    // getter method for timeline variables
    this.getTimelineVariableValue = function(variable_name){
      if(typeof timeline_parameters == 'undefined'){
        return undefined;
      }
      var v = timeline_parameters.timeline_variables[progress.order[progress.current_variable_set]][variable_name];
      return v;
    }

    // recursive upward search for timeline variables
    this.findTimelineVariable = function(variable_name){
      var v = this.getTimelineVariableValue(variable_name);
      if(typeof v == 'undefined'){
        if(typeof parent_node !== 'undefined'){
          return parent_node.findTimelineVariable(variable_name);
        } else {
          return undefined;
        }
      } else {
        return v;
      }
    }

    // recursive downward search for active trial to extract timeline variable
    this.timelineVariable = function(variable_name){
      if(typeof timeline_parameters == 'undefined'){
        return this.findTimelineVariable(variable_name);
      } else {
        return timeline_parameters.timeline[progress.current_location].timelineVariable(variable_name);
      }
    }

    // recursively get the number of **trials** contained in the timeline
    // assuming that while loops execute exactly once and if conditionals
    // always run
    this.length = function() {
      var length = 0;
      if (typeof timeline_parameters !== 'undefined') {
        for (var i = 0; i < timeline_parameters.timeline.length; i++) {
          length += timeline_parameters.timeline[i].length();
        }
      } else {
        return 1;
      }
      return length;
    }

    // return the percentage of trials completed, grouped at the first child level
    // counts a set of trials as complete when the child node is done
    this.percentComplete = function() {
      var total_trials = this.length();
      var completed_trials = 0;
      for (var i = 0; i < timeline_parameters.timeline.length; i++) {
        if (timeline_parameters.timeline[i].isComplete()) {
          completed_trials += timeline_parameters.timeline[i].length();
        }
      }
      return (completed_trials / total_trials * 100)
    }

    // resets the node and all subnodes to original state
    // but increments the current_iteration counter
    this.reset = function() {
      progress.current_location = -1;
      progress.current_repetition = 0;
      progress.current_variable_set = 0;
      progress.current_iteration++;
      progress.done = false;
      this.setTimelineVariablesOrder();
      if (typeof timeline_parameters != 'undefined') {
        for (var i = 0; i < timeline_parameters.timeline.length; i++) {
          timeline_parameters.timeline[i].reset();
        }
      }

    }

    // mark this node as finished
    this.end = function() {
      progress.done = true;
    }

    // recursively end whatever sub-node is running the current trial
    this.endActiveNode = function() {
      if (typeof timeline_parameters == 'undefined') {
        this.end();
        parent_node.end();
      } else {
        timeline_parameters.timeline[progress.current_location].endActiveNode();
      }
    }

    // get a unique ID associated with this node
    // the ID reflects the current iteration through this node.
    this.ID = function() {
      var id = "";
      if (typeof parent_node == 'undefined') {
        return "0." + progress.current_iteration;
      } else {
        id += parent_node.ID() + "-";
        id += relative_id + "." + progress.current_iteration;
        return id;
      }
    }

    // get the ID of the active trial
    this.activeID = function() {
      if (typeof timeline_parameters == 'undefined') {
        return this.ID();
      } else {
        return timeline_parameters.timeline[progress.current_location].activeID();
      }
    }

    // get all the data generated within this node
    this.generatedData = function() {
      return jsPsych.data.getDataByTimelineNode(this.ID());
    }

    // get all the trials of a particular type
    this.trialsOfType = function(type) {
      if (typeof timeline_parameters == 'undefined'){
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
    }

    // add new trials to end of this timeline
    this.insert = function(parameters){
      if(typeof timeline_parameters == 'undefined'){
        console.error('Cannot add new trials to a trial-level node.');
      } else {
        timeline_parameters.timeline.push(
          new TimelineNode(Object.assign({}, node_trial_data, parameters), self, timeline_parameters.timeline.length)
        );
      }
    }

    // constructor
    var _construct = function() {

      // store a link to the parent of this node
      parent_node = parent;

      // create the ID for this node
      if (typeof parent == 'undefined') {
        relative_id = 0;
      } else {
        relative_id = relativeID;
      }

      // check if there is a timeline parameter
      // if there is, then this node has its own timeline
      if ((typeof parameters.timeline !== 'undefined') || (typeof jsPsych.plugins[trial_type] == 'function')) {

        // create timeline properties
        timeline_parameters = {
          timeline: [],
          loop_function: parameters.loop_function,
          conditional_function: parameters.conditional_function,
          sample: parameters.sample,
          randomize_order: typeof parameters.randomize_order == 'undefined' ? false : parameters.randomize_order,
          repetitions: typeof parameters.repetitions == 'undefined' ? 1 : parameters.repetitions,
          timeline_variables: typeof parameters.timeline_variables == 'undefined' ? [{}] : parameters.timeline_variables
        };

        self.setTimelineVariablesOrder();

        // extract all of the node level data and parameters
        var node_data = Object.assign({}, parameters);
        delete node_data.timeline;
        delete node_data.conditional_function;
        delete node_data.loop_function;
        delete node_data.randomize_order;
        delete node_data.repetitions;
        delete node_data.timeline_variables;
        delete node_data.sample;
        node_trial_data = node_data; // store for later...

        // create a TimelineNode for each element in the timeline
        for (var i = 0; i < parameters.timeline.length; i++) {
          timeline_parameters.timeline.push(new TimelineNode(Object.assign({}, node_data, parameters.timeline[i]), self, i));
        }

      }
      // if there is no timeline parameter, then this node is a trial node
      else {
        // check to see if a valid trial type is defined
        var trial_type = parameters.type;
        if (typeof trial_type == 'undefined') {
          console.error('Trial level node is missing the "type" parameter. The parameters for the node are: ' + JSON.stringify(parameters));
        } else if ((typeof jsPsych.plugins[trial_type] == 'undefined') && (trial_type.toString().replace(/\s/g,'') != "function(){returntimeline.timelineVariable(varname);}")) {
          console.error('No plugin loaded for trials of type "' + trial_type + '"');
        }
        // create a deep copy of the parameters for the trial
        trial_parameters = Object.assign({}, parameters);
      }

    }();
  }

  function startExperiment() {

    loaded = true;

    // show progress bar if requested
    if (opts.show_progress_bar === true) {
      drawProgressBar();
    }

    // record the start time
    exp_start_time = new Date();

    // begin!
    timeline.advance();
    doTrial(timeline.trial());

  }

  function finishExperiment() {

    if(typeof timeline.end_message !== 'undefined'){
      DOM_target.innerHTML = timeline.end_message;
    }

    opts.on_finish(jsPsych.data.get());

  }

  function nextTrial() {
    // if experiment is paused, don't do anything.
    if(paused) {
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

    // call experiment wide callback
    opts.on_trial_start(trial);

    // call trial specific callback if it exists
    if(typeof trial.on_start == 'function'){
      trial.on_start(trial);
    }

    // apply the focus to the DOM (for keyboard events)
    DOM_target.focus();

    // execute trial method
    jsPsych.plugins[trial.type].trial(DOM_target, trial);

    // call trial specific loaded callback if it exists
    if(typeof trial.on_load == 'function'){
      trial.on_load();
    }
  }

  function evaluateTimelineVariables(trial){
    var keys = Object.keys(trial);

    for (var i = 0; i < keys.length; i++) {
      // timeline variables on the root level
      if (typeof trial[keys[i]] == "function" && trial[keys[i]].toString().replace(/\s/g,'') == "function(){returntimeline.timelineVariable(varname);}") {
        trial[keys[i]] = trial[keys[i]].call();
      }
      // timeline variables that are nested in objects
      if (typeof trial[keys[i]] == "object" && trial[keys[i]] !== null){
        evaluateTimelineVariables(trial[keys[i]]);
      }
    }
  }

  function evaluateFunctionParameters(trial){

    // first, eval the trial type if it is a function
    if(typeof trial.type === 'function'){
      trial.type = trial.type.call();
    }

    // now eval the whole trial
    var keys = Object.keys(trial);

    for (var i = 0; i < keys.length; i++) {
      if(keys[i] !== 'type'){
        if(
          (typeof jsPsych.plugins.universalPluginParameters[keys[i]] !== 'undefined' && jsPsych.plugins.universalPluginParameters[keys[i]].type !== jsPsych.plugins.parameterType.FUNCTION ) ||
          (typeof jsPsych.plugins[trial.type].info.parameters[keys[i]] !== 'undefined' && jsPsych.plugins[trial.type].info.parameters[keys[i]].type !== jsPsych.plugins.parameterType.FUNCTION)
        ) {
          if (typeof trial[keys[i]] == "function") {
            trial[keys[i]] = trial[keys[i]].call();
          }
        }
      }
    }
  }

  function setDefaultValues(trial){
    var trial_parameters = Object.keys(jsPsych.plugins[trial.type].info.parameters);
    for(var i=0; i<trial_parameters.length; i++){
      if(typeof trial[trial_parameters[i]] == 'undefined' || trial[trial_parameters[i]] === null){
        if(typeof jsPsych.plugins[trial.type].info.parameters[trial_parameters[i]].default == 'undefined'){
          console.error('You must specify a value for the '+trial_parameters[i]+' parameter in the '+trial.type+' plugin.');
        } else {
          trial[trial_parameters[i]] = jsPsych.plugins[trial.type].info.parameters[trial_parameters[i]].default;
        }
      }
    }
  }

  function checkExclusions(exclusions, success, fail){
    var clear = true;

    // MINIMUM SIZE
    if(typeof exclusions.min_width !== 'undefined' || typeof exclusions.min_height !== 'undefined'){
      var mw = typeof exclusions.min_width !== 'undefined' ? exclusions.min_width : 0;
      var mh = typeof exclusions.min_height !== 'undefined' ? exclusions.min_height : 0;
      var w = window.innerWidth;
      var h = window.innerHeight;
      if(w < mw || h < mh){
        clear = false;
        var interval = setInterval(function(){
          var w = window.innerWidth;
          var h = window.innerHeight;
          if(w < mw || h < mh){
            var msg = '<p>Your browser window is too small to complete this experiment. '+
              'Please maximize the size of your browser window. If your browser window is already maximized, '+
              'you will not be able to complete this experiment.</p>'+
              '<p>The minimum width is '+mw+'px. Your current width is '+w+'px.</p>'+
              '<p>The minimum height is '+mh+'px. Your current height is '+h+'px.</p>';
            core.getDisplayElement().innerHTML = msg;
          } else {
            clearInterval(interval);
            core.getDisplayElement().innerHTML = '';
            checkExclusions(exclusions, success, fail);
          }
        }, 100);
        return; // prevents checking other exclusions while this is being fixed
      }
    }

    // WEB AUDIO API
    if(typeof exclusions.audio !== 'undefined' && exclusions.audio) {
      if(window.hasOwnProperty('AudioContext') || window.hasOwnProperty('webkitAudioContext')){
        // clear
      } else {
        clear = false;
        var msg = '<p>Your browser does not support the WebAudio API, which means that you will not '+
          'be able to complete the experiment.</p><p>Browsers that support the WebAudio API include '+
          'Chrome, Firefox, Safari, and Edge.</p>';
        core.getDisplayElement().innerHTML = msg;
        fail();
        return;
      }
    }

    // GO?
    if(clear){ success(); }
  }

  function drawProgressBar() {
    document.querySelector('.jspsych-display-element').insertAdjacentHTML('afterbegin',
      '<div id="jspsych-progressbar-container">'+
      '<span>Completion Progress</span>'+
      '<div id="jspsych-progressbar-outer">'+
        '<div id="jspsych-progressbar-inner"></div>'+
      '</div></div>');
  }

  function updateProgressBar() {
    var progress = jsPsych.progress();

    document.querySelector('#jspsych-progressbar-inner').style.width = progress.percent_complete + "%";
  }

  core.setProgressBar = function(proportion_complete){
    proportion_complete = Math.max(Math.min(1,proportion_complete),0);
    document.querySelector('#jspsych-progressbar-inner').style.width = (proportion_complete*100) + "%";
  }

  //Leave a trace in the DOM that jspsych was loaded
  document.documentElement.setAttribute('jspsych', 'present');

  return core;
})();

jsPsych.plugins = (function() {

  var module = {};

  // enumerate possible parameter types for plugins
  module.parameterType = {
    BOOL: 0,
    STRING: 1,
    INT: 2,
    FLOAT: 3,
    FUNCTION: 4,
    KEYCODE: 5,
    SELECT: 6,
    HTML_STRING: 7,
    IMAGE: 8,
    AUDIO: 9,
    VIDEO: 10,
    OBJECT: 11,
    COMPLEX: 12
  }

  module.universalPluginParameters = {
    data: {
      type: module.parameterType.OBJECT,
      pretty_name: 'Data',
      default: {},
      description: 'Data to add to this trial (key-value pairs)'
    },
    on_start: {
      type: module.parameterType.FUNCTION,
      pretty_name: 'On start',
      default: function() { return; },
      description: 'Function to execute when trial begins'
    },
    on_finish: {
      type: module.parameterType.FUNCTION,
      pretty_name: 'On finish',
      default: function() { return; },
      description: 'Function to execute when trial is finished'
    },
    on_load: {
      type: module.parameterType.FUNCTION,
      pretty_name: 'On load',
      default: function() { return; },
      description: 'Function to execute after the trial has loaded'
    },
    post_trial_gap: {
      type: module.parameterType.INT,
      pretty_name: 'Post trial gap',
      default: null,
      description: 'Length of gap between the end of this trial and the start of the next trial'
    }
  }

  return module;
})();

jsPsych.data = (function() {

  var module = {};

  // data storage object
  var allData = DataCollection();

  // browser interaction event data
  var interactionData = DataCollection();

  // data properties for all trials
  var dataProperties = {};

  // cache the query_string
  var query_string;

  // DataCollection
  function DataCollection(data){

    var data_collection = {};

    var trials = typeof data === 'undefined' ? [] : data;

    data_collection.push = function(new_data){
      trials.push(new_data);
      return data_collection;
    }

    data_collection.join = function(other_data_collection){
      trials = trials.concat(other_data_collection.values());
      return data_collection;
    }

    data_collection.top = function(){
      if(trials.length <= 1){
        return data_collection;
      } else {
        return DataCollection([trials[trials.length-1]]);
      }
    }

    data_collection.first = function(n){
      if(typeof n=='undefined'){ n = 1 }
      var out = [];
      for(var i=0; i<n; i++){
        out.push(trials[i]);
      }
      return DataCollection(out);
    }

    data_collection.last = function(n){
      if(typeof n=='undefined'){ n = 1 }
      var out = [];
      for(var i=trials.length-n; i<trials.length; i++){
        out.push(trials[i]);
      }
      return DataCollection(out);
    }

    data_collection.values = function(){
      return trials;
    }

    data_collection.count = function(){
      return trials.length;
    }

    data_collection.readOnly = function(){
      return DataCollection(jsPsych.utils.deepCopy(trials));
    }

    data_collection.addToAll = function(properties){
      for (var i = 0; i < trials.length; i++) {
        for (var key in properties) {
          trials[i][key] = properties[key];
        }
      }
      return data_collection;
    }

    data_collection.addToLast = function(properties){
      if(trials.length != 0){
        for (var key in properties) {
          trials[trials.length-1][key] = properties[key];
        }
      }
      return data_collection;
    }

    data_collection.filter = function(filters){
      // [{p1: v1, p2:v2}, {p1:v2}]
      // {p1: v1}
      if(!Array.isArray(filters)){
        var f = jsPsych.utils.deepCopy([filters]);
      } else {
        var f = jsPsych.utils.deepCopy(filters);
      }

      var filtered_data = [];
      for(var x=0; x < trials.length; x++){
        var keep = false;
        for(var i=0; i<f.length; i++){
          var match = true;
          var keys = Object.keys(f[i]);
          for(var k=0; k<keys.length; k++){
            if(typeof trials[x][keys[k]] !== 'undefined' && trials[x][keys[k]] == f[i][keys[k]]){
              // matches on this key!
            } else {
              match = false;
            }
          }
          if(match) { keep = true; break; } // can break because each filter is OR.
        }
        if(keep){
          filtered_data.push(trials[x]);
        }
      }

      var out = DataCollection(filtered_data);

      return out;
    }

    data_collection.filterCustom = function(fn){
      var included = [];
      for(var i=0; i<trials.length; i++){
        if(fn(trials[i])){
          included.push(trials[i]);
        }
      }
      return DataCollection(included);
    }

    data_collection.select = function(column){
      var values = [];
      for(var i=0; i<trials.length; i++){
        if(typeof trials[i][column] !== 'undefined'){
          values.push(trials[i][column]);
        }
      }
      var out = DataColumn();
      out.values = values;
      return out;
    }

    data_collection.ignore = function(columns){
      if(!Array.isArray(columns)){
        columns = [columns];
      }
      var o = jsPsych.utils.deepCopy(trials);
      for (var i = 0; i < o.length; i++) {
        for (var j in columns) {
          delete o[i][columns[j]];
        }
      }
      return DataCollection(o);
    }

    data_collection.uniqueNames = function(){
      var names = [];

      for(var i=0; i<trials.length; i++){
        var keys = Object.keys(trials[i]);
        for(var j=0; j<keys.length; j++){
          if(!names.includes(keys[j])){
            names.push(keys[j]);
          }
        }
      }

      return names;
    }

    data_collection.csv = function(){
      return JSON2CSV(trials);
    }

    data_collection.json = function(pretty){
      if(pretty){
        return JSON.stringify(trials, null, '\t');
      }
      return JSON.stringify(trials);
    }

    data_collection.localSave = function(format, filename){
      var data_string;

      if (format == 'JSON' || format == 'json') {
        data_string = data_collection.json();
      } else if (format == 'CSV' || format == 'csv') {
        data_string = data_collection.csv();
      } else {
        throw new Error('Invalid format specified for localSave. Must be "JSON" or "CSV".');
      }

      saveTextToFile(data_string, filename);
    }

    return data_collection;
  }

  // DataColumn class
  function DataColumn(){
    var data_column = {};

    data_column.values = [];

    data_column.sum = function(){
      var s = 0;
      for(var i=0; i<data_column.values.length; i++){
        s += data_column.values[i];
      }
      return s;
    }

    data_column.mean = function(){
      return data_column.sum() / data_column.count();
    }

    data_column.median = function(){
      if (data_column.values.length == 0) {return undefined};
      var numbers = data_column.values.slice(0).sort(function(a,b){ return a - b; });
      var middle = Math.floor(numbers.length / 2);
      var isEven = numbers.length % 2 === 0;
      return isEven ? (numbers[middle] + numbers[middle - 1]) / 2 : numbers[middle];
    }

    data_column.min = function(){
      return Math.min.apply(null, data_column.values);
    }

    data_column.max = function(){
      return Math.max.apply(null, data_column.values);
    }

    data_column.count = function(){
      return data_column.values.length;
    }

    data_column.variance = function(){
      var mean = data_column.mean();
      var sum_square_error = 0;
      for(var i=0; i<data_column.values.length; i++){
        sum_square_error += Math.pow(data_column.values[i] - mean,2);
      }
      var mse = sum_square_error / data_column.values.length;
      return mse;
    }

    data_column.sd = function(){
      var mse = data_column.variance();
      var rmse = Math.sqrt(mse);
      return rmse;
    }

    data_column.frequencies = function(){
      var unique = {}
      for(var i=0; i<data_column.values.length; i++){
        var v = data_column.values[i];
        if(typeof unique[v] == 'undefined'){
          unique[v] = 1;
        } else {
          unique[v]++;
        }
      }
      return unique;
    }

    data_column.all = function(eval_fn){
      for(var i=0; i<data_column.values.length; i++){
        if(!eval_fn(data_column.values[i])){
          return false;
        }
      }
      return true;
    }

    data_column.subset = function(eval_fn){
      var out = [];
      for(var i=0; i<data_column.values.length; i++){
        if(eval_fn(data_column.values[i])){
          out.push(data_column.values[i]);
        }
      }
      var o = DataColumn();
      o.values = out;
      return o;
    }

    return data_column;
  }

  module.reset = function(){
    allData = DataCollection();
    interactionData = DataCollection();
  }

  module.get = function() {
    return allData;
  };

  module.getInteractionData = function() {
    return interactionData;
  }

  module.write = function(data_object) {

    var progress = jsPsych.progress();
    var trial = jsPsych.currentTrial();

    //var trial_opt_data = typeof trial.data == 'function' ? trial.data() : trial.data;

    var default_data = {
      'trial_type': trial.type,
      'trial_index': progress.current_trial_global,
      'time_elapsed': jsPsych.totalTime(),
      'internal_node_id': jsPsych.currentTimelineNodeID()
    };

    var ext_data_object = Object.assign({}, data_object, trial.data, default_data, dataProperties);

    allData.push(ext_data_object);
  };

  module.addProperties = function(properties) {

    // first, add the properties to all data that's already stored
    allData.addToAll(properties);

    // now add to list so that it gets appended to all future data
    dataProperties = Object.assign({}, dataProperties, properties);

  };

  module.addDataToLastTrial = function(data) {
    allData.addToLast(data);
  }

  module.getDataByTimelineNode = function(node_id) {
    var data = allData.filterCustom(function(x){
      return x.internal_node_id.slice(0, node_id.length) === node_id;
    });

    return data;
  };

  module.getLastTrialData = function() {
    return allData.top();
  };

  module.getLastTimelineData = function() {
    var lasttrial = module.getLastTrialData();
    var node_id = lasttrial.select('internal_node_id').values[0];
    if (typeof node_id === 'undefined') {
      return DataCollection();
    } else {
      var parent_node_id = node_id.substr(0,node_id.lastIndexOf('-'));
      var lastnodedata = module.getDataByTimelineNode(parent_node_id);
      return lastnodedata;
    }
  }

  module.displayData = function(format) {
    format = (typeof format === 'undefined') ? "json" : format.toLowerCase();
    if (format != "json" && format != "csv") {
      console.log('Invalid format declared for displayData function. Using json as default.');
      format = "json";
    }

    var data_string;

    if (format == 'json') {
      data_string = allData.json(true); // true = pretty print with tabs
    } else {
      data_string = allData.csv();
    }

    var display_element = jsPsych.getDisplayElement();

    display_element.innerHTML = '<pre id="jspsych-data-display"></pre>';

    document.getElementById('jspsych-data-display').textContent = data_string;
  };

  module.urlVariables = function() {
    if(typeof query_string == 'undefined'){
      query_string = getQueryString();
    }
    return query_string;
  }

  module.getURLVariable = function(whichvar){
    if(typeof query_string == 'undefined'){
      query_string = getQueryString();
    }
    return query_string[whichvar];
  }

  module.createInteractionListeners = function(){
    // blur event capture
    window.addEventListener('blur', function(){
      var data = {
        event: 'blur',
        trial: jsPsych.progress().current_trial_global,
        time: jsPsych.totalTime()
      };
      interactionData.push(data);
      jsPsych.initSettings().on_interaction_data_update(data);
    });

    // focus event capture
    window.addEventListener('focus', function(){
      var data = {
        event: 'focus',
        trial: jsPsych.progress().current_trial_global,
        time: jsPsych.totalTime()
      };
      interactionData.push(data);
      jsPsych.initSettings().on_interaction_data_update(data);
    });

    // fullscreen change capture
    function fullscreenchange(){
      var type = (document.isFullScreen || document.webkitIsFullScreen || document.mozIsFullScreen) ? 'fullscreenenter' : 'fullscreenexit';
      var data = {
        event: type,
        trial: jsPsych.progress().current_trial_global,
        time: jsPsych.totalTime()
      };
      interactionData.push(data);
      jsPsych.initSettings().on_interaction_data_update(data);
    }

    document.addEventListener('fullscreenchange', fullscreenchange);
    document.addEventListener('mozfullscreenchange', fullscreenchange);
    document.addEventListener('webkitfullscreenchange', fullscreenchange);
  }

  // public methods for testing purposes. not recommended for use.
  module._customInsert = function(data){
    allData = DataCollection(data);
  }

  module._fullreset = function(){
    module.reset();
    dataProperties = {};
  }

  // private function to save text file on local drive
  function saveTextToFile(textstr, filename) {
    var blobToSave = new Blob([textstr], {
      type: 'text/plain'
    });
    var blobURL = "";
    if (typeof window.webkitURL !== 'undefined') {
      blobURL = window.webkitURL.createObjectURL(blobToSave);
    } else {
      blobURL = window.URL.createObjectURL(blobToSave);
    }

    var display_element = jsPsych.getDisplayElement();

    display_element.insertAdjacentHTML('beforeend','<a id="jspsych-download-as-text-link" style="display:none;" download="'+filename+'" href="'+blobURL+'">click to download</a>');
    document.getElementById('jspsych-download-as-text-link').click();
  }

  //
  // A few helper functions to handle data format conversion
  //

  // this function based on code suggested by StackOverflow users:
  // http://stackoverflow.com/users/64741/zachary
  // http://stackoverflow.com/users/317/joseph-sturtevant

  function JSON2CSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var line = '';
    var result = '';
    var columns = [];

    var i = 0;
    for (var j = 0; j < array.length; j++) {
      for (var key in array[j]) {
        var keyString = key + "";
        keyString = '"' + keyString.replace(/"/g, '""') + '",';
        if (!columns.includes(key)) {
          columns[i] = key;
          line += keyString;
          i++;
        }
      }
    }

    line = line.slice(0, -1);
    result += line + '\r\n';

    for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var j = 0; j < columns.length; j++) {
        var value = (typeof array[i][columns[j]] === 'undefined') ? '' : array[i][columns[j]];
        var valueString = value + "";
        line += '"' + valueString.replace(/"/g, '""') + '",';
      }

      line = line.slice(0, -1);
      result += line + '\r\n';
    }

    return result;
  }

  // this function is modified from StackOverflow:
  // http://stackoverflow.com/posts/3855394

  function getQueryString() {
    var a = window.location.search.substr(1).split('&');
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
  }

  return module;

})();

jsPsych.turk = (function() {

  var module = {};

  // core.turkInfo gets information relevant to mechanical turk experiments. returns an object
  // containing the workerID, assignmentID, and hitID, and whether or not the HIT is in
  // preview mode, meaning that they haven't accepted the HIT yet.
  module.turkInfo = function() {

    var turk = {};

    var param = function(url, name) {
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regexS = "[\\?&]" + name + "=([^&#]*)";
      var regex = new RegExp(regexS);
      var results = regex.exec(url);
      return (results == null) ? "" : results[1];
    };

    var src = param(window.location.href, "assignmentId") ? window.location.href : document.referrer;

    var keys = ["assignmentId", "hitId", "workerId", "turkSubmitTo"];
    keys.map(

      function(key) {
        turk[key] = unescape(param(src, key));
      });

    turk.previewMode = (turk.assignmentId == "ASSIGNMENT_ID_NOT_AVAILABLE");

    turk.outsideTurk = (!turk.previewMode && turk.hitId === "" && turk.assignmentId == "" && turk.workerId == "")

    turk_info = turk;

    return turk;

  };

  // core.submitToTurk will submit a MechanicalTurk ExternalHIT type
  module.submitToTurk = function(data) {

    var turkInfo = jsPsych.turk.turkInfo();
    var assignmentId = turkInfo.assignmentId;
    var turkSubmitTo = turkInfo.turkSubmitTo;

    if (!assignmentId || !turkSubmitTo) return;

    var dataString = [];

    for (var key in data) {

      if (data.hasOwnProperty(key)) {
        dataString.push(key + "=" + escape(data[key]));
      }
    }

    dataString.push("assignmentId=" + assignmentId);

    var url = turkSubmitTo + "/mturk/externalSubmit?" + dataString.join("&");

    window.location.href = url;
  };

  return module;

})();

jsPsych.randomization = (function() {

  var module = {};

  module.repeat = function(array, repetitions, unpack) {

    var arr_isArray = Array.isArray(array);
    var rep_isArray = Array.isArray(repetitions);

    // if array is not an array, then we just repeat the item
    if (!arr_isArray) {
      if (!rep_isArray) {
        array = [array];
        repetitions = [repetitions];
      } else {
        repetitions = [repetitions[0]];
        console.log('Unclear parameters given to randomization.repeat. Multiple set sizes specified, but only one item exists to sample. Proceeding using the first set size.');
      }
    } else {
      if (!rep_isArray) {
        var reps = [];
        for (var i = 0; i < array.length; i++) {
          reps.push(repetitions);
        }
        repetitions = reps;
      } else {
        if (array.length != repetitions.length) {
          console.warning('Unclear parameters given to randomization.repeat. Items and repetitions are unequal lengths. Behavior may not be as expected.');
          // throw warning if repetitions is too short, use first rep ONLY.
          if (repetitions.length < array.length) {
            var reps = [];
            for (var i = 0; i < array.length; i++) {
              reps.push(repetitions);
            }
            repetitions = reps;
          } else {
            // throw warning if too long, and then use the first N
            repetitions = repetions.slice(0, array.length);
          }
        }
      }
    }

    // should be clear at this point to assume that array and repetitions are arrays with == length
    var allsamples = [];
    for (var i = 0; i < array.length; i++) {
      for (var j = 0; j < repetitions[i]; j++) {
        if(array[i] == null || typeof array[i] != 'object'){
          allsamples.push(array[i]);
        } else {
          allsamples.push(Object.assign({}, array[i]));
        }

      }
    }

    var out = shuffle(allsamples);

    if (unpack) {
      out = unpackArray(out);
    }

    return out;
  }

  module.shuffle = function(arr) {
    return shuffle(arr);
  }

  module.shuffleNoRepeats = function(arr, equalityTest) {
    // define a default equalityTest
    if (typeof equalityTest == 'undefined') {
      equalityTest = function(a, b) {
        if (a === b) {
          return true;
        } else {
          return false;
        }
      }
    }

    var random_shuffle = shuffle(arr);
    for (var i = 0; i < random_shuffle.length - 2; i++) {
      if (equalityTest(random_shuffle[i], random_shuffle[i + 1])) {
        // neighbors are equal, pick a new random neighbor to swap (not the first or last element, to avoid edge cases)
        var random_pick = Math.floor(Math.random() * (random_shuffle.length - 2)) + 1;
        // test to make sure the new neighbor isn't equal to the old one
        while (
          equalityTest(random_shuffle[i + 1], random_shuffle[random_pick]) ||
          (equalityTest(random_shuffle[i + 1], random_shuffle[random_pick + 1]) || equalityTest(random_shuffle[i + 1], random_shuffle[random_pick - 1]))
        ) {
          random_pick = Math.floor(Math.random() * (random_shuffle.length - 2)) + 1;
        }
        var new_neighbor = random_shuffle[random_pick];
        random_shuffle[random_pick] = random_shuffle[i + 1];
        random_shuffle[i + 1] = new_neighbor;
      }
    }

    return random_shuffle;
  }

  module.sampleWithoutReplacement = function(arr, size){
    if (size > arr.length) {
      console.error("Cannot take a sample " +
        "larger than the size of the set of items to sample.");
    }
    return jsPsych.randomization.shuffle(arr).slice(0,size);
  }

  module.sampleWithReplacement = function(arr, size, weights) {
    var normalized_weights = [];
    if(typeof weights !== 'undefined'){
      if(weights.length !== arr.length){
        console.error('The length of the weights array must equal the length of the array '+
        'to be sampled from.');
      }
      var weight_sum = 0;
      for(var i=0; i<weights.length; i++){
        weight_sum += weights[i];
      }
      for(var i=0; i<weights.length; i++){
        normalized_weights.push( weights[i] / weight_sum );
      }
    } else {
      for(var i=0; i<arr.length; i++){
        normalized_weights.push( 1 / arr.length );
      }
    }

    var cumulative_weights = [normalized_weights[0]];
    for(var i=1; i<normalized_weights.length; i++){
      cumulative_weights.push(normalized_weights[i] + cumulative_weights[i-1]);
    }

    var samp = [];
    for (var i = 0; i < size; i++) {
      var rnd = Math.random();
      var index = 0;
      while(rnd > cumulative_weights[index]) { index++; }
      samp.push(arr[index]);
    }
    return samp;
  }

  module.factorial = function(factors, repetitions, unpack) {

    var factorNames = Object.keys(factors);

    var factor_combinations = [];

    for (var i = 0; i < factors[factorNames[0]].length; i++) {
      factor_combinations.push({});
      factor_combinations[i][factorNames[0]] = factors[factorNames[0]][i];
    }

    for (var i = 1; i < factorNames.length; i++) {
      var toAdd = factors[factorNames[i]];
      var n = factor_combinations.length;
      for (var j = 0; j < n; j++) {
        var base = factor_combinations[j];
        for (var k = 0; k < toAdd.length; k++) {
          var newpiece = {};
          newpiece[factorNames[i]] = toAdd[k];
          factor_combinations.push(Object.assign({}, base, newpiece));
        }
      }
      factor_combinations.splice(0, n);
    }

    repetitions = (typeof repetitions === 'undefined') ? 1 : repetitions;
    var with_repetitions = module.repeat(factor_combinations, repetitions, unpack);

    return with_repetitions;
  }

  module.randomID = function(length){
    var result = '';
    var length = (typeof length == 'undefined') ? 32 : length;
    var chars = '0123456789abcdefghjklmnopqrstuvwxyz';
    for(var i = 0; i<length; i++){
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  function unpackArray(array) {

    var out = {};

    for (var i = 0; i < array.length; i++) {
      var keys = Object.keys(array[i]);
      for (var k = 0; k < keys.length; k++) {
        if (typeof out[keys[k]] === 'undefined') {
          out[keys[k]] = [];
        }
        out[keys[k]].push(array[i][keys[k]]);
      }
    }

    return out;
  }

  function shuffle(array) {
    var copy_array = array.slice(0);
    var m = copy_array.length,
      t, i;

    // While there remain elements to shuffle…
    while (m) {

      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);

      // And swap it with the current element.
      t = copy_array[m];
      copy_array[m] = copy_array[i];
      copy_array[i] = t;
    }

    return copy_array;
  }

  return module;

})();

jsPsych.pluginAPI = (function() {

  var module = {};

  // keyboard listeners //

  var keyboard_listeners = [];

  var held_keys = {};

  var root_keydown_listener = function(e){
    for(var i=0; i<keyboard_listeners.length; i++){
      keyboard_listeners[i].fn(e);
    }
    held_keys[e.keyCode] = true;
  }
  var root_keyup_listener = function(e){
    held_keys[e.keyCode] = false;
  }

  module.reset = function(root_element){
    keyboard_listeners = [];
    held_keys = {};
    root_element.removeEventListener('keydown', root_keydown_listener);
    root_element.removeEventListener('keyup', root_keyup_listener);
  }

  module.createKeyboardEventListeners = function(root_element){
    root_element.addEventListener('keydown', root_keydown_listener);
    root_element.addEventListener('keyup', root_keyup_listener);
  }

  module.getKeyboardResponse = function(parameters) {
    //parameters are: callback_function, valid_responses, rt_method, persist, audio_context, audio_context_start_time, allow_held_key?

    parameters.rt_method = (typeof parameters.rt_method === 'undefined') ? 'date' : parameters.rt_method;
    if (parameters.rt_method != 'date' && parameters.rt_method != 'performance' && parameters.rt_method != 'audio') {
      console.log('Invalid RT method specified in getKeyboardResponse. Defaulting to "date" method.');
      parameters.rt_method = 'date';
    }

    var start_time;
    if (parameters.rt_method == 'date') {
      start_time = (new Date()).getTime();
    } else if (parameters.rt_method == 'performance') {
      start_time = performance.now();
    } else if (parameters.rt_method == 'audio') {
      start_time = parameters.audio_context_start_time;
    }

    var listener_id;

    var listener_function = function(e) {

      var key_time;
      if (parameters.rt_method == 'date') {
        key_time = (new Date()).getTime();
      } else if (parameters.rt_method == 'performance') {
        key_time = performance.now();
      } else if (parameters.rt_method == 'audio') {
        key_time = parameters.audio_context.currentTime
      }

      var valid_response = false;
      if (typeof parameters.valid_responses === 'undefined' || parameters.valid_responses == jsPsych.ALL_KEYS) {
        valid_response = true;
      } else {
        if(parameters.valid_responses != jsPsych.NO_KEYS){
          for (var i = 0; i < parameters.valid_responses.length; i++) {
            if (typeof parameters.valid_responses[i] == 'string') {
              var kc = jsPsych.pluginAPI.convertKeyCharacterToKeyCode(parameters.valid_responses[i]);
              if (typeof kc !== 'undefined') {
                if (e.keyCode == kc) {
                  valid_response = true;
                }
              } else {
                throw new Error('Invalid key string specified for getKeyboardResponse');
              }
            } else if (e.keyCode == parameters.valid_responses[i]) {
              valid_response = true;
            }
          }
        }
      }
      // check if key was already held down

      if (((typeof parameters.allow_held_key == 'undefined') || !parameters.allow_held_key) && valid_response) {
        if (typeof held_keys[e.keyCode] !== 'undefined' && held_keys[e.keyCode] == true) {
          valid_response = false;
        }
      }

      if (valid_response) {

        parameters.callback_function({
          key: e.keyCode,
          rt: key_time - start_time
        });

        if (keyboard_listeners.includes(listener_id)) {

          if (!parameters.persist) {
            // remove keyboard listener
            module.cancelKeyboardResponse(listener_id);
          }
        }
      }
    };

    // create listener id object
    listener_id = {
      type: 'keydown',
      fn: listener_function
    };

    // add this keyboard listener to the list of listeners
    keyboard_listeners.push(listener_id);

    return listener_id;

  };

  module.cancelKeyboardResponse = function(listener) {
    // remove the listener from the list of listeners
    if (keyboard_listeners.includes(listener)) {
      keyboard_listeners.splice(keyboard_listeners.indexOf(listener), 1);
    }
  };

  module.cancelAllKeyboardResponses = function() {
    keyboard_listeners = [];
  };

  module.convertKeyCharacterToKeyCode = function(character) {
    var code;
    character = character.toLowerCase();
    if (typeof keylookup[character] !== 'undefined') {
      code = keylookup[character];
    }
    return code;
  }

  module.convertKeyCodeToKeyCharacter = function(code){
    for(var i in Object.keys(keylookup)){
      if(keylookup[Object.keys(keylookup)[i]] == code){
        return Object.keys(keylookup)[i];
      }
    }
    return undefined;
  }

  module.compareKeys = function(key1, key2){
    // convert to numeric values no matter what
    if(typeof key1 == 'string') {
      key1 = module.convertKeyCharacterToKeyCode(key1);
    }
    if(typeof key2 == 'string') {
      key2 = module.convertKeyCharacterToKeyCode(key2);
    }
    return key1 == key2;
  }

  var keylookup = {
    'backspace': 8,
    'tab': 9,
    'enter': 13,
    'shift': 16,
    'ctrl': 17,
    'alt': 18,
    'pause': 19,
    'capslock': 20,
    'esc': 27,
    'space': 32,
    'spacebar': 32,
    ' ': 32,
    'pageup': 33,
    'pagedown': 34,
    'end': 35,
    'home': 36,
    'leftarrow': 37,
    'uparrow': 38,
    'rightarrow': 39,
    'downarrow': 40,
    'insert': 45,
    'delete': 46,
    '0': 48,
    '1': 49,
    '2': 50,
    '3': 51,
    '4': 52,
    '5': 53,
    '6': 54,
    '7': 55,
    '8': 56,
    '9': 57,
    'a': 65,
    'b': 66,
    'c': 67,
    'd': 68,
    'e': 69,
    'f': 70,
    'g': 71,
    'h': 72,
    'i': 73,
    'j': 74,
    'k': 75,
    'l': 76,
    'm': 77,
    'n': 78,
    'o': 79,
    'p': 80,
    'q': 81,
    'r': 82,
    's': 83,
    't': 84,
    'u': 85,
    'v': 86,
    'w': 87,
    'x': 88,
    'y': 89,
    'z': 90,
    '0numpad': 96,
    '1numpad': 97,
    '2numpad': 98,
    '3numpad': 99,
    '4numpad': 100,
    '5numpad': 101,
    '6numpad': 102,
    '7numpad': 103,
    '8numpad': 104,
    '9numpad': 105,
    'multiply': 106,
    'plus': 107,
    'minus': 109,
    'decimal': 110,
    'divide': 111,
    'f1': 112,
    'f2': 113,
    'f3': 114,
    'f4': 115,
    'f5': 116,
    'f6': 117,
    'f7': 118,
    'f8': 119,
    'f9': 120,
    'f10': 121,
    'f11': 122,
    'f12': 123,
    '=': 187,
    ',': 188,
    '.': 190,
    '/': 191,
    '`': 192,
    '[': 219,
    '\\': 220,
    ']': 221
  };

  // timeout registration

  var timeout_handlers = [];

  module.setTimeout = function(callback, delay){
    var handle = setTimeout(callback, delay);
    timeout_handlers.push(handle);
    return handle;
  }

  module.clearAllTimeouts = function(){
    for(var i=0;i<timeout_handlers.length; i++){
      clearTimeout(timeout_handlers[i]);
    }
    timeout_handlers = [];
  }

  // audio //
  var context = null;
  var audio_buffers = [];

  module.initAudio = function(){
    context = (jsPsych.initSettings().use_webaudio == true) ? jsPsych.webaudio_context : null;
  }

  module.audioContext = function(){
    if(context !== null){
      if(context.state !== 'running'){
        context.resume();
      }
    }
    return context;
  }

  module.getAudioBuffer = function(audioID) {

    if (audio_buffers[audioID] == 'tmp') {
      console.error('Audio file failed to load in the time alloted.')
      return;
    }

    return audio_buffers[audioID];

  }

  // preloading stimuli //

  var preloads = [];

  var img_cache = {};

  module.preloadAudioFiles = function(files, callback_complete, callback_load) {

    files = jsPsych.utils.flatten(files);
    files = jsPsych.utils.unique(files);

    var n_loaded = 0;
    var loadfn = (typeof callback_load === 'undefined') ? function() {} : callback_load;
    var finishfn = (typeof callback_complete === 'undefined') ? function() {} : callback_complete;

    if(files.length==0){
      finishfn();
      return;
    }

    function load_audio_file_webaudio(source, count){
      count = count || 1;
      var request = new XMLHttpRequest();
      request.open('GET', source, true);
      request.responseType = 'arraybuffer';
      request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
          audio_buffers[source] = buffer;
          n_loaded++;
          loadfn(n_loaded);
          if(n_loaded == files.length) {
            finishfn();
          }
        }, function() {
          console.error('Error loading audio file: ' + bufferID);
        });
      }
      request.onerror = function(){
        if(count < jsPsych.initSettings().max_preload_attempts){
          setTimeout(function(){
            load_audio_file_webaudio(source, count+1)
          }, 200);
        } else {
          jsPsych.loadFail();
        }
      }
      request.send();
    }

    function load_audio_file_html5audio(source, count){
      count = count || 1;
      var audio = new Audio();
      audio.addEventListener('canplaythrough', function(){
        audio_buffers[source] = audio;
        n_loaded++;
        loadfn(n_loaded);
        if(n_loaded == files.length){
          finishfn();
        }
      });
      audio.addEventListener('onerror', function(){
        if(count < jsPsych.initSettings().max_preload_attempts){
          setTimeout(function(){
            load_audio_file_html5audio(source, count+1)
          }, 200);
        } else {
          jsPsych.loadFail();
        }
      });
      audio.addEventListener('onstalled', function(){
        if(count < jsPsych.initSettings().max_preload_attempts){
          setTimeout(function(){
            load_audio_file_html5audio(source, count+1)
          }, 200);
        } else {
          jsPsych.loadFail();
        }
      });
      audio.addEventListener('onabort', function(){
        if(count < jsPsych.initSettings().max_preload_attempts){
          setTimeout(function(){
            load_audio_file_html5audio(source, count+1)
          }, 200);
        } else {
          jsPsych.loadFail();
        }
      });
      audio.src = source;
    }

    for (var i = 0; i < files.length; i++) {
      var bufferID = files[i];
      if (typeof audio_buffers[bufferID] !== 'undefined') {
        n_loaded++;
        loadfn(n_loaded);
        if(n_loaded == files.length) {
          finishfn();
        }
      } else {
        audio_buffers[bufferID] = 'tmp';
        if(module.audioContext() !== null){
          load_audio_file_webaudio(bufferID);
        } else {
          load_audio_file_html5audio(bufferID);
        }
      }
    }

  }

  module.preloadImages = function(images, callback_complete, callback_load) {

    // flatten the images array
    images = jsPsych.utils.flatten(images);
    images = jsPsych.utils.unique(images);

    var n_loaded = 0;
    var loadfn = (typeof callback_load === 'undefined') ? function() {} : callback_load;
    var finishfn = (typeof callback_complete === 'undefined') ? function() {} : callback_complete;

    if(images.length==0){
      finishfn();
      return;
    }

    function preload_image(source, count){
      count = count || 1;

      var img = new Image();

      img.onload = function() {
        n_loaded++;
        loadfn(n_loaded);
        if (n_loaded == images.length) {
          finishfn();
        }
      };

      img.onerror = function() {
        if(count < jsPsych.initSettings().max_preload_attempts){
          setTimeout(function(){
            preload_image(source, count+1);
          }, 200);
        } else {
          jsPsych.loadFail();
        }
      }

      img.src = source;

      img_cache[source] = img;
    }

    for (var i = 0; i < images.length; i++) {
      preload_image(images[i]);
    }

  };

  module.registerPreload = function(plugin_name, parameter, media_type, conditional_function) {
    if (!(media_type == 'audio' || media_type == 'image')) {
      console.error('Invalid media_type parameter for jsPsych.pluginAPI.registerPreload. Please check the plugin file.');
    }

    var preload = {
      plugin: plugin_name,
      parameter: parameter,
      media_type: media_type,
      conditional_function: conditional_function
    }

    preloads.push(preload);
  }

  module.autoPreload = function(timeline, callback, images, audio, progress_bar) {
    // list of items to preload
    images = typeof images === 'undefined' ? [] : images;
    audio = typeof audio === 'undefined' ? [] : audio;

    // construct list
    for (var i = 0; i < preloads.length; i++) {
      var type = preloads[i].plugin;
      var param = preloads[i].parameter;
      var media = preloads[i].media_type;
      var func = preloads[i].conditional_function;
      var trials = timeline.trialsOfType(type);
      for (var j = 0; j < trials.length; j++) {
        if (typeof trials[j][param] !== 'undefined' && typeof trials[j][param] !== 'function') {
          if ( typeof func == 'undefined' || func(trials[j]) ){
            if (media == 'image') {
              images = images.concat(jsPsych.utils.flatten([trials[j][param]]));
            } else if (media == 'audio') {
              audio = audio.concat(jsPsych.utils.flatten([trials[j][param]]));
            }
          }
        }
      }
    }

    images = jsPsych.utils.unique(images);
    audio  = jsPsych.utils.unique(audio);

    var total_n = images.length + audio.length;
    var loaded = 0;

    if(progress_bar){
      var pb_html = "<div id='jspsych-loading-progress-bar-container' style='height: 10px; width: 300px; background-color: #ddd;'>";
      pb_html += "<div id='jspsych-loading-progress-bar' style='height: 10px; width: 0%; background-color: #777;'></div>";
      pb_html += "</div>";
      jsPsych.getDisplayElement().innerHTML = pb_html;
    }

    function update_loading_progress_bar(){
      loaded++;
      if(progress_bar){
        var percent_loaded = (loaded/total_n)*100;
        jsPsych.getDisplayElement().querySelector('#jspsych-loading-progress-bar').style.width = percent_loaded+"%";
      }
    }

    // do the preloading
    // first the images, then when the images are complete
    // wait for the audio files to finish
    module.preloadImages(images, function() {
      module.preloadAudioFiles(audio, function() {
        callback();
      }, update_loading_progress_bar);
    }, update_loading_progress_bar);
  }

  /**
   * Allows communication with user hardware through our custom Google Chrome extension + native C++ program
   * @param		{object}	mess	The message to be passed to our extension, see its documentation for the expected members of this object.
   * @author	Daniel Rivas
   *
   */
  module.hardware = function hardware(mess){
	  //since Chrome extension content-scripts do not share the javascript environment with the page script that loaded jspsych,
	  //we will need to use hacky methods like communicating through DOM events.
	  var jspsychEvt = new CustomEvent('jspsych', {detail: mess});
	  document.dispatchEvent(jspsychEvt);
	  //And voila! it will be the job of the content script injected by the extension to listen for the event and do the appropriate actions.
  };

  /** {boolean} Indicates whether this instance of jspsych has opened a hardware connection through our browser extension */
  module.hardwareConnected = false;


  //it might be useful to open up a line of communication from the extension back to this page script,
  //again, this will have to pass through DOM events. For now speed is of no concern so I will use jQuery
  document.addEventListener("jspsych-activate", function(evt){
	  module.hardwareConnected = true;
  })



  return module;
})();

// methods used in multiple modules //
jsPsych.utils = (function() {

	var module = {};

	module.flatten = function(arr, out) {
		out = (typeof out === 'undefined') ? [] : out;
		for (var i = 0; i < arr.length; i++) {
			if (Array.isArray(arr[i])) {
				module.flatten(arr[i], out);
			} else {
				out.push(arr[i]);
			}
		}
		return out;
	}

	module.unique = function(arr) {
		var out = [];
		for (var i = 0; i < arr.length; i++) {
			if (arr.indexOf(arr[i]) == i) {
				out.push(arr[i]);
			}
		}
		return out;
	}

	module.deepCopy = function(obj) {
    if(!obj) return obj;
    var out;
    if(Array.isArray(obj)){
      out = [];
      for(var i = 0; i<obj.length; i++){
        out.push(module.deepCopy(obj[i]));
      }
      return out;
    } else if(typeof obj === 'object'){
      out = {};
      for(var key in obj){
        if(obj.hasOwnProperty(key)){
          out[key] = module.deepCopy(obj[key]);
        }
      }
      return out;
    } else {
      return obj;
    }
  }

	return module;
})();

// polyfill for Object.assign to support IE
if (typeof Object.assign != 'function') {
  Object.assign = function (target, varArgs) { // .length of function is 2
    'use strict';
    if (target == null) { // TypeError if undefined or null
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource != null) { // Skip over if undefined or null
        for (var nextKey in nextSource) {
          // Avoid bugs when hasOwnProperty is shadowed
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// polyfill for Array.includes to support IE
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.includes called on null or undefined');
    }

    var O = Object(this);
    var len = parseInt(O.length, 10) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1], 10) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}

// polyfill for Array.isArray
if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}
