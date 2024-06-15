# canvas-keyboard-response

Current version: 1.1.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-canvas-keyboard-response/CHANGELOG.md).

This plugin can be used to draw a stimulus on a [HTML canvas element](https://www.w3schools.com/html/html5_canvas.asp) and record a keyboard response. The canvas stimulus can be useful for displaying dynamic, parametrically-defined graphics, and for controlling the positioning of multiple graphical elements (shapes, text, images). The stimulus can be displayed until a response is given, or for a pre-determined amount of time. The trial can be ended automatically if the participant has failed to respond within a fixed length of time.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| stimulus            | function         | *undefined*        | The function to draw on the canvas. This function automatically takes a canvas element as its only argument, e.g. `function(c) {...}` or `function drawStim(c) {...}`, where `c` refers to the canvas element. Note that the stimulus function will still generally need to set the correct context itself, using a line like `let ctx = c.getContext("2d")`. |
| canvas_size         | array            | [500, 500]         | Array that defines the size of the canvas element in pixels. First value is height, second value is width. |
| choices             | array of strings | `"ALL_KEYS"` | This array contains the key(s) that the participant is allowed to press in order to respond to the stimulus. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/) for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"` means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed. |
| prompt              | string           | null               | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). |
| stimulus_duration   | numeric          | null               | How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends. |
| trial_duration      | numeric          | null               | How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely. |
| response_ends_trial | boolean          | true               | If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can use this parameter to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete. |

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| response  | string  | Indicates which key the participant pressed. |
| rt        | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. |

Note: the canvas stimulus is *not* included in the trial data because it is a function. Any stimulus information that should be saved in the trial data can be added via the `data` parameter.

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-canvas-keyboard-response@1.1.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-canvas-keyboard-response.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-canvas-keyboard-response
```
```js
import canvasKeyboardResponse from '@jspsych/plugin-canvas-keyboard-response';
```

## Examples

???+ example "Draw rectangle and wait for response"
    === "Code"
        ```javascript
        function drawRect(c){
            var ctx = c.getContext('2d');
            ctx.beginPath();
            ctx.rect(30, 30, 200, 50);
            ctx.stroke();
        }

        var trial = {
            type: jsPsychCanvasKeyboardResponse,
            canvas_size: [300, 300],
            stimulus: drawRect,
            choices: ['e','i'],
            prompt: '<p>Is this a circle or a rectangle? Press "e" for circle and "i" for rectangle.</p>',
            data: {shape: 'rectangle'}
        }
        ```
    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-canvas-keyboard-response-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-canvas-keyboard-response-demo1.html">Open demo in new tab</a>
    
???+ example "Draw circle, no response allowed"
    === "Code"
        ```javascript
        function drawCirc(c){
            var ctx = c.getContext('2d');
            ctx.beginPath();
            ctx.arc(100, 75, 50, 0, 2 * Math.PI);
            ctx.stroke();
        }

        var trial = {
            type: jsPsychCanvasKeyboardResponse,
            canvas_size: [300, 300],
            stimulus: drawCirc,
            prompt: '<p>No key response is allowed.</p><p>The stimulus disappears after 3 seconds.</p>',
            choices: "NO_KEYS",
            trial_duration: 3000,
            data: {shape: 'circle', radius: 50}
        }
        ```
            
    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-canvas-keyboard-response-demo2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-canvas-keyboard-response-demo2.html">Open demo in new tab</a>
