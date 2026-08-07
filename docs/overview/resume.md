# Resuming an Experiment After a Page Reload
*Added in 9.0*

Participants sometimes reload the page in the middle of an experiment.
They refresh by accident, their browser crashes, they close the tab and come back later, or the connection drops and they hit reload to see if that fixes it.
By default this means starting over from the very first trial.

The `resume` option makes jsPsych save the state of the experiment as it runs, so that a reloaded page can pick up where the participant left off.
The trials that were already completed are restored, including their data, and the experiment continues from the trial that was interrupted.

The saved session lives in the participant's browser, so resuming only works if the participant returns to the same URL in the same browser (and not in a private window that discards storage).
The session is deleted automatically when the experiment finishes.

!!! warning
    Resuming is not a substitute for saving data as the experiment runs.
    If a participant never comes back, the data of the interrupted session stays in their browser and you will never see it.
    Save data to a server trial-by-trial (or at least in chunks) if you want to keep partial data.

## Getting started

Add a `resume` option to `initJsPsych()` with a `key` that identifies the experiment.

```javascript
const jsPsych = initJsPsych({
  resume: {
    key: 'flanker-task-v1'
  }
});
```

That's the whole setup.
While the experiment runs, jsPsych saves the session to the browser's `localStorage` after every trial.
If the participant reloads the page, jsPsych finds the saved session and restores the experiment to the point where it was interrupted.

If there is no saved session, because this is the participant's first visit or because they already finished the experiment, then the experiment simply starts from the beginning.

## What happens on a reload

jsPsych records the outcome of every decision that it cannot make the same way twice: the order that timeline variables were sampled in, the value returned by each `conditional_function` and `loop_function`, and the data of every trial that finished.
When the page is reloaded, jsPsych walks through the timeline again and replays that log instead of running the experiment.
Replayed trials do not call their plugin, do not render anything, and do not wait for a response, so the replay is essentially instantaneous.
Their data is added back to `jsPsych.data` exactly as it was recorded, including the original `trial_index` and `time_elapsed` values.
As soon as the log runs out, the experiment continues live at the trial that was interrupted, and the experiment clock (`jsPsych.getTotalTime()`) continues from the time that had elapsed before the reload.

!!! note
    Because replayed trials never run, none of their callbacks run either.
    `on_start`, `on_load`, and `on_finish` for the trial, the experiment-wide `on_trial_start`, `on_trial_finish`, and `on_data_update` callbacks, and extension callbacks are all skipped for trials that are restored from a saved session.
    Any data that these callbacks or extensions added to the trial in the original run *is* restored, because the session is saved after they have run.

## Where the state of your experiment lives

The general rule is that anything jsPsych can see is restored, and anything that only exists in your own JavaScript variables is not.
There are three places where information can live and survive a reload.

