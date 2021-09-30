---
"jspsych": major
"@jspsych/extension-webgazer": major
"@jspsych/plugin-animation": major
"@jspsych/plugin-audio-button-response": major
"@jspsych/plugin-audio-keyboard-response": major
"@jspsych/plugin-audio-slider-response": major
"@jspsych/plugin-call-function": major
"@jspsych/plugin-canvas-button-response": major
"@jspsych/plugin-canvas-keyboard-response": major
"@jspsych/plugin-canvas-slider-response": major
"@jspsych/plugin-categorize-animation": major
"@jspsych/plugin-categorize-html": major
"@jspsych/plugin-categorize-image": major
"@jspsych/plugin-cloze": major
"@jspsych/plugin-external-html": major
"@jspsych/plugin-free-sort": major
"@jspsych/plugin-fullscreen": major
"@jspsych/plugin-html-button-response": major
"@jspsych/plugin-html-keyboard-response": major
"@jspsych/plugin-html-slider-response": major
"@jspsych/plugin-iat-html": major
"@jspsych/plugin-iat-image": major
"@jspsych/plugin-image-button-response": major
"@jspsych/plugin-image-keyboard-response": major
"@jspsych/plugin-image-slider-response": major
"@jspsych/plugin-instructions": major
"@jspsych/plugin-maxdiff": major
"@jspsych/plugin-preload": major
"@jspsych/plugin-reconstruction": major
"@jspsych/plugin-resize": major
"@jspsych/plugin-same-different-html": major
"@jspsych/plugin-same-different-image": major
"@jspsych/plugin-serial-reaction-time": major
"@jspsych/plugin-serial-reaction-time-mouse": major
"@jspsych/plugin-survey-html-form": major
"@jspsych/plugin-survey-likert": major
"@jspsych/plugin-survey-multi-choice": major
"@jspsych/plugin-survey-multi-select": major
"@jspsych/plugin-survey-text": major
"@jspsych/plugin-template": major
"@jspsych/plugin-video-button-response": major
"@jspsych/plugin-video-keyboard-response": major
"@jspsych/plugin-video-slider-response": major
"@jspsych/plugin-virtual-chinrest": major
"@jspsych/plugin-visual-search-circle": major
"@jspsych/plugin-webgazer-calibrate": major
"@jspsych/plugin-webgazer-init-camera": major
"@jspsych/plugin-webgazer-validate": major
---

jsPsych is now fully modular, with individual NPM packages for the core library, plugins, and extensions. 
To support this change, we've made a number of breaking changes. 
We've added [a guide for migrating from version 6.x to 7.x](https://www.jspsych.org/support/migration-v7/) to the documentation, and updated the [hello world tutorial](https://www.jspsych.org/tutorials/hello-world/) with instructions for configuring jsPsych in three different ways.
In addition to enabling package management, some of the benefits that this change provides include an improved developer experience with IntelliSense code hints, proper encapsulation of jsPsych so that multiple instances can be run on the same page, and easier integration with modern JavaScript tools like bundlers.

author: @jodeleeuw
author: @becky-gilbert
author: @bjoluc
