# animation

Current version: 1.1.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-animation/CHANGELOG.md).

This plugin displays a sequence of images at a fixed frame rate. The sequence can be looped a specified number of times. The participant is free to respond at any point during the animation, and the time of the response is recorded.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimuli | array | *undefined* | Each element of the array is a path to an image file.
frame_time | numeric | 250 | How long to display each image in milliseconds.
frame_isi | numeric | 0 | If greater than 0, then a gap will be shown between each image in the sequence. This parameter specifies the length of the gap in milliseconds.
sequence_reps | numeric | 1 | How many times to show the entire sequence. There will be no gap (other than the gap specified by `frame_isi`) between repetitions.
choices | array of strings | `"ALL_KEYS"` | This array contains the key(s) that the participant is allowed to press in order to respond to the stimulus. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/) for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"` means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key(s) to press).
render_on_canvas | boolean | true | If true, the images will be drawn onto a canvas element. This prevents a blank screen (white flash) between consecutive images in some browsers, like Firefox and Edge. If false, the image will be shown via an img element, as in previous versions of jsPsych.

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
animation_sequence | array | An array, where each element is an object that represents a stimulus in the animation sequence. Each object has a `stimulus` property, which is the image that was displayed, and a `time` property, which is the time in ms, measured from when the sequence began, that the stimulus was displayed. The array will be encoded in JSON format when data is saved using either the `.json()` or `.csv()` functions.
response | array | An array, where each element is an object representing a response given by the participant. Each object has a `stimulus` property, indicating which image was displayed when the key was pressed, an `rt` property, indicating the time of the key press relative to the start of the animation, and a `key_press` property, indicating which key was pressed. The array will be encoded in JSON format when data is saved using either the `.json()` or `.csv()` functions.

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-animation@1.1.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-animation.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-animation
```
```js
import animation from '@jspsych/plugin-animation';
```

## Examples

???+ example "Displaying a single sequence multiple times"
    === "Code"
        ```javascript
        var animation_sequence = ["img/happy_face_1.jpg", "img/happy_face_2.jpg", "img/happy_face_3.jpg", "img/happy_face_4.jpg"];

        var animation_trial = {
            type: jsPsychAnimation,
            stimuli: animation_sequence,
            sequence_reps: 3,
            frame_time: 300,
            prompt: '<p>Watch the faces.</p>',
        };
        ```

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-animation-demo.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

        
    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-animation-demo.html">Open demo in new tab</a>