import { JsPsych } from "./JsPsych";
import {
  repeat,
  sampleWithReplacement,
  sampleWithoutReplacement,
  shuffle,
  shuffleAlternateGroups,
} from "./modules/randomization";
import { deepCopy } from "./modules/utils";

export class TimelineNode {
  // a unique ID for this node, relative to the parent
  relative_id;

  // store the parent for this node
  parent_node;

  // parameters for the trial if the node contains a trial
  trial_parameters;

  // parameters for nodes that contain timelines
  timeline_parameters;

  // stores trial information on a node that contains a timeline
  // used for adding new trials
  node_trial_data;

  // track progress through the node
  progress = <any>{
    current_location: -1, // where on the timeline (which timelinenode)
    current_variable_set: 0, // which set of variables to use from timeline_variables
    current_repetition: 0, // how many times through the variable set on this run of the node
    current_iteration: 0, // how many times this node has been revisited
    done: false,
  };

  end_message?: string;

  // constructor
  constructor(private jsPsych: JsPsych, parameters, parent?, relativeID?) {
    // store a link to the parent of this node
    this.parent_node = parent;

    // create the ID for this node
    this.relative_id = typeof parent === "undefined" ? 0 : relativeID;

    // check if there is a timeline parameter
    // if there is, then this node has its own timeline
    if (typeof parameters.timeline !== "undefined") {
      // create timeline properties
      this.timeline_parameters = {
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

      this.setTimelineVariablesOrder();

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
      this.node_trial_data = node_data; // store for later...

      // create a TimelineNode for each element in the timeline
      for (var i = 0; i < parameters.timeline.length; i++) {
        // merge parameters
        var merged_parameters = Object.assign({}, node_data, parameters.timeline[i]);
        // merge any data from the parent node into child nodes
        if (typeof node_data.data == "object" && typeof parameters.timeline[i].data == "object") {
          var merged_data = Object.assign({}, node_data.data, parameters.timeline[i].data);
          merged_parameters.data = merged_data;
        }
        this.timeline_parameters.timeline.push(
          new TimelineNode(this.jsPsych, merged_parameters, this, i)
        );
      }
    }
    // if there is no timeline parameter, then this node is a trial node
    else {
      // check to see if a valid trial type is defined
      if (typeof parameters.type === "undefined") {
        console.error(
          'Trial level node is missing the "type" parameter. The parameters for the node are: ' +
            JSON.stringify(parameters)
        );
      }
      // create a deep copy of the parameters for the trial
      this.trial_parameters = { ...parameters };
    }
  }

  // recursively get the next trial to run.
  // if this node is a leaf (trial), then return the trial.
  // otherwise, recursively find the next trial in the child timeline.
  trial() {
    if (typeof this.timeline_parameters == "undefined") {
      // returns a clone of the trial_parameters to
      // protect functions.
      return deepCopy(this.trial_parameters);
    } else {
      if (this.progress.current_location >= this.timeline_parameters.timeline.length) {
        return null;
      } else {
        return this.timeline_parameters.timeline[this.progress.current_location].trial();
      }
    }
  }

  markCurrentTrialComplete() {
    if (typeof this.timeline_parameters === "undefined") {
      this.progress.done = true;
    } else {
      this.timeline_parameters.timeline[this.progress.current_location].markCurrentTrialComplete();
    }
  }

  nextRepetiton() {
    this.setTimelineVariablesOrder();
    this.progress.current_location = -1;
    this.progress.current_variable_set = 0;
    this.progress.current_repetition++;
    for (var i = 0; i < this.timeline_parameters.timeline.length; i++) {
      this.timeline_parameters.timeline[i].reset();
    }
  }

  // set the order for going through the timeline variables array
  setTimelineVariablesOrder() {
    const timeline_parameters = this.timeline_parameters;

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
        order = sampleWithReplacement(
          order,
          timeline_parameters.sample.size,
          timeline_parameters.sample.weights
        );
      } else if (timeline_parameters.sample.type == "without-replacement") {
        order = sampleWithoutReplacement(order, timeline_parameters.sample.size);
      } else if (timeline_parameters.sample.type == "fixed-repetitions") {
        order = repeat(order, timeline_parameters.sample.size, false);
      } else if (timeline_parameters.sample.type == "alternate-groups") {
        order = shuffleAlternateGroups(
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
      order = shuffle(order);
    }

    this.progress.order = order;
  }

  // next variable set
  nextSet() {
    this.progress.current_location = -1;
    this.progress.current_variable_set++;
    for (var i = 0; i < this.timeline_parameters.timeline.length; i++) {
      this.timeline_parameters.timeline[i].reset();
    }
  }

  // update the current trial node to be completed
  // returns true if the node is complete after advance (all subnodes are also complete)
  // returns false otherwise
  advance() {
    const progress = this.progress;
    const timeline_parameters = this.timeline_parameters;
    const internal = this.jsPsych.internal;

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
          internal.call_immediate = true;
          var conditional_result = timeline_parameters.conditional_function();
          internal.call_immediate = false;
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
          internal.call_immediate = true;
          if (timeline_parameters.loop_function(this.generatedData())) {
            this.reset();
            internal.call_immediate = false;
            return this.parent_node.advance();
          } else {
            progress.done = true;
            internal.call_immediate = false;
            return true;
          }
        }
      }

