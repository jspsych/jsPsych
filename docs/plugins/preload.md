# preload

Current version: 1.1.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-preload/CHANGELOG.md).

This plugin loads images, audio, and video files. It is used for loading files into the browser's memory before they are needed in the experiment, in order to improve stimulus and response timing, and avoid disruption to the experiment flow. We recommend using this plugin anytime you are loading media files, and especially when your experiment requires large and/or many media files. See the [Media Preloading page](../overview/media-preloading.md) for more information.

The preload trial will end as soon as all files have loaded successfully. The trial will end or stop with an error message when one of these two scenarios occurs (whichever comes first): (a) all files have not finished loading when the `max_load_time` duration is reached, or (b) all file requests have responded with either a load or fail event, and one or more files has failed to load. The `continue_after_error` parameter determines whether the trial will stop with an error message or end (allowing the experiment to continue) when preloading is not successful.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. While there are no specific parameters that are required, the plugin expects to be given a set of files to load through one or more of the following parameters: `auto_preload` or `trials` (for automatic loading), and/or `images`, `audio`, `video` (for manual loading). To automatically load files based on a timeline of trials, either set the `auto_preload` parameter is `true` (to load files based on the main timeline passed to `jsPsych.run`) or use the `trials` parameter to load files based on a specific subset of trials. To manually load a set of files, use the `images`, `audio`, and `video` parameters. You can combine automatic and manual loading methods in a single preload trial.

All other parameters can be left unspecified if the default value is acceptable.

| Parameter             | Type           | Default Value                    | Description                              |
| --------------------- | -------------- | -------------------------------- | ---------------------------------------- |
| auto_preload          | boolean        | false                            | If `true`, the plugin will preload any files that can be automatically preloaded based on the main experiment timeline that is passed to `jsPsych.run`. If `false`, any file(s) to be preloaded should be specified by passing a timeline array to the `trials` parameter and/or an array of file paths to the `images`, `audio`, and/or `video` parameters. Setting this parameter to `false` is useful when you plan to preload your files in smaller batches throughout the experiment. |
| trials                | timeline array | []                               | An array containing one or more jsPsych trial or timeline objects. This parameter is useful when you want to automatically preload stimuli files from a specific subset of the experiment. See [Creating an Experiment: The Timeline](../overview/timeline.md) for information on constructing timelines. |
| images                | array          | []                               | Array containing file paths for one or more image files to preload. This option is typically used for image files that can't be automatically preloaded from the timeline. |
| audio                 | array          | []                               | Array containing file paths for one or more audio files to preload. This option is typically used for audio files that can't be automatically preloaded from the timeline. |
| video                 | array          | []                               | Array containing file paths for one or more video files to preload. This option is typically used for video files that can't be automatically preloaded from the timeline. |
| message               | HTML string    | null                             | HTML-formatted message to show above the progress bar while the files are loading. If `null`, then no message is shown. |
| show_progress_bar     | boolean        | true                             | If `true`, a progress bar will be shown while the files are loading. If `false`, no progress bar is shown. |
| continue_after_error  | boolean        | false                            | If `false`, then the experiment will stop during this trial if either (a) one or more of the files fails to load, and/or (b) all files do not finish loading before the `max_load_time` duration is reached. The trial will display the `error_message`, as well as the detailed error messages if `show_detailed_errors` is `true`. If `true`, the experiment will continue even if loading fails or times out, and information about loading success/failure will be stored in the trial data (see "Data Generated" below). |
| error_message         | HTML string    | 'The experiment failed to load.' | HTML-formatted message to be shown on the page after loading fails or times out. Only applies when `continue_after_error` is `false`. |
| show_detailed_errors  | boolean        | false                            | If `true`, and if `continue_after_error` is `false`, then a list of detailed errors will be shown below the `error_message`. This list will contain the file paths for any files that produced a loading failure, as well as a message indicating that loading timed out, if that was the case. This setting is intended to help the researcher with testing/debugging. If `false`, and if `continue_after_error` is `false`, then only the `error_message` will be shown if loading fails or times out. |
| max_load_time         | numeric        | null                             | Duration to wait, in milliseconds, for all files to load before loading times out. If one or more files has not finished loading within this time limit, then the trial will stop with an error (if `continue_after_error` is `false`), or the trial will end with information about the loading time-out in the trial data (see "Data Generated" below). If `null`, the trial will wait indefinitely for all files to either load or produce an error. |
| on_error              | function       | null                             | Function to be called immediately after a file loading request has returned an error. The function receives a single argument, which is the file path that produced the error. This callback is cancelled as soon as the trial ends. See example below. |
| on_success            | function       | null                             | Function to be called immediately after a file has successfully loaded. The function receives a single argument, which is the file path that finished loading. This callback is cancelled as soon as the trial ends. See example below. |

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name           | Type    | Value                                    |
| -------------- | ------- | ---------------------------------------- |
| success        | boolean | If `true`, then all files loaded successfully within the `max_load_time`. If `false`, then one or more file requests returned a failure and/or the file loading did not complete within the `max_load_time` duration. |
| timeout        | boolean | If `true`, then the files did not finish loading within the `max_load_time` duration. If `false`, then the file loading did not timeout. Note that when the preload trial does not timeout (`timeout: false`), it is still possible for loading to fail (`success: false`). This happens if one or more files fails to load and all file requests trigger either a success or failure event before the `max_load_time` duration. |
| failed_images  | array | One or more image file paths that produced a loading failure before the trial ended. |
| failed_audio   | array | One or more audio file paths that produced a loading failure before the trial ended. |
| failed_video   | array | One or more video file paths that produced a loading failure before the trial ended. |

