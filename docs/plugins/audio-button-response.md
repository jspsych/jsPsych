# audio-button-response

{{ plugin_meta('audio-button-response') }}
{{ plugin_description('audio-button-response') }}
{{ plugin_parameters('audio-button-response') }}

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

{{ plugin_installation('audio-button-response') }}

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
		var trial = {
			type: jsPsychAudioButtonResponse,
			stimulus: 'sound/roar.mp3',
			choices: ['lion.png', 'elephant.png', 'monkey.png'],
			prompt: "<p>Which animal made the sound?</p>",
			button_html: '<img src="%choice%" />'
		};
		```

	=== "Demo"
		<div style="text-align:center;">
			<iframe src="../../demos/jspsych-audio-button-response-demo-2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
		</div>

	<a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-audio-button-response-demo-2.html">Open demo in new tab</a>

	**Note**: if you want the images to look more like jsPsych buttons, i.e. with borders and different styles for hover/active/disabled states, then you can also embed the image element inside the default `button_html` string:
	```js
	button_html: '<button class="jspsych-btn"><img src="%choice%" /></button>'
	```