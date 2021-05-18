# jspsych-webgazer-validate

This plugin can be used to measure the accuracy and precision of gaze predictions made by the [WebGazer extension](/extensions/jspsych-ext-webgazer). For a narrative description of eye tracking with jsPsych, see the [eye tracking overview](/overview/eye-tracking). 

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
validation_points | array | `[[10,10], [10,50], [10,90], [50,10], [50,50], [50,90], [90,10], [90,50], [90,90]]` | Array of points in `[x,y]` coordinates. The default grid is 9 points. Meaning of coordinates controlled by `validation_point_coordinates` parameter.
validation_point_coordinates | string | `'percent'` | Can specify `percent` to have validation point coordinates specified in percentage of screen width and height, or `center-offset-pixels` to specify each point as the distance in pixels from the center of the screen.
roi_radius | numeric | 200 | Tolerance around the validation point in pixels when calculating the percent of gaze measurements within the acceptable range.
repetitions_per_point | numeric | 1 | The number of times to repeat the sequence of calibration points.
randomize_validation_order | bool | `false` | Whether to randomize the order of the validation points.
time_to_saccade | numeric | 1000 | The delay before validating after showing a point. Gives the participant time to fixate on the new target before assuming that the participant is looking at the target.
validation_duration | numeric | 2000 | If `calibration_mode` is set to `view`, then this is the length of time to show a point while calibrating. Note that if `click` calibration is used then the point will remain on the screen until clicked.
point_size | numeric | 20 | Diameter of the validation points in pixels.
show_validation_data | bool | false | If `true` then a visualization of the validation data will be shown on the screen after the validation is complete. This will show each measured gaze location color coded by whether it is within the `roi_radius` of the target point. This is mainly intended for testing and debugging.

## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
raw_gaze | array | Raw gaze data for the trial. The array will contain a nested array for each validation point. Within each nested array will be a list of `{x,y,dx,dy}` values specifying the absolute x and y pixels, as well as the distance from the target for that gaze point.
percent_in_roi | array | The percentage of samples within the `roi_radius` for each validation point.
average_offset | array | The average `x` and `y` distance from each validation point, plus the median distance `r` of the points from this average offset.
samples_per_sec | numeric | The average number of samples per second. Calculated by finding samples per second for each point and then averaging these estimates together.
validation_points | array | The list of validation points, in the order that they appeared.

## Example

#### 4 point validation using center offset mode

```javascript
var validation = {
  type: 'webgazer-validate',
  validation_points: [[-200,-200], [-200,200], [200,-200], [200,200]],
  validation_point_coordinates: 'center-offset-pixels',
  show_validation_data: true
}
```
