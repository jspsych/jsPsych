---
"jspsych": major
---

Rewrite jsPsych's core logic. The following breaking changes have been made:

**Timeline Events**

- `conditional_function` is no longer executed on every iteration of a looping timeline, but only once before running the first trial of the timeline. If you rely on the old behavior, move your `conditional_function` into a nested timeline instead.
- `on_timeline_start` and `on_timeline_finish` are no longer invoked in every repetition of a timeline, but only at the beginning or at the end of the timeline, respectively. If you rely on the old behavior, move the `on_timeline_start` and `on_timeline_finish` callbacks into a nested timeline.

**Timeline Variables**

- The functionality of `jsPsych.timelineVariable()` has been explicitly split into two functions, `jsPsych.timelineVariable()` and `jsPsych.evaluateTimelineVariable()`. Use `jsPsych.timelineVariable()` to create a timeline variable placeholder and `jsPsych.evaluateTimelineVariable()` to retrieve a given timeline variable's current value.
- `jsPsych.evaluateTimelineVariable()` now throws an error if a variable is not found.

**Progress Bar**

- `jsPsych.setProgressBar(x)` has been replaced by `jsPsych.progressBar.progress = x`
- `jsPsych.getProgressBarCompleted()` has been replaced by `jsPsych.progressBar.progress`
- The automatic progress bar updates after every trial now, including trials in nested timelines.

**Data Handling**

- Timeline nodes no longer have IDs. As a consequence, the `internal_node_id` trial result property and `jsPsych.data.getDataByTimelineNode()` have been removed.
- Unlike previously, the `save_trial_parameters` parameter can only be used to remove parameters that are specified in the plugin's info object. Other result properties will be left untouched.

**Miscellaneous Changes**

- `jsPsych.endExperiment()` and `jsPsych.endCurrentTimeline()` have been renamed to `jsPsych.abortExperiment()` and `jsPsych.abortCurrentTimeline()`, respectively.
- `jsPsych.getAllTimelineVariables()` has been replaced by a trial-level `save_timeline_variables` parameter that can be used to include all or some timeline variables in a trial's result data.
- Interaction listeners are now removed when the experiment ends.
- JsPsych now internally relies on the JavaScript event loop. This means automated tests have to `await` utility functions like `pressKey()` to process the event loop.
