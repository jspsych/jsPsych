# Integrating with Prolific Academic

A common use of jsPsych is to build an online experiment and find subjects using [Prolific Academic (PA)](http://www.prolific.ac/). Once an experiment is available through a web server and data is being [saved on the server](data.md), connecting the experiment with PA takes only a few additional steps. jsPsych has some built-in functionality to assist with this process. 

## The jsPsych.prolific module

The [jsPsych.prolific](../core_library/jspsych-prolific.md) module contains functions that are relevant for experiments running on PA.

## Getting the participant's prolific ID

Every account on PA is given a unique identification string. Recording this ID is a useful way to keep track of who is doing your experiment. In particular, while PA has built in tools for preventing the same person from doing a study more than once, there may be cases where you don't want subjects to complete related experiments. If you store the prolific ID of every person who starts an experiment in a database, then you can exclude people by running a query on the database to check for the ID.
Instead of making your participants entering their prolific ID manually, you can make PA send it to your jsPsych experiment. To do this, you will have to add the following string to the end of your experiment's URL entered in the study's settings on PA: `?participant={{%PROLIFIC_PID%}}&session={{%SESSION_ID%}}`. jsPsych will then be able to get the participant ID and session ID with the `prolific.info` method.

```javascript
var prolificInfo = jsPsych.prolific.info();

// participant ID
prolificInfo.participant

// session ID
prolificInfo.session
```

Recording the participant ID at the start of the experiment is also a good way to track dropouts.

## Submitting results to Prolific Academic

If you are running a study on Prolific Academic, participants will have to provide the completion code to PA after finishing the study. jsPSych makes this a relatively easy task. One strategy is to detect whether the experiment is running in an iframe and tell the participant to use the button "Open Study in New Window" to do so.
If you decide to provide another way to open the experiment in it's own window, you will have to make sure to set the URL parameter `study` accordingly.

Detecting the iframe and submitting to PA could work like this:

```html
<div id="iframe-detected" style="display: none;">Please open the experiment in another window by clicking the button "Open Study in New Window" on top of the page.</div>

<script>
function inIFrame() {
  try {
    // detects whether experiment is running in an iframe by comparing the parent page to the page itself
    return window.self !== window.top;
  } catch (e) {
    // browser has blocked access to window.top due to same-origin-policy: iframe exists
    return true;
  }
}

// Check for iframe and for study id
if(inIframe() && jsPsych.prolific.info().study) {
  // we are either in an iframe or in a new window but without a study ID - maybe experiment was not openend with the click on the button?
  // -> we show our iframe / button message
  $('#iframe-detected').show();
} else {
  // we are not in an iframe and have a study ID, so we can start the experiment
  jsPsych.init({
    timeline: [ /* timeline definition */ ],
    // submit to PA at the end of the experiment
    on_finish: function() {
      jsPsych.prolific.submit('MYCODE');
    }
  });
}

</script>
```

When participants open the experiment in a new window with the "Open Study in New Window" button, we can read the study ID from the referring URL and the study will be submitted to PA automatically at the end of the experiment. You'll then be able to view the subjects and the codes you created for them in Prolific Academic. You can then approve or reject their submissions using the PA website.

## Limitations

jsPsych is not designed to communicate with Prolific Academic in a comprehensive manner. Currently there is not API for PA available, so you have to create and manage your experiments through the PA webinterface.