## Simulation Mode

In `visual` simulation mode, the plugin will run the trial as if the experiment was running normally. Specifying `simulation_options.data` will not work in `visual` mode.

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-preload@1.1.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-preload.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-preload
```
```js
import preload from '@jspsych/plugin-preload';
```


## Examples

???+ example "Automatically preloading based on other trials"
    === "Code"

        ```javascript
        var preload = {
            type: jsPsychPreload,
            auto_preload: true
        }

        var trial_1 = {
            type: jsPsychImageButtonResponse,
            stimulus: 'img/happy_face_1.jpg',
            choices: ['Next']
        }

        var trial_2 = {
            type: jsPsychImageButtonResponse,
            stimulus: 'img/happy_face_2.jpg',
            choices: ['Next']
        }

        var trial_3 = {
            type: jsPsychImageButtonResponse,
            stimulus: 'img/happy_face_3.jpg',
            choices: ['Next']
        }
        ```
        The `stimulus` parameter from the `image-button-response` trials will be automatically preloaded.

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-preload-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-preload-demo1.html">Open demo in new tab</a>

???+ example "Manually preloading an image"
    === "Code"

        ```javascript
        var preload = {
            type: jsPsychPreload,
            images: ['img/sad_face_1.jpg']
        }

        var trial_1 = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
                <p>Study this face</p>
                <img src="img/sad_face_1.jpg"></img>
            `,
            choices: ['Next']
        }
        ```
        Because the image is embedded inside HTML from the `html-button-response` plugin, it will not be automatically preloaded. Instead we can preload manually.

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-preload-demo2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-preload-demo2.html">Open demo in new tab</a>

???+ example "Loading files in batches"
    === "Code"

        ```javascript
        var jsPsych = initJsPsych();

        var trial_1 = {
            type: jsPsychImageButtonResponse,
            stimulus: 'img/happy_face_1.jpg',
            choices: ['Next']
        }

        var trial_2 = {
            type: jsPsychImageButtonResponse,
            stimulus: 'img/happy_face_2.jpg',
            choices: ['Next']
        }

        var trial_3 = {
            type: jsPsychImageButtonResponse,
            stimulus: 'img/happy_face_3.jpg',
            choices: ['Next']
        }

        var block_1 = {
            timeline: [trial_1, trial_2, trial_3]
        }

        var trial_4 = {
            type: jsPsychImageButtonResponse,
            stimulus: 'img/sad_face_1.jpg',
            choices: ['Next']
        }

        var trial_5 = {
            type: jsPsychImageButtonResponse,
            stimulus: 'img/sad_face_2.jpg',
            choices: ['Next']
        }

        var trial_6 = {
            type: jsPsychImageButtonResponse,
            stimulus: 'img/sad_face_3.jpg',
            choices: ['Next']
        }

        var block_2 = {
            timeline: [trial_4, trial_5, trial_6]
        }

        var preload_block_1 = {
            type: jsPsychPreload,
            trials: [block_1]
        }

        var preload_block_2 = {
            type: jsPsychPreload,
            trials: [block_2]
        }

        jsPsych.run([preload_block_1, block_1, preload_block_2, block_2])
        ```
        You can put trials using the `preload` plugin throughout your experiment to distribute when files are loaded. In the example above, there are two blocks of trials and the images for each are preloaded just before the corresponding block.

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-preload-demo3.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-preload-demo3.html">Open demo in new tab</a>

???+ example "Showing a detailed error message for debugging loading issues"
    === "Code"

        ```javascript
        var preload = {
            type: jsPsychPreload,
            images: ['img/bad_file_path.png'],
            show_detailed_errors: true
        }
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-preload-demo4.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-preload-demo4.html">Open demo in new tab</a>


For more examples, see the `jspsych-preload.html` file in the `/examples` folder of the release and the [Media Preloading](../overview/media-preloading.md) documentation page.