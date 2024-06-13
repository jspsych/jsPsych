# canvas-slider-response

Current version: 1.1.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-canvas-slider-response/CHANGELOG.md).

This plugin can be used to draw a stimulus on a [HTML canvas element](https://www.w3schools.com/html/html5_canvas.asp) and collect a response within a range of values, which is made by dragging a slider. The canvas stimulus can be useful for displaying dynamic, parametrically-defined graphics, and for controlling the positioning of multiple graphical elements (shapes, text, images). The stimulus can be displayed until a response is given, or for a pre-determined amount of time. The trial can be ended automatically if the participant has failed to respond within a fixed length of time.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | function | *undefined* | The function to draw on the canvas. This function automatically takes a canvas element as its only argument, e.g. `function(c) {...}` or `function drawStim(c) {...}`, where `c` refers to the canvas element. Note that the stimulus function will still generally need to set the correct context itself, using a line like `let ctx = c.getContext("2d")`.
canvas_size | array | [500, 500] | Array that defines the size of the canvas element in pixels. First value is height, second value is width.
labels | array of strings | [] | Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the other two will be at 33% and 67% of the slider width.
button_label | string | 'Continue' | Label of the button to end the trial.
min | integer | 0 | Sets the minimum value of the slider.
max | integer | 100 | Sets the maximum value of the slider.
slider_start | integer | 50 | Sets the starting value of the slider.
step | integer | 1 | Sets the step of the slider. This is the smallest amount by which the slider can change.
slider_width | integer | null | Set the width of the slider in pixels. If left null, then the width will be equal to the widest element in the display.
require_movement | boolean | false | If true, the participant must click the slider before clicking the continue button.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., what question to answer).
stimulus_duration | numeric | null | How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends.
trial_duration | numeric | null | How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely.
response_ends_trial | boolean | true | If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can use this parameter to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete.

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
response | numeric | The numeric value of the slider.
rt | numeric | The time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response.

Note: the canvas stimulus is *not* included in the trial data because it is a function. Any stimulus information that should be saved in the trial data can be added via the `data` parameter.

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-canvas-slider-response@1.1.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-canvas-slider-response.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-canvas-slider-response
```
```js
import canvasSliderResponse from '@jspsych/plugin-canvas-slider-response';
```

## Examples

???+ example "Draw two squares"
    === "Code"
        ```javascript
        var colors = ['#FF3333', '#FF6A33'];

        function twoSquares(c) {    
            var ctx = c.getContext('2d');
            ctx.fillStyle = colors[0];
            ctx.fillRect(200, 70, 40, 40);
            ctx.fillStyle = colors[1];
            ctx.fillRect(260, 70, 40, 40);
        }

        var trial = {
            type: jsPsychCanvasSliderResponse,
            stimulus: twoSquares,
            labels: ['0','10'],
            canvas_size: [150, 500],
            prompt: '<p>How different would you say the colors of these two squares are on a scale from 0 (the same) to 10 (completely different)</p>',
            data: {color1: colors[0], color2: colors[1]}
        }
        ```

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-canvas-slider-response-demo1.html" width="90%;" height="550px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-canvas-slider-response-demo1.html">Open demo in new tab</a>


???+ example "Draw two squares with additional parameters"
    === "Code"
        ```javascript
        var colors;

        function twoSquares(c, colors) {
            var ctx = c.getContext('2d');
            ctx.fillStyle = colors[0];
            ctx.fillRect(200, 70, 40, 40);
            ctx.fillStyle = colors[1];
            ctx.fillRect(260, 70, 40, 40);
        }

        var trial = {
            type: jsPsychCanvasSliderResponse,
            stimulus: function(c) {
                colors = ['darkred', 'cyan'];
                twoSquares(c, colors);
            },
            labels: ['Exactly<br>the same','Totally<br>different'],
            canvas_size: [200, 500],
            prompt: '<p>How different would you say the colors of these two squares are?</p>',
            on_finish: function(data) {
                data.color1 = colors[0];
                data.color2 = colors[1];
            }
        };

        ```

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-canvas-slider-response-demo2.html" width="90%;" height="550px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-canvas-slider-response-demo2.html">Open demo in new tab</a>


