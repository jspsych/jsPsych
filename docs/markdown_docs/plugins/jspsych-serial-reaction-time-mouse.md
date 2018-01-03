# jspsych-serial-reaction-time-mouse plugin

The serial reaction time mouse plugin implements a generalized version of the SRT task [(Nissen & Bullmer, 1987)](https://doi.org/10.1016%2F0010-0285%2887%2990002-8). Squares are displayed in a grid-based system on the screen, and one square changes color. The participant must click on the square that changes color.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
target | array | *undefined* | The location of the target. The array should be the `[row, column]` of the target.
grid | array | `[[1,1,1,1]]` | This array represents the grid of boxes shown on the screen. Each inner array represents a single row. The entries in the inner arrays represent the columns. If an entry is `1` then a square will be drawn at that location on the grid. If an entry is `0` then the corresponding location on the grid will be empty. Thus, by mixing `1`s and `0`s it is possible to create many different grid-based arrangements.
grid_square_size | numeric | 100 | The width and height in pixels of each square in the grid.
target_color | hex color code | `#999` | The color of the target square.
response_ends_trial | boolean | `true` | If true, the trial ends after a key press. Feedback is displayed if `show_response_feedback` is true.
pre_target_duration | numeric | 0 | The number of milliseconds to display the grid *before* the target changes color.
trial_duration | numeric | null | The maximum length of time of the trial, not including feedback.
fade_duration | numeric | null | If a positive number, the target will progressively change color at the start of the trial, with the transition lasting this many milliseconds.
allow_nontarget_responses | boolean | false | If true, the user can make nontarget response.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which keys to press).

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
grid | JSON | A JSON-encoded representation of the grid.
target | JSON | A JSON-encoded representation of the target on the grid.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the second stimulus first appears on the screen until the subject's response.

## Examples

#### Basic example with four squares in a single row
```javascript
var trial = {
  type: 'serial-reaction-time-mouse',
  grid: [[1,1,1,1]],
  target: [0,1]
}
```

#### 2x2 grid with extra space in the middle
```javascript
var trial = {
  type: 'serial-reaction-time',
  grid: [[1,0,1],[0,0,0],[1,0,1]],
  target: [0,2]
}
```
