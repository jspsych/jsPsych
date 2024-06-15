# serial-reaction-time-mouse

Current version: 1.1.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-serial-reaction-time-mouse/CHANGELOG.md).

The serial reaction time mouse plugin implements a generalized version of the SRT task [(Nissen & Bullmer, 1987)](https://doi.org/10.1016%2F0010-0285%2887%2990002-8). Squares are displayed in a grid-based system on the screen, and one square changes color. The participant must click on the square that changes color.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter                 | Type           | Default Value | Description                              |
| ------------------------- | -------------- | ------------- | ---------------------------------------- |
| target                    | array          | *undefined*   | The location of the target. The array should be the `[row, column]` of the target. |
| grid                      | array          | `[[1,1,1,1]]` | This array represents the grid of boxes shown on the screen. Each inner array represents a single row. The entries in the inner arrays represent the columns. If an entry is `1` then a square will be drawn at that location on the grid. If an entry is `0` then the corresponding location on the grid will be empty. Thus, by mixing `1`s and `0`s it is possible to create many different grid-based arrangements. |
| grid_square_size          | numeric        | 100           | The width and height in pixels of each square in the grid. |
| target_color              | hex color code | `#999`        | The color of the target square.          |
| response_ends_trial       | boolean        | `true`        | If true, the trial ends after a mouse click. Feedback is displayed if `show_response_feedback` is true. |
| pre_target_duration       | numeric        | 0             | The number of milliseconds to display the grid *before* the target changes color. |
| trial_duration            | numeric        | null          | The maximum length of time of the trial, not including feedback. |
| fade_duration             | numeric        | null          | If a positive number, the target will progressively change color at the start of the trial, with the transition lasting this many milliseconds. |
| allow_nontarget_responses | boolean        | false         | If true, the user can make nontarget response. |
| prompt                    | string         | null          | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which keys to press). |

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name   | Type    | Value                                    |
| ------ | ------- | ---------------------------------------- |
| grid   | array   | The grid representation. Each inner array represents a single row. The entries in the inner arrays represent the columns. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
| target | array   | The `[row, column]` target location on the grid. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
| rt     | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the second stimulus first appears on the screen until the participant's response. |
| response | array | The `[row, column]` response location on the grid. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
| correct | boolean | Whether the response location matches the target location (`true`) or not (`false`). |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-serial-reaction-time-mouse@1.1.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-serial-reaction-time-mouse.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-serial-reaction-time-mouse
```
```js
import serialReactionTimeMouse from '@jspsych/plugin-serial-reaction-time-mouse';
```

## Examples

???+ example "A classic version of the SRT"
    === "Code"

        ```javascript
        var grid = [
          [1,1,1,1]
        ]

        var trial_1 = {
          type: jsPsychSerialReactionTimeMouse,
          grid: grid,
          target: [0,0]
        }
        var trial_2 = {
          type: jsPsychSerialReactionTimeMouse,
          grid: grid,
          target: [0,1]
        }
        var trial_3 = {
          type: jsPsychSerialReactionTimeMouse,
          grid: grid,
          target: [0,2]
        }
        var trial_4 = {
          type: jsPsychSerialReactionTimeMouse,
          grid: grid,
          target: [0,3]
        }
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-serial-reaction-time-mouse-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-serial-reaction-time-mouse-demo1.html">Open demo in new tab</a>

???+ example "A 2x2 grid with extra space and different colors"
    === "Code"

        ```javascript
        var grid = [
          [1,0,1],
          [0,0,0],
          [1,0,1]
        ]

        var trial_1 = {
          type: jsPsychSerialReactionTimeMouse,
          grid: grid,
          target: [0,0],
          target_color: '#006738'
        }
        var trial_2 = {
          type: jsPsychSerialReactionTimeMouse,
          grid: grid,
          target: [0,2],
          target_color: '#F78F1E'
        }
        var trial_3 = {
          type: jsPsychSerialReactionTimeMouse,
          grid: grid,
          target: [2,2],
          target_color: '#13B24B'
        }
        var trial_4 = {
          type: jsPsychSerialReactionTimeMouse,
          grid: grid,
          target: [2,0],
          target_color: '#E74921'
        }
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-serial-reaction-time-mouse-demo2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-serial-reaction-time-mouse-demo2.html">Open demo in new tab</a>
