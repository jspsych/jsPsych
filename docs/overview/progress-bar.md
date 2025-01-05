# Automatic Progress Bar

jsPsych can show a progress bar at the top of the experiment page indicating the participant's overall completion progress. The progress bar is rendered outside the jsPsych display element, and it requires the `jspsych.css` file to be loaded on the page. As of version 6.0, the progress bar looks like this:

![Progressbar Screenshot](../img/progress_bar.png)

To show the progress bar, set the `show_progress_bar` option in `initJsPsych` to `true`:

```javascript
const jsPsych = initJsPsych({
	show_progress_bar: true
});
```

The progress bar automatically updates after every trial.

## Manual Control

The progress bar can also be manually controlled by setting `jsPsych.progressBar.progress`. The value of `jsPsych.progressBar.progress` should be a number between 0 and 1. For example, to set the progress bar to 85% full, you would do this:


```js
const trial = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: 'Almost done...',
	on_finish: function(){
		jsPsych.progressBar.progress = 0.85; // set progress bar to 85% full.
	}
}
```

You can also get the current value of the progress bar as `jsPsych.progressBar.progress`

```js
const proportion_complete = jsPsych.progressBar.progress;
```

If you are going to use manual progress bar control, you may want to disable the automatic progress bar updates by setting the `auto_update_progress_bar` property in `initJsPsych()` to `false`.

```js
const jsPsych = initJsPsych({
	show_progress_bar: true,
	auto_update_progress_bar: false
});
```

Here's a complete example showing how to use these functions and `initJsPsych()` settings to manually update the progress bar:

```js
const jsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: false
});

const n_trials = 5;

const start = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 'Press any key to start!',
    on_start: function() {
        // set progress bar to 0 at the start of experiment
        jsPsych.progressBar.progress = 0
    }
};

const trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 'This is a trial!',
    on_finish: function() {
        // at the end of each trial, update the progress bar
        // based on the current value and the proportion to update for each trial
        var curr_progress_bar_value = jsPsych.progressBar.progress;
        jsPsych.progressBar.progress = curr_progress_bar_value + (1/n_trials)
    }
};

const trials = {
    timeline: [trial],
    repetitions: n_trials
};

const done = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 'Done!'
};

jsPsych.run([start, trials, done]);
```

## Custom Text

By default, jsPsych adds the text "Completion Progress" to the left of the progress bar. You can specify custom text using the `message_progress_bar` parameter in `initJsPsych`.

```js
// support for different spoken languages
const jsPsych = initJsPsych({
    show_progress_bar: true,
    message_progress_bar: 'Porcentaje completo'
});
```

```js
// no message
const jsPsych = initJsPsych({
    show_progress_bar: true,
    message_progress_bar: ''
});
```