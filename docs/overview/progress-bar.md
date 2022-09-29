# Automatic Progress Bar

jsPsych can show a progress bar at the top of the experiment page indicating the participant's overall completion progress. The progress bar is rendered outside the jsPsych display element, and it requires the `jspsych.css` file to be loaded on the page. As of version 6.0, the progress bar looks like this:

![Progressbar Screenshot](../img/progress_bar.png)

To show the progress bar, set the `show_progress_bar` option in `initJsPsych` to `true`:

```javascript
var jsPsych = initJsPsych({
	show_progress_bar: true
});
```

The progress bar updates after every node on the top-level timeline updates. This avoids distracting updates in the middle of trials that are composed of multiple plugins, or confusing updates due to looping or conditional structures that may or may not execute depending on the actions of the participant. This also allows some flexibility for the programmer; by nesting timelines in a deliberate manner, the timing of progress bar updates can be controlled.

## Manual Control

The progress bar can also be manually controlled using the function `jsPsych.setProgressBar()`. This function takes a numeric value between 0 and 1, representing the proportion of the progress bar to fill.

```js
var trial = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: 'Almost done...',
	on_finish: function(){
		jsPsych.setProgressBar(0.85); // set progress bar to 85% full.
	}
}
```

You can also get the current value of the progress bar with `jsPsych.getProgressBarCompleted()`.

```js
var proportion_complete = jsPsych.getProgressBarCompleted();
```

If you are going to use manual progress bar control, you may want to disable the automatic progress bar updates by setting the `auto_update_progress_bar` property in `initJsPsych()` to `false`.

```js
var jsPsych = initJsPsych({
	show_progress_bar: true,
	auto_update_progress_bar: false
});
```

Here's a complete example showing how to use these functions and `initJsPsych()` settings to manually update the progress bar:

```js
var jsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: false
});

var n_trials = 5;

var start = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 'Press any key to start!',
    on_start: function() {
        // set progress bar to 0 at the start of experiment
        jsPsych.setProgressBar(0);
    }
};

var trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 'This is a trial!',
    on_finish: function() {
        // at the end of each trial, update the progress bar
        // based on the current value and the proportion to update for each trial
        var curr_progress_bar_value = jsPsych.getProgressBarCompleted();
        jsPsych.setProgressBar(curr_progress_bar_value + (1/n_trials));
    }
};

var trials = {
    timeline: [trial],
    repetitions: n_trials
};

var done = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 'Done!'
};

jsPsych.run([start, trials, done]);
```

## Custom Text

By default, jsPsych adds the text "Completion Progress" to the left of the progress bar. You can specify custom text using the `message_progress_bar` parameter in `initJsPsych`.

```js
// support for different spoken languages
var jsPsych = initJsPsych({
    show_progress_bar: true,
    message_progress_bar: 'Porcentaje completo'
});
```

```js
// no message
var jsPsych = initJsPsych({
    show_progress_bar: true,
    message_progress_bar: ''
});
```