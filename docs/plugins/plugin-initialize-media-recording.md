# plugin-initialize-media-recording

## Overview

The `plugin-initialize-media-recording` plugin integrates the functionality of both the `initialize-microphone` and `initialize-camera` jsPsych plugins into a single, unified trial. This makes it easier to manage media permissions when both microphone and camera are required, and provides a consistent interface for participants to select their preferred devices.

When either a microphone or camera (or both) are requested, the plugin:

- Prompts the participant to grant permission to access the corresponding device(s).
- Allows device selection if multiple input options are available.
- Provides customizable instructional messages and button labels.
- Offers support for configuring resolution constraints (min/max height/width).
- Supports choosing whether to include camera audio when initializing the camera.

Once initialized, the selected devices can be accessed later in the experiment using the appropriate plugins, such as:

- [`html-video-response`](https://www.jspsych.org/v8/plugins/html-video-response/)
- [`html-audio-response`](https://www.jspsych.org/v8/plugins/html-audio-response/)

## Loading (Note: these CDN resources don't currently exist... but maybe will eventually?)

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-initialize-media-recording@VERSION_HERE"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-initialize-media-recording.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-initialize-media-recording
```

```js
import jsPsychPluginInitializeMediaRecording from "@jspsych/plugin-initialize-media-recording";
```

## Compatibility

`plugin-initialize-media-recording` requires jsPsych v8.0.0 or later.

## Parameters

| Name                        | Type        | Default                                                      | Description                                                                                                                          |
| --------------------------- | ----------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `initialize_microphone`     | boolean     | `false`                                                      | Whether to initialize the microphone.                                                                                                |
| `microphone_select_message` | HTML string | `<p>Please select the microphone you would like to use.</p>` | Message displayed above the microphone dropdown menu.                                                                                |
| `microphone_button_label`   | string      | `"Use this microphone"`                                      | Label for the microphone selection button.                                                                                           |
| `initialize_camera`         | boolean     | `false`                                                      | Whether to initialize the camera.                                                                                                    |
| `camera_select_message`     | HTML string | `<p>Please select the camera you would like to use.</p>`     | Message displayed above the camera dropdown menu.                                                                                    |
| `camera_button_label`       | string      | `"Use this camera"`                                          | Label for the camera selection button.                                                                                               |
| `include_camera_audio`      | boolean     | `false`                                                      | If true, includes audio when recording video with the camera.                                                                        |
| `width`                     | integer     | `null`                                                       | Requested width of the camera video stream. If `null`, the browser default is used.                                                  |
| `height`                    | integer     | `null`                                                       | Requested height of the camera video stream. If `null`, the browser default is used.                                                 |
| `min_width`                 | integer     | `640`                                                        | Minimum width of the video stream.                                                                                                   |
| `max_width`                 | integer     | `null`                                                       | Maximum width of the video stream.                                                                                                   |
| `min_height`                | integer     | `400`                                                        | Minimum height of the video stream.                                                                                                  |
| `max_height`                | integer     | `null`                                                       | Maximum height of the video stream.                                                                                                  |
| `mime_type`                 | string      | `null`                                                       | Preferred MIME type for recorded media (e.g., `"video/webm"` or `"video/x-matroska"`). If `null`, the browser chooses automatically. |
| `permission_reject_message` | string      | `null`                                                       | Optional message to display if the participant denies camera or microphone access.                                                   |

## Data Generated

This plugin records the selected device IDs, which can be useful for diagnostics or ensuring consistent device usage in subsequent trials.

```json
{
  "microphone_device_id": "default:12345abcde",
  "camera_device_id": "facecamHD:98765zyxwv"
}
```

## Documentation

See [documentation](https://github.com/themusiclab/pose/tree/main/test/plugin-initialize-media-recording/README.md)

## Author / Citation

[Courtney B. Hilton](https://github.com/courtney-bryce-hilton)
