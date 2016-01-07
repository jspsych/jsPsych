# jspsych-single-audio plugin

This plugin plays audio files and records responses generated with the keyboard.

Audio files are played using the [WebAudio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API). This allows for reasonably precise timing of the playback. The timing of responses generated is measured against the WebAudio specific clock, improving the measurement of response times.

Audio files are automatically preloaded by jsPsych.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | string | *undefined* | Path to an audio file.
choices | array | [ ] | This array contains the keys that the subject is allowed to press in order to respond to the stimulus. Keys can be specified as their [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) or as characters (e.g. `'a'`, `'q'`). The default value of an empty array means that all keys will be accepted as valid responses.
prompt | string | "" | This string can contain HTML markup. Any content here will be displayed on the screen. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g. which key to press).
timing_response | numeric | -1 | How long to wait for the subject to make a response before ending the trial in milliseconds. If the subject fails to make a response before this timer is reached, the the subject's response will be recorded as -1 for the trial and the trial will end. If the value of this parameter is -1, then the trial will wait for a response indefinitely.
response_ends_trial | boolean | true | If true, then the trial will end whenever the subject makes a response (assuming they make their response before the cutoff specified by the `timing_response` parameter). If false, then the trial will continue until the value for `timing_response` is reached. You can use this parameter to force the subject to view a stimulus for a fixed amount of time, even if they respond before the time is complete.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
stimulus | string | The path to the file that was played during the trial.
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the audio file began playing.

## Examples

#### Playing a sound

```javascript
var trial = {
	type: 'single-audio',
	stimulus: 'sound/sound.mp3'
}
```

#### Restricting which keys the subject can use to respond

```javascript
var trial = {
	type: 'single-audio',
	stimulus: 'sound/sound.mp3',
	choices: ['h','s']
}
```
