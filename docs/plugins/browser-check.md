# browser-check

{{ plugin_meta('browser-check') }}
{{ plugin_description('browser-check') }}
{{ plugin_parameters('browser-check') }}

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

{{ plugin_installation('browser-check') }}

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
