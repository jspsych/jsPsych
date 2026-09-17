---
"jspsych": minor
---

Added an optional stylesheet, `css/jspsych-mobile.css`, that moves response buttons into a bar fixed to the bottom of the screen on touch devices, where they are within reach of a thumb. Load it after `jspsych.css` to opt in. All of its rules are inside a `@media (pointer: coarse)` query, so loading it has no effect on mouse-driven devices, and `jspsych.css` is unchanged. The rules target the `.jspsych-btn-group-flex` and `.jspsych-btn-group-grid` classes, so they apply to the audio, canvas, html, image, and video button-response plugins alike.
