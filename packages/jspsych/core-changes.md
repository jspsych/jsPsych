# Core changes

A growing list of implemented 8.0 changes so we don't loose track

## Breaking

- `conditional_function` is no longer executed on every iteration of a looping timeline, but only once before running the first trial of the timeline
- `jsPsych.setProgressBar()` and `jsPsych.getProgressBarCompleted()` => `jsPsych.progressBar.progress`
- Automatic progress bar updates after every trial now, including trials in nested timelines
- `jsPsych.timelineVariable()` => `jsPsych.timelineVariable()` and `jsPsych.evaluateTimelineVariable()`
- Drop `jsPsych.data.getDataByTimelineNode()` since nodes have no IDs anymore
- Trial results do no longer have the `internal_node_id` property
- `save_trial_parameters` can only be used to remove parameters that are specified in the plugin info
- `endExperiment()` and `endCurrentTimeline()` => `abortExperiment()` and `abortCurrentTimeline()`
- Interaction listeners are now removed when the experiment ends.
