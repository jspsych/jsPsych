---
"@jspsych/plugin-html-audio-response": patch
"@jspsych/plugin-html-video-response": patch
---

Throw a clear error when the trial starts before the microphone (html-audio-response) or camera (html-video-response) has been initialized, instead of failing with "Cannot read properties of null (reading 'addEventListener')" (#2522).
