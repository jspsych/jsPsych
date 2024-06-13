# serial-reaction-time

Current version: 1.1.4. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-serial-reaction-time/CHANGELOG.md).

The serial reaction time plugin implements a generalized version of the SRT task [(Nissen & Bullemer, 1987)](https://doi.org/10.1016%2F0010-0285%2887%2990002-8). Squares are displayed in a grid-based system on the screen, and one square changes color. The participant presses a key that corresponds to the darkened key. Feedback is optionally displayed, showing the participant which square the key they pressed matches.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter              | Type             | Default Value         | Description                              |
| ---------------------- | ---------------- | --------------------- | ---------------------------------------- |
| target                 | array            | *undefined*           | The location of the target. The array should be the `[row, column]` of the target. |
| grid                   | array            | `[[1,1,1,1]]`         | This array represents the grid of boxes shown on the screen. Each inner array represents a single row. The entries in the inner arrays represent the columns. If an entry is `1` then a square will be drawn at that location on the grid. If an entry is `0` then the corresponding location on the grid will be empty. Thus, by mixing `1`s and `0`s it is possible to create many different grid-based arrangements. |
| choices                | array of strings | `[['3','5','7','9']]` | The dimensions of this array must match the dimensions of `grid`. Each entry in this array is the key that should be pressed for that corresponding location in the grid. Entries can be left blank if there is no key associated with that location of the grid. |
| grid_square_size       | numeric          | 100                   | The width and height in pixels of each square in the grid. |
| target_color           | hex color code   | `#999`                | The color of the target square.          |
| response_ends_trial    | boolean          | `true`                | If true, the trial ends after a key press. Feedback is displayed if `show_response_feedback` is true. |
| pre_target_duration    | numeric          | 0                     | The number of milliseconds to display the grid *before* the target changes color. |
| trial_duration         | numeric          | null                  | The maximum length of time of the trial, not including feedback. |
| show_response_feedback | boolean          | false                 | If true, show feedback indicating where the user responded and whether it was correct. |
| feedback_duration      | numeric          | 200                   | The length of time in milliseconds to show the feedback. |
| fade_duration          | numeric          | null                  | If a positive number, the target will progressively change color at the start of the trial, with the transition lasting this many milliseconds. |
| prompt                 | string           | null                  | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which keys to press). |

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| grid      | array   | The representation of the grid. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
| target    | array   | The representation of the target location on the grid. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
| response  | string | Indicates which key the participant pressed. |
| rt        | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the second stimulus first appears on the screen until the participant's response. |
| correct   | boolean | `true` if the participant's response matched the target. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-serial-reaction-time@1.1.4"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-serial-reaction-time.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-serial-reaction-time
```
```js
import serialReactionTime from '@jspsych/plugin-serial-reaction-time';
```

## Examples

???+ example "A classic SRT"
    === "Code"

        ```javascript
        var instructions = {
          type: jsPsychHtmlButtonResponse,
          stimulus: '<p>Use the S, F, H, and K keys to respond.</p>',
          choices: ['Continue']
        }

        var grid = [
          [1,1,1,1]
        ]

        var response_map = [
          ['s','f','h','k']
        ]

        var trial_1 = {
          type: jsPsychSerialReactionTime,
          grid: grid,
          choices: response_map,
          target: [0,0]
        }
        var trial_2 = {
          type: jsPsychSerialReactionTime,
          grid: grid,
          choices: response_map,
          target: [0,1]
        }
        var trial_3 = {
          type: jsPsychSerialReactionTime,
          grid: grid,
          choices: response_map,
          target: [0,2]
        }
        var trial_4 = {
          type: jsPsychSerialReactionTime,
          grid: grid,
          choices: response_map,
          target: [0,3]
        }
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-serial-reaction-time-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-serial-reaction-time-demo1.html">Open demo in new tab</a>

???+ example "2x2 grid with feedback"
    === "Code"

        ```javascript
        var instructions = {
          type: jsPsychHtmlButtonResponse,
          stimulus: '<p>Use the R, I, V, and M keys to respond.</p>',
          choices: ['Continue']
        }

        var grid = [
          [1,1],
          [1,1]
        ]

        var response_map = [
          ['r','i'],
          ['v','m']
        ]

        var trial_1 = {
          type: jsPsychSerialReactionTime,
          grid: grid,
          choices: response_map,
          target: [0,0],
          show_response_feedback: true,
          feedback_duration: 500
        }
        var trial_2 = {
          type: jsPsychSerialReactionTime,
          grid: grid,
          choices: response_map,
          target: [0,1],
          show_response_feedback: true,
          feedback_duration: 500
        }
        var trial_3 = {
          type: jsPsychSerialReactionTime,
          grid: grid,
          choices: response_map,
          target: [1,1],
          show_response_feedback: true,
          feedback_duration: 500
        }
        var trial_4 = {
          type: jsPsychSerialReactionTime,
          grid: grid,
          choices: response_map,
          target: [1,0],
          show_response_feedback: true,
          feedback_duration: 500
        }
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-serial-reaction-time-demo2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-serial-reaction-time-demo2.html">Open demo in new tab</a>