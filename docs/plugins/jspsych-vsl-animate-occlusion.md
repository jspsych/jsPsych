# jspsych-vsl-animate-occlusion plugin

The VSL (visual statistical learning) animate occlusion plugin displays an animated sequence of shapes that disappear behind an occluding rectangle while they change from one shape to another. This plugin can be used to replicate the experiments described in:

Fiser, J., & Aslin, R. N. (2002). Statistical learning of higher-order temporal structure from visual shape sequences. *Journal of Experimental Psychology: Learning, Memory, and Cognition, 28*(3), 458.

## Dependency

This plugin requires the Snap.svg library, available at [http://www.snapsvg.io](http://www.snapsvg.io). You must include the library in the `<head>` section of your experiment page.

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter             | Type             | Default Value      | Description                              |
| --------------------- | ---------------- | ------------------ | ---------------------------------------- |
| stimuli               | array            | *undefined*        | Each element of the array is a stimulus. A stimulus is a path to an image file. The order of stimuli in the array determines the order of the animation sequence. |
| canvas_size           | array            | `[400, 400]`       | Array specifying the width and height of the area that the animation will display in. Stimuli will move to the edges of this area, so increasing the width without increasing the `timing_cycle` parameter will speed up the images. |
| image_size            | array            | `[100, 100]`       | Array specifying the width and height of the images to show. The occluding rectangle will have a width equal to the width of image_size. |
| initial_direction     | string           | "left"             | Which direction the stimulus should move first (subsequent directions will alternate). Choices are "left" or "right". |
| occlude_center        | boolean          | true               | If true, display a rectangle in the center of the screen that is just wide enough to occlude the image completely as it passes behind. |
| choices               | array of strings | `jsPsych.ALL_KEYS` | This array contains the key(s) that the subject is allowed to press in order to respond to the stimulus. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/) for more examples. Any key presses that are not listed in the array will be ignored. The default value of `jsPsych.ALL_KEYS` means that all keys will be accepted as valid responses. Specifying `jsPsych.NO_KEYS` will mean that no responses are allowed. |
| cycle_duration        | numeric          | 1000               | How long it takes for a stimulus in the sequence to make a complete cycle (move to the edge and back to the center) in milliseconds. |
| pre_movement_duration | numeric          | 500                | How long to wait before the stimuli starts moving from behind the center rectangle. |

## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type        | Value                                    |
| --------- | ----------- | ---------------------------------------- |
| stimulus  | array | Array where each element is a stimulus from the sequence, in the order that they were shown. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
| response | array | Array containing all response information. Each element in the array is an object representing each valid response. Each response item has three properties: `key` the key that was pressed, `stimulus` the index of the stimulus that was displayed when the response was made, and `rt` the response time measured since the start of the sequence. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |

## Examples

???+ example "Displaying a short sequence with default options"
    === "Code"
        ```javascript
        var trial = {
          type: 'vsl-animate-occlusion',
          stimuli: [
            "img/1.gif",
            "img/2.gif",
            "img/3.gif",
            "img/4.gif"
          ]
        }
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="/demos/jspsych-vsl-animate-occlusion-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="/demos/jspsych-vsl-animate-occlusion-demo1.html">Open demo in new tab</a>
