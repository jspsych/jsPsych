# audio-button-response

Current version: 2.0.1. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-audio-button-response/CHANGELOG.md).

This plugin plays audio files and records responses generated with a button click.

If the browser supports it, audio files are played using the WebAudio API. This allows for reasonably precise timing of the playback. The timing of responses generated is measured against the WebAudio specific clock, improving the measurement of response times. If the browser does not support the WebAudio API, then the audio file is played with HTML5 audio. 

Audio files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md). However, if you are using timeline variables or another dynamic method to specify the audio stimulus, you will need to [manually preload](../overview/media-preloading.md#manual-preloading) the audio.

The trial can end when the participant responds, when the audio file has finished playing, or if the participant has failed to respond within a fixed length of time. You can also prevent a button response from being made before the audio has finished playing.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter                      | Type             | Default Value                            | Description                              |
| ------------------------------ | ---------------- | ---------------------------------------- | ---------------------------------------- |
| stimulus                       | audio file       | *undefined*                              | Path to audio file to be played.         |
| choices                        | array of strings | *undefined*                              | Labels for the buttons. Each different string in the array will generate a different button. |
| button_html | function | ``(choice: string, choice_index: number)=>`<button class="jspsych-btn">${choice}</button>``; | A function that generates the HTML for each button in the `choices` array. The function gets the string and index of the item in the `choices` array and should return valid HTML. If you want to use different markup for each button, you can do that by using a conditional on either parameter. The default parameter returns a button element with the text label of the choice. |
| prompt                         | string           | null                                     | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). |
| trial_duration                 | numeric          | null                                     | How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, the trial will wait for a response indefinitely. |
| button_layout | string | 'grid' | Setting to `'grid'` will make the container element have the CSS property `display: grid` and enable the use of `grid_rows` and `grid_columns`. Setting to `'flex'` will make the container element have the CSS property `display: flex`. You can customize how the buttons are laid out by adding inline CSS in the `button_html` parameter. |
| grid_rows | number | 1 | The number of rows in the button grid. Only applicable when `button_layout` is set to `'grid'`. If null, the number of rows will be determined automatically based on the number of buttons and the number of columns. |
| grid_columns | number | null | The number of columns in the button grid. Only applicable when `button_layout` is set to `'grid'`. If null, the number of columns will be determined automatically based on the number of buttons and the number of rows. |
| response_ends_trial            | boolean          | true                                     | If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to listen to the stimulus for a fixed amount of time, even if they respond before the time is complete. |
| trial_ends_after_audio         | boolean          | false                                    | If true, then the trial will end as soon as the audio file finishes playing. |
| response_allowed_while_playing | boolean          | true                                     | If true, then responses are allowed while the audio is playing. If false, then the audio must finish playing before the button choices are enabled and a response is accepted. Once the audio has played all the way through, the buttons are enabled and a response is allowed (including while the audio is being re-played via on-screen playback controls). |
| enable_button_after            | numeric          | 0                                              | How long the button will delay enabling in milliseconds. If `response_allowed_while_playing` is `true`, the timer will start immediately. If it is `false`, the timer will start at the end of the audio. |

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name           | Type    | Value                                    |
| -------------- | ------- | ---------------------------------------- |
| rt             | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first began playing until the participant's response. |
| response       | numeric | Indicates which button the participant pressed. The first button in the `choices` array is 0, the second is 1, and so on. |

## Simulation Mode

In `data-only` simulation mode, the `response_allowed_while_playing` parameter does not currently influence the simulated response time. 
This is because the audio file is not loaded in `data-only` mode and therefore the length is unknown. 
This may change in a future version as we improve the simulation modes.

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-audio-button-response@2.0.1"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-audio-button-response.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-audio-button-response
```
```js
import audioButtonResponse from '@jspsych/plugin-audio-button-response';
```

## Examples

???+ example "Displaying question until participant gives a response"
	=== "Code"
		```javascript
		var trial = {
			type: jsPsychAudioButtonResponse,
			stimulus: 'sound/tone.mp3',
			choices: ['Low', 'High'],
			prompt: "<p>Is the pitch high or low?</p>"
		};
		```

	=== "Demo"
		<div style="text-align:center;">
			<iframe src="../../demos/jspsych-audio-button-response-demo-1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
		</div>

	<a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-audio-button-response-demo-1.html">Open demo in new tab</a>

???+ example "Using custom button HTML to use images as buttons"
	=== "Code"
		```javascript
		const trial = {
    	type: jsPsychAudioButtonResponse,
    	stimulus: 'sound/roar.mp3',
    	choices: images,
    	prompt: "<p>Which animal made the sound?</p>",
    	button_html: (choice)=>`<img style="cursor: pointer; margin: 10px;" src="${choice}" />`
    };
		```

	=== "Demo"
		<div style="text-align:center;">
			<iframe src="../../demos/jspsych-audio-button-response-demo-2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
		</div>

	<a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-audio-button-response-demo-2.html">Open demo in new tab</a>

???+ example "Setting up a grid-based layout"
	=== "Code"
		```javascript
		const trial = {
    	type: jsPsychAudioButtonResponse,
      stimulus: 'sound/telephone.mp3',
      prompt: '<p>Which key was pressed first?</p>',
      choices: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'],
      button_layout: 'grid',
      grid_rows: 4,
      grid_columns: 3
    }
		```

	=== "Demo"
		<div style="text-align:center;">
			<iframe src="../../demos/jspsych-audio-button-response-demo-3.html" width="90%;" height="500px;" frameBorder="0"></iframe>
		</div>

	<a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-audio-button-response-demo-3.html">Open demo in new tab</a>