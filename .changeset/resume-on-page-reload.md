---
"jspsych": major
---

Added the ability to resume an experiment after a page reload, enabled with the new `resume` option of `initJsPsych()`. jsPsych saves the session (trial data, timeline variable orders, and `conditional_function` and `loop_function` outcomes) to `localStorage` or a custom storage adapter as the experiment runs, and a reloaded page replays it so that the experiment continues at the trial that was interrupted. Trials that establish browser state, such as entering fullscreen or initializing a camera, can be re-run on resume with the new universal `run_on_resume` trial parameter. Resolves #3573.

The state of the experiment is now a first-class concept: `jsPsych.state` is an object that you can store anything JSON-serializable in, and that the `resume` option makes durable across a page reload. jsPsych keeps three values of its own in it, under the reserved keys `_rng_seed`, `_data_properties`, and `_progress`.

**Breaking change:** `initJsPsych()` now always seeds the random number generator, which means that **`Math.random()` is replaced for the entire page in every jsPsych experiment**, whether or not the `resume` option is used. The seed is generated when the `JsPsych` instance is created, before your code builds the timeline, and it is stored in `jsPsych.state._rng_seed`. A seed that was set before `initJsPsych()` is adopted instead of being overridden. Seeding this early means that a resumed session reproduces the randomization that happened while the timeline was being built, so that the reloaded page reconstructs an identical timeline. The new `jsPsych.randomization.getSeed()` returns the seed that is currently in effect.

Two more things now survive a reload: properties added with `jsPsych.data.addProperties()` are applied to the trials that run after a resume, and a progress bar position that was set manually with `jsPsych.progressBar.progress` is restored.
