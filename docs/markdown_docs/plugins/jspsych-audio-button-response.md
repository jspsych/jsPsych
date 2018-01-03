# jspsych-audio-button-response

This plugin plays audio files and records responses generated with a button click.

If the browser supports it, audio files are played using the WebAudio API. This allows for reasonably precise timing of the playback. The timing of responses generated is measured against the WebAudio specific clock, improving the measurement of response times. If the browser does not support the WebAudio API, then the audio file is played with HTML5 audio. Audio files are automatically preloaded by jsPsych.

The trial can end when the subject responds, when the audio file has finished playing, or if the subject has failed to respond within a fixed length of time.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | audio file | undefined | Path to audio file to be played.
choices | array of strings | [] | Labels for the buttons. Each different string in the array will generate a different button.
button_html | HTML string | `'<button class="jspsych-btn">%choice%</button>'` | A template of HTML for generating the button elements. You can override this to create customized buttons of various kinds. The string `%choice%` will be changed to the corresponding element of the `choices` array. You may also specify an array of strings, if you need different HTML to render for each button. If you do specify an array, the `choices` array and this array must have the same length. The HTML from position 0 in the `button_html` array will be used to create the button for element 0 in the `choices` array, and so on.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which key to press).
trial_duration | numeric | null | How long to wait for the subject to make a response before ending the trial in milliseconds. If the subject fails to make a response before this timer is reached, the subject's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, the trial will wait for a response indefinitely.
margin_vertical | string | '0px' | Vertical margin of the button(s).
margin_horizontal | string | '8px' | Horizontal margin of the button(s).
response_ends_trial | boolean | true | If true, then the trial will end whenever the subject makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `timing_response` is reached. You can use this parameter to force the subject to view a stimulus for a fixed amount of time, even if they respond before the time is complete.
trial_ends_after_audio | boolean | false | If true, then the trial will end as soon as the audio file finishes playing.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response.
button_pressed | numeric | Indicates which button the subject pressed. The first button in the `choices` array is 0, the second is 1, and so on.

## Examples

#### Displaying question until subject gives a response

```javascript
var trial = {
	type: 'audio-button-response',
	stimulus: 'sound/tone.mp3',
	choices: ['Low', 'High'],
	prompt: "<p>Is the pitch high or low?</p>"
};
```

#### Using custom button HTML to use images as buttons

```javascript
var trial = {
	type: 'audio-button-response',
	stimulus: 'sound/roar.mp3',
	choices: ['lion.png', 'elephant.png', 'monkey.png'],
	prompt: "<p>Which animal made the sound?</p>",
	button_html: '<img src="%choice%" />'
};
```
