# html-keyboard-response

{{ plugin_meta('html-keyboard-response') }}
{{ plugin_description('html-keyboard-response') }}
{{ plugin_parameters('html-keyboard-response') }}

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| response  | string  | Indicates which key the participant pressed. |
| rt        | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. |
| stimulus  | string  | The HTML content that was displayed on the screen. |

{{ plugin_installation('html-keyboard-response') }}

## Examples

???+ example "Displaying trial until participant gives a response"
    === "Code"
        ```javascript
        var trial = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '<p style="font-size:48px; color:green;">BLUE</p>',
            choices: ['r', 'g', 'b'],
            prompt: "<p>Is the ink color (r)ed, (g)reen, or (b)lue?</p>"
        };
        ```
        
    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-html-keyboard-response-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-html-keyboard-response-demo1.html">Open demo in new tab</a>

???+ example "Showing a 1 second fixation cross; no response allowed"
    === "Code"
        ```javascript
        var trial = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '<p style="font-size: 48px;">+</p>',
            choices: "NO_KEYS",
            trial_duration: 1000,
        };		
        ```
	=== "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-html-keyboard-response-demo2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-html-keyboard-response-demo2.html">Open demo in new tab</a>
