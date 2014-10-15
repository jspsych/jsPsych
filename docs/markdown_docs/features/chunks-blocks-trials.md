# Creating an Experiment: Chunks, Blocks, & Trials

To create an experiment in jsPsych, you'll need to define the experiment structure. jsPsych experiments consist of three different structures: chunks, blocks, & trials. This page goes into detail about each kind of structure, and the features related to each.

## The timeline analogy

A useful analogy for understanding chunks, blocks, & trials is a timeline. We can think of an experiment as being drawn on a timeline. The simplest version of the timeline would mark the occurrence of each **trial** in the experiment:

Sometimes, we might repeat the same kind of trial over and over again, just changing what stimulus is shown or with some other minor modification. jsPsych can group these trials together into a **block**, making it faster to define the structure of the experiment. With blocks, a timeline might look something like this:

But, what if we wanted to group trials together that weren't the same kind (i.e. didn't use the same plugin) but shared some other relationship? This is what a **chunk** does. Chunks are simply groups of blocks, but conceptually they are treated as if they are a whole separate timeline in jsPsych. This allows for more complex experiment designs, such as loops and conditional *if* statemens. With chunks, timelines can get very complicated if needed:

## Defining an experiment

The `jsPsych.init` method requires that an experiment definition is passed in as the value of the `experiment_structure` parameter.

```javascript
jsPsych.init({
	experiment_structure: exp
})
```

The `exp` variable above needs to be an array, with each element of the array being either a chunk or a block.

To create a block, define a JavaScript object with a `type` property set to the particular plugin that the block uses. For example, to create a block using the `jspsych-single-stim` plugin, the corresponding object would look something like:

```javascript
var single_stim_block = {
	type: 'single-stim',
	stimulus: ['img/happy_face.png', 'img/sad_face.png']
}

jsPsych.init({
	experiment_structure: [single_stim_block]
})
```

The above block contains two trials. The first trial will show the image file `img/happy_face.png` and the second will show `img/sad_face.png`. Different plugins have different methods for specifying multiple trials within a block. Check the documentation of the plugin that you are using for more details about how that plugin works.

To show instructions before the faces appear, define another block and add it to the `experiment_structure` array:

```javascript
var instructions_block = {
	type: 'text',
	text: 'Press H if the face is happy. Press S if the face is sad.'
}

var single_stim_block = {
	type: 'single-stim',
	stimulus: ['img/happy_face.png', 'img/sad_face.png']
}

jsPsych.init({
	experiment_structure: [instructions_block, single_stim_block]
})
```

Let's imagine that we want subjects to keep viewing the faces until they get the correct response for each one. We can use a chunk to loop over the trials. To create a chunk, create an object with a `chunk_type` property set to a [valid chunk type]() and a `timeline` property containing an array of chunks and blocks within the chunk. Some chunk types will require other properties to be set as well:

```javascript
var instructions_block = {
	type: 'text',
	text: 'Press H if the face is happy. Press S if the face is sad.'
}

var single_stim_block = {
	type: 'single-stim',
	stimulus: ['img/happy_face.png', 'img/sad_face.png']
}

var looping_chunk = {
	chunk_type: 'while',
	timeline: [single_stim_block],
	continue_function: function(data){
		// code here to check if they got both answers correct.
		// this is a bit too complicated for a simple tutorial 
		// about chunks and blocks, so imagine that the variable
		// correct is true is they got both answers right, and
		// false otherwise.
		
		if(correct) { return false; }
		else { return true; }
	}
}

jsPsych.init({
	experiment_structure: [instructions_block, looping_chunk]
})
```

## Getting formal about definitions

What **exactly** are chunks, blocks, and trials?

A **trial** defines the parameters that will be used for a single execution of a plugin's `plugin.trial` method. Since all experiments are defined in terms of plugins, this is the atomic unit of a jsPsych experiment.

A **block** is a collection of trials in which each trial uses the same plugin. Since it is very common in behavioral research to have multiple trials of the same type in a row with different stimuli, jsPsych experiments are defined at the block level by default. When creating the `experiment_structure` array for the `jsPsych.init` method, each element of the array can be either a block or a chunk.

A **chunk** is a collection of chunks or blocks that will be run in order. There are a few different kinds of chunks, which can be used to create experiments that loop or experiments that change which parts execute based on what the subject has done so far. 

All three types are defined as JavaScript objects within the jsPsych code. 

## Chunk types

There are different types of chunks; each defines a different way of executing the chunk's timeline. To specify the chunk type, set the `chunk_type` property of the chunk definition object.

```javascript
var chunk = {
	chunk_type: 'linear',
	timeline: [block1, block2]
}
```

### Linear

A linear chunk executes the timeline once and then is complete. 

If the `experiment_structure` property in `jsPsych.init` contains blocks, they will be converted to linear chunks internally. 

### While

A while chunk can be used for looping. It executes the timeline and then calls the `continue_function` to see if it should execute the timeline again. If the `continue_function` returns `true`, then the chunk executes again. If the function returns `false`, the chunk is complete. 

The `continue_function` will be passed the data generated by the most recent execution of the chunk as the first parameter. The data will be an array; each item in the array will be the data for a single trial. 

```javascript
var while_chunk = {
	chunk_type: 'while',
	timeline: [block1, block2],
	continue_function: function(data){
		// check to see if the average RT was under 1s
		var sum_rt = 0;
		for(var i=0; i < data.length; i++){
			sum_rt += data.rt;
		}
		var average_rt = sum_rt / data.length;
		if(average_rt < 1000){
			// end the loop
			return false;
		} else {
			// keep going until they are faster!
			return true;
		}
	}
}
```

### If

An if chunk will only execute if some condition is met. 


