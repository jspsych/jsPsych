# jspsych-multiple-slider plugin

The multiple-slider plugin displays a set of questions with visual analog scale responses. The subject responds by clicking or moving a slider.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
questions | array | *undefined* | An array of objects, each object represents a question that appears on the screen. Each object contains a prompt, labels and required parameter that will be applied to the question. See examples below for further clarification.`prompt`: Type string, default value is *undefined*. The strings are the question that will be associated with a slider. `labels`: Type array, default value is *undefined*. Each array element is an array of strings. The innermost arrays contain a set of labels to display for an individual question. You can use no or several labels, the labels are automatically displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the other two will be at 33% and 67% of the slider width. `required`: Type boolean, default value is false. Makes answering questions required. `name`: Name of the question. Used for storing data. If left undefined then default names (`Q0`, `Q1`, `...`) will be used for the questions. `min`: type integer, the default value is 0. Sets the minimum value of the slider. `max`: type integer, the default value is 100. Sets the maximum value of the slider.  `slider_start`: type integer, the default value is 50. Sets the starting value of the slider.  `step`: type integer, the default value is 1. Sets the step of the slider. This is the smallest amount by which the slider can change.
randomize_question_order | boolean | `false` | If true, the display order of `questions` is randomly determined at the start of the trial. In the data object, `Q0` will still refer to the first question in the array, regardless of where it was presented visually.
preamble | string | empty string | HTML formatted string to display at the top of the page above all the questions.
slider_width | numeric | 500 | The width of the sliders in pixels.
require_movement | boolean | `false` | If true, the subject must move or click every sliders before clicking the continue button.
button_label | string | 'Continue' | Label of the button.

## Data Generated

In addition to the [default data collected by all plugins](overview#data-collected-by-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
responses | JSON string | A string in JSON format containing the response for each question. The encoded object will have a separate variable for the response to each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. The responses are recorded as integers, representing the position of the slider on the scale. If the `name` parameter is defined for the question, then the response will use the value of `name` as the key for the response in the `responses` object.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the questions first appear on the screen until the subject's response.
question_order | JSON string | A string in JSON format containing an array with the order of questions. For example `[2,0,1]` would indicate that the first question was `trial.questions[2]` (the third item in the `questions` parameter), the second question was `trial.questions[0]`, and the final question was `trial.questions[1]`.

## Examples

#### Basic example with two labels

```javascript
var scale_1 = [
  "Strongly Disagree",
  "Strongly Agree"
];

var slider_page = {
  type: 'multiple-slider',
  questions: [
    {prompt: "I like vegetables.", labels: scale_1}
  ]
};
```

#### Advanced example with multiple questions in a random order

```javascript
// define the labels
var scale_1 = [
  "Strongly Disagree",
  "Neutral",
  "Strongly Agree"
];

// define the sliders parameters
var start = 50;
var min = 0;
var max = 100;
var step = 1;

// create the multiple-slider page
var slider_page = {
  type: 'multiple-slider',
  questions: [
    {prompt: "I like vegetables.", name: 'Vegetables', labels: scale_1,
    slider_start: start, min: min, max: max, step: step},
    {prompt: "I like fruit.", name: 'Fruit', labels: scale_1,
    slider_start: start, min: min, max: max, step: step},
    {prompt: "I like meat.", name: 'Meat', labels: scale_1,
    slider_start: start, min: min, max: max, step: step},
    {prompt: "I like dairy.", name: 'Dairy', labels: scale_1,
    slider_start: start, min: min, max: max, step: step},
    {prompt: "I like legumes.", name: 'Legumes', labels: scale_1,
    slider_start: start, min: min, max: max, step: step}
  ],
  randomize_question_order: true,
  require_movement: true,
  slider_width: 600
};
```
