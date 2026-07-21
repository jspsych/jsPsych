---
"jspsych": minor
"@jspsych/plugin-html-keyboard-response": minor
"@jspsych/plugin-image-keyboard-response": minor
"@jspsych/plugin-audio-keyboard-response": minor
"@jspsych/plugin-video-keyboard-response": minor
"@jspsych/plugin-canvas-keyboard-response": minor
---

Added the ability to measure how long a response key was held down. The `getKeyboardResponse()` method of the keyboard plugin API gains an optional `wait_for_key_release` option; when true, the `callback_function` fires at key release instead of key press, and its payload includes an `rt_key_duration` field (the press-to-release duration in milliseconds) alongside the usual `key` and `rt`. The five `*-keyboard-response` plugins (html, image, audio, video, canvas) expose a matching `wait_for_key_release` trial parameter (default false) and record the new `rt_key_duration` data field.
