---
"@jspsych/plugin-audio-slider-response": minor
"@jspsych/plugin-canvas-slider-response": minor
"@jspsych/plugin-html-slider-response": minor
"@jspsych/plugin-image-slider-response": minor
"@jspsych/plugin-video-slider-response": minor
---

When `require_movement` is true a 'touchstart' event or a 'mousedown' event will now enable the button. This means that this parameter will work on mobile devices, and that the button will become enabled as soon as the paricipant interacts with the slider rather than after they click and release the slider.

pr:2143