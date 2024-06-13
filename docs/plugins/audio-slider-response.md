# audio-slider-response

Current version: 1.1.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-audio-slider-response/CHANGELOG.md).

This plugin plays an audio file and allows the participant to respond by dragging a slider.

If the browser supports it, audio files are played using the WebAudio API. This allows for reasonably precise timing of the playback. The timing of responses generated is measured against the WebAudio specific clock, improving the measurement of response times. If the browser does not support the WebAudio API, then the audio file is played with HTML5 audio. 

Audio files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md). However, if you are using timeline variables or another dynamic method to specify the audio stimulus, then you will need to [manually preload](../overview/media-preloading.md#manual-preloading) the audio.

The trial can end when the participant responds, or if the participant has failed to respond within a fixed length of time. You can also prevent the slider response from being made before the audio has finished playing.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter                      | Type             | Default Value | Description                              |
| ------------------------------ | ---------------- | ------------- | ---------------------------------------- |
| stimulus                       | audio file       | *undefined*   | Audio file to be played                  |
| labels                         | array of strings | []            | Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the other two will be at 33% and 67% of the slider width. |
| button_label                   | string           | 'Continue'    | Label of the button to end the trial.    |
| min                            | integer          | 0             | Sets the minimum value of the slider     |
| max                            | integer          | 100           | Sets the maximum value of the slider     |
| slider_start                   | integer          | 50            | Sets the starting value of the slider    |
| step                           | integer          | 1             | Sets the step of the slider. This is the smallest amount by which the slider can change. |
| slider_width                   | integer          | null          | Set the width of the slider in pixels. If left null, then the width will be equal to the widest element in the display. |
| require_movement               | boolean          | false         | If true, the participant must move the slider before clicking the continue button. |
| prompt                         | string           | null          | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). |
| trial_duration                 | numeric          | null          | How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely. |
| response_ends_trial            | boolean          | true          | If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to listen to the stimulus for a fixed amount of time, even if they respond before the time is complete. |
| response_allowed_while_playing | boolean          | true          | If true, then responses are allowed while the audio is playing. If false, then the audio must finish playing before the slider is enabled and the trial can end via the next button click. Once the audio has played all the way through, the slider is enabled and a response is allowed (including while the audio is being re-played via on-screen playback controls). |

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name         | Type    | Value                                    |
| ------------ | ------- | ---------------------------------------- |
| response     | numeric | The numeric value of the slider.         |
| rt           | numeric | The time in milliseconds for the participant to make a response. The time is measured from when the stimulus first began playing until the participant's response. |
| stimulus     | string  | The path of the audio file that was played. |
| slider_start | numeric | The starting value of the slider.        |

## Simulation Mode

In `data-only` simulation mode, the `response_allowed_while_playing` parameter does not currently influence the simulated response time. 
This is because the audio file is not loaded in `data-only` mode and therefore the length is unknown. 
This may change in a future version as we improve the simulation modes.

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-audio-slider-response@1.1.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-audio-slider-response.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-audio-slider-response
```
```js
import audioSliderResponse from '@jspsych/plugin-audio-slider-response';
```

## Examples

???+ example "A simple rating scale"
	=== "Code"
		```javascript
		var trial = {
			type: jsPsychAudioSliderResponse,
			stimulus: 'sound/speech_joke.mp3',
			labels: ['Not Funny', 'Funny'],
			prompt: '<p>How funny is the joke?</p>'
		}
		```

	=== "Demo"
		<div style="text-align:center;">
			<iframe src="../../demos/jspsych-audio-slider-response-demo-1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
		</div>

	<a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-audio-slider-response-demo-1.html">Open demo in new tab</a>

???+ example "No response allowed until audio finishes; participant must interact with slider to continue"
	=== "Code"
		```javascript
		var trial = {
			type: jsPsychAudioSliderResponse,
			stimulus: 'sound/speech_joke.mp3',
			labels: ['Not Funny', 'Funny'],
			prompt: '<p>How funny is the joke?</p>',
			response_allowed_while_playing: false,
			require_movement: true
		}
		```

	=== "Demo"
		<div style="text-align:center;">
			<iframe src="../../demos/jspsych-audio-slider-response-demo-2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
		</div>

	<a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-audio-slider-response-demo-2.html">Open demo in new tab</a>