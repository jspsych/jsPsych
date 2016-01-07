# Creating an Experiment: The Timeline

To create an experiment using jsPsych, you need to specify a timeline that describes the experiment. The timeline is an ordered set of trials. You must create the timeline before launching the experiment. The bulk of the code you will write for an experiment will be code to create the timeline. This page walks through the creation of timelines, including very basic examples and more advanced features.

## A single trial

To create a trial, you need to create an object that describes the trial. The most important feature of this object is the `type` parameter. This tells jsPsych which plugin file to use to run the trial. For example, if you want to use the text plugin to display a short message, the trial object would look like this:

```javascript
var trial = {
	type: 'text',
	text: 'hello world!'
}
```

The parameters for this object will depend on the plugin that you choose. Each plugin defines the set of parameters that are needed to run a trial with that plugin. Visit the documentation for a plugin to learn about the parameters that you can use with that plugin.

To create a timeline with the single trial and run the experiment, just embed the trial object in an array. A timeline is simply an array of trials.

```javascript
var timeline = [trial];

jsPsych.init({
	timeline: timeline
});
```

To actually create and run this simple example, complete the [hello world tutorial](../tutorials/hello-world.md).

## Multiple trials

Scaling up to multiple trials is easy. Just create an object for each trial, and add each object to the array.

```javascript
// with lots of trials, it might be easier to add the trials
// to the timeline array as they are defined.
var timeline = [];

var trial_1 = {
	type: 'text',
	text: 'This is trial 1.'
}
timeline.push(trial_1);

var trial_2 = {
	type: 'text',
	text: 'This is trial 2.'
}
timeline.push(trial_2);

var trial_3 = {
	type: 'text',
	text: 'This is trial 3.'
}
timeline.push(trial_3);
```

## Nested timelines

Each object on the timeline can also have it's own timeline. This is useful for a lot of reasons. The first is that it allows you to define common parameters across trials once and have them apply to all the trials on the nested timeline. The example below creates a series of trials using the single-stim plugin, where the only thing that changes from trial-to-trial is the image file being displayed on the screen.

```javascript
var judgment_trials = {
	type: 'single-stim',
	prompt: '<p>Press a number 1-7 to indicate how unusual the image is.</p>',
	choices: ['1','2','3','4','5','6','7'],
	timeline: [
		{stimulus: 'image1.png'},
		{stimulus: 'image2.png'},
		{stimulus: 'image3.png'}
	]
}
```

In the above code, the `type`, `prompt`, and `choices` parameters are automatically applied to all of the objects in the `timeline` array. This creates three trials with the same `type`, `prompt`, and `choices` parameters, but different values for the `stimulus` parameter.

You can also override the values by declaring a new value in the `timeline` array. In the example below, the second trial will display a different prompt message.

```javascript
var judgment_trials = {
	type: 'single-stim',
	prompt: '<p>Press a number 1-7 to indicate how unusual the image is.</p>',
	choices: ['1','2','3','4','5','6','7'],
	timeline: [
		{stimulus: 'image1.png'},
		{stimulus: 'image2.png', prompt: '<p>Press 1 for this trial.</p>'},
		{stimulus: 'image3.png'}
	]
}
```

Timelines can be nested any number of times.

## Randomizing the order of trials on a timeline

You can randomize the order that the trials on timeline occur by setting the parameter `randomize_order` to `true`.

```javascript
var judgment_trials = {
	type: 'single-stim',
	prompt: '<p>Press a number 1-7 to indicate how unusual the image is.</p>',
	choices: ['1','2','3','4','5','6','7'],
	timeline: [
		{stimulus: 'image1.png'},
		{stimulus: 'image2.png'},
		{stimulus: 'image3.png'}
	],
	randomize_order: true
}
```

If the timeline repeats multiple times (through a loop), then the order will be re-randomized at the start of each iteration.

## Looping timelines

Any timeline can be looped using the `loop_function` option. The loop function should be a function that evaluates to `true` if the timeline should repeat, and `false` if the timeline should end. The loop function will be evaluated after the timeline is completed.

```javascript
var trial = {
	type: 'text',
	text: 'Hello. This is in a loop. Press R to repeat this trial, or C to continue.'
}

var loop_node = {
	timeline: [trial],
	loop_function: function(data){
		if(jsPsych.pluginAPI.convertKeyCharacterToKeyCode('r') == data[0].key_press){
			return true;
		} else {
			return false;
		}
	}
}
```

## Conditional timelines

A timeline can be skipped based on the evaluation of a function using the `conditional_function` option. If the conditional function evaluates to `true`, the timeline will execute normally. If the conditional function evaluates to `false`, then the timeline will be skipped. The conditional function is evaluated whenever the timeline is about to run the first trial.

```javascript
var pre_if_trial = {
	type: 'text',
	text: 'The next trial is in a conditional statement. Press S to skip it, or V to view it.'
}

var if_trial = {
	type: 'text',
	text: 'You chose to view the trial. Press any key to continue.'
}

var if_node = {
	timeline: [if_trial],
	conditional_function: function(){
		var data = jsPsych.data.getLastTrialData();
		if(data.key_press == jsPsych.pluginAPI.convertKeyCharacterToKeyCode('s')){
			return false;
		} else {
			return true;
		}
	}
}

var after_if_trial = {
	type: 'text',
	text: 'This is the trial after the conditional.'
}

jsPsych.init({
	display_element: $('#jspsych-target'),
	timeline: [pre_if_trial, if_node, after_if_trial],
	on_finish: function(){jsPsych.data.displayData(); }
});
```
