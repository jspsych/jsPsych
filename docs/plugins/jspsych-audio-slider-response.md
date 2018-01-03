# jspsych-audio-slider-response

This plugin plays audio files and records responses generated with a button click.

If the browser supports it, audio files are played using the WebAudio API.This allows for reasonably precise timing of the playback. The timing of responses generated is measured against the WebAudio specific clock, improving the measurement of response times. If the browser does not support the WebAudio API, then the audio file is played with HTML5 audio. Audio files are automatically preloaded by jsPsych.

The trial can end when the subject responds, or if the subject has failed to respond within a fixed length of time.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | audio file | *undefined* | Audio file to be played
labels | array of strings | Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the other two will be at 33% and 67% of the slider width.
button_label | string | 'Continue' | Label of the button to end the trial.
min | integer | 0 | Sets the minimum value of the slider
max | integer | 100 | Sets the maximum value of the slider
start | integer | 50 | Sets the starting value of the slider
step | integer | 1 | Sets the step of the slider. This is the smallest amount by which the slider can change.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which key to press).
trial_duration | numeric | null | How long to wait for the subject to make a response before ending the trial in milliseconds. If the subject fails to make a response before this timer is reached, the subject's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely.
response_ends_trial | boolean | true | If true, then the trial will end whenever the subject makes a response (assuming they make their response before the cutoff specified by the `timing_response` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can use this parameter to force the subject to listen to the stimulus for a fixed amount of time, even if they respond before the time is complete.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
response | numeric | The numeric value of the slider.
rt | numeric | The time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response.
stimulus | string | The path of the audio file that was played.

## Examples

#### A simple rating scale

```javascript
var trial_1 = {
	type: 'audio-slider-response',
	stimulus: 'sound/speech_joke.mp3',
	labels: ['Not Funny', 'Funny'],
	prompt: '<p>How funny is the joke?</p>'
}
```
