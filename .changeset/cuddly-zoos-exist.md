---
"@jspsych/plugin-video-button-response": major
"@jspsych/plugin-video-keyboard-response": major
"@jspsych/plugin-video-slider-response": major
---

Fixed a bug that caused the trial to not end when the `trial_ends_after_video` parameter was set to `true` and the video ended at a specific time via the `stop` parameter.

pr:1533
