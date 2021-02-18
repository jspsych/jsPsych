# Automatic Progress Bar

jsPsych can show a progress bar at the top of the experiment page indicating the subject's overall completion progress. The progress bar is rendered outside the jsPsych display element, and it requires the `jspsych.css` file to be loaded on the page. As of version 6.0, the progress bar looks like this:

![Progressbar Screenshot](/img/progress_bar.png)

To show the progress bar, set the `show_progress_bar` option in `jsPsych.init` to `true`:

```javascript
jsPsych.init({
	timeline: exp,
	show_progress_bar: true
});
```

The progress bar updates after every node on the top-level timeline updates. This avoids distracting updates in the middle of trials that are composed of multiple plugins, or confusing updates due to looping or conditional structures that may or may not execute depending on the actions of the subject. This also allows some flexibility for the programmer; by nesting timelines in a deliberate manner, the timing of progress bar updates can be controlled.

## Manual Control

The progress bar can also be manually controlled using the function `jsPsych.setProgressBar()`. This function takes a numeric value between 0 and 1, representing the proportion of the progress bar to fill.

```js
var trial = {
	type: 'html-keyboard-response',
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

If you are going to use manual progress bar control, you may want to disable the automatic progress bar updates by setting the `auto_update_progress_bar` property in `jsPsych.init()` to `false`.

```js
jsPsych.init({
	timeline: exp,
	show_progress_bar: true,
	auto_update_progress_bar: false
});
```

Here's a complete example showing how to use these functions and `jsPsych.init()` settings to manually update the progress bar:

```js
var n_trials = 5;

var start = {
    type: 'html-keyboard-response',
    stimulus: 'Press any key to start!',
    on_start: function() {
        // set progress bar to 0 at the start of experiment
        jsPsych.setProgressBar(0);
    }
};

var trial = {
    type: 'html-keyboard-response',
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
    type: 'html-keyboard-response',
    stimulus: 'Done!'
};

jsPsych.init({
    timeline: [start, trials, done],
    show_progress_bar: true,
    auto_update_progress_bar: false
});
```

## Custom Text

By default, jsPsych adds the text "Completion Progress" to the left of the progress bar. You can specify custom text using the `message_progress_bar` parameter in `jsPsych.init`.

```js
// support for different spoken languages
jsPsych.init({
    timeline: [...],
    show_progress_bar: true,
    message_progress_bar: 'Porcentaje completo'
});
```

```js
// no message
jsPsych.init({
    timeline: [...],
    show_progress_bar: true,
    message_progress_bar: ''
});
```