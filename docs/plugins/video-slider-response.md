# video-slider-response

Current version: 1.1.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-video-slider-response/CHANGELOG.md).

This plugin plays a video and allows the participant to respond by dragging a slider. The stimulus can be displayed until a response is given, or for a pre-determined amount of time. The trial can be ended automatically when the participant responds, when the video file has finished playing, or if the participant has failed to respond within a fixed length of time. You can also prevent the slider response from being made before the video has finished playing.

Video files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md). However, if you are using timeline variables or another dynamic method to specify the video stimulus, you will need to [manually preload](../overview/media-preloading.md#manual-preloading) the videos. Also note that video preloading is disabled when the experiment is running as a file (i.e. opened directly in the browser, rather than through a server), in order to prevent CORS errors - see the section on [Running Experiments](../overview/running-experiments.md) for more information.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | array | *undefined* | An array of file paths to the video. You can specify multiple formats of the same video (e.g., .mp4, .ogg, .webm) to maximize the [cross-browser compatibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats). Usually .mp4 is a safe cross-browser option. The plugin does not reliably support .mov files. The player will use the first source file in the array that is compatible with the browser, so specify the files in order of preference.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).
width | numeric | width of the video file | The width of the video display in pixels.
height | numeric | heigh of the video file | The height of the video display in pixels.
autoplay | boolean | true | If true, the video will begin playing as soon as it has loaded.
controls | boolean | false | If true, controls for the video player will be available to the participant. They will be able to pause the video or move the playback to any point in the video.
start | numeric | null | If given a value, the video will start at this time point in seconds.
stop| numeric | null | If given a value, the video will stop at this time point in seconds.
rate | numeric | null | The playback rate of the video. 1 is normal, <1 is slower, >1 is faster.
min | integer | 0 | Sets the minimum value of the slider.
max | integer | 100 | Sets the maximum value of the slider.
slider_start | integer | 50 | Sets the starting value of the slider
step | integer | 1 | Sets the step of the slider. This is the smallest amount by which the slider can change.
labels | array of strings | [] | Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the other two will be at 33% and 67% of the slider width.
slider_width | integer | null | Set the width of the slider in pixels. If left null, then the width will be equal to the widest element in the display.
require_movement | boolean | false | If true, the participant must move the slider before clicking the continue button.
button_label | string | 'Continue' | Label of the button to end the trial.
trial_ends_after_video | bool | false | If true, then the trial will end as soon as the video file finishes playing.
trial_duration | numeric | null | How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely.
response_ends_trial | boolean | true | If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete.
response_allowed_while_playing | boolean | true | If true, then responses are allowed while the video is playing. If false, then the video must finish playing before the slider is enabled and the trial can end via the next button click. Once the video has played all the way through, the slider is enabled and a response is allowed (including while the video is being re-played via on-screen playback controls). 


## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
response | numeric | The numeric value of the slider.
rt | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response.
stimulus | array | The `stimulus` array. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. 
slider_start | numeric | The starting value of the slider. 
start | numeric | The start time of the video clip.

## Simulation Mode

In `data-only` simulation mode, the `response_allowed_while_playing` parameter does not currently influence the simulated response time. 
This is because the audio file is not loaded in `data-only` mode and therefore the length is unknown. 
This may change in a future version as we improve the simulation modes.

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-video-slider-response@1.1.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-video-slider-response.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-video-slider-response
```
```js
import videoSliderResponse from '@jspsych/plugin-video-slider-response';
```

## Example

???+ example "Rate enjoyment of a video clip"
    === "Code"
    
        ```javascript
        var trial = {
          type: jsPsychVideoSliderResponse,
          stimulus: [
            'video/fish.mp4'
          ],
          labels: ["Hated it", "Loved it"],
          prompt: '<p>Please rate your enjoyment of the video clip.</p>'
        };
        ```

        *[Stock Footage](https://www.pond5.com/stock-footage/item/721819-school-yellowtail-snappers) provided by rjt98, from [Pond5](https://www.pond5.com/)*
    
    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-video-slider-response-demo1.html" width="90%;" height="600px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-video-slider-response-demo1.html">Open demo in new tab</a>

