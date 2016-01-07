# Using Functions as Parameters for Plugins

Most plugins allow parameters to be functions. In a typical declaration of a jsPsych trial, parameters have to be known at the start of the experiment. This makes it impossible to alter the content of the trial based on the outcome of previous trials. When functions are used as parameters for a block of trials, the function is evaluated at the start of each trial, and the return value of the function is used as the parameter. This enables dynamic updating of the parameter based on data that a subject has generated.

Here is a sketch of how this functionality could be used to display a score to subjects that depends on their overall accuracy on the task.

```javascript

// this variable contains a score based on accuracy.
// you can update the score variable in a number of ways.
// one option would be to use the on_finish callback in the
// trial to update the score after the trial is complete.
var score = 0;

var xab_trial = {
  type: 'xab',
  stimulus: xab_stimuli,
  prompt: function() {
    return "<p>Your current score is "+score+"</p>";
  }
}
```