**Trial data.**
Everything in `jsPsych.data` is restored, so anything that reads previous data behaves the same way after a reload. This includes a `loop_function` that checks accuracy, a [dynamic parameter](dynamic-parameters.md) that displays a score, or a debrief trial that summarizes performance.
Note that this only includes values that made it into the data.
If a dynamic parameter computes something that is not saved to the data, that value is gone after a reload; use the [`data`](plugins.md#the-data-parameter) or [`save_trial_parameters`](plugins.md#parameters-available-in-all-plugins) parameters to record it.

**Timeline variables.**
The order in which timeline variables are sampled is part of the saved session, so a `randomize_order: true` timeline or a `sample` block presents the remaining trials in exactly the order that was chosen before the reload.
The randomization is not repeated, and a custom `sample` function is not called again.

**`jsPsych.state`.**
This is an object you can put anything JSON-serializable into.
It is a general-purpose store that exists whether or not the `resume` option is used; what `resume` adds is durability.
With `resume` enabled, `jsPsych.state` is saved with the session after every trial and restored when the experiment resumes.
This is where variables that track the state of your experiment belong.

Some values that jsPsych itself needs after a reload are kept in `jsPsych.state` too, under [reserved keys](#reserved-keys) that your experiment should not overwrite.

### An example: a staircase

Suppose the difficulty of a trial depends on how the participant has been doing.
A natural way to write this is with a variable in your script:

```javascript
// DON'T DO THIS: `difficulty` does not survive a reload
let difficulty = 5;

const trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function(){
    return generate_stimulus(difficulty);
  },
  choices: ['f', 'j'],
  on_finish: function(data){
    difficulty += data.correct ? 1 : -1;
  }
};
```

After a reload this variable is back to `5`.
Worse, it stays at `5`: the `on_finish` callbacks of the replayed trials do not run, so nothing updates it as the session is replayed.

Keeping the same value in `jsPsych.state` fixes both problems:

```javascript
// the starting value, used only when there is no saved session to restore
jsPsych.state.difficulty = 5;

const trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function(){
    return generate_stimulus(jsPsych.state.difficulty);
  },
  choices: ['f', 'j'],
  on_finish: function(data){
    jsPsych.state.difficulty += data.correct ? 1 : -1;
  }
};

jsPsych.run(timeline);
```

Values assigned to `jsPsych.state` before `jsPsych.run()` act as defaults: they are used when the experiment starts fresh, and they are replaced by the saved values when a session is resumed.

`jsPsych.state` is a plain object, so you can read and write it anywhere in your experiment code.
It must be JSON-serializable, so it can hold numbers, strings, booleans, arrays, and plain objects, but not functions, DOM elements, or class instances.

### Reserved keys

jsPsych stores a few things in `jsPsych.state` itself, so that they survive a reload just like the rest of your state.
Do not overwrite these keys:

| Key | What jsPsych stores in it |
| --- | ------------------------- |
| `_rng_seed` | The seed of the random number generator. See [Randomization is reproduced](#randomization-is-reproduced) below. |
| `_data_properties` | The properties added with [`jsPsych.data.addProperties()`](../reference/jspsych-data.md#jspsychdataaddproperties), so that they are applied to the trials that run after a resume. |
| `_progress` | The position of the [progress bar](progress-bar.md), when it is set manually with `jsPsych.progressBar.progress`. Automatic progress bar updates are not stored, because they are recomputed from the timeline. |

Reading these values is fine, and `jsPsych.state._rng_seed` is a convenient thing to add to your data.

### Recomputing state with `on_resume`

If the state you need can be derived from the data, you don't have to store it at all.
The `on_resume` callback runs once, right after the saved session has been replayed and just before the experiment continues live.
It receives a [DataCollection](../reference/jspsych-data.md) with all of the restored data.

```javascript
let score = 0;

const jsPsych = initJsPsych({
  resume: {
    key: 'flanker-task-v1',
    on_resume: function(data){
      // rebuild the running score from the restored data
      score = data.filter({correct: true}).count();
      console.log(`Resumed after ${data.count()} trials.`);
    }
  }
});
```

`on_resume` only runs when there was a saved session to restore.
It does not run when the experiment starts from the beginning.

## Randomization is reproduced

jsPsych seeds the random number generator when you call `initJsPsych()` and stores the seed in `jsPsych.state._rng_seed`.
When a saved session is resumed, the stored seed is applied again before your code runs, so every random draw that your experiment made while it was being built comes out the same way it did in the interrupted session.

This matters because the saved session only describes the timeline that jsPsych ran; it does not describe the timeline that your code creates.
If you shuffle an array of stimuli, pick a counterbalancing condition, or generate the timeline variables of a block yourself, that happens before `jsPsych.run()` and is not part of the log.
Seeding at `initJsPsych()` makes the reloaded page rebuild the identical timeline, so the replay of the saved session lines up with it.

!!! warning
    Seeding replaces `Math.random()` for the entire page, and it happens whether or not you use the `resume` option.
    Any code on the page that uses `Math.random()`, including code that is not part of jsPsych, will get numbers from the seeded generator.

If the generator has already been seeded when `initJsPsych()` runs, jsPsych adopts that seed and stores it in `jsPsych.state._rng_seed` instead of generating a new one.

You can still choose the seed yourself with [`jsPsych.randomization.setSeed()`](../reference/jspsych-randomization.md#jspsychrandomizationsetseed), which is the way to use a seed that is derived from a participant ID, for example.

```javascript
const jsPsych = initJsPsych({
  resume: {
    key: 'flanker-task-v1'
  }
});

jsPsych.randomization.setSeed(participant_id);
```

jsPsych does not keep track of a seed that is set this way; `jsPsych.state._rng_seed` still holds the seed from `initJsPsych()`.
Resuming works anyway, as long as the `setSeed()` call happens at the same point in your code on every page load, because everything that runs before it is reproduced by the stored seed.
What does break the alignment is a seed that is different on the reloaded page, such as one derived from `Date.now()`, or a `setSeed()` call that only happens on some page loads.
The randomization that happens while the timeline is built would then differ from the timeline that the saved session describes.

## Re-running a trial after a reload: `run_on_resume`

Some trials do not just produce data; they put the browser into a state that the rest of the experiment depends on.
Entering fullscreen mode, getting permission for and access to the camera or microphone, and connecting to an external device are all undone by a page reload.
Replaying the saved data for such a trial would restore the data but not the state.

Setting `run_on_resume: true` on a trial tells jsPsych to run it again during the replay instead of restoring its saved result.
The trial is executed normally (the plugin runs, the participant interacts with it, and the callbacks fire) and the fresh result replaces the saved one, so the data still contains exactly one record for the trial.
Everything around it continues to be replayed as usual.

```javascript
const enter_fullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: true,
  run_on_resume: true
};

const init_camera = {
  type: jsPsychInitializeCamera,
  run_on_resume: true
};
```

`run_on_resume` is a [universal trial parameter](plugins.md#parameters-available-in-all-plugins) and defaults to `false`.
Like other parameters, it can be set on a nested timeline to apply to all of the trials it contains.

Use it only for trials that establish something the experiment needs, not for trials that collect data.
A trial with `run_on_resume: true` will be presented to the participant again every time they reload the page.

## Invalidating saved sessions with `key`

The saved session describes the experiment that produced it.
If you change the experiment while a participant has a saved session, for example by adding a trial, reordering a block, or changing what a `conditional_function` does, then the old session no longer describes the new timeline.

The `key` is how you control this.
A session is only restored if it was saved under the same key, so changing the key makes every existing saved session irrelevant.
Include a version number in the key and change it whenever you edit the experiment:

```javascript
const jsPsych = initJsPsych({
  resume: {
    key: 'flanker-task-v3'
  }
});
```

The key can also be used to keep sessions apart when more than one person uses the same browser, or when the same participant does several sessions of a study.
Anything you know at page load can go into it, such as a participant ID from the URL.

```javascript
const participant_id = new URLSearchParams(window.location.search).get('PROLIFIC_PID');

const jsPsych = initJsPsych({
  resume: {
    key: `flanker-task-v3-${participant_id}`
  }
});
```

If jsPsych does load a session that turns out not to match the timeline it is replaying, it does not fail.
It prints a warning to the console, discards the rest of the saved session, and continues the experiment live from that point.
The same is true for a session that cannot be parsed, or that was saved in an older session format by a previous version of jsPsych.
A mismatched session can cost the participant some progress, but it will never break the experiment.

## Using a different storage location

By default the session is written to `window.localStorage`.
You can provide any object with `getItem()`, `setItem()`, and `removeItem()` methods as the `storage` option, which makes it possible to use `sessionStorage`, or to write your own adapter that mirrors the session somewhere else.

```javascript
// keep the session only for as long as the browser tab is open
const jsPsych = initJsPsych({
  resume: {
    key: 'flanker-task-v3',
    storage: window.sessionStorage
  }
});
```

The methods are used synchronously and are expected to behave like the DOM `Storage` interface, so an adapter for an asynchronous store (a server, `IndexedDB`) needs to keep an in-memory copy that it writes through to the slower store.

If storage is unavailable or a write fails, for example because the browser blocks `localStorage` or because the saved session exceeds the storage quota, jsPsych prints a warning and the experiment continues without resume support.

## Starting over

`jsPsych.resume.clear()` deletes the saved session.
Reloading the page after that starts the experiment from the beginning.
This is useful during development, and for giving a participant (or yourself) a way out of a session that should not be continued.

```javascript
// a "start over" button that is part of the page, outside of the experiment
document.querySelector('#start-over').addEventListener('click', function(){
  jsPsych.resume.clear();
  location.reload();
});
```

Clear the session at a moment when no further trial finishes afterwards, because jsPsych saves the session again every time a trial finishes.
If the experiment keeps running after you call `clear()`, jsPsych starts recording a new session from that point on, and the next reload will resume that new session.

You do not need to clear the session at the end of the experiment.
jsPsych does that itself when the experiment ends, whether it runs to completion or is stopped with [`jsPsych.abortExperiment()`](../reference/jspsych.md#jspsychabortexperiment), so a participant who finishes and then reloads the page starts a new experiment rather than landing on the end screen.

## Limitations

* **Only JSON-serializable data is saved.** The session is stored as JSON. Data that a plugin records as a function, a DOM element, a `Blob`, or a class instance will not survive a reload.
* **Storage is limited.** `localStorage` typically allows about 5 MB per origin. Experiments that store large per-trial data, such as base64-encoded audio or video recordings or dense eye-tracking samples, can exceed this. When a write fails, jsPsych warns in the console and keeps running, but the saved session will be out of date from that point on.
* **Side effects happen only once.** Because callbacks do not run for replayed trials, anything you do in `on_finish` or `on_data_update`, such as saving a trial to a server, happened during the original run and does not happen again. This is usually what you want (data is not saved twice), but it is worth checking against your own callbacks.
* **The timeline has to be the same.** jsPsych replays the decisions it recorded, so the timeline has to be built the same way on the reloaded page. Randomization that your own code does while it builds the timeline is reproduced, because [the seed is restored](#randomization-is-reproduced), but a timeline that depends on something else that differs between page loads (the current time, a fresh request to a server, or a modification made at runtime somewhere other than the `conditional_function`, `loop_function`, and timeline variable sampling that jsPsych logs) will not line up with the saved session. jsPsych detects the mismatch and falls back to running live, but the participant loses the progress after that point.
* **Interaction data is not restored.** The focus, blur, and fullscreen events recorded by [`jsPsych.data.getInteractionData()`](../reference/jspsych-data.md#jspsychdatagetinteractiondata) before a reload are not part of the saved session. After resuming, the interaction data only contains events from the current page load.
* **The session is tied to one browser.** `localStorage` is specific to a browser and an origin. A participant who switches devices or browsers, clears their browsing data, or works in a private window that discards storage on close, will start over.
