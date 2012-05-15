jsPsych
=======

jsPsych is a [jQuery](http://www.jquery.com) plugin for running behavioral experiments in a web browser. It uses a modular structure so that new experiment types can be written as plugins to the core library. It was created by Josh de Leeuw and Drew Hendrickson at Indiana University.

Documentation
-------------

We are actively documenting the library in our [GitHub wiki](https://github.com/jodeleeuw/jsPsych/wiki). You can find information about the core library and the various plugins that are available.

Can I run my experiment with this?
----------------------------------

jsPsych can run a variety of experiment types, and experienced coders should have no problem writing a plugin for experiments that don't exist.





jquery.json-2.3.js
	jQuerry plugin for creating and using JSON objects
	Based on code from https://github.com/douglascrockford/JSON-js
	IS THIS BEING USED ANYMORE?

jspsych-animation.js
	jsPsych plugin for showing animations
	Takes as input the images to display
	Allows for manipulating timing and repetitions
	No response collected

jspsych-samedifferent.js
	jsPsych plugin for performing a set of same-different trials
	Press P for Same, Q for Different
	Takes as input a first image (a_path) and a second image (b_path)
	Along with timing and correct answer information
	Response accuracy, key pressed, and RT are recorded for each trial
	
jspsych-similarity.js
	jsPsych plugin for getting similarity rating for a set of two stimuli trials
	Similarity rating is done by a mouse slider
	Two objects must be provided for each trial with between-trial timing

jspsych-text.js
	jsPsych plugin for displaying a series of text on the screen
	Each screen is conceptualized on a trial
	Along with timing and text, the response key must be provided as input
	No response data is recorded

jspsych-xab.js
	jsPsych plugin for performing a set of XAB trials
	Press P if Right image is correct, Q if left image is correct
	On each trial, 2 images must be specified, along with 3 timing parameters
		The "a_path" image is always the X image
		Both the "a_path" and "b_path" images are displayed in random arrangement
	POSSIBLY A BUG ON P TRIALS: how are they ever marked as correct?
	STILL HAS A TODO NOTE, is that current?

jspsych.js
	jQuerry plugin for creating psychology experiments
	Takes as input a series of blocks (what to do in the blocks)
	Iterates through each block
		finding the correct trial plugin type
		building the set of trials
		then calling the correct plugin
	Data is output at the end of all blocks (?)
	Also includes helpful private functions for displaying images
