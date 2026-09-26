---
"jspsych": patch
---

`save_trial_parameters` now works with the parameters that are available in all plugins, such as `css_classes` and `post_trial_gap`. Before, they were ignored with a "Non-existent parameter" warning and their values were not saved to the data.
