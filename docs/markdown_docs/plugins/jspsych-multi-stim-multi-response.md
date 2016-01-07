# jspsych-multi-stim-multi-response plugin

This plugin is a more generalized version of the single-stim plugin. With this plugin, you can present multiple stimuli in a single trial, and specify the amount of time that each stimulus will be on the screen. You can also collect more than one response from the subject. The plugin organizes the responses into *response groups*. For example, you might require that the subject make a 'yes'/'no' judgement by pressing the y or n key, but also require a rating judgment on a scale of 1-9 by pressing a number key.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimuli | array | *undefined* | Each element of this array is a string; they can be paths to images or HTML-formatted content.
is_html | boolean | false | If the elements of the `stimuli` array are strings containing HTML content, then this parameter must be set to true.
choices | array | *undefined* | Each element of this array is an array. The inner arrays contain the keys that the subject is allowed to press in order to respond to the stimulus. Keys can be specified as their [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes); specifying as a character won't work for this plugin. Each inner array represents a response group that the subject should respond to. If you want the subject to generate a single response, then specify only one inner array that contains all the acceptable responses. If you want the subject to generate two responses, then you should have two inner arrays, one with the acceptable keys for the first response, and one with the acceptable keys for the second response. **Note:** If the response keys overlap between response groups, setting the `timing_response` parameter is recommended.
prompt | string | "" | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g. which key to press).
timing_stim | array | [1000, 1000, ... , 1000] | Each element of the array is the length of time to display the corresponding stimulus for in milliseconds. The length of this array should match the length of the innermost stimuli arrays. Setting the last value of the array to -1 will cause the last stimulus to display until the subject has generated a response for each response group.
timing_response | numeric | -1 | How long to wait for the subject to make all responses before ending the trial in milliseconds. If the subject fails to make a response in a response group before this timer is reached, the the subject's response for that response group will be recorded as -1 for the trial and the trial will end. If the value of this parameter is -1, then the trial will wait for a response indefinitely.
response_ends_trial | boolean | true | If true, then the trial will end whenever the subject makes a response for each response group (assuming they make their response before the cutoff specified by the `timing_response` parameter). If false, then the trial will continue until the value for `timing_response` is reached. You can use this parameter to force the subject to view a stimulus for a fixed amount of time, even if they respond before the time is complete.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
stimulus | JSON string | JSON-encoded array containing the stimuli presented in the trial.
key_press | JSON string | JSON-encoded array indicating which keys the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response. Each response group will have a distinct entry in this array.
rt | JSON string | JSON-encoded array indicating the response time in milliseconds for the subject to make each response. The time is measured from when the first stimulus appears on the screen until the subject's response. Each response group will have a separate RT in the array.

## Examples

#### Displaying a sequence of images, get a single response

```javascript
var block = {
	type: 'multi-stim-multi-response',
	stimuli: ['img/happy_face.png', 'img/sad_face.png'],
	choices: [[89,78]], // Y or N
	timing_stim: [1000,-1],
	prompt: 'Did the face get happier?'
}
```

#### Displaying a single image, getting two responses

```javascript
var block = {
	type: 'multi-stim-multi-response',
	stimuli: ['img/happy_face.png'],
	choices: [[89, 78],[49,50,51,52,53]], // Y or N , 1 - 5
	timing_stim: [-1],
	prompt: 'Rate the happiness of the person on a scale of 1-5, and press Y or N to indicate if you have seen the face before'
}
```
