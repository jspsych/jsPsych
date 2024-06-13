# webgazer-calibrate

Current version: 1.0.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-webgazer-calibrate/CHANGELOG.md).

This plugin can be used to calibrate the [WebGazer extension](../extensions/webgazer.md). For a narrative description of eye tracking with jsPsych, see the [eye tracking overview](../overview/eye-tracking.md). 

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
calibration_points | array | `[[10,10], [10,50], [10,90], [50,10], [50,50], [50,90], [90,10], [90,50], [90,90]]` | Array of points in `[x,y]` coordinates. Specified as a percentage of the screen width and height, from the left and top edge. The default grid is 9 points.
calibration_mode | string | `'click'` | Can specify `click` to have participants click on calibration points or `view` to have participants passively watch calibration points.
repetitions_per_point | numeric | 1 | The number of times to repeat the sequence of calibration points.
point_size | numeric | 20 | Diameter of the calibration points in pixels.
randomize_calibration_order | bool | `false` | Whether to randomize the order of the calibration points.
time_to_saccade | numeric | 1000 | If `calibration_mode` is set to `view`, then this is the delay before calibrating after showing a point. Gives the participant time to fixate on the new target before assuming that the participant is looking at the target.
time_per_point | numeric | 1000 | If `calibration_mode` is set to `view`, then this is the length of time to show a point while calibrating. Note that if `click` calibration is used then the point will remain on the screen until clicked.

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------

No data currently added by this plugin. Use the [webgazer-validate](webgazer-validate.md) plugin to measure the precision and accuracy of calibration.

## Simulation Mode

This plugin does not yet support [simulation mode](../overview/simulation.md).

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-webgazer-calibrate@1.0.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-webgazer-calibrate.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-webgazer-calibrate
```
```js
import webgazerCalibrate from '@jspsych/plugin-webgazer-calibrate';
```

## Example

Because the eye tracking plugins need to be used in conjunction with each other, please see the [example on the eye tracking overview page](../overview/eye-tracking.md#example) for an integrated example. 

