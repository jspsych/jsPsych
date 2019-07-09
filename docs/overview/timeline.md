# Creating an Experiment: The Timeline

To create an experiment using jsPsych, you need to specify a timeline that describes the structure of the experiment. The timeline is an ordered set of trials. You must create the timeline before launching the experiment. Most of the code you will write for an experiment will be code to create the timeline. This page walks through the creation of timelines, including very basic examples and more advanced features.

## A single trial

To create a trial, you need to create an object that describes the trial. The most important feature of this object is the `type` parameter. This tells jsPsych which plugin file to use to run the trial. For example, if you want to use the text plugin to display a short message, the trial object would look like this:

```javascript
var trial = {
	type: 'html-keyboard-response',
	stimulus: 'hello world!'
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

Scaling up to multiple trials is straightforward. Just create an object for each trial, and add each object to the timeline array.

```javascript
// with lots of trials, it might be easier to add the trials
// to the timeline array as they are defined.
var timeline = [];

var trial_1 = {
	type: 'html-keyboard-response',
	stimulus: 'This is trial 1.'
}
timeline.push(trial_1);

var trial_2 = {
	type: 'html-keyboard-response',
	stimulus: 'This is trial 2.'
}
timeline.push(trial_2);

var trial_3 = {
	type: 'html-keyboard-response',
	stimulus: 'This is trial 3.'
}
timeline.push(trial_3);
```

## Nested timelines

Each object on the timeline can also have it's own timeline. This is useful for many reasons. One is that it allows you to define common parameters across trials once and have them apply to all the trials on the nested timeline. The example below creates a series of trials using the image-keyboard-response plugin, where the only thing that changes from trial-to-trial is the image file being displayed on the screen.

```javascript
var judgment_trials = {
	type: 'image-keyboard-response',
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
	type: 'image-keyboard-response',
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

## Timeline variables

A common pattern in behavioral experiments is to repeat the same procedure many times with slightly different parameters. A procedure might be a single trial, but it also might be a series of trials. One shortcut to implement this pattern is with the approach described in the previous section, but this only works if all the trials use the same plugin type. Timeline variables are a more general solution. With timeline variables you define the procedure once (as a timeline) and specify a set of parameters and their values for each iteration through the timeline.

What follows is an example of how to use timeline variables. The [simple reaction time tutorial](../tutorials/rt-task.md) also explains how to use timeline variables.

Suppose we want to create an experiment where people see a set of faces. Perhaps this is a memory experiment and this is the phase of the experiment where the faces are being presented for the first time. In between each face, a fixation cross is displayed on the screen. Without timeline variables, we would need to add many trials to the timeline, alternating between trials showing the fixation cross and trials showing the face and name. This could be done efficiently using a loop or function, but timeline variables make it even easier - as well as adding extra features like sampling and randomization.

Here's a basic version of the task with timeline variables.

```javascript
var face_name_procedure = {
	timeline: [
		{
			type: 'html-keyboard-response',
			stimulus: '+',
			choices: jsPsych.NO_KEYS,
			trial_duration: 500
		},
		{
			type: 'image-keyboard-response',
			stimulus: jsPsych.timelineVariable('face'),
			choices: jsPsych.NO_KEYS,
			trial_duration: 2500
		}
	],
	timeline_variables: [
		{ face: 'person-1.jpg' },
		{ face: 'person-2.jpg' },
		{ face: 'person-3.jpg' },
		{ face: 'person-4.jpg' }
	]
}
```

In the above version, there are four separate trials defined in the `timeline_variables` parameter. Each trial has a variable `face` and a variable `name`. The `timeline` defines a procedure of showing a fixation cross for 500ms followed by the face and name for 2500ms.  This procedure will repeat four times, with the first trial showing Alex, the second Beth, and so on. The variables are referenced within the procedure by calling the `jsPsych.timelineVariable()` method and passing in the name of the variable.

What if we wanted the stimuli to be a little more complex, with a name displayed below each face? And let's add an additional step where the name is displayed prior to the face appearing. (Maybe this is one condition of an experiment investigating whether the order of name-face or face-name affects retention.)

To do this, we will need to use the `jsPsych.timelineVariable()` method in a slightly different way. Instead of using it as the parameter, we are going to create a dynamic parameter using a function and place the call to `jsPsych.timelineVariable()` inside this function. This will allow us to create an HTML string that has both the image and the name. Note that there is a subtle syntax difference: there is an extra parameter when `jsPsych.timelineVariable()` is called within a function. This `true` value causes the `jsPsych.timelineVariable()` to immediately return the value of the timeline variable. In a normal context, the function `jsPsych.timelineVariable()` returns a function. This is why `jsPsych.timelineVariable()` can be used directly as a parameter even though the parameter is dynamic.


```javascript
var face_name_procedure = {
	timeline: [
		{
			type: 'html-keyboard-response',
			stimulus: '+',
			choices: jsPsych.NO_KEYS,
			trial_duration: 500
		},
		{
			type: 'html-keyboard-response',
			stimulus: jsPsych.timelineVariable('name'),
			trial_duration: 1000,
			choices: jsPsych.NO_KEYS
		},
		{
			type: 'html-keyboard-response',
			stimulus: function(){
				var html="<img src='"+jsPsych.timelineVariable('face', true)+"'>";
				html += "<p>"+jsPsych.timelineVariable('name', true)+"</p>";
				return html;
			},			
			choices: jsPsych.NO_KEYS,
			trial_duration: 2500
		}
	],
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	]
}
```
### Random orders of trials

If we want to randomize the order of the trials, we can set `randomize_order` to `true`.

```javascript
var face_name_procedure = {
	// timeline parameter hidden to save space ...
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	],
	randomize_order: true
}
```

### Repeating trials

If we want to repeat the set of trials multiple times, then we can set `repetitions` to an integer. If `randomize_order` is also `true`, the order will re-randomize before every repetition.

```javascript
var face_name_procedure = {
	// timeline parameter hidden to save space ...
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	],
	randomize_order: true,
	repetitions: 3
}
```

### Sampling methods

There are also a set of sampling methods that can be used to select a set of trials from the timeline_variables. Sampling is declared by creating a `sample` parameter. The `sample` parameter is given an object of arguments. The `type` parameter in this object controls the type of sampling that is done. Valid values for `type` are 

* `"with-replacement"`: Sample `size` items from the timeline variables with the possibility of choosing the same item multiple time.
* `"without-replacement"`: Sample `size` itesm from timeline variables, with each item being selected a maximum of 1 time.
* `"fixed-repetitons"`: Repeat each item in the timeline variables `size` times, in a random order. Unlike using the `repetitons` parameter, this method allows for consecutive trials to use the same timeline variable set.
* `"alternate-groups"`: Sample in an alternating order based on a declared group membership. Groups are defined by the `groups` parameter. This parameter takes an array of arrays, where each inner array is a group and the items in the inner array are the indices of the timeline variables in the `timeline_variables` array that belong to that group.
* `"custom"`: Write a function that returns a custom order of the timeline variables.

#### Sampling with replacement
```javascript
var face_name_procedure = {
	// timeline parameter hidden to save space ...
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	],
	sample: {
		type: 'with-replacement',
		size: 10, // 10 trials, with replacement
	}
}
```

#### Sampling with replacement, unequal probabilities
```javascript
var face_name_procedure = {
	// timeline parameter hidden to save space ...
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	],
	sample: {
		type: 'with-replacement',
		size: 10, // 10 trials, with replacement
		weights: [3, 1, 1, 1], // The Alex trial is three times as likely to be sampled as the others.
	}
}
```

#### Sampling without replacement
```javascript
var face_name_procedure = {
	// timeline parameter hidden to save space ...
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	],
	sample: {
		type: 'without-replacement',
		size: 3, // 3 trials, without replacement
	}
}
```

#### Repeating each trial a fixed number of times in a random order
```javascript
var face_name_procedure = {
	// timeline parameter hidden to save space ...
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	],
	sample: {
		type: 'fixed-repetitions',
		size: 3, // 3 repetitions of each trial, 12 total trials, order is randomized.
	}
}
```

#### Alternating groups
```javascript
var face_name_procedure = {
	// timeline parameter hidden to save space ...
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	],
	sample: {
		type: 'alternate-groups',
		groups: [[0,2],[1,3]], // Alex and Chad are in group 1. Beth and Dave are in group 2. 
		randomize_group_order: false // The first trial will be an item from group 1.
	}
}
```

#### Custom sampling function
```javascript
var face_name_procedure = {
	// timeline parameter hidden to save space ...
	timeline_variables: [
		{ face: 'person-1.jpg', name: 'Alex' },
		{ face: 'person-2.jpg', name: 'Beth' },
		{ face: 'person-3.jpg', name: 'Chad' },
		{ face: 'person-4.jpg', name: 'Dave' }
	],
	sample: {
		type: 'custom',
		fn: function(t){
			// the first parameter to this function call is an array of integers
			// from 0 to n-1, where n is the number of trials.
			// the method needs to return an array of integers specifying the order
			// that the trials should be executed. this array does not need to
			// contain all of the integers.

			return t.reverse(); // show the trials in the reverse order
		}
	}
}
```

## Looping timelines

Any timeline can be looped using the `loop_function` option. The loop function should be a function that evaluates to `true` if the timeline should repeat, and `false` if the timeline should end. It receives a single parameter: the DataCollection object with all of the data from the trials executed in the last iteration of the timeline. The loop function will be evaluated after the timeline is completed.

```javascript
var trial = {
	type: 'html-keyboard-response',
	stimulus: 'This trial is in a loop. Press R to repeat this trial, or C to continue.'
}

var loop_node = {
	timeline: [trial],
	loop_function: function(data){
		if(jsPsych.pluginAPI.convertKeyCharacterToKeyCode('r') == data.values()[0].key_press){
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
	type: 'html-keyboard-response',
	stimulus: 'The next trial is in a conditional statement. Press S to skip it, or V to view it.'
}

var if_trial = {
	type: 'html-keyboard-response',
	stimulus: 'You chose to view the trial. Press any key to continue.'
}

var if_node = {
	timeline: [if_trial],
	conditional_function: function(){
		// get the data from the previous trial,
		// and check which key was pressed
		var data = jsPsych.data.get().last(1).values()[0];
		if(data.key_press == jsPsych.pluginAPI.convertKeyCharacterToKeyCode('s')){
			return false;
		} else {
			return true;
		}
	}
}

var after_if_trial = {
	type: 'html-keyboard-response',
	stimulus: 'This is the trial after the conditional.'
}

jsPsych.init({
	timeline: [pre_if_trial, if_node, after_if_trial],
	on_finish: function(){jsPsych.data.displayData(); }
});
```
