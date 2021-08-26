---
"@jspsych/plugin-same-different-html": patch
"@jspsych/plugin-same-different-image": patch
---

Fixed a bug where `null` was incorrectly set as the default value for the `first_stim_duration` and `second_stim_duration` parameters. The defaults for these parameters have been changed to `1000`, consistent with existing documentation.

pr:1880