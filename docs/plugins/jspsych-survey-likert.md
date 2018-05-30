# jspsych-survey-likert plugin

The survey-likert plugin displays a set of questions with Likert scale responses. The subject responds by selecting a radio button.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
questions | array | *undefined* | An array of objects, each object represents a question that appears on the screen. Each object contains a prompt, labels and required parameter that will be applied to the question. See examples below for further clarification.`prompt`: Type string, default value is *undefined*. The strings are the question that will be associated with a slider. `labels`: Type array, default value is *undefined*. Each array element is an array of strings. The innermost arrays contain a set of labels to display for an individual question. If you want to use blank responses and only label the end points or some subset of the options, just insert a blank string for the unlabeled responses.`required`: Type boolean, default value is false. Makes answering questions required.
preamble | string | empty string | HTML formatted string to display at the top of the page above all the questions.
button_label | string |  'Continue' | Label of the button.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
responses | JSON string | A string in JSON format containing the response for each question. The encoded object will have a separate variable for the response to each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. The responses are recorded as integers, representing the position of the slider on the scale.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the questions first appear on the screen until the subject's response.

## Examples

#### Basic example with multiple questions on a page.

```javascript

// defining two different response scales that can be used.
var scale_1 = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

var likert_page = {
    type: 'survey-likert',
    questions: [{prompt: "I like vegetables.", labels: scale_1}],
};
```
