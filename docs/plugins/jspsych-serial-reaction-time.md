# jspsych-serial-reaction-time plugin

The serial reaction time plugin implements a generalized version of the SRT task [(Nissen & Bullemer, 1987)](https://doi.org/10.1016%2F0010-0285%2887%2990002-8). Squares are displayed in a grid-based system on the screen, and one square changes color. The participant presses a key that corresponds to the darkened key. Feedback is optionally displayed, showing the participant which square the key they pressed matches.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
target | array | *undefined* | The location of the target. The array should be the `[row, column]` of the target.
grid | array | `[[1,1,1,1]]` | This array represents the grid of boxes shown on the screen. Each inner array represents a single row. The entries in the inner arrays represent the columns. If an entry is `1` then a square will be drawn at that location on the grid. If an entry is `0` then the corresponding location on the grid will be empty. Thus, by mixing `1`s and `0`s it is possible to create many different grid-based arrangements.
choices | array | `[['3','5','7','9']]` | The dimensions of this array must match the dimensions of `grid`. Each entry in this array is the key that should be pressed for that corresponding location in the grid. Entries can be left blank if there is no key associated with that location of the grid.
grid_square_size | numeric | 100 | The width and height in pixels of each square in the grid.
target_color | hex color code | `#999` | The color of the target square.
response_ends_trial | boolean | `true` | If true, the trial ends after a key press. Feedback is displayed if `show_response_feedback` is true.
pre_target_duration | numeric | 0 | The number of milliseconds to display the grid *before* the target changes color.
trial_duration | numeric | null | The maximum length of time of the trial, not including feedback.
show_response_feedback | boolean | false | If true, show feedback indicating where the user responded and whether it was correct.
feedback_duration | numeric | 200 |The length of time in milliseconds to show the feedback.
fade_duration | numeric | null | If a positive number, the target will progressively change color at the start of the trial, with the transition lasting this many milliseconds.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which keys to press).

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
grid | JSON | A JSON-encoded representation of the grid.
target | JSON | A JSON-encoded representation of the target on the grid.
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the second stimulus first appears on the screen until the subject's response.
correct | boolean | `true` if the subject's response matched the target.

## Examples

#### Basic example with four squares in a single row
```javascript
var trial = {
  type: 'serial-reaction-time',
  grid: [[1,1,1,1]],
  target: [0,1]
}
```

#### 2x2 grid, Showing feedback for 500ms
```javascript
var trial = {
  type: 'serial-reaction-time',
  grid: [[1,1],[1,1]],
  choices: [['r','t'],['f','g']],
  target: [1,0],
  show_response_feedback: true,
  feedback_duration: 500
}
```
