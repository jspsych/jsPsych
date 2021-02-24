# jspsych-ext-webgazer

This extension supports eye tracking through the [WebGazer](https://webgazer.cs.brown.edu/) library. For a narrative description of how to use this extension see the [eye tracking overview](../overview/eye-tracking.md).

## Parameters

### Initialization Parameters

Initialization parameters can be set when calling `jsPsych.init()`

```js
jsPsych.init({
  extensions: [
    {type: 'webgazer', params: {...}}
  ]
})
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
webgazer  | object | `undefined` | You can explicitly pass a reference to a loaded instance of the webgazer.js library. If no explicit reference is passed then the extension will look for a global `webgazer` object. If you are loading webgazer.js via a `<script>` tag you do not need to set this parameter in most circumstances.
round_predictions | bool | true | Whether to round the `x`,`y` coordinates predicted by WebGazer to the nearest whole number. This *greatly* reduces the size of the data, as WebGazer records data to 15 decimal places by default. Given the noise of the system, there's really no need to record data to this level of precision.

### Trial Parameters

Trial parameters can be set when adding the extension to a trial object.

```js
var trial = {
  type: '...',
  extensions: [
    {type: 'webgazer', params: {...}}
  ]
}
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
targets | array | [] | A list of elements on the page that you would like to record the coordinates of for comparison with the WebGazer data. Each entry in the array should be a valid [CSS selector string](https://www.w3schools.com/cssref/css_selectors.asp) that identifies the element. The selector string should be valid for exactly one element on the page. If the selector is valid for more than one element then only the first matching element will be recorded.

## Data Generated

Name | Type | Value
-----|------|------
webgazer_data | array | An array of objects containing gaze data for the trial. Each object has an `x`, a `y`, and a `t` property. The `x` and `y` properties specify the gaze location in pixels and `t` specifies the time in milliseconds since the start of the trial.
webgazer_targets | array | An array of objects contain the pixel coordinates of elements on the screen specified by the `.targets` parameter. Each object contains a `selector` property, containing the CSS selector string used to find the element, plus `top`, `bottom`, `left`, and `right` parameters which specify the [bounding rectangle](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) of the element. 

## Functions

In addition to the jsPsych webgazer-* plugins, the jsPsych webgazer extension provides a set of functions that allow the researcher to interact more directly with WebGazer. These functions can be called at any point during an experiment, and are crucial for building trial plugins that interact with WebGazer. All of the functions below must be prefixed with `jsPsych.extensions.webgazer` (e.g. `jsPsych.extensions.webgazer.faceDetected()`).

### faceDetected()

Returns `true` if WebGazer is ready to make predictions (`webgazer.getTracker().predictionReady` is `true`).

### showPredictions()

Turns on WebGazer's real-time visualization of predicted gaze location.

### hidePredictions()

Turns off WebGazer's real-time visualization of predicted gaze location.

### showVideo()

Turns on a display of the webcam image, guiding box for positioning the face, and WebGazer's estimate of the location of facial landmarks.

### hideVideo()

Turns off the camera display.

### resume()

Turns on gaze prediction. The extension will automatically handle this for you in most cases. You probably only need to use this if you are writing your own plugin that interfaces directly with WebGazer.

### pause()

Turns off gaze prediction. The extension will automatically handle this for you in most cases. You probably only need to use this if you are writing your own plugin that interfaces directly with WebGazer.

### startMouseCalibration()

Turns on mouse movement and mouse clicks as calibration events. While the `webgazer-calibration` plugin can also be used to run a parmeterized calibration routine, this calibration function call allows you to continuously calibrate WebGazer to any mouse movements or clicks throughout the experiment. For example, any *-button-response trial would also function as a WebGazer calibration event. 

### stopMouseCalibration()

Stops WebGazer from using mouse movements and mouse clicks as calibration events.

### calibratePoint(x, y)

Instructs WebGazer to register the location `x`, `y` (in screen pixel coordinates) as a calibration event. Can be used for passive viewing calibration, i.e., instructing participants to fixate at a particular location.

### setRegressionType(regression_type)

Change the method that WebGazer is using to perform feature -> location regression. Valid options are `ridge`, `weightedRidge`, and `threadedRidge`. See the WebGazer docs for more information about these options.
The extension uses the default mode specified by WebGazer (currently `ridge`).

### getCurrentPrediction()

Get the current predicted gaze location from WebGazer. Returns an object with `x`, `y`, and `eyeFeature` properties. This function is asynchronus, so proper use requires either the `await` keyword in the context of another `async function` or using `.then()`. 

```js
jsPsych.extensions.webgazer.getCurrentPrediction().then(function(data){
  console.log(`Currently looking at coordinate ${data.x}, ${data.y}`)
});
```

