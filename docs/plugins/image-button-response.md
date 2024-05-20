# image-button-response

Current version: 1.2.0. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-image-button-response/CHANGELOG.md).

This plugin displays an image and records responses generated with a button click. The stimulus can be displayed until a response is given, or for a pre-determined amount of time. The trial can be ended automatically if the participant has failed to respond within a fixed length of time. The button itself can be customized using HTML formatting.

Image files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md). However, if you are using timeline variables or another dynamic method to specify the image stimulus, you will need to [manually preload](../overview/media-preloading.md#manual-preloading) the images.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | string | undefined | The path of the image file to be displayed.
stimulus_height | integer | null | Set the height of the image in pixels. If left null (no value specified), then the image will display at its natural height.
stimulus_width | integer | null | Set the width of the image in pixels. If left null (no value specified), then the image will display at its natural width.
maintain_aspect_ratio | boolean | true | If setting *only* the width or *only* the height and this parameter is true, then the other dimension will be scaled to maintain the image's aspect ratio. 
choices | array of strings | [] | Labels for the buttons. Each different string in the array will generate a different button.
button_html | HTML string | `'<button class="jspsych-btn">%choice%</button>'` | A template of HTML for generating the button elements. You can override this to create customized buttons of various kinds. The string `%choice%` will be changed to the corresponding element of the `choices` array. You may also specify an array of strings, if you need different HTML to render for each button. If you do specify an array, the `choices` array and this array must have the same length. The HTML from position 0 in the `button_html` array will be used to create the button for element 0 in the `choices` array, and so on.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).
stimulus_duration | numeric | null | How long to show the stimulus for in milliseconds. If the value is null, then the stimulus will be shown until the participant makes a response.
trial_duration | numeric | null | How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, the trial will wait for a response indefinitely.
margin_vertical | string | '0px' | Vertical margin of the button(s).
margin_horizontal | string | '8px' | Horizontal margin of the button(s).
response_ends_trial | boolean | true | If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete.
render_on_canvas | boolean | true | If true, the image will be drawn onto a canvas element. This prevents a blank screen (white flash) between consecutive image trials in some browsers, like Firefox and Edge. If false, the image will be shown via an img element, as in previous versions of jsPsych. If the stimulus is an **animated gif**, you must set this parameter to false, because the canvas rendering method will only present static images.
enable_button_after | numeric | 0 | How long the button will delay enabling in milliseconds.

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
rt | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response.
response | numeric | Indicates which button the participant pressed. The first button in the `choices` array is 0, the second is 1, and so on.
stimulus | string | The path of the image that was displayed.

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-image-button-response@1.2.0"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-image-button-response.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-image-button-response
```
```js
import imageButtonResponse from '@jspsych/plugin-image-button-response';
```

## Examples

???+ example "Displaying question until participant gives a response"
    === "Code"

        ```javascript
        var trial = {
            type: jsPsychImageButtonResponse,
            stimulus: 'img/happy_face_1.png',
            choices: ['Happy', 'Sad'],
            prompt: "<p>Is this person happy or sad?</p>"
        };
        ```

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-image-button-response-demo1.html" width="90%;" height="600px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-image-button-response-demo1.html">Open demo in new tab</a>
