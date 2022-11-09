# Core changes

A growing list of implemented 8.0 changes so we don't loose track

## Breaking

- JsPsych internally relies on the JavaScript event loop now. This means unit tests now have to `await` utility functions like `pressKey()` so the event loop is run.
- `conditional_function` is no longer executed on every iteration of a looping timeline, but only once before running the first trial of the timeline
- `jsPsych.setProgressBar()` and `jsPsych.getProgressBarCompleted()` => `jsPsych.progressBar.progress`
- Automatic progress bar updates after every trial now, including trials in nested timelines
- `jsPsych.timelineVariable()` => `jsPsych.timelineVariable()` and `jsPsych.evaluateTimelineVariable()`
- Drop `jsPsych.data.getDataByTimelineNode()` since nodes have no IDs anymore
- Trial results do no longer have the `internal_node_id` property
- `save_trial_parameters` can only be used to remove parameters that are specified in the plugin info
- `endExperiment()` and `endCurrentTimeline()` => `abortExperiment()` and `abortCurrentTimeline()`
- Interaction listeners are now removed when the experiment ends.
- `on_timeline_start` and `on_timeline_finish` are no longer invoked in every repetition of a timeline, but only at the beginning or end of a timeline, respectively.
- `jsPsych.evaluateTimelineVariable()` now throws an error if the variable is not found

- Drop `jsPsych.getAllTimelineVariables()` – a replacement is yet to be implemented
