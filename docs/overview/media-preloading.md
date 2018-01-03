# Media Preloading

If an experiment uses images or audio files as stimuli, it is a good idea to preload the files before running the experiment. Preloading files means that the subject's browser will download all of the files and store them in local memory on the subject's computer. This is important because loading an image file is much faster if it is already in memory on the subject's computer. Without preloading, there will be noticeable delays in the display of media, which will affect any timing measurements (such as how long an image is displayed, or a subject's response time since first viewing an image).

## Automatic Preloading

jsPsych will automatically preload audio and image files that are used as parameters for the standard set of plugins.

```javascript
// the image file img/file1.png is
// automatically preloaded before the experiment begins
var trial = {
	type: 'image-keyboard-response',
	stimulus: 'img/file1.png'
}

// the sound file is also preloaded automatically
var sound_trial = {
	type: 'audio-keyboard-response',
	stimulus: 'audio/hello.mp3'
}

jsPsych.init({
	timeline: [trial]
});
```

## Manual preloading

If you are using images or audio in your experiment but they are not being passed directly as parameters to the trials (e.g., because you are using functions as parameters that return the image or audio), then you can manually specify the files to preload.

You can specify an array of image files (`preload_images`) and an array of audio files (`preload_audio`) for preloading in the `jsPsych.init()` method. These files will load before the experiment starts.

```javascript
// this trial will not preload the images, because the image file is being used
// in an HTML string
var trial = {
	type: 'html-keyboard-response',
	stimulus: '<img src="img/file1.png"></img>',
}

var audio_trial = {
	type: 'audio-keyboard-response',
	stimulus: function() { return 'audio/foo.mp3' }
}

// an array of paths to images that need to be loaded
var images = ['img/file1.png'];
var audio = ['audio/foo.mp3'];

jsPsych.init({
	timeline: [trial],
	preload_audio: audio,
	preload_images: images
});

```

## Preloading progress bar

By default, jsPsych will display a small progress bar while files are being preloaded. This progress bar represents all files that are being automatically preloaded or preloaded from the `preload_audio` and `preload_images` arrays. You may wish to turn this off if you are only loading a small number of files, as it will disappear so quickly that the participant may be confused about what it was. You can control whether the preloading progress bar appears by setting the `show_preload_progress_bar` parameter in `jsPsych.init()`

```javascript
jsPsych.init({
	timeline: timeline,
	show_preload_progress_bar: false // hide preload progress bar
});
```
