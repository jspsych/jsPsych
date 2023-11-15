# webgazer-init-camera

Current version: 1.0.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-webgazer-init-camera/CHANGELOG.md).

This plugin initializes the camera and helps the participant center their face in the camera view for using the the [WebGazer extension](../extensions/webgazer.md). For a narrative description of eye tracking with jsPsych, see the [eye tracking overview](../overview/eye-tracking.md). 

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
instructions | string | too long to put here | Instructions for the participant to follow.
button_text | string | Continue | The text for the button that participants click to end the trial.

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
load_time | numeric | The time it took for webgazer to initialize. This can be a long time in some situations, so this value is recorded for troubleshooting when participants are reporting difficulty.

## Simulation Mode

This plugin does not yet support [simulation mode](../overview/simulation.md).

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-webgazer-init-camera@1.0.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-webgazer-init-camera.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-webgazer-init-camera
```
```js
import webgazerInitCamera from '@jspsych/plugin-webgazer-init-camera';
```

## Example

Because the eye tracking plugins need to be used in conjunction with each other, please see the [example on the eye tracking overview page](../overview/eye-tracking.md#example) for an integrated example. 
