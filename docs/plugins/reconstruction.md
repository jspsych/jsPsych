# reconstruction

Current version: 1.1.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-reconstruction/CHANGELOG.md).

This plugin allows a participant to interact with a stimulus by modifying a parameter of the stimulus and observing the change in the stimulus in real-time.

The stimulus must be defined through a function that returns an HTML-formatted string. The function should take a single value, which is the parameter that can be modified by the participant. The value can only range from 0 to 1. See the example at the bottom of the page for a sample function.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stim_function | function | *undefined* | A function with a single parameter that returns an HTML-formatted string representing the stimulus.
starting_value | numeric | 0.5 | The starting value of the stimulus parameter.
step_size | numeric | 0.05 | The change in the stimulus parameter caused by pressing one of the modification keys.
key_increase | string | 'h' | The key to press for increasing the parameter value.
key_decrease | string | 'g' | The key to press for decreasing the parameter value.
button_label | string | 'Continue' | The text that appears on the button to finish the trial.

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
start_value | numeric | The starting value of the stimulus parameter.
final_value | numeric | The final value of the stimulus parameter.
rt | numeric | The length of time, in milliseconds, that the trial lasted.

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-reconstruction@1.1.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-reconstruction.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-reconstruction
```
```js
import reconstruction from '@jspsych/plugin-reconstruction';
```

## Examples

???+ example "Make a block larger and smaller"
    === "Code"

        ```javascript
        var sample_function = function(param){
            var size = 50 + Math.floor(param*250);
            var html = '<div style="display: block; margin: auto; height: 300px; width: 300px; position: relative;">'+
            '<div style="display: block; position: absolute; top: '+(150 - size/2)+'px; left:'+(150 - size/2)+'px; background-color: #000000; '+
            'width: '+size+'px; height: '+size+'px;"></div></div><p>Press "h" to make the square larger. Press "g" to make the square smaller.</p>'+
            '<p>When the square is the same size as the previous one, click Continue.</p>';
            return html;
        }

        var match_item = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '<div style="display: block; margin: auto; height: 300px; width: 300px; position: relative;">'+
            '<div style="display: block; position: absolute; top: '+(150 - 210/2)+'px; left:'+(150 - 210/2)+'px; background-color: #000000; '+
            'width: 210px; height: 210px;"></div></div>',
            choices: ['c'],
            post_trial_gap: 1250,
            prompt: '<p>Study the size of this square carefully. On the next screen you will have to recreate it. When you are ready, press "c".</p>'
        }

        var reconstruction = {
            type: jsPsychReconstruction,
            stim_function: sample_function,
            starting_value: 0.5,
        }
        ```

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-reconstruction-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-reconstruction-demo1.html">Open demo in new tab</a>
