# browser-check

Current version: 1.0.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-browser-check/CHANGELOG.md).

This plugin measures and records various features of the participant's browser and can end the experiment if defined inclusion criteria are not met.

The plugin currently can record the following features:

* The width and height of the browser window in pixels.
* The type of browser used (e.g., Chrome, Firefox, Edge, etc.) and the version number of the browser.*
* Whether the participant is using a mobile device.*
* The operating system.*
* Support for the WebAudio API.
* Support for the Fullscreen API, e.g., through the [fullscreen plugin](../plugins/fullscreen.md).
* The display refresh rate in frames per second.
* Whether the device has a webcam and microphone. Note that this only reveals whether a webcam/microphone exists. The participant still needs to grant permission in order for the experiment to use these devices.

!!! warning
    Features with an * are recorded by parsing the [user agent string](https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent). 
    This method is accurate most of the time, but is not guaranteed to be correct. 
    The plugin uses the [detect-browser package](https://github.com/DamonOehlman/detect-browser) to perform user agent parsing. 
    You can find a list of supported browsers and OSes in the [source file](https://github.com/DamonOehlman/detect-browser/blob/master/src/index.ts).

The plugin begins by measuring the set of features requested. 
An inclusion function is evaluated to see if the paricipant passes the inclusion criteria. 
If they do, then the trial ends and the experiment continues. 
If they do not, then the experiment ends immediately. 
If a minimum width and/or minimum height is desired, the plugin will optionally display a message to participants whose browser windows are too small to give them an opportunity to make the window larger if possible. 
See the examples below for more guidance.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter                      | Type             | Default Value | Description                              |
| ------------------------------ | ---------------- | ------------- | ---------------------------------------- |
| features | array of strings | `["width", "height", "webaudio", "browser", "browser_version", "mobile", "os", "fullscreen", "vsync_rate", "webcam", "microphone"]` | The list of browser features to record. The default value includes all of the available options. |
| skip_features | array of strings | `[]` | Any features listed here will be skipped, even if they appear in `features`. Use this when you want to run most of the defaults.
| vsync_frame_count | int | 60 | The number of frames to sample when measuring the display refresh rate (`"vsync_rate"`). Increasing the number will potenially improve the stability of the estimate at the cost of increasing the amount of time the plugin takes during this test. On most devices, 60 frames takes about 1 second to measure.
| allow_window_resize | bool | true | Whether to allow the participant to resize the browser window if the window is smaller than `minimum_width` and/or `minimum_height`. If `false`, then the `minimum_width` and `minimum_height` parameters are ignored and you can validate the size in the `inclusion_function`.
| minimum_height | int | 0 | If `allow_window_resize` is `true`, then this is the minimum height of the window (in pixels) that must be met before continuing.
| minimum_width | int | 0 | If `allow_window_resize` is `true`, then this is the minimum width of the window (in pixels) that must be met before continuing.
| window_resize_message | string | see description | The message that will be displayed during the interactive resize when `allow_window_resize` is `true` and the window is too small. If the message contains HTML elements with the special IDs `browser-check-min-width`, `browser-check-min-height`, `browser-check-actual-height`, and/or `browser-check-actual-width`, then the contents of those elements will be dynamically updated to reflect the `minimum_width`, `minimum_height` and measured width and height of the browser. The default message is: `<p>Your browser window is too small to complete this experiment. Please maximize the size of your browser window. If your browser window is already maximized, you will not be able to complete this experiment.</p><p>The minimum window width is <span id="browser-check-min-width"></span> px.</p><p>Your current window width is <span id="browser-check-actual-width"></span> px.</p><p>The minimum window height is <span id="browser-check-min-height"></span> px.</p><p>Your current window height is <span id="browser-check-actual-height"></span> px.</p>`.
resize_fail_button_text | string | `"I cannot make the window any larger"` | During the interactive resize, a button with this text will be displayed below the `window_resize_message` for the participant to click if the window cannot meet the minimum size needed. When the button is clicked, the experiment will end and `exclusion_message` will be displayed.
inclusion_function | function | `() => { return true; }` | A function that evaluates to `true` if the browser meets all of the inclusion criteria for the experiment, and `false` otherwise. The first argument to the function will be an object containing key value pairs with the measured features of the browser. The keys will be the same as those listed in `features`. See example below.
exclusion_message | function | `() => { return <p>Your browser does not meet the requirements to participate in this experiment.</p> }` | A function that returns the message to display if `inclusion_function` evaluates to `false` or if the participant clicks on the resize fail button during the interactive resize. In order to allow customization of the message, the first argument to the function will be an object containing key value pairs with the measured features of the browser. The keys will be the same as those listed in `features`. See example below.

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name         | Type    | Value                                    |
| ------------ | ------- | ---------------------------------------- |
| width | int | The width of the browser window in pixels. If interactive resizing happens, this is the width *after* resizing.
| height | int | The height of the browser window in pixels. If interactive resizing happens, this is the height *after* resizing.
| browser | string | The browser used.
| browser_version | string | The version number of the browser.
| os | string | The operating system used.
| mobile | bool | Whether the browser is a mobile device.
| webaudio | bool | Whether the browser supports the WebAudio API.
| fullscreen | bool | Whether the browser supports the Fullscreen API.
| vsync_rate | number | An estimate of the refresh rate of the screen, in frames per second.
| webcam | bool | Whether there is a webcam device available. Note that the participant still must grant permission to access the device before it can be used.
| microphone | bool | Whether there is an audio input device available. Note that the participant still must grant permission to access the device before it can be used.

Note that all of these values are only recorded when the corresponding key is included in the `features` parameter for the trial.

## Simulation Mode 

In [simulation mode](../overview/simulation.md) the plugin will report the actual features of the browser, with the exception of `vsync_rate`, which is always 60. 

In `data-only` mode, if `allow_window_resize` is true and the browser's width and height are below the maximum value then the reported width and height will be equal to `minimum_width` and `minimum_height`, as if the participant resized the browser to meet the specifications.

In `visual` mode, if `allow_window_resize` is true and the browser's width and height are below the maximum value then the experiment will wait for 3 seconds before clicking the resize fail button. During this time, you can adjust the window if you would like to.

As with all simulated plugins, you can override the default (actual) data with fake data using `simulation_options`. This allows you to test your exclusion criteria by simulating other configurations.

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-browser-check@1.0.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-browser-check.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-browser-check
```
```js
import browserCheck from '@jspsych/plugin-browser-check';
```

## Examples

???+ example "Recording all of the available features, no exclusions"
    === "Code"
        ```javascript
        var trial = {
          type: jsPsychBrowserCheck
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-browser-check-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-browser-check-demo1.html">Open demo in new tab</a>

???+ example "Using the inclusion function to mandate the use of Chrome or Firefox as the browser"
    === "Code"
        ```javascript
        var trial = {
          type: jsPsychBrowserCheck,
          inclusion_function: (data) => {
            return ['chrome', 'firefox'].includes(data.browser);
          },
          exclusion_message: (data) => {
            return `<p>You must use Chrome or Firefox to complete this experiment.</p>`
          },
        };
        ``` 

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-browser-check-demo2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-browser-check-demo2.html">Open demo in new tab</a>

???+ example "Setting a minimum window height & width, with the option to resize the window"
    === "Code"
        ```javascript
        var trial = {
          type: jsPsychBrowserCheck,
          minimum_width: 1000,
          minimum_height: 600
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <p>This demo only works in a resizable window. Please <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-browser-check-demo3.html"> open it in new tab</a>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-browser-check-demo3.html">Open demo in new tab</a>

???+ example "Custom exclusion message based on measured features"
    === "Code"
        ```javascript
        var trial = {
          type: jsPsychBrowserCheck,
          inclusion_function: (data) => {
            return data.browser == 'chrome' && data.mobile === false
          },
          exclusion_message: (data) => {
            if(data.mobile){
              return '<p>You must use a desktop/laptop computer to participate in this experiment.</p>';
            } else if(data.browser !== 'chrome'){
              return '<p>You must use Chrome as your browser to complete this experiment.</p>'
            }
          }
        };
        ``` 

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-browser-check-demo4.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-browser-check-demo4.html">Open demo in new tab</a>
