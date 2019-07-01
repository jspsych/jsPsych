# jspsych-survey-text plugin

The survey-text plugin displays a set of questions with free response text fields. The subject types in answers.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
questions | array | *undefined* | An array of objects, each object represents a question that appears on the screen. Each object contains a prompt, value, required, rows, and columns parameter that will be applied to the question. See examples below for further clarification. `prompt`: Type string, default value of *undefined*. The string is the prompt for the subject to respond to. Each question gets its own response field. `value`: Type string, default value of `""`. The string will be used to populate the response field with editable answer. `required`: Boolean; if `true` then the user must enter a response to submit. `rows`: Type integer, default value of 1. The number of rows for the response text box. `columns`: Type integer, default value of 40. The number of columns for the response text box.
randomize_question_order | boolean | `false` | If true, the display order of `questions` is randomly determined at the start of the trial. In the data object, `Q0` will still refer to the first question in the array, regardless of where it was presented visually.
preamble | string | empty string | HTML formatted string to display at the top of the page above all the questions.
button_label | string |  'Continue' | The text that appears on the button to finish the trial.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
responses | JSON string | A string in JSON format containing the response for each question. The encoded object will have a separate variable for the response to each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. Each response is a string containing whatever the subject typed into the associated text box.
rt | numeric | The response time in milliseconds for the subject to make a response.
question_order | JSON string | A string in JSON format containing an array with the order of questions. For example `[2,0,1]` would indicate that the first question was `trial.questions[2]` (the third item in the `questions` parameter), the second question was `trial.questions[0]`, and the final question was `trial.questions[1]`.

## Examples

### Basic example

```javascript
// defining groups of questions that will go together.
var survey_trial = {
  type: 'survey-text',
  questions: [{prompt: "How old are you?"}, {prompt: "Where were you born?"}],
};
```

### Custom number of rows and columns

```javascript
var survey_trial = {
  type: 'survey-text',
  questions: [{prompt: "How old are you?", rows: 5, columns: 40}, {prompt: "Where were you born?", rows: 3, columns: 50}],
};
```
