# browser-check

This plugin measures and records various features of the participant's browser and can end the experiment if defined inclusion criteria are not met.

The plugin currently can record the following features:

* The width and height of the browser window.
* Support for the WebAudio API.
* The type of browser used (e.g., Chrome, Firefox, Edge, etc.) and the version number of the browser.*
* Whether the participant is using a mobile device.*
* The operating system.*
* Whether the browser supports fullscreen displays, e.g., through the [fullscreen plugin](../plugins/fullscreen.md).
* The frame rate.

_*These features are recording through parsing the [user agent string](https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent). This method is accurate most of the time, but is not guaranteed to be correct._

The plugin begins by measuring the set of features requested. An inclusion function is evaluated to see if the paricipant passes the inclusion criteria. If they do, then the trial ends and the experiment continues. If they do not, then the experiment ends immediately. If a minimum width and/or minimum height is desired, the plugin will optionally display a message to participants whose browser windows are too small to give them an opportunity to make the window larger if possible. See the examples below for more guidance.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter                      | Type             | Default Value | Description                              |
| ------------------------------ | ---------------- | ------------- | ---------------------------------------- |
| 

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name         | Type    | Value                                    |
| ------------ | ------- | ---------------------------------------- |
| response     | numeric | The numeric value of the slider.         |
| rt           | numeric | The time in milliseconds for the subject to make a response. The time is measured from when the stimulus first began playing until the subject's response. |
| stimulus     | string  | The path of the audio file that was played. |
| slider_start | numeric | The starting value of the slider.        |

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

???+ example "No response allowed until audio finishes; subject must interact with slider to continue"
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