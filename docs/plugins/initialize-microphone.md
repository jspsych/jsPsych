# initialize-microphone

Current version: 1.0.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-initialize-microphone/CHANGELOG.md).

This plugin asks the participant to grant permission to access a microphone. 
If multiple microphones are connected to the participant's device, then it allows the participant to pick which device to use. 
Once access is granted for an experiment you do not need to get permission again.

Once the microphone is selected with this plugin it can be accessed with [`jsPsych.pluginAPI.getMicrophoneRecorder()`](../reference/jspsych-pluginAPI.md#getmicrophonerecorder).

!!! warning
    When recording from a microphone your experiment will need to be running over `https://` protocol. If you try to run the experiment locally using the `file://` protocol or over `http://` protocol you will not be able to access the microphone because of [potential security problems](https://blog.mozilla.org/webrtc/camera-microphone-require-https-in-firefox-68/).

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
device_select_message | html string | `<p>Please select the microphone you would like to use.</p>` | The message to display when the user is presented with a dropdown list of available devices.
button_label | sting | 'Use this microphone.' | The label for the select button.


## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
device_id | string | The [device ID](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo/deviceId) of the selected microphone.

## Simulation Mode

This plugin does not yet support [simulation mode](../overview/simulation.md).

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-initialize-microphone@1.0.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-initialize-microphone.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-initialize-microphone
```
```js
import initializeMicrophone from '@jspsych/plugin-initialize-microphone';
```

## Examples

???+ example "Ask for microphone permission"
    === "Code"
        ```javascript
        var trial = {
            type: jsPsychInitializeMicrophone
        };
        ```

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-initialize-microphone-demo1.html" width="90%;" height="600px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-initialize-microphone-demo1.html">Open demo in new tab</a>