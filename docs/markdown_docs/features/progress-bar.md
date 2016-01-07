# Automatic Progress Bar

jsPsych can show a progress bar at the top of the experiment page indicating the subject's overall completion progress. The progress bar is rendered outside the jsPsych display element, and it requires the `jspsych.css` file to be loaded on the page. As of version 4.0, the progress bar looks like this:

![Progressbar Screenshot](/img/progress_bar.png)

To show the progress bar, set the `show_progress_bar` option in `jsPsych.init` to `true`:

```javascript
jsPsych.init({
	timeline: exp,
	show_progress_bar: true
});
```

The progress bar updates after every every node on the top-level timeline updates. In other words, the progress bar updates after each TimelineNode in the main timeline array is completed. This avoids distracting updates in the middle of trials that are composed of multiple plugins, or confusing updates due to looping or conditional structures that may or may not execute depending on the actions of the subject. This also allows some flexibility for the programmer; by nesting timelines in a deliberate manner, the timing of progress bar updates can be controlled.
