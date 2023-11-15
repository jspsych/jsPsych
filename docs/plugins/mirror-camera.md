# mirror-camera

Current version: 1.0.0 [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-mirror-camera/CHANGELOG.md).

This plugin shows a live feed of the participant's camera. It can be useful in experiments that need to record video in order to give the participant a chance to see what is in the view of the camera.

You must initialize the camera using the [initialize-camera plugin](initialize-camera.md) prior to running this plugin.

!!! warning
    When recording from a camera your experiment will need to be running over `https://` protocol. If you try to run the experiment locally using the `file://` protocol or over `http://` protocol you will not be able to access the camera because of [potential security problems](https://blog.mozilla.org/webrtc/camera-microphone-require-https-in-firefox-68/).

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
prompt | html string | null | HTML-formatted content to display below the camera feed.
width | int | null | The width of the video playback element. If left `null` then it will match the size of the recording.
height | int | null | The height of the video playback element. If left `null` then it will match the size of the recording.
button_label | string | "Continue" | The label of the button to advance to the next trial.
mirror_camera | bool | true | Whether to mirror the video image.


## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
rt | int | The length of time the participant viewed the video playback.

## Simulation Mode

This plugin does not yet support [simulation mode](../overview/simulation.md).

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-mirror-camera@1.0.2"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-mirror-camera.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-mirror-camera
```
```js
import mirrorCamera from '@jspsych/plugin-mirror-camera';
```

## Examples

???+ example "Show the camera feed"
    === "Code"
        ```javascript
        const init_camera = {
            type: jsPsychInitializeCamera,
        }

        const mirror_camera = {
            type: jsPsychMirrorCamera,
        }
        ```

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-mirror-camera-demo1.html" width="90%;" height="600px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-mirror-camera-demo1.html">Open demo in new tab</a>