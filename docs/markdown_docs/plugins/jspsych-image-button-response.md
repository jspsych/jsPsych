# jspsych-html-button-response

This plugin displays an image and records responses generated with a button click. The stimulus can be displayed until a response is given, or for a pre-determined amount of time. The trial can be ended automatically if the subject has failed to respond within a fixed length of time. The button itself can be customized using HTML formatting.

## Parameters

Parameters with a default value of *undefined* must be specified.
Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | string | undefined | The path of the image file to be displayed.
choices | array of strings | [] | Labels for the buttons. Each different string in the array will generate a different button.
button_html | HTML string | `'<button class="jspsych-btn">%choice%</button>'` | A template of HTML for generating the button elements. You can override this to create customized buttons of various kinds. The string `%choice%` will be changed to the corresponding element of the `choices` array. You may also specify an array of strings, if you need different HTML to render for each button. If you do specify an array, the `choices` array and this array must have the same length. The HTML from position 0 in the `button_html` array will be used to create the button for element 0 in the `choices` array, and so on.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which key to press).
stimulus_duration | numeric | null | How long to show the stimulus for in milliseconds. If the value is null, then the stimulus will be shown until the subject makes a response.
trial_duration | numeric | null | How long to wait for the subject to make a response before ending the trial in milliseconds. If the subject fails to make a response before this timer is reached, the subject's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, the trial will wait for a response indefinitely.
margin_vertical | string | '0px' | Vertical margin of the button(s).
margin_horizontal | string | '8px' | Horizontal margin of the button(s).
response_ends_trial | boolean | true | If true, then the trial will end whenever the subject makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `timing_response` is reached. You can use this parameter to force the subject to view a stimulus for a fixed amount of time, even if they respond before the time is complete.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response.
button_pressed | numeric | Indicates which button the subject pressed. The first button in the `choices` array is 0, the second is 1, and so on.
stimulus | string | The path of the image that was displayed.

## Examples

#### Displaying question until subject gives a response

```javascript
var trial = {
	type: 'image-button-response',
	stimulus: 'img/happy_face_1.png',
	choices: ['Happy', 'Sad'],
	prompt: "<p>Is this person happy or sad?</p>"
};
```
