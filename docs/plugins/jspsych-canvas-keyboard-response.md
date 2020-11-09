# jspsych-canvas-keyboard-response

This plugin can be used to draw a stimulus on a JavaScript canvas element, which can be useful for displaying parametrically defined shapes, and records responses generated with the keyboard. The stimulus can be displayed until a response is given, or for a pre-determined amount of time. The trial can be ended automatically if the subject has failed to respond within a fixed length of time.

## Parameters

Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | function | *undefined* | The function to draw on the canvas. This function must take a canvas element as its only argument, e.g. `foo(c)`. Note that the function will still generally need to set the correct context itself, using a line like let `ctx = c.getContext("2d")`.
canvas_size | array | [500, 500] | The size of the canvas element in pixels.
choices | array of keycodes | `jsPsych.ALL_KEYS` | This array contains the keys that the subject is allowed to press in order to respond to the stimulus. Keys can be specified as their [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) or as characters (e.g., `'a'`, `'q'`). The default value of `jsPsych.ALL_KEYS` means that all keys will be accepted as valid responses. Specifying `jsPsych.NO_KEYS` will mean that no responses are allowed.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which key to press).
stimulus_duration | numeric | null | How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends.
trial_duration | numeric | null | How long to wait for the subject to make a response before ending the trial in milliseconds. If the subject fails to make a response before this timer is reached, the subject's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely.
response_ends_trial | boolean | true | If true, then the trial will end whenever the subject makes a response (assuming they make their response before the cutoff specified by the `timing_response` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can use this parameter to force the subject to view a stimulus for a fixed amount of time, even if they respond before the time is complete.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response.
stimulus | function | The function that was drawn.

## Examples

### Displaying a drawing until subject gives a response

```javascript

function drawRect(c){
    var ctx = c.getContext('2d');
    ctx.beginPath();
    ctx.rect(30, 30, 200, 50);
    ctx.stroke();
}

var trial = {
    type: 'canvas-keyboard-response',
    stimulus: drawRect,
    choices: ['e','i'],
    prompt: '<p>is this a circle or a rectangle? press "e" for circle and "i" for rectangle</p>',
}
```

### Displaying a circle for 1 second, no response allowed

```javascript

function drawCirc(c){
    var ctx = c.getContext('2d');
    ctx.beginPath();
    ctx.arc(100, 75, 50, 0, 2 * Math.PI);
    ctx.stroke();
}

var trial = {
    type: 'canvas-keyboard-response',
    stimulus: drawCirc,
    choices: jsPsych.NO_KEYS,
    trial_duration: 1000,
}
```