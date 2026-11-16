# Integrating with Populiva

[Populiva](https://populiva.com) is a participant recruitment service for online research. Integrating a jsPsych experiment with Populiva requires capturing the participant's ID and sending the participant to a completion URL at the end of the experiment.

## Capturing the Participant ID, Study ID, and Session ID

When creating a study on Populiva you must provide a *study link*: the URL of your experiment. The link must use `https`. You can host your jsPsych experiment however you'd like - some options are discussed in the [Running Experiments](running-experiments.md#hosting-the-experiment-and-saving-the-data) documentation page.

When a participant starts the study, Populiva opens the study link with three URL parameters appended:

* `PARTICIPANT_ID`: a pseudonymous ID for the participant. It stays the same for a participant across your lab's studies, and is different for each lab.
* `STUDY_ID`: the ID of the Populiva study.
* `SESSION_ID`: a new ID for each attempt at the study.

We can capture these variables with jsPsych, and add them to jsPsych's data. This can be done anywhere in your code. This code does not need to run as part of your experiment timeline.

```html
<script>
  var jsPsych = initJsPsych();

  // capture info from Populiva
  jsPsych.data.addProperties({
    PARTICIPANT_ID: jsPsych.data.getURLVariable('PARTICIPANT_ID'),
    STUDY_ID: jsPsych.data.getURLVariable('STUDY_ID'),
    SESSION_ID: jsPsych.data.getURLVariable('SESSION_ID')
  });

  // create the rest of the experiment
  var timeline = [...]

  jsPsych.run(timeline)
</script>
```

## Completing the Experiment

When the experiment is complete, send the participant to the study's completion URL. It has the form `https://populiva.com/c/STUDY_ID?code=COMPLETION_CODE`. Copy the exact URL from the *Connect your survey* section of the study page on Populiva.

A study can have more than one completion code, and each code can have a different outcome (for example, approving the submission or recording a paid screen-out). If your experiment screens participants out or uses attention checks, you can send those participants to the URL for a different code. The default code sends the submission to manual review.

You can send the participant to the completion URL in a couple different ways.

!!! warning
    It's important that you've saved all the data from your experiment before the participant returns to Populiva. Make sure that any server communication has completed prior to redirecting the participant. One way to do this is by using the async features of the `call-function` plugin ([example](../plugins/call-function.md#async-example)).

### Participant clicks a link

One option is to create a trial that contains a link that the participant clicks to end the experiment and return to Populiva. For example, the `html-keyboard-response` plugin can be used to display text that includes a link. This could go on a debriefing page.

Here's an example trial that could be used. Note that `choices` is set to `"NO_KEYS"`, which will prevent the participant from continuing past this point in the experiment.

```js
var final_trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `<p>You've finished the last task. Thanks for participating!</p>
    <p><a href="https://populiva.com/c/STUDY_ID?code=COMPLETION_CODE">Click here to return to Populiva and complete the study</a>.</p>`,
  choices: "NO_KEYS"
}
```

### Automatically redirect

A second option is to automatically redirect the participant to the completion URL when the experiment is finished. You could do this in a number of places in the jsPsych timeline.

Here's an example using the `on_finish` event for the entire experiment.

```js
var jsPsych = initJsPsych({
  on_finish: function(){
    window.location = "https://populiva.com/c/STUDY_ID?code=COMPLETION_CODE"
  }
});
```

## Optional quality script

Populiva provides an optional script that can be added to the `<head>` of the experiment page. It reads `SESSION_ID` from the page URL and sends activity counts (such as time on page and tab switches) to Populiva. It does not send responses. If you use it, mention it in your consent form. See [Populiva's jsPsych guide](https://populiva.com/guides/jspsych) for details.
