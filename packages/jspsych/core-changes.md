# Core changes

A growing list of implemented 8.0 changes so we don't loose track

## Breaking

- `jsPsych.setProgressBar()` and `jsPsych.getProgressBarCompleted()` => `jsPsych.progressBar.progress`
- Automatic progress bar updates after every trial now, including trials in nested timelines
- `jsPsych.timelineVariable()` => `jsPsych.timelineVariable()` and `jsPsych.evaluateTimelineVariable()`
- Drop `jsPsych.data.getDataByTimelineNode()` since nodes have no IDs anymore
- Trial results do no longer have the `internal_node_id` property
