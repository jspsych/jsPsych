# jspsych-image-keyboard-response

This plugin displays and image and records responses generated with the keyboard. The stimulus can be displayed until a response is given, or for a pre-determined amount of time. The trial can be ended automatically if the subject has failed to respond within a fixed length of time.

Image files can be automatically preloaded by jsPsych using the [`preload` plugin](jspsych-preload.md). However, if you are using timeline variables or another dynamic method to specify the image stimulus, you will need to [manually preload](/overview/media-preloading/#manual-preloading) the images.

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter             | Type             | Default Value      | Description                              |
| --------------------- | ---------------- | ------------------ | ---------------------------------------- |
| stimulus              | string           | *undefined*        | The path of the image file to be displayed. |
| stimulus_height       | integer          | null               | Set the height of the image in pixels. If left null (no value specified), then the image will display at its natural height. |
| stimulus_width        | integer          | null               | Set the width of the image in pixels. If left null (no value specified), then the image will display at its natural width. |
| maintain_aspect_ratio | boolean          | true               | If setting *only* the width or *only* the height and this parameter is true, then the other dimension will be scaled to maintain the image's aspect ratio. |
| choices               | array of strings | `jsPsych.ALL_KEYS` | This array contains the key(s) that the subject is allowed to press in order to respond to the stimulus. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/) for more examples. Any key presses that are not listed in the array will be ignored. The default value of `jsPsych.ALL_KEYS` means that all keys will be accepted as valid responses. Specifying `jsPsych.NO_KEYS` will mean that no responses are allowed. |
| prompt                | string           | null               | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which key to press). |
| stimulus_duration     | numeric          | null               | How long to show the stimulus for in milliseconds. If the value is `null`, then the stimulus will be shown until the subject makes a response. |
| trial_duration        | numeric          | null               | How long to wait for the subject to make a response before ending the trial in milliseconds. If the subject fails to make a response before this timer is reached, the subject's response will be recorded as null for the trial and the trial will end. If the value of this parameter is `null`, then the trial will wait for a response indefinitely. |
| response_ends_trial   | boolean          | true               | If true, then the trial will end whenever the subject makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force the subject to view a stimulus for a fixed amount of time, even if they respond before the time is complete. |
| render_on_canvas      | boolean          | true               | If `true`, the image will be drawn onto a canvas element. This prevents a blank screen (white flash) between consecutive image trials in some browsers, like Firefox and Edge. If `false`, the image will be shown via an img element, as in previous versions of jsPsych. If the stimulus is an **animated gif**, you must set this parameter to false, because the canvas rendering method will only present static images. |

## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| response  | string  | Indicates which key the subject pressed. |
| rt        | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response. |
| stimulus  | string  | The path of the image that was displayed. |

## Examples

#### Displaying trial until subject gives a response

```javascript
var trial = {
	type: 'image-keyboard-response',
	stimulus: 'img/happy_face_1.png',
	choices: ['e', 'i'],
	prompt: "<p>Is this person happy or sad? Press 'e' for happy and 'i' for sad.</p>",
	response_ends_trial: false
};
```

#### Displaying image for a fixed duration; no response allowed

```javascript
var trial = {
	type: 'image-button-response',
	stimulus: 'img/happy_face_1.png',
	choices: jsPsych.NO_KEYS,
	prompt: "<p>Study this face for 5 seconds.</p>",
	trial_duration: 5000
};
```
