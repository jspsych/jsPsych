# html-audio-response

Current version: 1.0.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-html-audio-response/CHANGELOG.md).

This plugin displays HTML content and records audio from the participant via a microphone. 

In order to get access to the microphone, you need to use the [initialize-microphone plugin](initialize-microphone.md) on your timeline prior to using this plugin.
Once access is granted for an experiment you do not need to get permission again.

This plugin records audio data in [base 64 format](https://developer.mozilla.org/en-US/docs/Glossary/Base64). 
This is a text-based representation of the audio which can be coverted to various audio formats using a variety of [online tools](https://www.google.com/search?q=base64+audio+decoder) as well as in languages like python and R.

**This plugin will generate a large amount of data, and you will need to be careful about how you handle this data.** 
Even a few seconds of audio recording will add 10s of kB to jsPsych's data. 
Multiply this by a handful (or more) of trials, and the data objects will quickly get large.
If you need to record a lot of audio, either many trials worth or just a few trials with longer responses, we recommend that you save the data to your server immediately after the trial and delete the data in jsPsych's data object.
See below for an example of how to do this.

This plugin also provides the option to store the recorded audio files as [Object URLs](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) via `save_audio_url: true`. 
This will generate a URL that is storing a copy of the recorded audio, which can be used for subsequent playback. 
See below for an example where the recorded audio is used as the stimulus in a subsequent trial.
This feature is turned off by default because it uses a relatively large amount of memory compared to most jsPsych features.
If you are running an experiment where you need this feature and you are recording lots of audio snippets, you may want to manually revoke the URLs when you no longer need them using [`URL.revokeObjectURL(objectURL)`](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL).

!!! warning
    When recording from a microphone your experiment will need to be running over `https://` protocol. If you try to run the experiment locally using the `file://` protocol or over `http://` protocol you will not be able to access the microphone because of [potential security problems](https://blog.mozilla.org/webrtc/camera-microphone-require-https-in-firefox-68/).

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | HTML string | undefined | The HTML content to be displayed.
recording_duration | numeric | 2000 | The maximum length of the recording, in milliseconds. The default value is intentionally set low because of the potential to accidentally record very large data files if left too high. You can set this to `null` to allow the participant to control the length of the recording via the done button, but be careful with this option as it can lead to crashing the browser if the participant waits too long to stop the recording. 
stimulus_duration | numeric | null | How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends.
show_done_button | bool | true | Whether to show a button on the screen that the participant can click to finish the recording.
done_button_label | string | 'Continue' | The label for the done button.
allow_playback | bool | false | Whether to allow the participant to listen to their recording and decide whether to rerecord or not. If `true`, then the participant will be shown an interface to play their recorded audio and click one of two buttons to either accept the recording or rerecord. If rerecord is selected, then stimulus will be shown again, as if the trial is starting again from the beginning.
record_again_button_label | string | 'Record again' | The label for the record again button enabled when `allow_playback: true`.
accept_button_label | string | 'Continue' | The label for the accept button enabled when `allow_playback: true`.
save_audio_url | bool | false | If `true`, then an [Object URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) will be generated and stored for the recorded audio. Only set this to `true` if you plan to reuse the recorded audio later in the experiment, as it is a potentially memory-intensive feature.


## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
rt | numeric | The time, since the onset of the stimulus, for the participant to click the done button. If the button is not clicked (or not enabled), then `rt` will be `null`.
response | base64 string | The base64-encoded audio data.
stimulus | string | The HTML content that was displayed on the screen.
estimated_stimulus_onset | number | This is an estimate of when the stimulus appeared relative to the start of the audio recording. The plugin is configured so that the recording should start prior to the display of the stimulus. We have not yet been able to verify the accuracy of this estimate with external measurement devices.
audio_url | string | A URL to a copy of the audio data.

## Simulation Mode

This plugin does not yet support [simulation mode](../overview/simulation.md).

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-html-audio-response@1.0.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-html-audio-response.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-html-audio-response
```
```js
import htmlAudioResponse from '@jspsych/plugin-html-audio-response';
```

## Examples

???+ example "Simple spoken response to a stimulus"
    === "Code"
        ```javascript
        var trial = {
            type: jsPsychHtmlAudioResponse,
            stimulus: `
            <p style="font-size:48px; color:red;">GREEN</p>
            <p>Speak the color of the ink.</p>`,
            recording_duration: 3500
        };
        ```

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-html-audio-response-demo1.html" width="90%;" height="600px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-html-audio-response-demo1.html">Open demo in new tab</a>

???+ example "Allow playback and rerecording; save data to server immediately"
    === "Code"
        ```javascript
        var trial = {
            type: jsPsychHtmlAudioResponse,
            stimulus: `
                <p>Please sing the first few seconds of a song and click the button when you are done.</p>
            `,
            recording_duration: 15000,
            allow_playback: true,
            on_finish: function(data){
                fetch('/save-my-data.php', { audio_base64: data.response })
                    .then((audio_id){
                        data.response = audio_id;
                    });
            }
        };
        ```

        This example assumes that there is a script on your experiment server that accepts the data called `save-my-data.php`. It also assumes that the script will generate a response with an ID for the stored audio file (`audio_id`). In the example, we replace the very long base64 representation of the audio file with the generated ID, which could be just a handful of characters. This would let you link files to responses in data analysis, without having to store long audio files in memory during the experiment.

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-html-audio-response-demo2.html" width="90%;" height="600px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-html-audio-response-demo2.html">Open demo in new tab</a>

???+ example "Use recorded audio as a subsequent stimulus"
    === "Code"
        ```javascript
        var instruction = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
                <img src='img/10.gif' style="width:100px; padding: 20px;"></img>
                <p>Make up a name for this shape. When you have one in mind, click the button and then say the name aloud.</p>
            `,
            choices: ['I am ready.']
        }

        var record = {
            type: jsPsychHtmlAudioResponse,
            stimulus: `
                <img src='img/10.gif' style="width:100px; padding: 20px;"></img>
                <p>Recording...</p>
            `,
            recording_duration: 1500,
            save_audio_url: true
        };

        var playback = {
            type: jsPsychAudioButtonResponse,
            stimulus: ()=>{
                return jsPsych.data.get().last(1).values()[0].audio_url;
            },
            prompt: '<p>Click the object the matches the spoken name.</p>',
            choices: ['img/9.gif','img/10.gif','img/11.gif','img/12.gif'],
            button_html: '<img src="%choice%" style="width:100px; padding: 20px;"></img>'
        }
        ```

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-html-audio-response-demo3.html" width="90%;" height="600px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-html-audio-response-demo3.html">Open demo in new tab</a>


