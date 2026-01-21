---
"@jspsych/plugin-audio-keyboard-response": patch
"@jspsych/plugin-audio-button-response": patch
"@jspsych/plugin-audio-slider-response": patch
---

Prevent WebAudio stop error when trials end early by removing ended listeners before stopping playback.