      // no more loops on this timeline, we're done!
      progress.done = true;
      return true;
    }
  }

  // check the status of the done flag
  isComplete() {
    return this.progress.done;
  }

  // getter method for timeline variables
  getTimelineVariableValue(variable_name: string) {
    if (typeof this.timeline_parameters == "undefined") {
      return undefined;
    }
    var v =
      this.timeline_parameters.timeline_variables[
        this.progress.order[this.progress.current_variable_set]
      ][variable_name];
    return v;
  }

  // recursive upward search for timeline variables
  findTimelineVariable(variable_name) {
    var v = this.getTimelineVariableValue(variable_name);
    if (typeof v == "undefined") {
      if (typeof this.parent_node !== "undefined") {
        return this.parent_node.findTimelineVariable(variable_name);
      } else {
        return undefined;
      }
    } else {
      return v;
    }
  }

  // recursive downward search for active trial to extract timeline variable
  timelineVariable(variable_name: string) {
    if (typeof this.timeline_parameters == "undefined") {
      const val = this.findTimelineVariable(variable_name);
      if (typeof val === "undefined") {
        console.warn("Timeline variable " + variable_name + " not found.");
      }
      return val;
    } else {
      // if progress.current_location is -1, then the timeline variable is being evaluated
      // in a function that runs prior to the trial starting, so we should treat that trial
      // as being the active trial for purposes of finding the value of the timeline variable
      var loc = Math.max(0, this.progress.current_location);
      // if loc is greater than the number of elements on this timeline, then the timeline
      // variable is being evaluated in a function that runs after the trial on the timeline
      // are complete but before advancing to the next (like a loop_function).
      // treat the last active trial as the active trial for this purpose.
      if (loc == this.timeline_parameters.timeline.length) {
        loc = loc - 1;
      }
      // now find the variable
      const val = this.timeline_parameters.timeline[loc].timelineVariable(variable_name);
      if (typeof val === "undefined") {
        console.warn("Timeline variable " + variable_name + " not found.");
      }
      return val;
    }
  }

  // recursively get all the timeline variables for this trial
  allTimelineVariables() {
    var all_tvs = this.allTimelineVariablesNames();
    var all_tvs_vals = <any>{};
    for (var i = 0; i < all_tvs.length; i++) {
      all_tvs_vals[all_tvs[i]] = this.timelineVariable(all_tvs[i]);
    }
    return all_tvs_vals;
  }

  // helper to get all the names at this stage.
  allTimelineVariablesNames(so_far = []) {
    if (typeof this.timeline_parameters !== "undefined") {
      so_far = so_far.concat(
        Object.keys(
          this.timeline_parameters.timeline_variables[
            this.progress.order[this.progress.current_variable_set]
          ]
        )
      );
      // if progress.current_location is -1, then the timeline variable is being evaluated
      // in a function that runs prior to the trial starting, so we should treat that trial
      // as being the active trial for purposes of finding the value of the timeline variable
      var loc = Math.max(0, this.progress.current_location);
      // if loc is greater than the number of elements on this timeline, then the timeline
      // variable is being evaluated in a function that runs after the trial on the timeline
      // are complete but before advancing to the next (like a loop_function).
      // treat the last active trial as the active trial for this purpose.
      if (loc == this.timeline_parameters.timeline.length) {
        loc = loc - 1;
      }
      // now find the variable
      return this.timeline_parameters.timeline[loc].allTimelineVariablesNames(so_far);
    }
    if (typeof this.timeline_parameters == "undefined") {
      return so_far;
    }
  }

  // recursively get the number of **trials** contained in the timeline
  // assuming that while loops execute exactly once and if conditionals
  // always run
  length() {
    var length = 0;
    if (typeof this.timeline_parameters !== "undefined") {
      for (var i = 0; i < this.timeline_parameters.timeline.length; i++) {
        length += this.timeline_parameters.timeline[i].length();
      }
    } else {
      return 1;
    }
    return length;
  }

  // return the percentage of trials completed, grouped at the first child level
  // counts a set of trials as complete when the child node is done
  percentComplete() {
    var total_trials = this.length();
    var completed_trials = 0;
    for (var i = 0; i < this.timeline_parameters.timeline.length; i++) {
      if (this.timeline_parameters.timeline[i].isComplete()) {
        completed_trials += this.timeline_parameters.timeline[i].length();
      }
    }
    return (completed_trials / total_trials) * 100;
  }

  // resets the node and all subnodes to original state
  // but increments the current_iteration counter
  reset() {
    this.progress.current_location = -1;
    this.progress.current_repetition = 0;
    this.progress.current_variable_set = 0;
    this.progress.current_iteration++;
    this.progress.done = false;
    this.setTimelineVariablesOrder();
    if (typeof this.timeline_parameters != "undefined") {
      for (var i = 0; i < this.timeline_parameters.timeline.length; i++) {
        this.timeline_parameters.timeline[i].reset();
      }
    }
  }

  // mark this node as finished
  end() {
    this.progress.done = true;
  }

  // recursively end whatever sub-node is running the current trial
  endActiveNode() {
    if (typeof this.timeline_parameters == "undefined") {
      this.end();
      this.parent_node.end();
    } else {
      this.timeline_parameters.timeline[this.progress.current_location].endActiveNode();
    }
  }

  // get a unique ID associated with this node
  // the ID reflects the current iteration through this node.
  ID() {
    var id = "";
    if (typeof this.parent_node == "undefined") {
      return "0." + this.progress.current_iteration;
    } else {
      id += this.parent_node.ID() + "-";
      id += this.relative_id + "." + this.progress.current_iteration;
      return id;
    }
  }

  // get the ID of the active trial
  activeID() {
    if (typeof this.timeline_parameters == "undefined") {
      return this.ID();
    } else {
      return this.timeline_parameters.timeline[this.progress.current_location].activeID();
    }
  }

  // get all the data generated within this node
  generatedData() {
    return this.jsPsych.data.getDataByTimelineNode(this.ID());
  }

  // get all the trials of a particular type
  trialsOfType(type) {
    if (typeof this.timeline_parameters == "undefined") {
      if (this.trial_parameters.type == type) {
        return this.trial_parameters;
      } else {
        return [];
      }
    } else {
      var trials = [];
      for (var i = 0; i < this.timeline_parameters.timeline.length; i++) {
        var t = this.timeline_parameters.timeline[i].trialsOfType(type);
        trials = trials.concat(t);
      }
      return trials;
    }
  }

  // add new trials to end of this timeline
  insert(parameters) {
    if (typeof this.timeline_parameters === "undefined") {
      console.error("Cannot add new trials to a trial-level node.");
    } else {
      this.timeline_parameters.timeline.push(
        new TimelineNode(
          this.jsPsych,
          { ...this.node_trial_data, ...parameters },
          this,
          this.timeline_parameters.timeline.length
        )
      );
    }
  }
}
