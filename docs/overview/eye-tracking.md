# Eye Tracking

jsPsych supports eye tracking through the [WebGazer](https://webgazer.cs.brown.edu/) library. WebGazer uses computer vision techniques to identify features of the participant's eyes via a webcam and predicts gaze location. The system is calibrated by having the participant click on or look at known locations on the screen. These locations are linked to eye features. Gaze location is predicted using regression.

## Getting Started

### Load webgazer.js

The [official version of WebGazer](https://webgazer.cs.brown.edu/#download) is currently **not** supported by jsPsych. Our [fork of the library](https://github.com/jspsych/WebGazer) contains some minor improvements aimed at the kind of experiments that jsPsych is typically used for, e.g., situations in which the timing of display screens needs to be accurate. 

A copy of our fork is included in the jsPsych release, in the `/examples/js/webgazer` folder. You will need to copy this folder into your project directory. This guide will assume that the folder is located at `/js/webgazer`, but you can change the path as you'd like. 

Include the `webgazer.js` file in your experiment via a `<script>` tag. 

```html
<head>
  <script src="jspsych/jspsych.js"></script>
  <script src="js/webgazer/webgazer.js"></script>
</head>
```

### Load the jsPsych webgazer extension

The [webgazer extension](/extensions/jspsych-ext-webgazer.md) adds functionality to jsPsych for interacting with webgazer. Load it like you would a plugin file.


```html
<head>
  <script src="jspsych/jspsych.js"></script>
  <script src="webgazer.js"></script>
  <script src="jspsych/extensions/jspsych-ext-webgazer.js"></script>
</head>
```

To use the WebGazer extension in an experiment, include it in the list of extensions passed to `jsPsych.init()`

```js
jsPsych.init({
  timeline: [...],
  extensions: [
    {type: 'webgazer'}
  ]
})
```


!!! tip 
    Example experiments using WebGazer are available in the **/examples** folder of the jsPsych release. See `webgazer.html`, `webgazer_image.html`, and `webgazer_audio.html`.

### Initialize the camera

To help the participant position their face correctly for eye tracking you can use the [jspsych-webgazer-init-camera plugin](/plugins/jspsych-webgazer-init-camera.ms). This will show the participant what the camera sees, including facial feature landmarks, and prevent the participant from continuing until their face is in good position for eye tracking. This plugin will also trigger the experiment to request permission to access the user's webcam if it hasn't already been granted.


```js
var init_camera_trial = {
  type: 'webgazer-init-camera'
}
```


### Calibration

To calibrate WebGazer, you can use the [jspsych-webgazer-calibrate plugin](/plugins/jspsych-webgazer-calibrate.md). This plugin allows you to specify a set of points on the screen for calibration and to choose the method for calibrating -- either clicking on each point or simply fixating on each point. The location of calibration points is specified in percentages, e.g., `[25,50]` will result in a point that is 25% of the width of the screen from the left edge and 50% of the height of the screen from the top edge. Options for controlling other details of the calibration are explained in the [documentation for the plugin](/plugins/jspsych-webgazer-calibrate.md).

Note that instructions are not included in the calibration plugin, so you'll likely want to use a different plugin (e.g., `html-button-response`) to display instructions prior to running the calibration. 

```js
var calibration_trial = {
  type: 'webgazer-calibrate',
  calibration_points: [[25,50], [50,50], [75,50], [50,25], [50,75]],
  calibration_mode: 'click'
}
```


### Validation

To measure the accuracy and precision of the calibration, you can use the [jspsych-webgazer-vaidate plugin](/plugins/jspsych-webgazer-validate.md). Like the calibration plugin, you can specify a list of points to perform validation on. Here you can specify the points as either percentages or in terms of the distance from the center of the screen in pixels. Which mode you use will probably depend on how you are defining your stimuli throughout the experiment. You can also specify the radius of tolerance around each point, and the plugin will calculate the percentage of measured gaze samples within that radius. This is a potentially useful heuristic for deciding whether or not to calibrate again. Options for controlling other details of the validation are explained in the [documentation for the plugin](/plugins/jspsych-webgazer-validate.md).


```js
var validation_trial = {
  type: 'webgazer-validate',
  validation_points: [[-200,200], [200,200],[-200,-200],[200,-200]],
  validation_point_coordinates: 'center-offset-pixels',
  roi_radius: 100
}
```

The validation procedure stores the raw gaze data for each validation point, the computed average offset from each validation point, the percentage of samples within the `roi_radius` for each validation point, and the number of samples collected per second.

```js
{
  raw_gaze: [...],
  percent_in_roi: [...],
  average_offset: [...],
  samples_per_sec: ...
}
```

We recommend performing calibration and validation periodically throughout your experiment.

### Adding eye tracking to a trial

To enable eye tracking for a trial in your experiment, you can simply add the WebGazer extension to the trial.

```js
var trial = {
  type: 'html-keyboard-response',
  stimulus: '<img id="scene" src="my-scene.png"></img>',
  extensions: [
    {
      type: 'webgazer', 
      params: { 
        targets: ['#scene']
      }
    }
  ]
}
```

This will turn on WebGazer at the start of the trial. 

The `params` property in the `extensions` declaration allows you to pass in a list of [CSS selector strings](https://www.w3schools.com/cssref/css_selectors.asp). The [bounding rectangle](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) of the DOM element that matches each selector will be recorded in the data for that trial. This allows for easy alignment of the gaze data and objects on the screen.

```js
webgazer_targets : {
  'selector': {x: ..., y: ..., height: ..., width: ..., top: ..., left: ..., right: ..., bottom:...}
  'selector': {x: ..., y: ..., height: ..., width: ..., top: ..., left: ..., right: ..., bottom:...}
}
```

Gaze data will be added to the trial's data under the property `webgazer_data`. The gaze data is an array of objects. Each object has an `x`, a `y`, and a `t` property. The `x` and `y` properties specify the gaze location in pixels and `t` specifies the time in milliseconds since the start of the trial. Note that establishing the precision and accuracy of these measurements across the variety of web browsers and systems that your experiment participants might be using is quite difficult. For example, different browsers may cause small systematic shifts in the accuracy of `t` values. 

```js
webgazer_data: [
  {x: ..., y: ..., t: ...},
  {x: ..., y: ..., t: ...},
  {x: ..., y: ..., t: ...},
  {x: ..., y: ..., t: ...}
]
```

## Tips for Improving Data Quality

These are some anecdotal observations about factors that improve data quality.

1. The quality of the camera feed is essential. Good lighting makes a big difference. You may want to encourage participants to perform any eye tracking experiments in a well-lit room.
2. Participants need to keep their head relatively still during and after calibration. The calibration is not robust to head movements.
3. WebGazer's click-based calibration can be used throughout the experiment. You can turn this on by calling `jsPsych.extensions.webgazer.startMouseCalibration()` at any point in the experiment. If you use a continue button to advance through the experiment and move the location of the continue button around you can be making small adjustments to the calibration throughout. 
4. Computing the gaze predictions consumes more computational resources than most other things that jsPsych is typically used for. The sampling rate that WebGazer is able to achieve will depend on the computing power of the participant's device. You may want to ask the participant to close any non-essential software and browser windows prior to completing the experiment. You may also want to check that the sampling rate is sufficiently high as part of validation.

If you have tips based on your own experience please consider sharing them on our [discussion forum](https://github.com/jspsych/jsPsych/discussions) and we'll add to this list!

## Example

The code below shows a basic example of what it looks like when you put all of these things together in your experiment's HTML file.

```html
<html>
<head>
    <script src="jspsych/jspsych.js"></script>
    <script src="jspsych/plugins/jspsych-preload.js"></script>
    <script src="jspsych/plugins/jspsych-image-keyboard-response.js"></script>
    <script src="jspsych/plugins/jspsych-html-keyboard-response.js"></script>
    <script src="jspsych/plugins/jspsych-webgazer-init-camera.js"></script>
    <script src="jspsych/plugins/jspsych-webgazer-calibrate.js"></script>
    <script src="jspsych/plugins/jspsych-webgazer-validation.js"></script>
    <script src="js/webgazer/webgazer.js"></script>
    <script src="jspsych/extensions/jspsych-ext-webgazer.js"></script>
    <link rel="stylesheet" href="jspsych/css/jspsych.css">
</head>
<body></body>
<script>

var preload = {
  type: 'preload',
  images: ['img/blue.png']
}

var init_camera = {
  type: 'webgazer-init-camera'
}

var calibration = {
  type: 'webgazer-calibrate'
}

var validation = {
  type: 'webgazer-validate'
}

var start = {
  type: 'html-keyboard-response',
  stimulus: 'Press any key to start.'
}

var trial = {
  type: 'image-keyboard-response',
  stimulus: 'img/blue.png',
  choices: jsPsych.NO_KEYS,
  trial_duration: 1000,
  extensions: [
    {
      type: 'webgazer', 
      params: {targets: ['#jspsych-image-keyboard-response-stimulus']}
    }
  ]
}

jsPsych.init({
  timeline: [init_camera, calibration, validation, start, trial],
  preload_images: ['img/blue.png'],
  extensions: [
    {type: 'webgazer'}
  ]
})

</script>
</html>
```

Below is example data from the image-keyboard-response trial taken from the experiment above. In addition to the standard data that is collected for this plugin, you can see the additional `webgazer_data` and `webgazer_targets` arrays. The `webgazer_data` shows 21 gaze location estimates during the 1-second image presentation. The `webgazer_targets` array shows that there was one target, the image-keyboard-response stimulus, and tells you the x- and y-coordinate boundaries for the target (image) rectangle. By comparing each of the x/y locations from the `webgazer_data` locations array with the target boundaries in `webgazer_targets`, you can determine if/when the estimated gaze location was inside the target area.

```js
{
  "rt": null,
  "stimulus": "img/blue.png",
  "response": null,
  "trial_type": "image-keyboard-response",
  "trial_index": 4,
  "time_elapsed": 30701,
  "internal_node_id": "0.0-4.0",
  "webgazer_data": [
    { "x": 1065, "y": 437, "t": 39},
    { "x": 943, "y": 377, "t": 79},
    { "x": 835, "y": 332, "t": 110},
    { "x": 731, "y": 299, "t": 146},
    { "x": 660, "y": 271, "t": 189},
    { "x": 606, "y": 251, "t": 238},
    { "x": 582, "y": 213, "t": 288},
    { "x": 551, "y": 200, "t": 335},
    { "x": 538, "y": 183, "t": 394},
    { "x": 514, "y": 177, "t": 436},
    { "x": 500, "y": 171, "t": 493},
    { "x": 525, "y": 178, "t": 542},
    { "x": 537, "y": 182, "t": 592},
    { "x": 543, "y": 178, "t": 633},
    { "x": 547, "y": 177, "t": 691},
    { "x": 558, "y": 174, "t": 739},
    { "x": 574, "y": 183, "t": 789},
    { "x": 577, "y": 197, "t": 838},
    { "x": 584, "y": 214, "t": 889},
    { "x": 603, "y": 218, "t": 937},
    { "x": 606, "y": 221, "t": 987}
  ],
  "webgazer_targets": [
    "#jspsych-image-keyboard-response-stimulus": {
      "x": 490,
      "y": 135,
      "height": 300,
      "width": 300,
      "top": 135,
      "bottom": 435,
      "left": 490,
      "right": 790
    }
  ]
}
```