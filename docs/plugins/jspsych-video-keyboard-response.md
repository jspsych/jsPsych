# jspsych-video-keyboard-response plugin

This plugin plays a video file and records a keyboard response. The stimulus can be displayed until a response is given, or for a pre-determined amount of time. The trial can be ended automatically when the subject responds, when the video file has finished playing, or if the subject has failed to respond within a fixed length of time. You can also prevent a keyboard response from being recorded before the video has finished playing.

Video files can be automatically preloaded by jsPsych using the [`preload` plugin](jspsych-preload.md). However, if you are using timeline variables or another dynamic method to specify the video stimulus, you will need to [manually preload](/overview/media-preloading/#manual-preloading) the videos. Also note that video preloading is disabled when the experiment is running as a file (i.e. opened directly in the browser, rather than through a server), in order to prevent CORS errors - see the section on [Running Experiments](/overview/running-experiments.md) for more information.

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter                      | Type             | Default Value           | Description                              |
| ------------------------------ | ---------------- | ----------------------- | ---------------------------------------- |
| stimulus                       | array            | *undefined*             | An array of file paths to the video. You can specify multiple formats of the same video (e.g., .mp4, .ogg, .webm) to maximize the [cross-browser compatibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats). Usually .mp4 is a safe cross-browser option. The plugin does not reliably support .mov files. The player will use the first source file in the array that is compatible with the browser, so specify the files in order of preference. |
| prompt                         | string           | null                    | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which key to press). |
| width                          | numeric          | width of the video file | The width of the video display in pixels. |
| height                         | numeric          | heigh of the video file | The height of the video display in pixels. |
| autoplay                       | boolean          | true                    | If true, the video will begin playing as soon as it has loaded. |
| controls                       | boolean          | false                   | If true, controls for the video player will be available to the subject. They will be able to pause the video or move the playback to any point in the video. |
| start                          | numeric          | null                    | If given a value, the video will start at this time point in seconds. |
| stop                           | numeric          | null                    | If given a value, the video will stop at this time point in seconds. |
| rate                           | numeric          | null                    | The playback rate of the video. 1 is normal, <1 is slower, >1 is faster. |
| choices                        | array of strings | `jsPsych.ALL_KEYS`      | This array contains the key(s) that the subject is allowed to press in order to respond to the stimulus. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/) for more examples. Any key presses that are not listed in the array will be ignored. The default value of `jsPsych.ALL_KEYS` means that all keys will be accepted as valid responses. Specifying `jsPsych.NO_KEYS` will mean that no responses are allowed. |
| trial_ends_after_video         | bool             | false                   | If true, then the trial will end as soon as the video file finishes playing. |
| trial_duration                 | numeric          | null                    | How long to wait for the subject to make a response before ending the trial in milliseconds. If the subject fails to make a response before this timer is reached, the subject's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely. |
| response_ends_trial            | boolean          | true                    | If true, then the trial will end whenever the subject makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force the subject to view a stimulus for a fixed amount of time, even if they respond before the time is complete. |
| response_allowed_while_playing | boolean          | true                    | If true, then responses are allowed while the video is playing. If false, then the video must finish playing before a keyboard response is accepted. Once the video has played all the way through, a valid keyboard response is allowed (including while the video is being re-played via on-screen playback controls). |

## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| response  | string | Indicates which key the subject pressed. |
| rt        | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response. |
stimulus | array | The `stimulus` array. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |

## Example

```javascript
var trial = {
	type: 'video-keyboard-response',
	stimulus: [
		'video/sample_video.mp4',
		'video/sample_video.ogg'
	],
	choices: ['y','n'],
	width: 640
}
```
