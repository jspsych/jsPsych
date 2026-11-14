---
"jspsych": patch
---

Changes to `trial.data` made in `on_start` are now saved in the trial's data (#3727). This also changes when functions in a trial's `data` parameter are evaluated: they are now called right before the trial starts, like other dynamic parameters, so `on_start` sees their values. Before, they were called after the trial ended, when the data was saved. Values that depend on the response should be added in `on_finish`.
