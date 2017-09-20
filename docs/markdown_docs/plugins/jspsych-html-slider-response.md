# jspsych-html-slider-response

This plugin displays HTML content.The stimulus can be displayed until a response is given, or for a pre-determined amount of time. The trial can be ended automatically if the subject has failed to respond within a fixed length of time.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | HTML string | *undefined* | The string to be displayed
labels | array of keycodes/strings | Labels of the slider
button_label | String |  'Continue' | Label of the button to advance/submit
min | integer | 0 | Sets the minimum value of the slider
max | integer | 100 | Sets the maximum value of the slider
step | integer | 1 | Sets the step of the slider
prompt | String | '' | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g. which key to press).
stimulus_duration | integer | -1 | How long to show the stimulus for in milliseconds. If the value is -1, then the stimulus will be shown until the subject makes a response.
trial duration | numeric | -1 | How long to wait for the subject to make a response before ending the trial in milliseconds. If the subject fails to make a response before this timer is reached, the the subject's response will be recorded as -1 for the trial and the trial will end. If the value of this parameter is -1, then the trial will wait for a response indefinitely.
response_ends_trial | boolean | true | If true, then the trial will end whenever the subject makes a response (assuming they make their response before the cutoff specified by the `timing_response` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can use this parameter to force the subject to view a stimulus for a fixed amount of time, even if they respond before the time is complete.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
response | numeric | The numeric value of the slider.
rt | numeric | The time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response.

## Examples

#### Displaying trial until subject gives a response

```javascript
var trial = {
	type: 'html-slider-response',
	stimulus: '<p>Running</p>',
	labels: ['healthy', 'unhealthy'],
	prompt: "<p>How healthy/unhealthy is this activity?</p>",
  response_ends_trial: false
};
```
