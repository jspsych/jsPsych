---
"@jspsych/plugin-video-button-response": patch
"@jspsych/plugin-video-keyboard-response": patch
"@jspsych/plugin-video-slider-response": patch
---

Fixed a bug that caused the trial to not end when the `trial_ends_after_video` parameter was set to `true` and the video ended at a specific time via the `stop` parameter.

pr:1533
author: @becky-gilbert
commit: 7b16a1d