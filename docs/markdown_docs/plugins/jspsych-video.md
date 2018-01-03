# jspsych-video plugin

This plugin is for showing a video. No responses are recorded. The trial concludes when the video finishes.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
sources | array | *undefined* | An array of file paths to the video. You can specify multiple formats of the same video (e.g., .mp4, .ogg, .webm) to maximize the [cross-browser compatibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats). Usually .mp4 is a safe option. The player will use the first source file in the array that is compatible with the browser, so specify the files in order of preference.
width | numeric | width of the video file | The width of the video display in pixels.
height | numeric | heigh of the video file | The height of the video display in pixels.
prompt | string | empty string | A message (any valid HTML) to display beneath the video element.
autoplay | boolean | true | If true, the video will begin playing as soon as it has loaded.
controls | boolean | false | If true, controls for the video player will be available to the subject. They will be able to pause the video or move the playback to any point in the video.
start | numeric | null | If given a value, the video will start at this time point in seconds.
stop| numeric | null | If given a value, the video will stop at this time point in seconds.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
stimulus | string | JSON encoding of the `sources` array.

## Example

```javascript
var trial = {
	type: 'video',
	sources: ['video/sample_video.mp4']
}
```
