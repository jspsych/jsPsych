---
"jspsych": minor
"@jspsych/plugin-html-keyboard-response": minor
"@jspsych/plugin-image-keyboard-response": minor
"@jspsych/plugin-audio-keyboard-response": minor
"@jspsych/plugin-video-keyboard-response": minor
"@jspsych/plugin-canvas-keyboard-response": minor
---

Added the ability to measure how long a response key was held down. The `getKeyboardResponse()` method of the keyboard plugin API gains an optional `release_callback_function` option that fires when the key that produced a valid response is released, reporting the press-to-release duration. The five `*-keyboard-response` plugins (html, image, audio, video, canvas) use this to record a new `rt_key_duration` data field.
