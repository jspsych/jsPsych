# Migrating an experiment to v8.x

Version 8.x of jsPsych focused on a complete rewrite of the core library to enable new features and make it easier to maintain.
Most of the changes in version 8.x are behind the scenes.
However, there are some breaking changes that you will need to address in your experiment code in order to upgrade to v8.x.

This guide is aimed at upgrades from version 7.x to 8.x. 
If you are using version 6.x or earlier, please follow the [migration guide for v7.x](./migration-v7.md) before trying to upgrade to v8.x.

## Timeline Events

In version 7.x, if a timeline had a `conditional_function` it would be checked on every iteration if the timeline also looped. 
In version 8.x, the `conditional_function` is checked only before the first trial on the timeline. 
We think this is a more intuitive behavior. 
It allows the `conditional_function` to toggle whether a timeline runs at all, and once it starts running we assume that it should continue.
If you relied on the old behavior, you can nest the timeline with the `conditional_function` inside another timeline that loops.

We've also changed the behavior of `on_timeline_start` and `on_timeline_finish` to only execute one time each. 
Previously these events executed on every repetition of a timeline. 
If you relied on the old behavior, you can nest the timeline with the `on_timeline_start` or `on_timeline_finish` inside the timeline that repeats.

## Timeline Variables

We've split the functionality of `jsPsych.timelineVariable()` into two different functions to reflect the two different use cases. 
If you are using `jsPsych.timelineVariable()` inside a function you will need to replace the function call with `jsPsych.evaluateTimelineVariable()`. 
Usage as a parameter in a trial doesn't change.

This behavior is still the same:
```js
const trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: jsPsych.timelineVariable('stimulus'),
}
```

This behavior has changed:
```js
const trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => {
    return `<p>The stimulus is ${jsPsych.evaluateTimelineVariable('stimulus')}</p>`
  }
}
```

We've added some better error support for `evaluateTimelineVariable()` so that it will throw an error if there's no corresponding timeline variable to evaluate. 

We've removed support for `jsPsych.getAllTimelineVariables()` and replaced it with the trial-level property `save_timeline_variables`. 

If you need to save all the timeline variables of a trial to jsPsych's data, you can set `save_timeline_variables: true` in the trial.


## Trial parameters

We've made some trial parameters more strict to improve the maintainability of the library.

If a plugin has a parameter that is marked as `array: true` in the plugin's `info` object, then jsPsych will now throw an error if the parameter is not an array. 
Previously, some plugins allowed some parameters to be either an array or non-array. 
For the plugins included in jsPsych's main repository, the only affected parameter is the `button_html` parameter for the various button response plugins. 
Previously this parameter could be an array or a string. 
We've now made it so that it must be a function. 

Version 7.x:
```js
const trial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: 'Press a button',
  choices: ['a', 'b', 'c'],
  button_html: '<button class="jspsych-btn" style="font-size: 80px;">%choice%</button>'
}
```

Version 8.x:
```js
const trial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: 'Press a button',
  choices: ['a', 'b', 'c'],
  button_html: (choice) => {
    return `<button class="jspsych-btn" style="font-size: 80px;">${choice}</button>`
  }
}
```

The `button_html` parameter can also support different HTML for each button. 
See the [plugin documentation](https://www.jspsych.org/plugins/jspsych-html-button-response/) for more details.

## Plugin parameter handling

In version 7.x, a plugin could omit parameters from the `info` object and jsPsych would still evaluate these parameters appropriately in most cases. 
Version 8.x is more strict about this.
Plugins should list all parameters in the `info` object.
If a parameter is not listed, then timeline variables and function evaluation will not work for that parameter. The `save_trial_parameters` parameter will also not work for parameters that are not listed in the `info` object.

## Progress bar

The automatic progress bar now updates after every trial, including trials in nested timelines. 
If you would like to implement the old behavior of updating only on the top-level timeline, you can manually control the progress bar using the `on_finish` callback of the timelines and trials in the top-level timeline.

We've also changed `jsPsych.setProgressBar(x)` to `jsPsych.progressBar.progress = x`.
And we've changed `jsPsych.getProgressBarCompleted()` to `jsPsych.progressBar.progress`.
This simplifies the API for the progress bar.

## Data Handling

We've removed `internal_node_id` and `jsPsych.data.getDataByTimelineNode()`. 
Timeline node IDs were used internally by jsPsych to keep track of experiment progress in version 7, but this is no longer the case in version 8. 
Most users didn't need or want to see the `internal_node_id` in the data, so we've removed it. 
If you relied on this parameter, the simplest replacement is probably to use the `data` parameter to add the information you need back to the timeline.

## Ending a timeline and ending the experiment

We've renamed `jsPsych.endExperiment()` to `jsPsych.abortExperiment()`.

We've renamed `jsPsych.endCurrentTimeline()` to `jsPsych.abortCurrentTimeline()`.

## Interaction listeners

In version 7.x, interaction events (like exiting fullscreen) would still be listened for even after the experiment ended. 
These events are no longer reported once the experiment ends.

## Need help?

If you encounter issues migrating code to v8.x please open a thread on our [discussion board](https://github.com/jspsych/jsPsych/discussions/).




