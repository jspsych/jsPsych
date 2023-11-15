# html-video-response

Current version: 1.0.2. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-html-video-response/CHANGELOG.md).

This plugin displays HTML content and records video from the participant via a webcam. 

In order to get access to the camera, you need to use the [initialize-camera plugin](initialize-camera.md) on your timeline prior to using this plugin.
Once access is granted for an experiment you do not need to get permission again.

This plugin records video data in [base 64 format](https://developer.mozilla.org/en-US/docs/Glossary/Base64). 
This is a text-based representation of the video which can be coverted to various video formats using a variety of [online tools](https://www.google.com/search?q=base64+video+decoder) as well as in languages like python and R.

**This plugin will generate a large amount of data, and you will need to be careful about how you handle this data.** 
Even a few seconds of video recording will add 10s of kB to jsPsych's data. 
Multiply this by a handful (or more) of trials, and the data objects will quickly get large.
If you need to record a lot of video, either many trials worth or just a few trials with longer responses, we recommend that you save the data to your server immediately after the trial and delete the data in jsPsych's data object.
See below for an example of how to do this.

This plugin also provides the option to store the recorded video files as [Object URLs](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) via `save_video_url: true`. 
This will generate a URL that stores a copy of the recorded video, which can be used for subsequent playback during the experiment. 
See below for an example where the recorded video is used as the stimulus in a subsequent trial.
This feature is turned off by default because it uses a relatively large amount of memory compared to most jsPsych features.
If you are running an experiment where you need this feature and you are recording lots of video clips, you may want to manually revoke the URLs when you no longer need them using [`URL.revokeObjectURL(objectURL)`](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL).

!!! warning
    When recording from a camera your experiment will need to be running over `https://` protocol. If you try to run the experiment locally using the `file://` protocol or over `http://` protocol you will not be able to access the camera because of [potential security problems](https://blog.mozilla.org/webrtc/camera-microphone-require-https-in-firefox-68/).

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | HTML string | undefined | The HTML content to be displayed.
recording_duration | numeric | 2000 | The maximum length of the recording, in milliseconds. The default value is intentionally set low because of the potential to accidentally record very large data files if left too high. You can set this to `null` to allow the participant to control the length of the recording via the done button, but be careful with this option as it can lead to crashing the browser if the participant waits too long to stop the recording. 
stimulus_duration | numeric | null | How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends.
show_done_button | bool | true | Whether to show a button on the screen that the participant can click to finish the recording.
done_button_label | string | 'Continue' | The label for the done button.
allow_playback | bool | false | Whether to allow the participant to listen to their recording and decide whether to rerecord or not. If `true`, then the participant will be shown an interface to play their recorded video and click one of two buttons to either accept the recording or rerecord. If rerecord is selected, then stimulus will be shown again, as if the trial is starting again from the beginning.
record_again_button_label | string | 'Record again' | The label for the record again button enabled when `allow_playback: true`.
accept_button_label | string | 'Continue' | The label for the accept button enabled when `allow_playback: true`.
save_video_url | bool | false | If `true`, then an [Object URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) will be generated and stored for the recorded video. Only set this to `true` if you plan to reuse the recorded video later in the experiment, as it is a potentially memory-intensive feature.


## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
rt | numeric | The time, since the onset of the stimulus, for the participant to click the done button. If the button is not clicked (or not enabled), then `rt` will be `null`.
response | base64 string | The base64-encoded video data.
stimulus | string | The HTML content that was displayed on the screen.
video_url | string | A URL to a copy of the video data.

## Simulation Mode

This plugin does not yet support [simulation mode](../overview/simulation.md).

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-html-video-response@1.0.2"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-html-video-response.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-html-video-response
```
```js
import htmlVideoResponse from '@jspsych/plugin-html-video-response';
```

## Examples

???+ example "Simple recorded response to a stimulus"
    === "Code"
        ```javascript
        var init_camera = {
            type: jsPsychInitializeCamera
        }

        var trial = {
            type: jsPsychHtmlVideoResponse,
            stimulus: `
            <p style="font-size:48px; color:red;"> <-- </p>
            <p>Turn your head in the direction of the arrow</p>`,
            recording_duration: 3500,
            show_done_button: false,
        };
        ```

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-html-video-response-demo1.html" width="90%;" height="600px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-html-video-response-demo1.html">Open demo in new tab</a>

???+ example "Allow playback and rerecording"
    === "Code"
        ```javascript
        var init_camera = {
            type: jsPsychInitializeCamera
        }

        var trial = {
            type: jsPsychHtmlVideoResponse,
            stimulus: `<p>Make a sad face</p>`,
            recording_duration: 3500,
            show_done_button: false,
            allow_playback: true
        };
        ```

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-html-video-response-demo2.html" width="90%;" height="600px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-html-video-response-demo2.html">Open demo in new tab</a>

???+ example "Use recorded video as a subsequent stimulus"
    === "Code"
        ```javascript
        var init_camera = {
            type: jsPsychInitializeCamera
        }

        var record = {
            type: jsPsychHtmlVideoResponse,
            stimulus: `<p>Make a sad face.</p>`,
            recording_duration: 1500,
            show_done_button: false,
            save_video_url: true
        };

        var classify = {
            type: jsPsychVideoButtonResponse,
            stimulus: () => {
                return [jsPsych.data.get().last(1).values()[0].video_url];
            },
            choices: ["Happy", "Sad", "Angry", "Surprised"],
            prompt: "<p>What emotion is this?</p>",
        }
        ```

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-html-video-response-demo3.html" width="90%;" height="600px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-html-video-response-demo3.html">Open demo in new tab</a>


