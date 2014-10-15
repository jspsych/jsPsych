# jsPsych 

## Overview

jsPsych is a JavaScript library for creating and running behavioral experiments in a web browser. The library provides a flexible framework for building a wide range of laboratory-like experiments that can be run online. 

jsPsych prvoides the *structure* for an experiment. It handles things like determining which trial to run next, storing data, and randomizing factors/order of presentation. It also provides a set of *plugins*, which are ready-made templates for simple experimental tasks like displaying instructions or displaying a stimulus and collecting a keyboard response. A full experiment created with jsPsych will be a collection of different plugins that define the different tasks that a subject will complete. 

To build an experiment with jsPsych, you'll specify the structure of the experiment using JavaScript code. You'll also need to provide the *content* that defines your experiment, such as the actual text that subjects see when they are shown instructions and the images that they will view. You can also specify a wide-range of parameters to control things like stimulus duration, which keyboard keys subjects are allowed to press, and so on.

This page gives a broad overview of how jsPsych works. More detail is available on most of the topics on this page by using the navigation above, or by following the links within the documentation.

## Loading jsPsych

To use jsPsych, you'll need to load a few JavaScript files in an HTML document. At a minimum, you'll be loading three files: the jQuery library, the main jsPsych.js library, and at least one jsPsych plugin. A bare-bones jsPsych-ready document (with the single-stim plugin loaded) will look something like the following:

```html
<!doctype html>
<html>
	<head>
		<script src="js/jquery.js"></script>
		<script src="js/jspsych/jspsych.js"></script>
		<script src="js/jspsych/plugins/jspsych-single-stim.js"></script>
	</head>
	<body>
	</body>
</html>
```

## Creating an experiment

To use jsPsych, you'll need to create a description of your experiment in JavaScript. This description is an array; each element of the array is a **block** or a **chunk**. Chunks and blocks are special objects in jsPsych. They define sets of trials that should be grouped together (learn more about [chunks and blocks]()).

```javascript
// defining an empty array to contain the experiment description
var experiment = [];
```

Blocks are created by defining a JavaScript object with a `type` property that corresponds to a particular [plugin](). The other properties of the block object will depend on which plugin is used. Each plugin has different options.

The code below will create a block that contains two trials. The first trial will display the image file `img/happy_face.jpg` and the second trial will display the image file `img/sad_face.jpg`.

```javascript
// create a block using the 'single-stim' plugin
var block = {
	type: 'single-stim',
	stimuli: ['img/happy_face.jpg','img/sad_face.jpg']
};
```

To add the block to the experiment description, we need to change the `experiment` array. There are several ways to do this in JavaScript, but we'll use the `.push()` function for generalizability.

```javascript
// add the block to the experiment description
experiment.push(block);
```
 
Once you have the experiment description defined, you can tell jsPsych to run the experiment by calling `jsPsych.init()` and passing your description as the value for the `experiment_structure` parameter:

```javascript
jsPsych.init({
	experiment_structure: experiment
})
```

For a more in-depth tutorial about creating an experiment, take a look at the [tutorials]().

