# fullscreen

Current version: 1.2.1. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-fullscreen/CHANGELOG.md).

The fullscreen plugin allows the experiment to enter or exit fullscreen mode. For security reasons, all browsers require that entry into fullscreen mode is triggered by a user action. To enter fullscreen mode, this plugin has the user click a button. Exiting fullscreen mode can be done without user input.

!!! warning
    Safari does not support keyboard input when the browser is in fullscreen mode. Therefore, the function will not launch fullscreen mode on Safari. The experiment will ignore any trials using the fullscreen plugin in Safari.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
fullscreen_mode | boolean | `true` | A value of `true` causes the experiment to enter fullscreen mode. A value of `false` causes the browser to exit fullscreen mode.
message | string | `<p>The experiment will switch to full screen mode when you press the button below</p>` | The HTML content to display above the button to enter fullscreen mode.
button_label | string |  'Continue' | The text that appears on the button to enter fullscreen mode.
delay_after | numeric | 1000 | The length of time to delay after entering fullscreen mode before ending the trial. This can be useful because entering fullscreen is jarring and most browsers display some kind of message that the browser has entered fullscreen mode.

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
success | boolean | true if the browser supports fullscreen mode (i.e., is not Safari)
rt | number | Response time to click the button that launches fullscreen mode

## Simulation Mode

Web browsers do not allow fullscreen mode to be triggered by a script to avoid malicious usage of fullscreen behavior when the user is not wanting it.
In `visual` simulation mode, the trial will run normally and the button will get a simulated click, but the display will not change. 
If you want the display to actually enter fullscreen mode during the simulation, you should disable simulation for the fullscreen trial and manually click the button.

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-fullscreen@1.2.1"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-fullscreen.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-fullscreen
```
```js
import fullscreen from '@jspsych/plugin-fullscreen';
```

## Examples


???+ example "Entering and exiting fullscreen"
    === "Code"
        ```javascript
        var enter_fullscreen = {
          type: jsPsychFullscreen,
          fullscreen_mode: true
        }

        var trial_in_fullscreen = {
          type: jsPsychHtmlButtonResponse,
          stimulus: 'This trial will be in fullscreen mode.',
          choices: ['Continue']
        }

        var exit_fullscreen = {
          type: jsPsychFullscreen,
          fullscreen_mode: false,
          delay_after: 0
        }

        var trial_after_fullscreen = {
          type: jsPsychHtmlButtonResponse,
          stimulus: 'This trial will NOT be in fullscreen mode.',
          choices: ['Continue']
        }
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-fullscreen-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-fullscreen-demo1.html">Open demo in new tab</a>
