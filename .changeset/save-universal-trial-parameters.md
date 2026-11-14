---
"jspsych": patch
---

`save_trial_parameters` now works with the parameters that are available in all plugins, such as `css_classes` and `post_trial_gap`. Before, they were ignored with a "Non-existent parameter" warning and their values were not saved to the data.

Functions passed to these parameters are now called when the trial starts, before `on_start`, so `on_start` and the plugin see their values. Before, they were called when the parameter was used; for example, a function passed to `post_trial_gap` was called after the trial ended.
