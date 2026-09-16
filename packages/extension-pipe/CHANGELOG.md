# @jspsych/extension-pipe

## 0.2.0

### Minor Changes

- [#3718](https://github.com/jspsych/jsPsych/pull/3718) [`dfdfb5ef09cc30fa43aec6af63a157093d52430f`](https://github.com/jspsych/jsPsych/commit/dfdfb5ef09cc30fa43aec6af63a157093d52430f) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - New extension for sending data to DataPipe. Registering it in `initJsPsych` is the whole integration: it stages each trial as it finishes, so an abandoned session can be recovered, and submits the complete dataset when the experiment ends — including after `abortExperiment()`, which a save trial never reaches.
