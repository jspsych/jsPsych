# Fullscreen Experiments

You can run your experiment in fullscreen mode by using the jspsych-fullscreen plugin.

```javascript
var jsPsych = initJsPsych();

var timeline = [];

timeline.push({
  type: jsPsychFullscreen,
  fullscreen_mode: true
});

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'This trial will be in fullscreen mode.'
});

// exit fullscreen mode
timeline.push({
  type: jsPsychFullscreen,
  fullscreen_mode: false
});

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'This trial will NOT be in fullscreen mode.'
});

jsPsych.run(timeline);
```

For security reasons, web browsers require that users initiate an action to launch fullscreen mode. The fullscreen plugin displays a button that the user must click to change the display to fullscreen.

Safari does not support keyboard input when the browser is in fullscreen mode. Therefore, the function will not launch fullscreen mode on Safari. The experiment will ignore any trials using the fullscreen plugin in Safari.
