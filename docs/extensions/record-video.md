# record-video

This extension records video from the participant's webcam during a trial. 

This extension encodes the video data in [base 64 format](https://developer.mozilla.org/en-US/docs/Glossary/Base64). 
This is a text-based representation of the video which can be coverted to various video formats using a variety of [online tools](https://www.google.com/search?q=base64+video+decoder) as well as in languages like python and R.

## Parameters

### Initialization Parameters

Initialization parameters can be set when calling `initJsPsych()`

```js
initJsPsych({
  extensions: [
    {type: jsPsychExtensionRecordVideo, params: {...}}
  ]
})
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*None*

### Trial Parameters

Trial parameters can be set when adding the extension to a trial object.

```js
var trial = {
  type: jsPsych...,
  extensions: [
    {type: jsPsychExtensionRecordVideo, params: {...}}
  ]
}
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*None*

## Data Generated

Name | Type | Value
-----|------|------
record_video_data | base64 string | [Base 64 encoded](https://developer.mozilla.org/en-US/docs/Glossary/Base64) representation of the video data.

## Examples

???+ example "Record video data during a trial"
    === "Code"
        ```javascript
        const init_camera = {
          type: jsPsychInitializeCamera
        };

        const trial = {
          type: jsPsychHtmlButtonResponse,
          stimulus: `<div id="target" style="width:250px; height: 250px; background-color: #333; position: relative; margin: 2em auto;">
              <div class="orbit" style="width:25px; height:25px; border-radius:25px;background-color: #f00; position: absolute; top:calc(50% - 12px); left:calc(50% - 12px);"></div>
            </div>
            <style>
              .orbit {
                transform: translateX(100px);
                animation: orbit 4s infinite;
              }
              @keyframes orbit {
                0% {
                  transform: rotate(0deg) translateX(100px);
                }
                100% {
                  transform: rotate(360deg) translateX(100px);
                }
              }
            </style>`,
          choices: ['Done'],
          prompt: "<p>Video is recording. Click done after a few seconds.</p>",
          extensions: [
            {type: jsPsychExtensionRecordVideo}
          ]
        };
        ```
        
    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-extension-record-video-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-extension-record-video-demo1.html">Open demo in new tab</a>