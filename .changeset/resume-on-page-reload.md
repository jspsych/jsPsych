---
"jspsych": minor
---

Added the ability to resume an experiment after a page reload, enabled with the new `resume` option of `initJsPsych()`. jsPsych saves the session (trial data, timeline variable orders, `conditional_function` and `loop_function` outcomes, and the new `jsPsych.resume.state` object) to `localStorage` or a custom storage adapter as the experiment runs, and a reloaded page replays it so that the experiment continues at the trial that was interrupted. Trials that establish browser state, such as entering fullscreen or initializing a camera, can be re-run on resume with the new universal `run_on_resume` trial parameter. Resolves #3573.
