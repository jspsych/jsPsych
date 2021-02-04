# Eye Tracking

jsPsych supports eye tracking through the [WebGazer](https://webgazer.cs.brown.edu/) library. WebGazer uses computer vision techniques to identify features of the participant's eyes via a webcam and predicts gaze location. The system is calibrated by having the participant click on or look at known locations on the screen. These locations are linked to eye features. Gaze location is predicted using regression.

## Getting Started

First, [download WebGazer.js ](https://webgazer.cs.brown.edu/#download) and include it in your experiment file via a `<script>` tag. You'll also need to include jsPsych's [webgazer extension](/extensions/jspsych-ext-webgazer.md).

```html
<head>
  <script src="jspsych/jspsych.js"></script>
  <script src="webgazer.js"></script>
  <script src="jspsych/extensions/jspsych-ext-webgazer.js"></script>
</head>
```

!!! tip 
    An example experiment using WebGazer is available in the **/examples** folder of the jsPsych release. See `webgazer.html`.

To use the WebGazer extension in an experiment, include it in the list of extensions passed to `jsPsych.init()`

```js
jsPsych.init({
  timeline: [...],
  extensions: [
    {type: 'webgazer'}
  ]
})
```

To help the participant position their face correctly for eye tracking you can use the [jspsych-webgazer-init-camera plugin](/plugins/jspsych-webgazer-init-camera.ms). This will show the participant what the camera sees, including facial feature landmarks, and prevent the participant from continuing until their face is in good position for eye tracking.

```js
var init_camera_trial = {
  type: 'webgazer-init-camera'
}
```

To calibrate WebGazer, you can use the [jspsych-webgazer-calibrate plugin](/plugins/jspsych-webgazer-calibrate.md). This plugin allows you to specify a set of points on the screen for calibration and to choose the method for calibrating -- either clicking on each point or simply fixating on each point. The location of calibration points is specified in percentages, e.g., `[25,50]` will result in a point that is 25% of the width of the screen from the left edge and 50% of the height of the screen from the top edge. Options for controlling other details of the calibration are explained in the [documentation for the plugin](/plugins/jspsych-webgazer-calibrate.md).

Note that instructions are not included in the calibration plugin, so you'll likely want to use a different plugin (e.g., `html-button-response`) to display instructions prior to running the calibration. 

```js
var calibration_trial = {
  type: 'webgazer-calibrate',
  calibration_points: [[25,50], [50,50], [75,50], [50,25], [50,75]],
  calibration_mode: 'click'
}
```

To measure the accuracy and precision of the calibration, you can use the [jspsych-webgazer-vaidate plugin](/plugins/jspsych-webgazer-validate.md). Like the calibration plugin, you can specify a list of points to perform validation on. Here you can specify the points as either percentages or in terms of the distance from the center of the screen in pixels. Which mode you use will probably depend on how you are defining your stimuli throughout the experiment. You can also specify the radius of tolerance around each point, and the plugin will calculate the percentage of measured gaze samples within that radius. This is a potentially useful heuristic for deciding whether or not to calibrate again. Options for controlling other details of the validation are explained in the [documentation for the plugin](/plugins/jspsych-webgazer-validate.md).

```js
var validation_trial = {
  type: 'webgazer-validate',
  validation_points: [[-200,200], [200,200],[-200,-200],[200,-200]],
  validation_point_coordinates: 'center-offset-pixels',
  roi_radius: 100
}
```

The validation procedure stores the raw gaze data for each validation point, the computed average offset from each validation point, and the percentage of samples within the `roi_radius` for each validation point.

```js
{
  raw_gaze: [...],
  percent_in_roi: [...],
  average_offset: [...]
}
```

We recommend performing calibration and validation periodically throughout your experiment.

To enable eye tracking for a trial in your experiment, you can simply add the WebGazer extension to the trial.

```js
var trial = {
  type: 'image-keyboard-response',
  stimulus: 'my-scene.png',
  extensions: ['webgazer']
}
```

This will turn on WebGazer at the start of the trial. Gaze data will be added to the trial's data under the property `webgazer_data`. The gaze data is an array of objects. Each object has an `x`, a `y`, and a `t` property. The `x` and `y` properties specify the gaze location in pixels and `t` specifies the time in milliseconds since the start of the trial. Note that establishing the precision and accuracy of these measurements across the variety of web browsers and systems that your experiment participants might be using is quite difficult. For example, different browsers may cause small systematic shifts in the accuracy of `t` values. 

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

If you have tips based on your own experience please consider sharing them on our [discussion forum](https://github.com/jspsych/jsPsych/discussions) and we'll add to this list!