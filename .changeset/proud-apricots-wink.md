---
"jspsych": minor
---

When `jsPsych.endExperiment` is called it provides the option of displaying a message on the screen. If the `on_finish` event handler in `initJsPsych()` returns a `Promise` then the message will now display only after the promise has resolved.

pr:2142
