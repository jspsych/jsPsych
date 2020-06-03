# jspsych-audio-keyboard-response

This plugin plays audio files and records responses generated with the keyboard.

If the browser supports it, audio files are played using the WebAudio API. This allows for reasonably precise timing of the playback. The timing of responses generated is measured against the WebAudio specific clock, improving the measurement of response times. If the browser does not support the WebAudio API, then the audio file is played with HTML5 audio. 

Audio files are automatically preloaded by jsPsych. However, if you are using timeline variables or another dynamic method to specify the audio stimulus you will need to [manually preload](/overview/media-preloading/#manual-preloading) the audio.

The trial can end when the subject responds, when the audio file has finished playing, or if the subject has failed to respond within a fixed length of time.

## Parameters

Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | audio file | undefined | Path to audio file to be played.
choices | array of keycodes | `jsPsych.ALL_KEYS` | This array contains the keys that the subject is allowed to press in order to respond to the stimulus. Keys can be specified as their [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) or as characters (e.g., `'a'`, `'q'`). The default value of `jsPsych.ALL_KEYS` means that all keys will be accepted as valid responses. Specifying `jsPsych.NO_KEYS` will mean that no responses are allowed.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which key to press).
trial_duration | numeric | null | How long to wait for the subject to make a response before ending the trial in milliseconds. If the subject fails to make a response before this timer is reached, the subject's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely.
response_ends_trial | boolean | true | If true, then the trial will end whenever the subject makes a response (assuming they make their response before the cutoff specified by the `timing_response` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can use this parameter to force the subject to view a stimulus for a fixed amount of time, even if they respond before the time is complete.
trial_ends_after_audio | boolean | false | If true, then the trial will end as soon as the audio file finishes playing.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response.
stimulus | string | Path to the audio file that played during the trial.

## Examples

#### Displaying trial until subject gives a response

```javascript
var trial = {
	type: 'audio-keyboard-response',
	stimulus: 'sound/tone.mp3',
	choices: ['e', 'i'],
	prompt: "<p>Is the pitch high or low? Press 'e' for low and 'i' for high.</p>",
  response_ends_trial: false
};
```

#### Play a sound with no user response; trial ends after sound plays

```javascript
var trial = {
	type: 'audio-keyboard-response',
	stimulus: 'sound/tone.mp3',
	choices: jsPsych.NO_KEYS,
	trial_ends_after_audio: true
};
```
