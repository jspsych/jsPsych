# jspsych-webgazer-calibrate

This plugin can be used to calibrate the [WebGazer extension](/extensions/jspsych-ext-webgazer). For a narrative description of eye tracking with jsPsych, see the [eye tracking overview](/overview/eye-tracking). 

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
calibration_points | array | `[[10,10], [10,50], [10,90], [50,10], [50,50], [50,90], [90,10], [90,50], [90,90]]` | Array of points in `[x,y]` coordinates. Specified as a percentage of the screen width and height, from the left and top edge. The default grid is 9 points.
calibration_mode | string | `'click'` | Can specify `click` to have subjects click on calibration points or `view` to have subjects passively watch calibration points.
repetitions_per_point | numeric | 1 | The number of times to repeat the sequence of calibration points.
point_size | numeric | 20 | Diameter of the calibration points in pixels.
randomize_calibration_order | bool | `false` | Whether to randomize the order of the calibration points.
time_to_saccade | numeric | 1000 | If `calibration_mode` is set to `view`, then this is the delay before calibrating after showing a point. Gives the participant time to fixate on the new target before assuming that the participant is looking at the target.
time_per_point | numeric | 1000 | If `calibration_mode` is set to `view`, then this is the length of time to show a point while calibrating. Note that if `click` calibration is used then the point will remain on the screen until clicked.

## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------

No data currently added by this plugin. Use the [webgazer-validate](/plugins/jspsych-webgazer-validate) plugin to measure the precision and accuracy of calibration.

## Example

#### Click-based calibration with 5 points

```javascript
var calibration = {
    type: 'webgazer-calibrate',
    calibration_points: [[50,50], [25,25], [25,75], [75,25], [75,75]],
    repetitions_per_point: 2,
    randomize_calibration_order: true
  }
```

### View-based calibration with 33 points, concentrated in the center

```javascript
 var calibration = {
  type: 'webgazer-calibrate',
  calibration_points: [
    [10,10],[10,50],[10,90],
    [30,10],[30,50],[30,90],
    [40,10],[40,30],[40,40],[40,45],[40,50],[40,55],[40,60],[40,70],[40,90],
    [50,10],[50,30],[50,40],[50,45],[50,50],[50,55],[50,60],[50,70],[50,90],
    [60,10],[60,30],[60,40],[60,45],[60,50],[60,55],[60,60],[60,70],[60,90],
    [70,10],[70,50],[70,90],
    [90,10],[90,50],[90,90]
  ],
  repetitions_per_point: 1,
  randomize_calibration_order: true,
  calibration_mode: 'view',
  time_per_point: 500,
  time_to_saccade: 1000
}
```
