---
"jspsych": minor
"@jspsych/plugin-audio-button-response": minor
"@jspsych/plugin-audio-keyboard-response": minor
"@jspsych/plugin-audio-slider-response": minor
"@jspsych/plugin-external-html": minor
"@jspsych/plugin-webgazer-init-camera": minor
---

Added the option for plugins to return a `Promise` and delay the execution of the `on_load` event handler for the trial until the plugin manually invokes it. This allows for plugins that have asynchronous components to finish loading before triggering the `on_load` event. Added this functionality to all plugins that currently require it.

pr:2130