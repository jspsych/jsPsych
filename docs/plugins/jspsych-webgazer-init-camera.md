# jspsych-webgazer-init-camera

This plugin initializes the camera and helps the participant center their face in the camera view for using the the [WebGazer extension](/extensions/jspsych-ext-webgazer). For a narrative description of eye tracking with jsPsych, see the [eye tracking overview](/overview/eye-tracking). 

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
instructions | string | too long to put here | Instructions for the participant to follow.
button_text | string | Continue | The text for the button that participants click to end the trial.

## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
load_time | numeric | The time it took for webgazer to initialize. This can be a long time in some situations, so this value is recorded for troubleshooting when participants are reporting difficulty.

## Example

#### Parameterless use

```javascript
var init_camera = {
  type: 'webgazer-init-camera'
}
```
