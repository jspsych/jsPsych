# Core changes

A growing list of implemented 8.0 changes so we don't loose track

## Breaking

- `jsPsych.setProgressBar()` and `jsPsych.getProgressBarCompleted()` => `jsPsych.progressBar.progress`
- Automatic progress bar updates after every trial now, including trials in nested timelines
- `jsPsych.timelineVariable()` => `jsPsych.timelineVariable()` and `jsPsych.evaluateTimelineVariable()`
- `on_finish` and `on_trial_finish` callbacks are now called after the `post_trial_gap` or `default_iti` is over
