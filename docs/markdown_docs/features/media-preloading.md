# Media Preloading

If an experiment uses images or audio files as stimuli, it is important to preload the files before running the experiment. Preloading files means that the subject's browser will download all of the files and store them in local memory on the subject's computer. This is important because loading an image file is much faster if it is already in memory on the subject's computer. Without preloading, there will be noticeable delays in the display of media, which will affect any timing measurements (such as how long an image is displayed, or a subject's response time since first viewing an image).

jsPsych will automatically preload audio and image files that are used as parameters for the standard set of plugins.

```javascript
// the image file img/file1.png is
// automatically preloaded before the experiment begins
var trial = {
	type: 'single-stim',
	stimulus: 'img/file1.png'
}

// the sound file is also preloaded automatically
var sound_trial = {
	type: 'single-audio',
	stimulus: 'snd/hello.mp3'
}

jsPsych.init({
	timeline: [trial]
});
```

If you are using images in your experiment but they are not being passed directly as parameters to the trials, then you may need to manually preload the image files.

jsPsych has an image preloading function in the core library. For full documentation, see the [API reference page](../core_library/jspsych-pluginAPI.md#jspsychpluginapipreloadimages). The function will load all of the images listed in an array, and then call a function when the loading is complete. Below is a brief example.

```javascript
// this trial will not preload the images, because the image file is being used
// in an HTML string
var trial = {
	type: 'single-stim',
	stimulus: '<img src="img/file1.png"></img>',
	is_html: true
}

// an array of paths to images that need to be loaded
var images = ['img/file1.png'];

jsPsych.preloadImages(images, function(){ startExperiment(); });

function startExperiment(){
	jsPsych.init({
		timeline: [trial]
	});
}
```

Note: If you are using HTML strings as stimuli, such as in the single-stim plugin, you will see a series of error messages in the JavaScript console about failing to find files. These messages can be ignored.
