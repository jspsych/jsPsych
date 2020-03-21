# jspsych-image-slider-response

This plugin displays and image and allows the subject to respond by dragging a slider.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | string | *undefined* | The path to the image file to be displayed.
stimulus_height | integer | null | Set the height of the image in pixels. If left null (no value specified), then the image will display at its natural height.
stimulus_width | integer | null | Set the width of the image in pixels. If left null (no value specified), then the image will display at its natural width.
maintain_aspect_ration | boolean | true | If setting *only* the width or *only* the height and this parameter is true, then the other dimension will be scaled to maintain the image's aspect ratio. 
labels | array of strings | [] | Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the other two will be at 33% and 67% of the slider width.
button_label | string |  'Continue' | Label of the button to advance/submit
min | integer | 0 | Sets the minimum value of the slider
max | integer | 100 | Sets the maximum value of the slider
start | integer | 50 | Sets the starting value of the slider
step | integer | 1 | Sets the step of the slider
slider_width | integer | null | Set the width of the slider in pixels. If left null, then the width will be equal to the widest element in the display.
require_movement | boolean | false | If true, the subject must move the slider before clicking the continue button.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which key to press).
stimulus_duration | numeric | null | How long to show the stimulus for in milliseconds. If the value is null, then the stimulus will be shown until the subject makes a response.
trial_duration | numeric | null | How long to wait for the subject to make a response before ending the trial in milliseconds. If the subject fails to make a response before this timer is reached, the subject's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely.
response_ends_trial | boolean | true | If true, then the trial will end whenever the subject makes a response (assuming they make their response before the cutoff specified by the `timing_response` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can use this parameter to force the subject to view a stimulus for a fixed amount of time, even if they respond before the time is complete.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
response | numeric | The numeric value of the slider.
rt | numeric | The time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response.
stimulus | string | The path of the image that was displayed.

## Examples

#### Displaying trial until subject gives a response

```javascript
var trial = {
	type: 'image-slider-response',
	stimulus: 'img/happy_face_1.png',
	labels: ['happy', 'sad'],
	prompt: "<p>How happy/sad is this person?</p>",
  response_ends_trial: false
};
```
