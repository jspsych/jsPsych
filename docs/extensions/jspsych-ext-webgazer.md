# jspsych-ext-webgazer

This extension supports eye tracking through the [WebGazer](https://webgazer.cs.brown.edu/) library. For a narrative description of how to use this extension see the [eye tracking overview](/overview/eye-tracking.md).

## Parameters

Parameters can be set when calling `jsPsych.init()`

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

## Data Generated

Name | Type | Value
-----|------|------
webgazer_data | array | An array of objects containing gaze data for the trial. Each object has an `x`, a `y`, and a `t` property. The `x` and `y` properties specify the gaze location in pixels and `t` specifies the time in milliseconds since the start of the trial.

## Functions

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

Turns on gaze prediction. The extension will automatically handle this for you in most cases. You probably only need to use this if you are writing your own plugin that interfaces directly with webgazer.

### pause()

Turns off gaze prediction. The extension will automatically handle this for you in most cases. You probably only need to use this if you are writing your own plugin that interfaces directly with webgazer.

### stopMouseCalibration()

Stops WebGazer from using mouse movements and mouse clicks as calibration events.

### startMouseCalibration()

Turns on mouse movement and mouse clicks as calibration events.

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

