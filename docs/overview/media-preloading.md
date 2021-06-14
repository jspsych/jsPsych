# Media Preloading

If an experiment uses image, audio, or video files as stimuli, it is a good idea to preload the files before running the experiment. You can preload files at any point in your experiment using the [jsPsych `preload` plugin](../plugins/jspsych-preload.md). Preloading files means that the subject's browser will download the files and store them in local memory on the subject's computer. This is important because displaying or playing a media file is much faster if it is already in memory on the subject's computer. Without preloading, there will be noticeable delays in the display of media, which will affect any timing measurements (such as how long an image is displayed, or a subject's response time since first viewing an image). For particularly large files, like video, preloading content avoids lengthy pauses in the middle of the experiment that can be disruptive to the flow of the experiment.

!!! warning
		Note that video preloading will not work when you run your experiment offline (e.g., by double-clicking on the HTML file), but it will work once your experiment is running online (hosted on a server). The [Cross-origin requests (CORS) and safe mode](running-experiments.md#cross-origin-requests-cors-and-safe-mode) section on the Running Experiments page contains more information about this.

## Automatic Preloading

jsPsych can automatically preload audio, video, and image files that are used as parameters for the standard set of plugins, based on the timeline that is passed to `jsPsych.init`. You must initiate this preloading using a `preload` trial. You should add this `preload` trial into your timeline when you want the preloading to occur, and set the `auto_preload` parameter to `true`.

```javascript
// the "auto_preload: true" setting tells the plugin to automatically find 
// stimuli to preload based the main experiment timeline (used in jsPsych.init)
var preload = {
	type: 'preload',
	auto_preload: true 
}

// this image file can be automatically preloaded 
var image_trial = {
	type: 'image-keyboard-response',
	stimulus: 'img/file1.png'
}

// the sound file can be automatically preloaded 
var sound_trial = {
	type: 'audio-keyboard-response',
	stimulus: 'audio/hello.mp3'
}

// the video file can be automatically preloaded (as long as the experiment 
// is running on a server)
var video_trial = {
	type: 'video',
	stimulus: ['video/sample_video.mp4']
}

jsPsych.init({
	timeline: [preload, image_trial, sound_trial, video_trial]
});
```

## Manual preloading

If you are using media files in your experiment but they are not being passed directly as parameters to the trials (e.g., because you are using functions as parameters that return the media files, you are using timeline variables, or you are embedding the media files in an HTML string), then these files will not be detected when you use the `auto_preload` option, so you must manually specify them. The `preload` plugin allows you to add these files using the `images`, `audio` and `video` parameters.

```javascript
// this image file cannot be automatically preloaded because it is embedded in 
// an HTML string
var image_trial = {
	type: 'html-keyboard-response',
	stimulus: '<img src="img/file1.png"></img>',
}

// this audio file cannot be automatically preloaded because it is returned 
// from a function
var sound_trial = {
	type: 'audio-keyboard-response',
	stimulus: function() { return 'audio/sound1.mp3' }
}

// these video files cannot be automatically preloaded because they are passed 
// into a trial using the jsPsych.timelineVariable function
var video_trials = {
	timeline: [
		{
			type: 'video',
			stimulus: jsPsych.timelineVariable('video')
		}
	],
	timeline_variables: [
		{video: ['video/1.mp4']},
		{video: ['video/2.mp4']}
	]
}

// to manually preload media files, create an array of file paths for each 
// media type
var images = ['img/file1.png'];
var audio = ['audio/sound1.mp3'];
var video = ['video/1.mp4', 'video/2.mp4'];

// these array can be passed into the preload plugin using the images, audio 
// and video parameters
var preload = {
	type: 'preload',
	images: images,
	audio: audio,
	video: video
}

jsPsych.init({
	timeline: [preload, image_trial, sound_trial, video_trials],
});

```

## Combining automatic and manual preloading

It's possible to combine automatic and manual preloading. For instance, you may want to automatically preload all of the media files based on your experiment timeline, while also manually preloading any files that can't be automatically preloaded. Any duplicate file names across all preloading methods will be removed before preloading starts, so including the same file names in multiple `preload` parameters will not affect the preloading duration. 

```javascript
// this file can be preloaded automatically
var image_trial = {
	type: 'image-keyboard-response',
	stimulus: 'img/file1.png'
}

// this file can be preloaded automatically
var sound_trial = {
	type: 'audio-keyboard-response',
	stimulus: 'audio/hello.mp3'
}

// these files must be preloaded manually
var video_trials = {
	timeline: [
		{
			type: 'video',
			stimulus: jsPsych.timelineVariable('video')
		}
	],
	timeline_variables: [
		{video: ['video/1.mp4']},
		{video: ['video/2.mp4']}
	]
}

var video = ['video/1.mp4', 'video/2.mp4'];

var preload = {
	type: 'preload',
	auto_preload: true, // automatically preload the image and audio files
	video: video // manually preload the videos used with timeline variables
}

jsPsych.init({
	timeline: [preload, image_trial, sound_trial, video_trials],
});

```

## Preloading in batches

Some experiments use many and/or large media files. This can cause problems when participants have slow and/or unreliable internet connections, because it increases the chances of loading errors during preloading. This can also cause problems with file caching, i.e. ensuring that the preloaded files remain in the browser's memory, because loading all stimuli at once may exceed the browser's cache limits. One option for mitigating these problems is to load the media files in smaller batches throughout the experiment. Files should be preloaded as close as possible to when they will be needed. For instance, if you have several blocks of trials, then right before each block, you can preload the stimuli that are needed for that block.

Here is an example with trials where the stimuli files can be preloaded automatically. In this case, the `trials` parameter is used to tell the `preload` plugin to preload the stimuli from a specific part of the timeline. 

```javascript
// these image files in these trial blocks can be automatically preloaded
var block_1 = {
	timeline: [
		{
			type: 'image-keyboard-response',
			stimulus: 'img/file1.png'
		},
		{
			type: 'image-keyboard-response',
			stimulus: 'img/file2.png'
		}
	]
}

var block_2 = {
	timeline: [
		{
			type: 'image-keyboard-response',
			stimulus: 'img/file3.png'
		},
		{
			type: 'image-keyboard-response',
			stimulus: 'img/file4.png'
		}
	]
}

var preload_1 = {
	type: 'preload',
	trials: block_1 // automatically preload just the images from block_1 trials
}

var preload_2 = {
	type: 'preload',
	trials: block_2 // automatically preload just the images from block_2 trials
}

jsPsych.init({
	// add each preload trial onto the timeline before the appropriate trial block
	timeline: [preload_1, block_1, preload_2, block_2],
});
```

Below is an example with trials where the stimuli files cannot be preloaded automatically, because the stimuli files are passed to the trials via `jsPsych.timelineVariable`. In this case, we create separate arrays for each batch of files, and then pass those arrays to the each preload trial.

```javascript
// these trial blocks cannot be automatically preloaded because 
// the media files are passed to the trial parameters with timeline variables
var block_1 = {
	timeline: [...],
	timeline_variables: [
		{stim: 'file1.png'},
		{stim: 'file1.png'}
	]
}

var block_2 = {
	timeline: [...],
	timeline_variables: [
		{stim: 'file3.png'},
		{stim: 'file4.png'}
	]
}

var images_block_1 = ['file1.png', 'file2.png'];
var images_block_2 = ['file3.png', 'file4.png'];

// preload trial for preloading the block 1 stimuli
var preload_1 = {
	type: 'preload',
	images: images_block_1
}

// preload trial for preloading the block 2 stimuli
var preload_2 = {
	type: 'preload',
	images: images_block_2
}

jsPsych.init({
	// add each preload trial to the timeline before the appropriate trial block
	timeline: [preload_1, block_1, preload_2, block_2], 
});

```

## Preloading progress bar

By default, the `preload` plugin will display a progress bar while files are being preloaded. This progress bar represents all files that are being preloaded during the trial, regardless of whether the file is being preloaded automatically via the `auto_preload` or `trials` parameters, or manually via the `audio`, `images`, and `video` parameters. You may wish to turn the preload progress bar off if you are only loading a small number of files, as it will appear and disappear so quickly that the participant may be confused about what it was. You can control whether the preloading progress bar appears by setting the `show_progress_bar` parameter in the `preload` trial.

```javascript
var preload_trial = {
	type: 'preload',
	auto_preload: true
	show_progress_bar: false // hide progress bar
}
```

## Loading time limits

It's usually a good idea to set a time limit for file loading, to ensure that participants aren't waiting for an unreasonable amount of time. Time limits can be specified in milliseconds using the `max_load_time` parameter. If you set a loading time limit and all files haven't finished loading before this time, then the `preload` trial will either stop an error (if `continue_after_error` is false, the default) or the trial will end and the experiment will continue (if `continue_after_error` is `true`). If `max_load_time` is `null` (the default), then there is no time limit. 

```javascript
var preload_trial = {
	type: 'preload',
	auto_preload: true
	max_load_time: 60000 // 1 minute
}
```

## Loading and error messages

It's possible to specify custom messages to be shown on the page while the media files are loading, and in case of one or more file loading errors. The `message` parameter allows you to customize the loading message using an HML-formatted string. If `show_progress_bar` is `true`, then this message will be shown above the progress bar. 

```javascript
var preload_trial = {
	type: 'preload',
	auto_preload: true
	message: 'Please wait while the experiment loads. This may take a few minutes.',
}
```

A preloading error will occur when either (a) one or more files produces a loading error, and/or (b) all files have not finished loading before the `max_load_time` duration. The `error_message` parameter allows you to customize the messsage that's shown on the page in these cases. This message will only be shown if `continue_after_error` is `false` (the default). 

```javascript
var preload_trial = {
	type: 'preload',
	auto_preload: true,
	error_message: 'The experiment failed to load. Please contact the researcher.'
}
```

In addition to the `error_message` parameter, it's also possible to show more detailed error messages on the page about any files that failed to load. You can control this with the `show_detailed_errors` parameter. Detailed error messages will appear below the general error message. This only applies if `continue_after_error` is `false` (the default). 

Detailed error messages can be useful when testing and debugging your experiment. If `show_detailed_errors` is `true`, then if one or more loading errors occurs before the `max_load_time` is reached, then the error page will also contian a list of the file(s) that produced an error, along with error information (if there is any). Note that this may not be a complete list, because it will only report any errors that occurred before the `max_load_time` was reached. If there are no file loading errors but preloading hasn't finished before the `max_load_time`, then detailed error message will just tell you that loading timed out. 

```javascript
var preload_trial = {
	type: 'preload',
	auto_preload: true,
	// show details of any file loading errors and/or loading time out
	show_detailed_errors: true 
}
```

## Options for handling errors

If `continue_after_error` is `true`, then the experiment _will not stop_ if one or more files fails to load. Instead, the trial will end and the experiment will continue. However, the preload trial data will contain a property called `success`, which is whether or not all files were loaded successfully, `timeout`, which is whether or not the files loaded successfully before the `max_load_time`. The preload trial data will also contain lists of any `image`, `audio`, and `video` files that failed to load. This gives you the option to continue the experiment after preloading fails and use the preload trial data decide what to do next. For instance, you may decide to skip the trials that use the stimuli files that failed to load, or try loading the failed files again. Another option is to simply end the experiment when preloading fails, but send the data back to your server so that you have more information about the loading failure.

```javascript
var preload_trial = {
	type: 'preload',
	auto_preload: true,
	message: 'Please wait while the experiment loads...',
	// don't stop the experiment if there are file loading errors or if loading times out
	continue_after_error: true 
}

var save_data = {
    type: 'call-function',
    async: true,
    func: function(done){
		var data = jsPsych.data.get().json();
        save_data(data, function() {done()})
    }
}

// the experiment will stop here, since there are no valid key choices or trial duration 
var fail_message = {
	type: 'html-keyboard-response',
	stimulus: 'The experiment failed to load. Please contact the researcher.',
	choices: jsPsych.NO_KEYS,
	trial_duration: null 
}

var if_loading_fails = {
	timeline: [save_data, fail_message],
	conditional_function: function() {
		if (jsPsych.data.getLastTrialData()[0].values().success) {
			// preloading was successful, so skip this conditional timeline
			// and move on with the experiment
			return false;
		} else {
			// preloading failed, so run this conditional timeline:
			// save the data to the server and show the fail message
			return true;
		}
	}
}

// ... rest of experiment

jsPsych.init({
	timeline: [preload_trial, if_loading_fails, ... ]
})

```

The `preload` plugin's `on_success` and `on_error` callback functions provide another way of tracking preloading progress and handling file loading errors. These functions are called after any file either loads successfully or produces an error, respectively. These functions receive a single argument, which is the path of the file (string) that loaded or produced an error.

```javascript
var file_load_count = 0;
var file_error_count = 0;

var preload_trial = {
    type: 'preload',
    auto_preload: true,
    on_error: function(file) {
		file_error_count++;
      	console.log('Error: ',file);
    },
    on_success: function(file) {
		file_load_count++;
      	console.log('Loaded: ',file);
    }
};
```

Note that there's no guarantee that any/all files will trigger one of these two callback functions, because they are cancelled after the `preload` trial ends. For instance, if a file takes longer to load then the `max_load_time`, then the `preload` trial will end due to timing out, and the `on_success` and `on_error` callbacks for any in-progress files will be cancelled.