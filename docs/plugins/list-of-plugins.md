# List of Plugins

These are the plugins that are included in the jsPsych release. 

Additional plugins may be available in the [community contributions repository](https://github.com/jspsych/jspsych-contrib). 

For an overview of what plugins are and how they work, see our [plugins overview](../overview/plugins.md).

Plugin | Description
------ | -----------
[animation](animation.md) | Shows a sequence of images at a specified frame rate. Records key presses (including timing information) made by the participant while they are viewing the animation.
[audio&#8209;button&#8209;response](audio-button-response.md) | Play an audio file and allow the participant to respond by choosing a button to click. The button can be customized extensively, e.g., using images in place of standard buttons.
[audio&#8209;keyboard&#8209;response](audio-keyboard-response.md) | Play an audio file and allow the participant to respond by pressing a key.
[audio&#8209;slider&#8209;response](audio-slider-response.md) | Play an audio file and allow the participant to respond by moving a slider to indicate a value.
[browser&#8209;check](browser-check.md) | Measures various features of the participant's browser and runs an inclusion check to see if the browser meets a custom set of criteria for running the study.
[call&#8209;function](call-function.md) | Executes an arbitrary function call. Doesn't display anything to the participant, and the participant is usually unaware that this plugin has even executed. It's useful for performing tasks at specified times in the experiment, such as saving data.
[canvas&#8209;button&#8209;response](canvas-button-response.md) | Draw a stimulus on a [HTML canvas element](https://www.w3schools.com/html/html5_canvas.asp), and record a button click response. Useful for displaying dynamic, parametrically-defined graphics, and for controlling the positioning of multiple graphical elements (shapes, text, images).
[canvas&#8209;keyboard&#8209;response](canvas-keyboard-response.md) | Draw a stimulus on a [HTML canvas element](https://www.w3schools.com/html/html5_canvas.asp), and record a key press response. Useful for displaying dynamic, parametrically-defined graphics, and for controlling the positioning of multiple graphical elements (shapes, text, images).
[canvas&#8209;slider&#8209;response](canvas-slider-response.md) | Draw a stimulus on a [HTML canvas element](https://www.w3schools.com/html/html5_canvas.asp), and ask the participant to respond by moving a slider to indicate a value. Useful for displaying dynamic, parametrically-defined graphics, and for controlling the positioning of multiple graphical elements (shapes, text, images).
[categorize&#8209;animation](categorize-animation.md) | The participant responds to an animation and can be given feedback about their response.
[categorize&#8209;html](categorize-html.md) | The participant responds to an HTML-formatted stimulus using the keyboard and can be given feedback about the correctness of their response.
[categorize&#8209;image](categorize-image.md) | The participant responds to an image using the keyboard and can be given feedback about the correctness of their response.
[cloze](cloze.md) | Plugin for displaying a cloze test and checking participants answers against a correct solution.
[external&#8209;html](external-html.md) | Displays an external HTML page (such as a consent form) and lets the participant respond by clicking a button or pressing a key. Plugin can validate their response, which is useful for making sure that a participant has granted consent before starting the experiment.
[free&#8209;sort](free-sort.md) | Displays a set of images on the screen in random locations. Participants can click and drag the images to move them around the screen. Records all the moves made by the participant, so the sequence of moves can be recovered from the data.
[fullscreen](fullscreen.md) | Toggles the experiment in and out of fullscreen mode.
[html&#8209;audio&#8209;response](html-audio-response.md) | Display an HTML-formatted stimulus and records an audio response via a microphone.
[html&#8209;button&#8209;response](html-button-response.md) | Display an HTML-formatted stimulus and allow the participant to respond by choosing a button to click. The button can be customized extensively, e.g., using images in place of standard buttons.
[html&#8209;keyboard&#8209;response](html-keyboard-response.md) | Display an HTML-formatted stimulus and allow the participant to respond by pressing a key.
[html&#8209;slider&#8209;response](html-slider-response.md) | Display an HTML-formatted stimulus and allow the participant to respond by moving a slider to indicate a value.
[html&#8209;video&#8209;response](html-video-response.md) | Display an HTML-formatted stimulus and records video data via a webcam.
[iat&#8209;html](iat-html.md) | The implicit association task, using HTML-formatted stimuli.
[iat&#8209;image](iat-image.md) | The implicit association task, using images as stimuli.
[image&#8209;button&#8209;response](image-button-response.md) | Display an image and allow the participant to respond by choosing a button to click. The button can be customized extensively, e.g., using images in place of standard buttons.
[image&#8209;keyboard&#8209;response](image-keyboard-response.md) | Display an image and allow the participant to respond by pressing a key.
[image&#8209;slider&#8209;response](image-slider-response.md) | Display an image and allow the participant to respond by moving a slider to indicate a value.
[initialize&#8209;camera](initialize-camera.md) | Request permission to use the participant's camera to record video and allows the participant to choose which camera to use if multiple devices are enabled. Also allows setting the mime type of the recorded video.
[initialize&#8209;microphone](initialize-microphone.md) | Request permission to use the participant's microphone to record audio and allows the participant to choose which microphone to use if multiple devices are enabled.
[instructions](instructions.md) | For displaying instructions to the participant. Allows the participant to navigate between pages of instructions using keys or buttons.
[maxdiff](maxdiff.md) | Displays rows of alternatives to be selected for two mutually-exclusive categories, typically as 'most' or 'least' on a particular criteria (e.g. importance, preference, similarity). The participant responds by selecting one radio button corresponding to an alternative in both the left and right response columns.
[mirror&#8209;camera](mirror-camera.md) | Shows a live feed of the participant's camera on the screen.
[preload](preload.md) | This plugin loads images, audio, and video files into the browser's memory before they are needed in the experiment, in order to improve stimulus and response timing, and to avoid disrupting the flow of the experiment.
[reconstruction](reconstruction.md) | The participant interacts with a stimulus by modifying a parameter of the stimulus and observing the change in the stimulus in real-time.
[resize](resize.md) | Calibrate the display so that materials display with a known physical size.
[same&#8209;different&#8209;html](same-different-html.md) | A same-different judgment task. An HTML-formatted stimulus is shown, followed by a brief gap, and then another stimulus is shown. The participant indicates whether the stimuli are the same or different.
[same&#8209;different&#8209;image](same-different-image.md) | A same-different judgment task. An image is shown, followed by a brief gap, and then another stimulus is shown. The participant indicates whether the stimuli are the same or different.
[serial&#8209;reaction&#8209;time](serial-reaction-time.md) | A set of boxes are displayed on the screen and one of them changes color. The participant presses a key that corresponds to the different color box as fast as possible.
[serial&#8209;reaction&#8209;time&#8209;mouse](serial-reaction-time-mouse.md) | A set of boxes are displayed on the screen and one of them changes color. The participants clicks the box that changed color as fast as possible.
[sketchpad](sketchpad.md) | Creates an interactive canvas that the participant can draw on using their mouse or touchscreen.
[survey&#8209;html&#8209;form](survey-html-form.md) | Renders a custom HTML form. Allows for mixing multiple kinds of form input.
[survey&#8209;likert](survey-likert.md) | Displays likert-style questions.
[survey&#8209;multi&#8209;choice](survey-multi-choice.md) | Displays multiple choice questions with one answer allowed per question.
[survey&#8209;multi&#8209;select](survey-multi-select.md) | Displays multiple choice questions with multiple answes allowed per question.
[survey&#8209;text](survey-text.md) | Shows a prompt with a text box. The participant writes a response and then submits by clicking a button.
[video&#8209;button&#8209;response](video-button-response.md) | Displays a video file with many options for customizing playback. participant responds to the video by pressing a button.
[video&#8209;keyboard&#8209;response](video-keyboard-response.md) | Displays a video file with many options for customizing playback. participant responds to the video by pressing a key.
[video&#8209;slider&#8209;response](video-slider-response.md) | Displays a video file with many options for customizing playback. participant responds to the video by moving a slider.
[virtual&#8209;chinrest](virtual-chinrest.md) | An implementation of the "virutal chinrest" procedure developed by [Li, Joo, Yeatman, and Reinecke (2020)](https://doi.org/10.1038/s41598-019-57204-1). Calibrates the monitor to display items at a known physical size by having participants scale an image to be the same size as a physical credit card. Then uses a blind spot task to estimate the distance between the participant and the display.
[visual&#8209;search&#8209;circle](visual-search-circle.md) | A customizable visual-search task modelled after [Wang, Cavanagh, & Green (1994)](http://dx.doi.org/10.3758/BF03206946). The participant indicates whether or not a target is present among a set of distractors. The stimuli are displayed in a circle, evenly-spaced, equidistant from a fixation point.
[webgazer&#8209;calibrate](webgazer-calibrate.md) | Calibrates the WebGazer extension for eye tracking.
[webgazer&#8209;init&#8209;camera](webgazer-init-camera.md) | Initializes the camera and helps the participant center their face for eye tracking.
[webgazer&#8209;validate](webgazer-validate.md) | Performs validation to measure precision and accuracy of WebGazer eye tracking predictions.
