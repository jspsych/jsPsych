# visual-search-circle

Current version: 1.2.1. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-visual-search-circle/CHANGELOG.md).

This plugin presents a customizable visual-search task modelled after [Wang, Cavanagh, & Green (1994)](http://dx.doi.org/10.3758/BF03206946). The participant indicates whether or not a target is present among a set of distractors. The stimuli are displayed in a circle, evenly-spaced, equidistant from a fixation point. Here is an example using normal and backward Ns:

![Sample Visual Search Stimulus](../img/visual_search_example.jpg)

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. The set of images to display must be defined in one of two ways:

* The `target`, `foil` and `set_size` parameters: the combination of these parameters can be used to construct a 'classic' visual search task, where there is a single foil/distractor image that makes up all of the images in the set, with the exception of the target image if it is present.
OR
* The `stimuli` parameter: this array that can be used to present any arbitrary set of image files, with or without the target image, with any number of different foils/distractors, and with any number of repeated images.

The `target_present` and `fixation_image` parameters must always be specified. Other parameters can be left unspecified if the default value is acceptable.


| Parameter          | Type            | Default Value | Description                              |
| ------------------ | --------------- | ------------- | ---------------------------------------- |
| target             | string          | null          | Path to image file that is the search target. This parameter must specified when the stimuli set is defined using the `target`, `foil` and `set_size` parameters, but should NOT be specified when using the `stimuli` parameter. |
| foil               | string          | null          | Path to image file that is the foil/distractor. This image will be repeated for all distractors up to the `set_size` value. This parameter must specified when the stimuli set is defined using the `target`, `foil` and `set_size` parameters, but should NOT be specified when using the `stimuli` parameter. |
| set_size           | numeric         | null          | How many items should be displayed, including the target when `target_present` is `true`. The foil image will be repeated up to this value when `target_present` is `false`, or up to `set_size - 1` when `target_present` is `true`. This parameter must specified when using the `target`, `foil` and `set_size` parameters to define the stimuli set, but should NOT be specified when using the `stimuli` parameter.  |
| stimuli            | array of images | null          | Array containing all of the image files to be displayed. This parameter must be specified when NOT using the `target`, `foil`, and `set_size` parameters to define the stimuli set. |
| target_present     | boolean         | *undefined*   | Is the target present? This parameter must always be specified. When using the `target`, `foil` and `set_size` parameters, `false` means that the foil image will be repeated up to the set_size, and `true` means that the target will be presented along with the foil image repeated up to set_size - 1. When using the `stimuli` parameter, this parameter is only used to determine the response accuracy. |
| fixation_image     | string          | *undefined*   | Path to image file that is a fixation target. This parameter must always be specified. |
| target_size        | array           | `[50, 50]`    | Two element array indicating the height and width of the search array element images. |
| fixation_size      | array           | `[16, 16]`    | Two element array indicating the height and width of the fixation image. |
| circle_diameter    | numeric         | 250           | The diameter of the search array circle in pixels. |
| target_present_key | string          | 'j'           | The key to press if the target is present in the search array. |
| target_absent_key  | string          | 'f'           | The key to press if the target is not present in the search array. |
| trial_duration     | numeric         | null          | The maximum amount of time the participant is allowed to search before the trial will continue. A value of null will allow the participant to search indefinitely. |
| fixation_duration  | numeric         | 1000          | How long to show the fixation image for before the search array (in milliseconds). |
| response_ends_trial| boolean         | true         | If true, the trial will end when the participant makes a response. |

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name           | Type        | Value                                    |
| -------------- | ----------- | ---------------------------------------- |
| correct        | boolean     | True if the participant gave the correct response. |
| response       | string      | Indicates which key the participant pressed. |
| rt             | numeric     | The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. |
| set_size       | numeric     | The number of items in the search array  |
| target_present | boolean     | True if the target is present in the search array |
| locations      | array       | Array where each element is the pixel value of the center of an image in the search array. If the target is present, then the first element will represent the location of the target. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-visual-search-circle@1.2.1"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-visual-search-circle.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-visual-search-circle
```
```js
import visualSearchCircle from '@jspsych/plugin-visual-search-circle';
```

## Examples

???+ example "Identical distractors"
    === "Code"

        ```javascript
        var instructions = {
          type: jsPsychHtmlButtonResponse,
          stimulus: `<p>Press J if there is a backwards N.</p>
            <p>Press F if all the Ns are in the normal orientation.</p>`,
          choices: ['Continue']
        }

        var trial = {
          type: jsPsychVisualSearchCircle,
          target: 'img/backwardN.gif',
          foil: 'img/normalN.gif',
          fixation_image: 'img/fixation.gif',
          target_present: true,
          set_size: 4
        }
        ```
    
    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-visual-search-circle-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-visual-search-circle-demo1.html">Open demo in new tab</a>

???+ example "Variety of different distractors"
    === "Code"

        ```javascript
        var instructions = {
          type: jsPsychHtmlButtonResponse,
          stimulus: `<p>Press E if there is an elephant in the group.</p>
            <p>Press N if there is no elephant in the group.</p>`,
          choices: ['Continue']
        }

        var trial = {
          type: jsPsychVisualSearchCircle,
          stimuli: ['img/elephant.png', 'img/lion.png', 'img/monkey.png'],
          fixation_image: 'img/fixation.gif',
          target_present_key: 'e',
          target_absent_key: 'n',
          target_present: true
        }
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-visual-search-circle-demo2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-visual-search-circle-demo2.html">Open demo in new tab</a>
