# pipe

This extension sends an experiment's data to [DataPipe](https://pipe.jspsych.org), a free service that forwards data from online experiments to a storage provider such as OSF, Google Drive, or Dataverse.

Registering the extension is the whole integration. It stages each trial as it finishes, so that a participant who closes the tab part-way through does not take their data with them, and it submits the complete dataset when the experiment ends.

You will need an experiment ID, which you can get by creating an experiment on [pipe.jspsych.org](https://pipe.jspsych.org).

## Parameters

### Initialization Parameters

Initialization parameters can be set when calling `initJsPsych()`.

```js
initJsPsych({
  extensions: [
    {type: jsPsychExtensionPipe, params: {...}}
  ]
})
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
experiment_id | string | *undefined* | The 12-character experiment ID from your DataPipe dashboard. Required.
filename | string \| function | *undefined* | The name of the file to save. Every file in an experiment must have a unique name. Required. This is usually a function; see the note below.
format | string | `"csv"` | The format to submit the data in, either `"csv"` or `"json"`. Ignored when `data_string` is given.
data_string | function | `null` | A function that returns the data to submit, for filtering or transforming the data first. Overrides `format`.
stream | boolean | `true` | Whether to stage each trial as it finishes, so that an abandoned session can be recovered. When `false`, the data is submitted only at the end and no connection to DataPipe's staging database is opened.
enabled | boolean | `true` | When `false`, the extension does nothing at all: no session, no staging, no submission. See [Turn it off when simulating](#turn-it-off-when-simulating).
wait_message | string | `"<p>Saving data. Please do not close this page.</p>"` | HTML shown to the participant while the final upload is in progress. Change it to translate or reword the message.
done_message | string | `"<p>Done. You may close this page.</p>"` | HTML shown to the participant once the final upload has finished, whether or not it succeeded. It is shown after your own `on_finish` runs, and only if nothing else has changed the page, so a message your `on_finish` displays, or one passed to `abortExperiment()`, is left in place. Change it to translate or reword the message. If your `on_finish` redirects the participant, see [Redirecting participants at the end](#redirecting-participants-at-the-end).
on_save | function | `null` | Called with the result of the final upload. See [Reacting to a failed save](#reacting-to-a-failed-save).
base_url | string | *undefined* | Point the experiment at a different DataPipe deployment. Only useful for testing.

### Trial Parameters

This extension has no trial parameters, and you do **not** add it to any trial or timeline. Registering it in `initJsPsych()` is enough; it applies to the whole experiment.

This is different from most extensions, which run per-trial callbacks that fire only for trials whose own `extensions` parameter names them. Because a nested timeline replaces an inherited `extensions` array rather than merging with it, an extension that worked that way could silently miss trials whenever a researcher set `extensions` on an inner trial for something else. Saving your data is not something that should depend on where else you happened to use an extension, so this one hooks into the experiment as a whole instead.

## Data Generated

This extension adds nothing to any trial's data. It reads your data and sends it; it does not change it.

## Example

### Saving data

```js
const jsPsych = initJsPsych({
  extensions: [
    {
      type: jsPsychExtensionPipe,
      params: {
        experiment_id: "YOUR_EXPERIMENT_ID",
        filename: () => `${subject_id}.csv`
      }
    }
  ]
});

const subject_id = jsPsych.randomization.randomID(10);

const timeline = [
  /* your trials */
];

jsPsych.run(timeline);
```

There is no save trial, no `await`, and no session variable to thread through your timeline.

!!! tip "Why `filename` is usually a function"

    The participant ID normally comes from `jsPsych.randomization`, which does not exist yet at the point where `initJsPsych()` is called. A function is not evaluated until the experiment starts, by which time it does. A plain string works too, if the filename is known that early. If the function throws at that point, for example because it reads trial data that does not exist yet, it is called again when the experiment ends, and the data is still saved.

### Saving only part of the data

```js
params: {
  experiment_id: "YOUR_EXPERIMENT_ID",
  filename: () => `${subject_id}.csv`,
  data_string: () => jsPsych.data.get().filter({task: "response"}).csv()
}
```

### Reacting to a failed save

The result of the final upload cannot be recorded in your data, because the data has already been sent by the time the result is known. Use `on_save` instead.

```js
params: {
  experiment_id: "YOUR_EXPERIMENT_ID",
  filename: () => `${subject_id}.csv`,
  on_save: (result) => {
    if (!result.ok) {
      document.body.innerHTML =
        "<p>Your data could not be saved. Please contact the researcher.</p>";
    }
  }
}
```

A failed submission does not necessarily mean the data is lost. While `stream` is on, the trials that were staged stay on DataPipe's servers and are recovered as a `.partial.json` file.

### Redirecting participants at the end

When the upload finishes, the extension replaces the wait message with `done_message`, which by default tells the participant they may close the page. That happens after your own `on_finish` runs. If `on_finish` sends the participant to another site, such as Prolific, the done message stays on screen while that site loads, and a participant who closes the page then never reaches it. Set `done_message` to say what is about to happen instead.

```js
const jsPsych = initJsPsych({
  on_finish: () => {
    window.location = "https://app.prolific.com/submissions/complete?cc=YOUR_CODE";
  },
  extensions: [
    {
      type: jsPsychExtensionPipe,
      params: {
        experiment_id: "YOUR_EXPERIMENT_ID",
        filename: () => `${subject_id}.csv`,
        done_message: "<p>Returning you to Prolific. Please do not close this page.</p>"
      }
    }
  ]
});
```

If `on_finish` puts its own content on the page instead, such as a completion code, the done message is not shown.

## Do not also add a save trial

The extension submits your data. If you are migrating from `@jspsych-contrib/plugin-pipe`, delete the `jsPsychPipe` save trial from your timeline.

Leaving it in submits twice. The first submission wins and the second is refused as a duplicate filename, which the extension then treats as a failed save — so it marks the session abandoned and DataPipe recovers your staged trials as a `.partial.json` you did not want.

A `saveBase64` trial for media is fine to keep. It is only the `save` action that collides.

## Condition assignment

`jsPsychExtensionPipe.getCondition()` is a static method, because a condition usually decides which timeline to build and so has to be known before `initJsPsych()` is called.

It **throws** if the condition cannot be obtained. There is no safe value to fall back to: a participant sent down the wrong branch, or an empty one, looks like a successful run until someone reads the data. Decide what they should see.

```js
let condition;
try {
  condition = await jsPsychExtensionPipe.getCondition("YOUR_EXPERIMENT_ID");
} catch (error) {
  document.body.innerHTML = "<p>The experiment could not be started.</p>";
  throw error;
}

const timeline = condition === 0 ? condition_1_timeline : condition_2_timeline;
```

## Saving media files

`jsPsychExtensionPipe.saveBase64Data()` uploads audio, video, or images. Returning its promise from a trial's `on_finish` makes the timeline wait for the upload.

```js
const trial = {
  type: jsPsychHtmlAudioResponse,
  stimulus: "<p>Record a few seconds of audio.</p>",
  recording_duration: 15000,
  on_finish: async (data) => {
    const filename = `${subject_id}_${jsPsych.getProgress().current_trial_global}_audio.webm`;
    await jsPsychExtensionPipe.saveBase64Data("YOUR_EXPERIMENT_ID", filename, data.response);
    data.response = filename;
  }
};
```

Unlike `getCondition`, this does not throw — check `result.ok`.

## Ending an experiment early

The final save also runs after [`jsPsych.abortExperiment()`](../reference/jspsych.md#abortexperiment), which unwinds the timeline and then finishes the experiment normally. A participant who is failed out by an attention check therefore still has their data submitted.

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/extension-pipe@0.1.0"></script>
```

Using NPM:

```
npm install @jspsych/extension-pipe
```

```js
import jsPsychExtensionPipe from '@jspsych/extension-pipe';
```
