# Fullscreen Experiments

You can run your experiment in fullscreen mode by setting the `fullscreen` parameter in the `jsPsych.init` call that launches the experiment.

```javascript
jsPsych.init({
  timeline: timeline,
  fullscreen: true
});
```

For security reasons, launching the browser into fullscreen mode requires that the user take an action. Therefore, if fullscreen mode is requested, a button will be displayed on the page to launch the experiment into fullscreen mode. The experiment will not begin until this button is pressed.

Safari does not support keyboard input when the browser is in fullscreen mode. Therefore, the function will not launch fullscreen mode on Safari.
