# jspsych-canvas-button-response

This plugin can be used to draw a stimulus on a [HTML canvas element](https://www.w3schools.com/html/html5_canvas.asp), and record a button click response and response time. The canvas stimulus can be useful for displaying dynamic, parametrically-defined graphics, and for controlling the positioning of multiple graphical elements (shapes, text, images). The stimulus can be displayed until a response is given, or for a pre-determined amount of time. The trial can be ended automatically if the subject has failed to respond within a fixed length of time. One or more button choices will be displayed under the canvas, and the button style can be customized using HTML formatting.

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | function | *undefined* | The function to draw on the canvas. This function automatically takes a canvas element as its only argument, e.g. `function(c) {...}`  or `function drawStim(c) {...}`, where `c` refers to the canvas element. Note that the stimulus function will still generally need to set the correct context itself, using a line like `let ctx = c.getContext("2d")`.
canvas_size | array | [500, 500] | Array that defines the size of the canvas element in pixels. First value is height, second value is width.
choices | array of strings | [] | Labels for the buttons. Each different string in the array will generate a different button.
button_html | HTML string | `'<button class="jspsych-btn">%choice%</button>'` | A template of HTML for generating the button elements. You can override this to create customized buttons of various kinds. The string `%choice%` will be changed to the corresponding element of the `choices` array. You may also specify an array of strings, if you need different HTML to render for each button. If you do specify an array, the `choices` array and this array must have the same length. The HTML from position 0 in the `button_html` array will be used to create the button for element 0 in the `choices` array, and so on.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., what question to answer).
trial_duration | numeric | null | How long to wait for the subject to make a response before ending the trial in milliseconds. If the subject fails to make a response before this timer is reached, the subject's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, the trial will wait for a response indefinitely.
stimulus_duration | numeric | null | How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends.
margin_vertical | string | '0px' | Vertical margin of the button(s).
margin_horizontal | string | '8px' | Horizontal margin of the button(s).
response_ends_trial | boolean | true | If true, then the trial will end whenever the subject makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can use this parameter to force the subject to view a stimulus for a fixed amount of time, even if they respond before the time is complete.

## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response.
response | numeric | Indicates which button the subject pressed. The first button in the `choices` array is 0, the second is 1, and so on.

Note: the canvas stimulus is *not* included in the trial data because it is a function. Any stimulus information that should be saved in the trial data can be added via the `data` parameter.

## Examples

### Drawing circles based on parameters

```javascript
function filledCirc(canvas, radius, color){
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(250, 250, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill()
}

var circle_1 = {
    type: 'canvas-button-response',
    stimulus: function (c) {
        filledCirc(c, 100, 'blue');
    },
    choices: ['Red', 'Green', 'Blue'],
    prompt: '<p>What color is the circle?</p>',
    data: {color: 'blue', radius: 100}
};

var circle_2 = {
    type: 'canvas-button-response',
    stimulus: function (c) {
        filledCirc(c, 150, 'green');
    },
    choices: ['Larger', 'Smaller'],
    prompt: '<p>Is this circle larger or smaller than the last one?</p>',
    data: {color: 'green', radius: 150}
};

```