# @jspsych/extension-pipe

Send an experiment's data to [DataPipe](https://pipe.jspsych.org) without writing any DataPipe code.

Registering the extension is the whole integration. It stages each trial as it finishes — so a participant who closes the tab at trial 199 of 200 does not take all 199 with them — and submits the complete dataset when the experiment ends.

## Example

```js
const jsPsych = initJsPsych({
  extensions: [
    {
      type: jsPsychExtensionPipe,
      params: {
        experiment_id: "YOUR_EXPERIMENT_ID",
        filename: () => `${subject_id}.csv`,
      },
    },
  ],
});

const subject_id = jsPsych.randomization.randomID(10);

jsPsych.run([
  /* your trials */
]);
```

There is no save trial, no `await`, and no session variable to thread through the timeline. You do not add `extensions` to any trial or timeline — registering it in `initJsPsych` is enough.

`filename` usually needs to be a function, because the participant ID normally comes from `jsPsych.randomization`, which does not exist yet when `initJsPsych` is called. A function is evaluated when the experiment starts.

## Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `experiment_id` | string | *required* | The 12-character experiment ID from your DataPipe dashboard. |
| `filename` | string \| function | *required* | The name of the file to save. Must be unique within the experiment. |
| `format` | `"csv"` \| `"json"` | `"csv"` | The format to submit the data in. Ignored when `data_string` is given. |
| `data_string` | function | | Returns the data to submit. Use instead of `format` to filter or transform first. |
| `stream` | boolean | `true` | Whether to stage each trial as it finishes. `false` submits only at the end and opens no connection to the staging database. |
| `wait_message` | string | | HTML shown while the final upload is in progress. |
| `on_save` | function | | Called with the result of the final upload. |
| `base_url` | string | | Point the experiment at a different DataPipe deployment. Only useful for testing. |

## What it does

The extension takes jsPsych's two global callbacks, `on_data_update` and `on_finish`, through the public `getInitSettings()`. Both are wrapped rather than replaced, so anything you passed to `initJsPsych` still runs.

It does not use the per-trial extension callbacks. Those fire only for trials whose own `extensions` parameter names the extension — which is a different thing from the array passed to `initJsPsych`, and which a nested timeline can shadow without merging. An extension relying on them would silently miss trials.

The final save also runs after `jsPsych.abortExperiment()`, which unwinds the timeline and falls through to `on_finish`. A save *trial* is never reached on an abort, so a participant failed out by an attention check would otherwise lose everything.

## Reporting a failed save

The result of the final upload cannot be recorded in the data, because the data has already been sent by the time it is known. Use `on_save`:

```js
params: {
  experiment_id: "YOUR_EXPERIMENT_ID",
  filename: () => `${subject_id}.csv`,
  on_save: (result) => {
    if (!result.ok) {
      document.body.innerHTML = "<p>Your data could not be saved. Please contact the researcher.</p>";
    }
  },
}
```

A failed submission does not mean the data is lost: the staged trials stay on DataPipe's servers and are recovered as a `.partial.json` file.

## Do not also add a save trial

The extension submits your data. If you are migrating from `@jspsych-contrib/plugin-pipe`, delete the `jsPsychPipe` save trial from your timeline.

Leaving it in submits twice. The first submission wins and the second is refused as a duplicate filename, which the extension then treats as a failed save — so it marks the session abandoned and DataPipe recovers your staged trials as a `.partial.json` you did not want. A `saveBase64` trial for media is fine to keep; it is only the `save` action that collides.

## Static methods

Both are static because they are needed outside the extension's own lifecycle, and they are here only so that an experiment needs one script tag rather than two.

`jsPsychExtensionPipe.getCondition(experiment_id)` requests this participant's condition assignment. A condition usually decides which timeline to build, so it has to be known before `initJsPsych()` is called. It **throws** on failure — a participant sent down the wrong branch looks like a successful run until someone reads the data.

```js
let condition;
try {
  condition = await jsPsychExtensionPipe.getCondition("YOUR_EXPERIMENT_ID");
} catch (error) {
  document.body.innerHTML = "<p>The experiment could not be started.</p>";
  throw error;
}
```

`jsPsychExtensionPipe.saveBase64Data(experiment_id, filename, data)` uploads audio, video, or images. Return its promise from a trial's `on_finish` to make the timeline wait for the upload. It does not throw; check `result.ok`.

## Compatibility

jsPsych v8.0.0 and later.
