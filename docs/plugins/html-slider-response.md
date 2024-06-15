# html-slider-response

Current version: 1.1.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-html-slider-response/CHANGELOG.md).

This plugin displays HTML content and allows the participant to respond by dragging a slider.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | HTML string | *undefined* | The string to be displayed
labels | array of strings | [] | Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the other two will be at 33% and 67% of the slider width.
button_label | string | 'Continue' | Label of the button to end the trial.
min | integer | 0 | Sets the minimum value of the slider.
max | integer | 100 | Sets the maximum value of the slider.
slider_start | integer | 50 | Sets the starting value of the slider
step | integer | 1 | Sets the step of the slider. This is the smallest amount by which the slider can change.
slider_width | integer | null | Set the width of the slider in pixels. If left null, then the width will be equal to the widest element in the display.
require_movement | boolean | false | If true, the participant must move the slider before clicking the continue button.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).
stimulus_duration | numeric | null | How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends.
trial_duration | numeric | null | How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely.
response_ends_trial | boolean | true | If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete.

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
response | numeric | The numeric value of the slider.
rt | numeric | The time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response.
stimulus | string | The HTML content that was displayed on the screen.
slider_start | numeric | The starting value of the slider.

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-html-slider-response@1.1.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-html-slider-response.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-html-slider-response
```
```js
import htmlSliderResponse from '@jspsych/plugin-html-slider-response';
```

## Examples

???+ example "Displaying question until participant moves the slider"
    === "Code"

        ```javascript
        var trial = {
            type: jsPsychHtmlSliderResponse,
            stimulus: `<div style="width:500px;">
                <p>How likely is it that team A will win this match?</p>
                <div style="width:240px; float: left;">
                    <p>TEAM A</p>
                    <p>10 wins, 5 losses, 6 draws</p>
                </div>
                <div style="width:240px; float: right;">
                    <p>TEAM B</p>
                    <p>6 wins, 4 losses, 11 draws</p>
                </div>
                </div>`,
            require_movement: true,
            labels: ['100% chance', '50% chance', '0% chance']
        };
        ```

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-html-slider-response-demo1.html" width="90%;" height="600px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-html-slider-response-demo1.html">Open demo in new tab</a>
