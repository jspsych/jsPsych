# initialize-camera

Current version: 1.0.0 [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-initialize-camera/CHANGELOG.md).

This plugin asks the participant to grant permission to access a camera.
If multiple cameras are connected to the participant's device, then it allows the participant to pick which device to use. 
Once access is granted for an experiment you do not need to get permission again.

Once the camera is selected with this plugin it can be accessed with [`jsPsych.pluginAPI.getCameraRecorder()`](../reference/jspsych-pluginAPI.md#getcamerarecorder).

!!! warning
    When recording from a camera your experiment will need to be running over `https://` protocol. If you try to run the experiment locally using the `file://` protocol or over `http://` protocol you will not be able to access the microphone because of [potential security problems](https://blog.mozilla.org/webrtc/camera-microphone-require-https-in-firefox-68/).

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
device_select_message | html string | `<p>Please select the camera you would like to use.</p>` | The message to display when the user is presented with a dropdown list of available devices.
button_label | sting | 'Use this camera.' | The label for the select button.
include_audio | bool | false | Set to `true` to include an audio track in the recordings.
width | int | null | Request a specific width for the recording. This is not a guarantee that this width will be used, as it depends on the capabilities of the participant's device. Learn more about `MediaRecorder` constraints [here](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API/Constraints#requesting_a_specific_value_for_a_setting).
height | int | null | Request a specific height for the recording. This is not a guarantee that this height will be used, as it depends on the capabilities of the participant's device. Learn more about `MediaRecorder` constraints [here](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API/Constraints#requesting_a_specific_value_for_a_setting).
mime_type | string | null | Set this to use a specific [MIME type](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/mimeType) for the recording. Set the entire type, e.g., `'video/mp4; codecs="avc1.424028, mp4a.40.2"'`.


## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
device_id | string | The [device ID](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo/deviceId) of the selected camera.

## Simulation Mode

This plugin does not yet support [simulation mode](../overview/simulation.md).

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-initialize-camera@1.0.2"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-initialize-camera.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-initialize-camera
```
```js
import initializeCamera from '@jspsych/plugin-initialize-camera';
```

## Examples

???+ example "Ask for camera permission"
    === "Code"
        ```javascript
        var trial = {
            type: jsPsychInitializeCamera
        };
        ```

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-initialize-camera-demo1.html" width="90%;" height="600px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-initialize-camera-demo1.html">Open demo in new tab</a>