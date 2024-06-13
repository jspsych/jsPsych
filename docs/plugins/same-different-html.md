# same-different-html

Current version: 1.1.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-same-different-html/CHANGELOG.md).

The same-different-html plugin displays two stimuli sequentially. Stimuli are HTML objects. The participant responds using the keyboard, and indicates whether the stimuli were the same or different. Same does not necessarily mean identical; a category judgment could be made, for example.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter            | Type    | Default Value | Description                              |
| -------------------- | ------- | ------------- | ---------------------------------------- |
| stimuli              | array   | *undefined*   | A pair of stimuli, represented as an array with two entries, one for each stimulus. A stimulus is a string containing valid HTML markup. Stimuli will be shown in the order that they are defined in the array. |
| answer               | string  | *undefined*   | Either `'same'` or `'different'`.        |
| same_key             | string  | 'q'           | The key that participants should press to indicate that the two stimuli are the same. |
| different_key        | string  | 'p'           | The key that participants should press to indicate that the two stimuli are different. |
| first_stim_duration  | numeric | 1000          | How long to show the first stimulus for in milliseconds. If the value of this parameter is null then the stimulus will be shown until the participant presses any key. |
| gap_duration         | numeric | 500           | How long to show a blank screen in between the two stimuli. |
| second_stim_duration | numeric | 1000          | How long to show the second stimulus for in milliseconds. If the value of this parameter is null then the stimulus will be shown until the participant responds. |
| prompt               | string  | null          | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). |


## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| stimulus  | array   | An array of length 2 containing the HTML-formatted content that the participant saw for each trial. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
| response  | string  | Indicates which key the participant pressed. |
| rt        | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the second stimulus first appears on the screen until the participant's response. |
| correct   | boolean | `true` if the participant's response matched the `answer` for this trial. |
| answer    | string  | The correct answer to the trial, either `'same'` or `'different'`. |

Additionally, if `first_stim_duration` is  null, then the following data is also collected:

| Name            | Type    | Value                                    |
| --------------- | ------- | ---------------------------------------- |
| rt_stim1        | numeric | The response time in milliseconds for the participant to continue after the first stimulus. The time is measured from when the first stimulus appears on the screen until the participant's response. |
| response_stim1  | string  | Indicates which key the participant pressed to continue. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-same-different-html@1.1.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-same-different-html.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-same-different-html
```
```js
import sameDifferentHtml from '@jspsych/plugin-same-different-html';
```


## Examples

???+ example "Two text choices"
    === "Code"
  
        ```javascript
        var trial = {
          type: jsPsychSameDifferentHtml,
          stimuli: [
            '<p style="font-size:30px;">Climbing</p>', 
            '<p style="font-size:30px;">Walking</p>'
          ],
          prompt: `<p>Press 's' if the activities require the same amount of physical exertion.</p>
            <p>Press 'd' if the activities require different amount of physical exertion.</p>`,
          same_key: 's',
          different_key: 'd',
          first_stim_duration: 800,
          answer: 'different'
        }
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-same-different-html-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-same-different-html-demo1.html">Open demo in new tab</a>
