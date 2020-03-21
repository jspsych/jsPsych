# jspsych-video-keyboard-response plugin

This plugin plays a video file and records a keyboard response. Various aspects of the timing, video playback, and keyboard options can be controlled through parameters.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
sources | array | *undefined* | An array of file paths to the video. You can specify multiple formats of the same video (e.g., .mp4, .ogg, .webm) to maximize the [cross-browser compatibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats). Usually .mp4 is a safe cross-browser option. The player will use the first source file in the array that is compatible with the browser, so specify the files in order of preference.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which key to press).
width | numeric | width of the video file | The width of the video display in pixels.
height | numeric | heigh of the video file | The height of the video display in pixels.
autoplay | boolean | true | If true, the video will begin playing as soon as it has loaded.
controls | boolean | false | If true, controls for the video player will be available to the subject. They will be able to pause the video or move the playback to any point in the video.
start | numeric | null | If given a value, the video will start at this time point in seconds.
stop| numeric | null | If given a value, the video will stop at this time point in seconds.
rate | numeric | null | The playback rate of the video. 1 is normal, <1 is slower, >1 is faster.
choices | array of keycodes | `jsPsych.ALL_KEYS` | This array contains the keys that the subject is allowed to press in order to respond to the stimulus. Keys can be specified as their [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) or as characters (e.g., `'a'`, `'q'`). The default value of `jsPsych.ALL_KEYS` means that all keys will be accepted as valid responses. Specifying `jsPsych.NO_KEYS` will mean that no responses are allowed.
trial_ends_after_video | bool | false | If true, then the trial will end as soon as the video file finishes playing.
trial_duration | numeric | null | How long to wait for the subject to make a response before ending the trial in milliseconds. If the subject fails to make a response before this timer is reached, the subject's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely.
response_ends_trial | boolean | true | If true, then the trial will end whenever the subject makes a response (assuming they make their response before the cutoff specified by the `timing_response` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can use this parameter to force the subject to view a stimulus for a fixed amount of time, even if they respond before the time is complete.


## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response.
stimulus | string | JSON encoding of the `sources` array.

## Example

```javascript
var trial = {
	type: 'video-keyboard-response',
	sources: [
		'video/sample_video.mp4',
		'video/sample_video.ogg'
	],
	choices: ['y','n'],
	width: 640
}
```
