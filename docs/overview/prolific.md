# Intergrating with Prolific

[Prolific](https://www.prolific.co/?ref=5JCXZPVU) is a participant recruitment service aimed at research. Integrating a jsPsych experiment with Prolific requires capturing the participant's ID and sending the participant to a completion URL at the end of the experiment.

## Capturing the Participant ID, Study ID, and Session ID

When creating a study on Prolific you must provide the URL to your study. You can host your jsPsych experiment however you'd like - some options are discussed in the [Running Experiments](/overview/running-experiments/#hosting-the-experiment-and-saving-the-data) documentation page. Once you've got a URL to your experiment, you can enter that in the *study link* section of Prolific. Then, click the option to record Prolific IDs via URL parameters.

![Prolific screenshot](/img/prolific-study-link.png)

This will append information about the participant's prolific ID (`PROLIFIC_PID`), the study's ID (`STUDY_ID`), and the session ID (`SESSION_ID`) to the URL that participants use to access your experiment. 

We can capture these variables with jsPsych, and add them to jsPsych's data. This can be done anywhere in your code. This code does not need to run as part of your experiment timeline.

```html
<script>
  // capture info from Prolific
  var subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
  var study_id = jsPsych.data.getURLVariable('STUDY_ID');
  var session_id = jsPsych.data.getURLVariable('SESSION_ID');

  jsPsych.data.addProperties({
    subject_id: subject_id,
    study_id: study_id,
    session_id: session_id
  });

  // create the rest of the experiment
  var timeline = [...]

  jsPsych.init({
    timeline: timeline
  })
</script>
```

## Completing the Experiment

When the experiment is complete, Prolific requires that you send the participant to a specific URL that marks the session as complete on Prolific's server. The link is provided to you by Prolific in the *study completion* section of the setup.

![Prolific Study Completion Screenshot](/img/prolific-study-completion.png)

You can accomplish this in a couple different ways.

!!! warning
    It's important that you've saved all the data from your experiment before the participant returns to Prolific. Make sure that any server communication has completed prior to redirecting the participant. One way to do this is by using the async features of the `call-function` plugin ([example](/plugins/jspsych-call-function/#async-function-call)).

### Participant clicks a link

One option is to create a trial that contains a link that the participant clicks to end the experiment and return to Prolific. For example, the `html-keyboard-response` plugin can be used to display text that includes a link. This could go on a debriefing page.

Here's an example trial that could be used. Note that `choices` is set to `jsPsych.NO_KEYS`, which will prevent the participant from continuing past this point in the experiment.

```js
var final_trial = {
  type: 'html-keyboard-response',
  stimulus: `<p>You've finished the last task. Thanks for participating!</p>
    <p><a href="https://app.prolific.co/submissions/complete?cc=XXXXXXX">Click here to return to Prolific and complete the study</a>.</p>`,
  choices: jsPsych.NO_KEYS
}
```

### Automatically redirect

A second option is to automatically redirect the participant to the completion URL when the experiment is finished. You could do this in a number of places in the jsPsych timeline.

Here's an example using the `on_finish` event for the entire experiment.

```js
jsPsych.init({
  timeline: [...],
  on_finish: function(){
    window.location = "https://app.prolific.co/submissions/complete?cc=XXXXXXX"
  }
});
```


