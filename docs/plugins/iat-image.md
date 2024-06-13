# iat-image

Current version: 1.1.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-iat-image/CHANGELOG.md).

This plugin runs a single trial of the [implicit association test (IAT)](https://implicit.harvard.edu/implicit/iatdetails.html), using an image as the stimulus.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter               | Type                | Default Value                            | Description                              |
| ----------------------- | ------------------- | ---------------------------------------- | ---------------------------------------- |
| stimulus                | string              | *undefined*                              | The stimulus to display. The path to an image. |
| html_when_wrong         | string              | `<span style="color: red; font-size: 80px">X</span>` | The HTML to display when a user presses the wrong key. |
| bottom_instructions     | string              | `<p>If you press the wrong key, a red X will appear. Press any key to continue.</p>` | Instructions about making a wrong key press and whether another key press is needed to continue. |
| force_correct_key_press | boolean             | false                                    | If this is `true` and the user presses the wrong key then they have to press the other key to continue. An example would be two keys 'e' and 'i'. If the key associated with the stimulus is 'e' and key 'i' was pressed, then pressing 'e' is needed to continue the trial. When this is `true`, then parameter `key_to_move_forward` is not used. |
| display_feedback        | boolean             | false                                    | If `true`, then `image_when_wrong` and `wrong_image_name` are required. If `false`, `trial_duration` is needed and trial will continue automatically. |
| left_category_key       | string              | 'e'                                      | Key press that is associated with the `left_category_label`. |
| right_category_key      | string              | 'i'                                      | Key press that is associated with the `right_category_label`. |
| left_category_label     | string              | ['left']                                 | An array that contains the words/labels associated with a certain stimulus. The labels are aligned to the left side of the page. |
| right_category_label    | string              | ['right']                                | An array that contains the words/labels associated with a certain stimulus. The labels are aligned to the right side of the page. |
| stim_key_association    | string              | 'undefined'                              | Either 'left' or 'right'. This indicates whether the stimulus is associated with the key press and category on the left or right side of the page (`left_category_key` or `right_category_key`). |
| key_to_move_forward     | array of characters | "ALL_KEYS"                         | This array contains the characters the participant is allowed to press to move on to the next trial if their key press was incorrect and feedback was displayed. Can also have 'other key' as an option which will only allow the user to select the right key to move forward. |
| trial_duration          | numeric             | null                                     | How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as `null` for the trial and the trial will end. If the value of this parameter is `null`, then the trial will wait for a response indefinitely. |
| response_ends_trial     | boolean             | true                                     | If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can use this parameter to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete. |

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| stimulus  | string  | Either the path to the image file or the string containing the HTML-formatted content that the participant saw on this trial. |
| response  | string  | Indicates which key the participant pressed. |
| rt        | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. |
| correct   | boolean | Boolean indicating whether the user's key press was correct or incorrect for the given image. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-iat-image@1.1.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-iat-image.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-iat-image
```
```js
import iatImage from '@jspsych/plugin-iat-image';
```

## Examples

???+ example "Displaying IAT question using image files"
    === "Code"
        ```javascript
        var trial_block = {
          type: jsPsychIatImage,
          stimulus: 'img/iat_old_face.jpg',
          stim_key_association: 'left',
          html_when_wrong: '<span style="color: red; font-size: 80px">X</span>',
          bottom_instructions: '<p>If you press the wrong key, a red X will appear. Press the other key to continue</p>',
          force_correct_key_press: true,
          display_feedback: true,
          trial_duration: 3000, //Only if display_feedback is false
          left_category_key: 'e',
          right_category_key: 'i',
          left_category_label: ['OLD','GOOD'],
          right_category_label: ['YOUNG','BAD'],
          response_ends_trial: true
        }
        ```
    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-iat-image-demo1.html" width="90%;" height="650px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-iat-image-demo1.html">Open demo in new tab</a>
