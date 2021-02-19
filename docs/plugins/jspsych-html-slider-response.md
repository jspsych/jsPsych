# jspsych-html-slider-response

This plugin displays HTML content and allows the subject to respond by dragging a slider.

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | HTML string | *undefined* | The string to be displayed
labels | array of strings | [] | Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the other two will be at 33% and 67% of the slider width.
button_label | string | 'Continue' | Label of the button to end the trial.
min | integer | 0 | Sets the minimum value of the slider.
max | integer | 100 | Sets the maximum value of the slider.
slider_start | integer | 50 | Sets the starting value of the slider
step | integer | 1 | Sets the step of the slider. This is the smallest amount by which the slider can change.
slider_width | integer | null | Set the width of the slider in pixels. If left null, then the width will be equal to the widest element in the display.
require_movement | boolean | false | If true, the subject must move the slider before clicking the continue button.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which key to press).
stimulus_duration | numeric | null | How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends.
trial_duration | numeric | null | How long to wait for the subject to make a response before ending the trial in milliseconds. If the subject fails to make a response before this timer is reached, the subject's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely.
response_ends_trial | boolean | true | If true, then the trial will end whenever the subject makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force the subject to view a stimulus for a fixed amount of time, even if they respond before the time is complete.

## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
response | numeric | The numeric value of the slider.
rt | numeric | The time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response.
stimulus | string | The HTML content that was displayed on the screen.
slider_start | numeric | The starting value of the slider.

## Examples

```javascript
var trial = {
	type: 'html-slider-response',
	stimulus: '<p>Running</p>',
	labels: ['healthy', 'unhealthy'],
	prompt: "<p>How healthy/unhealthy is this activity?</p>"
};
```
