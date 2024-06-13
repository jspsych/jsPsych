# categorize-image

Current version: 1.1.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-categorize-image/CHANGELOG.md).

The categorize image plugin shows an image object on the screen. The participant responds by pressing a key. Feedback indicating the correctness of the response is given.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter                  | Type             | Default Value            | Description                              |
| -------------------------- | ---------------- | ------------------------ | ---------------------------------------- |
| stimulus                   | string           | *undefined*              | The path to the image file.              |
| key_answer                 | string           | *undefined*              | The key character indicating the correct response. |
| choices                    | array of strings | `"ALL_KEYS"`       | This array contains the key(s) that the participant is allowed to press in order to respond to the stimulus. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/) for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"` means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed. |
| text_answer                | string           | ""                       | A label that is associated with the correct answer. Used in conjunction with the `correct_text` and `incorrect_text` parameters. |
| correct_text               | string           | "Correct."               | String to show when the correct answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below). |
| incorrect_text             | string           | "Wrong."                 | String to show when the wrong answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below). |
| prompt                     | string           | null                     | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). |
| force_correct_button_press | boolean          | false                    | If set to true, then the participant must press the correct response key after feedback is given in order to advance to the next trial. |
| show_stim_with_feedback    | boolean          | true                     | If set to true, then the stimulus will be shown during feedback. If false, then only the text feedback will display during feedback. |
| show_feedback_on_timeout   | boolean          | false                    | If true, then category feedback will be displayed for an incorrect response after a timeout (trial_duration is exceeded). If false, then a timeout message will be shown. |
| timeout_message            | string           | "Please respond faster." | The message to show on a timeout non-response. |
| stimulus_duration          | numeric          | null                     | How long to show the stimulus for (milliseconds). If null, then the stimulus is shown until a response is given. |
| feedback_duration          | numeric          | 2000                     | How long to show the feedback for (milliseconds). |
| trial_duration             | numeric          | null                     | The maximum time allowed for a response. If null, then the experiment will wait indefinitely for a response. |


## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| stimulus  | string  | Either the path to the image file or the string containing the HTML formatted content that the participant saw on this trial. |
| response  | string  | Indicates which key the participant pressed. |
| rt        | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. |
| correct   | boolean | `true` if the participant got the correct answer, `false` otherwise. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-categorize-image@1.1.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-categorize-image.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-categorize-image
```
```js
import categorizeImage from '@jspsych/plugin-categorize-image';
```


## Examples

???+ example "Categorizing an image"
    === "Code"
        ```javascript
        var categorization_trial = {
            type: jsPsychCategorizeImage,
            stimulus: 'img/blue.png',
            key_answer: 'b',
            text_answer: 'Blue',
            choices: ['r', 'g', 'b'],
            correct_text: "<p class='prompt'>Correct! The color is %ANS%.</p>",
            incorrect_text: "<p class='prompt'>Incorrect. The color is %ANS%.</p>",
            prompt: "<p>Is the color of this circle (R)ed, (G)reen, or (B)lue?</p>"
        };
        ```
    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-categorize-image-demo1.html" width="90%;" height="600px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-categorize-image-demo1.html">Open demo in new tab</a>
