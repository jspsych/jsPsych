# Integrating with Mechanical Turk

A common use of jsPsych is to build an online experiment and find subjects using [Mechanical Turk](http://www.mturk.com/). Once an experiment is available through a web server and data is being [saved on the server](data.md), connecting the experiment with Mechanical Turk takes only a few additional steps. jsPsych has some built-in functionality to assist with this process. 

## The jsPsych.turk module

The [jsPsych.turk](../core_library/jspsych-turk.md) module contains functions that are relevant for experiments running on Mechanical Turk.

## Creating an advertisement page

When potential subjects view your experiment on Mechanical Turk, they will be able to see a single webpage before deciding whether or not to accept the HIT (start the experiment). This first page is often used as an advertisement for the experiment, similar to posting a flier in a department hallway. The important thing to remember about this page is that potential subjects will be able to interact with it even if they haven't accepted the HIT. Therefore, it can be useful to change the content of the page depending on whether the HIT has been accepted or not. This is relatively easy to do using jsPsych and jQuery:

```html
<div id="experiment_link">You must accept the HIT to begin the experiment</div>.

<script>
// jsPsych has a method turkInfo() which can determine whether or not the
// HIT has been accepted.
var turkInfo = jsPsych.turkInfo();

// turkInfo.previewMode is true in two cases: when the HIT has not been
// accepted yet OR when the page is viewed outside of mechanical turk.
// The second property, outsideTurk, is true when the page is viewed
// outside of mechanical turk, so together, the statement will be true
// only when in Turk and when the HIT is not accepted yet.
if(turkInfo.previewMode && !turkInfo.outsideTurk) {
  $('#turkInfo').html('<a href="link_to_experiment.html" target="_blank">Click Here to Start Experiment</a>');
}
</script>
```

One important issue with advertisement pages is that they must be served using the https protocol, which requires having an SSL certificate on the web server hosting the page. Instructions for how to do this vary depending on what kind of server you are using, so the best advice is to simply Google for instructions on how to acquire and install an SSL certificate on your particular server.

## Getting the worker ID

Every account on Mechanical Turk is given a unique identification string. Recording this ID is a useful way to keep track of who is doing your experiment. In particular, while Turk has built in tools for preventing the same person from doing a HIT more than once, there may be cases where you don't want subjects to complete related experiments. If you store the worker ID of every person who starts an experiment in a database, then you can exclude people by running a query on the database to check for the ID. jsPsych can get the workerID, assignmentID, and hitID with the turkInfo method.

```javascript
var turkInfo = jsPsych.turk.turkInfo();

// workerID
turkInfo.workerId

// hitID
turkInfo.hitId

// assignmentID
turkInfo.assignmentId
```

Recording the workerId at the start of the experiment is also a good way to track dropouts.

## Submitting results to Mechanical Turk

If you are running a HIT on Mechanical Turk using the ExternalQuestion template, then you'll need to provide a way for subjects to indicate that they have completed the HIT. (If you are using another template, then the template will provide this code for you). jsPSych makes this a relatively easy task. A common strategy for external HITs is to display an HTML page on the Mechanical Turk website that links to your HIT. Subjects click the link, which opens the actual experiment content in a new browser window or tab, allowing the experiment to take up the whole browser window instead of just the iframe that displays content on Mechanical Turk.

On this page, you might include a submit button for workers to indicate that they have finished the experiment. The page would look something like this:

```html
<p>Enter the code you were given:</p>
<input type="text" id="code"></input>
<button onclick="sendData();">Submit HIT</button>

<script>
function sendData() {
  jsPsych.turk.submitToTurk({
    code: document.getElementById('code').value
  });
}
</script>
```

When workers click the button, the contents of the `code` text field will be sent to Mechanical Turk, and you'll be able to view the subjects and the codes that they entered in the Mechanical Turk GUI. You can then approve or reject work using the Mechanical Turk website.

## Limitations

jsPsych is not designed to communicate with the Mechanical Turk API in a comprehensive manner. If you are looking for software to help you post and manage HITs, then you may want to look at [PsiTurk](http://www.psiturk.org). jsPsych and PsiTurk complement each other nicely, and there is [an example of combining the two platforms](https://psiturk.org/ee/W4v3TPAsiD6FUVY8PDyajH) on PsiTurk's experiment exchange.
