# Fullscreen Experiments

You can run your experiment in fullscreen mode by using the jspsych-fullscreen plugin.

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

For security reasons, web browsers require that users initiate an action to launch fullscreen mode. The fullscreen plugin displays a button that the user must click to change the display to fullscreen.

Safari does not support keyboard input when the browser is in fullscreen mode. Therefore, the function will not launch fullscreen mode on Safari. The experiment will ignore any trials using the fullscreen plugin in Safari.
