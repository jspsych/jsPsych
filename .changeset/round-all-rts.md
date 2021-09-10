---
"jspsych": minor
"@jspsych/plugin-animation": minor
"@jspsych/plugin-audio-button-response": minor
"@jspsych/plugin-audio-slider-response": minor
"@jspsych/plugin-canvas-button-response": minor
"@jspsych/plugin-canvas-slider-response": minor
"@jspsych/plugin-external-html": minor
"@jspsych/plugin-free-sort": minor
"@jspsych/plugin-html-button-response": minor
"@jspsych/plugin-html-slider-response": minor
"@jspsych/plugin-image-button-response": minor
"@jspsych/plugin-image-slider-response": minor
"@jspsych/plugin-instructions": minor
"@jspsych/plugin-maxdiff": minor
"@jspsych/plugin-rdk": minor
"@jspsych/plugin-reconstruction": minor
"@jspsych/plugin-serial-reaction-time-mouse": minor
"@jspsych/plugin-survey-html-form": minor
"@jspsych/plugin-survey-likert": minor
"@jspsych/plugin-survey-multi-choice": minor
"@jspsych/plugin-survey-multi-select": minor
"@jspsych/plugin-survey-text": minor
"@jspsych/plugin-video-button-response": minor
"@jspsych/plugin-video-slider-response": minor
"@jspsych/plugin-virtual-chinrest": minor
---

All duration measurements, including response times, are now rounded to the nearest millisecond. We changed this because the precision that `performance.now()` generates is misleading in this context and removing the (often very long) decimal component of the measurement will save space in the data files.

pr:2129
