# jspsych-html-keyboard-response

This plugin displays HTML content and records responses generated with the keyboard.The stimulus can be displayed until a response is given, or for a pre-determined amount of time. The trial can be ended automatically if the subject has failed to respond within a fixed length of time.


## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | HTML string | *undefined* | The string to be displayed.
choices | array of keycodes | `jsPsych.ALL_KEYS` | This array contains the keys that the subject is allowed to press in order to respond to the stimulus. Keys can be specified as their [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) or as characters (e.g. `'a'`, `'q'`). The default value of `jsPsych.ALL_KEYS` means that all keys will be accepted as valid responses. Specifying `jsPsych.NO_KEYS` will mean that no responses are allowed.
prompt | string | "" | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g. which key to press).
trial duration | numeric | -1 | How long to wait for the subject to make a response before ending the trial in milliseconds. If the subject fails to make a response before this timer is reached, the the subject's response will be recorded as -1 for the trial and the trial will end. If the value of this parameter is -1, then the trial will wait for a response indefinitely.
response_ends_trial | boolean | true | If true, then the trial will end whenever the subject makes a response (assuming they make their response before the cutoff specified by the `timing_response` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can use this parameter to force the subject to view a stimulus for a fixed amount of time, even if they respond before the time is complete.
trial_ends_after_audio | Boolean | false | If true, then the trial will end as soon as the audio file finishes playing.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response.

## Examples

#### Displaying trial until subject gives a response

```javascript
var trial = {
	type: 'html-keyboard-response',
	stimulus: '<p>Running</p>',
	choices: ['e', 'i'],
	prompt: "<p>Is this activity healthy or unhealthy? Press 'e' for healthy and 'i' for unhealthy.</p>",
  response_ends_trial: false
};
```
