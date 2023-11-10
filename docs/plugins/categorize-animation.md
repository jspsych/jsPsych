# categorize-animation

Current version: 1.1.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-categorize-animation/CHANGELOG.md).

The categorize animation plugin shows a sequence of images at a specified frame rate. The participant responds by pressing a key. Feedback indicating the correctness of the response is given.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter                      | Type             | Default Value      | Description                              |
| ------------------------------ | ---------------- | ------------------ | ---------------------------------------- |
| stimuli                        | array            | *undefined*        | Each element of the array is a path to an image file. |
| choices                        | array of strings | `"ALL_KEYS"` | This array contains the key(s) that the participant is allowed to press in order to respond to the stimulus. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/) for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"` means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed. |
| key_answer                     | string           | *undefined*        | The key character indicating the correct response. |
| text_answer                    | string           | ""                 | A text label that describes the correct answer. Used in conjunction with the `correct_text` and `incorrect_text` parameters. |
| correct_text                   | string           | "Correct."         | String to show when the correct answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below). |
| incorrect_text                 | string           | "Wrong."           | String to show when the wrong answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below). |
| frame_time                     | numeric          | 500                | How long to display each image (in milliseconds). |
| sequence_reps                  | numeric          | 1                  | How many times to show the entire sequence. |
| allow_response_before_complete | boolean          | false              | If true, the participant can respond before the animation sequence finishes. |
| prompt                         | string           | null               | This string can contain HTML markup. Any content here will be displayed below the stimulus or the end of the animation depending on the allow_response_before_complete parameter. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). |
| feedback_duration              | numeric          | 2000               | How long to show the feedback (milliseconds). |
| render_on_canvas               | boolean          | true               | If true, the images will be drawn onto a canvas element. This prevents a blank screen (white flash) between consecutive images in some browsers, like Firefox and Edge. If false, the image will be shown via an img element, as in previous versions of jsPsych. |

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| stimulus  | array   | Array of stimuli displayed in the trial. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
| response  | string  | Indicates which key the participant pressed. |
| rt        | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. |
| correct   | boolean | `true` if the participant got the correct answer, `false` otherwise. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-categorize-animation@1.1.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-categorize-animation.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-categorize-animation
```
```js
import categorizeAnimation from '@jspsych/plugin-categorize-animation';
```

## Examples

???+ example "Basic example"
    === "Code"
        ```javascript
        var animation_trial = {
            type: jsPsychCategorizeAnimation,
            stimuli: [
                'img/happy_face_1.jpg', 
                'img/happy_face_2.jpg', 
                'img/happy_face_3.jpg', 
                'img/happy_face_4.jpg'
            ],
            prompt: `Press the P or Q key.`,
            choices: ['p', 'q'],
            key_answer: 'q', 
        };
        ```
    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-categorize-animation-demo1.html" width="90%;" height="600px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-categorize-animation-demo1.html">Open demo in new tab</a>

???+ example "Giving feedback with `%ANS%` string"
    === "Code"
        ```javascript
        var images = [
            'img/happy_face_1.jpg', 
            'img/happy_face_2.jpg', 
            'img/happy_face_3.jpg', 
            'img/happy_face_4.jpg'
        ];

        var animation_trial = {
            type: jsPsychCategorizeAnimation,
            stimuli: images,
            choices: ['p', 'q'],
            prompt: `Press the P or Q key.`,
            key_answer: 'q', 
            text_answer: 'Dax', // the label for the sequence is 'Dax'
            correct_text: 'Correct! This was a %ANS%.',
            incorrect_text: 'Incorrect. This was a %ANS%.'
        };
        ```
    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-categorize-animation-demo2.html" width="90%;" height="600px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-categorize-animation-demo2.html">Open demo in new tab</a>
