---
"@jspsych/plugin-audio-button-response": patch
"@jspsych/plugin-audio-slider-response": patch
---

Fixed negative response times being recorded by ensuring if the AudioContext object exists, startTime is recorded with respect to that.
