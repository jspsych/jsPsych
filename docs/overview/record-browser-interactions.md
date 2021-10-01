# Record browser interactions

Participants in an online experiment have the freedom to multitask while performing an experiment. jsPsych automatically records information about when the user clicks on a window that is not the experiment, and about when the user exits full screen mode if the experiment is running in full screen mode. This data is stored separately from the main experiment data, and can be accessed with [jsPsych.data.getInteractionData()](../reference/jspsych-data.md#jspsychdatagetinteractiondata).

Each time the user leaves the experiment window, returns to the experiment window, exits full screen mode, or enters full screen mode, the event is recorded in the interaction data. Each event has the following structure.

```javascript
{
  event: 'focus', // 'focus' or 'blur' or 'fullscreenenter' or 'fullscreenexit'
  trial: 12, // the index of the active trial when the event happened
  time: 1240543 // time in ms since the start of the experiment
}
```

You can specify a custom function, in the initJsPsych() method, that is called whenever one of these events occurs

```javascript
initJsPsych({
  on_interaction_data_update: function(data) {
    console.log(JSON.stringify(data))
  }
});
```
