# jspsych-fullscreen plugin

The fullscreen plugin allows the experiment to enter or exit fullscreen mode. For security reasons, all browsers require that entry into fullscreen mode is triggered by a user action. To enter fullscreen mode, this plugin has the user click a button. Exiting fullscreen mode can be done without user input.

Safari does not support keyboard input when the browser is in fullscreen mode. Therefore, the function will not launch fullscreen mode on Safari. The experiment will ignore any trials using the fullscreen plugin in Safari.

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
fullscreen_mode | boolean | `true` | A value of `true` causes the experiment to enter fullscreen mode. A value of `false` causes the browser to exit fullscreen mode.
message | string | `<p>The experiment will switch to full screen mode when you press the button below</p>` | The HTML content to display above the button to enter fullscreen mode.
button_label | string |  'Continue' | The text that appears on the button to enter fullscreen mode.
delay_after | numeric | 1000 | The length of time to delay after entering fullscreen mode before ending the trial. This can be useful because entering fullscreen is jarring and most browsers display some kind of message that the browser has entered fullscreen mode.

## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
success | boolean | true if the browser supports fullscreen mode (i.e., is not Safari)

## Examples

#### Entering and exiting fullscreen

```javascript
var timeline = [];

timeline.push({
  type: 'fullscreen',
  fullscreen_mode: true
});

timeline.push({
  type: 'html-keyboard-response',
  stimulus: 'This trial will be in fullscreen mode.'
});

// exit fullscreen mode
timeline.push({
  type: 'fullscreen',
  fullscreen_mode: false
});

timeline.push({
  type: 'html-keyboard-response',
  stimulus: 'This trial will NOT be in fullscreen mode.'
});

jsPsych.init({
  timeline: timeline
});
```
