# jspsych-survey-multi-choice plugin

The survey-text plugin displays a set of questions with multiple choice response fields. The subject selects a single answer.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
questions | array | *undefined* | An array of strings. The strings are the prompts/questions that will be associated with a group of options (radio buttons). All questions will get presented on the same page (trial).
options | array |  *undefined* | An array of arrays. The innermost arrays contain a set of options to display for an individual question. The length of the outer array should be the same as the number of questions.
required | array | null | An array of boolean values. Each boolean indicates if a question is required (`true`) or not (`false`), using the HTML5 `required` attribute. The length of this array should correspond to the length of the questions array. If this parameter is undefined, all questions will be optional. Note: The HTML5 `required` attribute is [not currently supported by the Safari browser][1].
horizontal | boolean | false | If true, then questions are centered and options are displayed horizontally.
preamble | array | empty string | Array of HTML formatted strings to display at the top of each page above all the questions. Each element of the array corresponds to a trial/page of questions.

[1]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Browser_compatibility

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
responses | JSON string | A string in JSON format containing the responses for each question. The encoded object will have a separate variable for the response to each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. The responses recorded as the name of the option label.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the questions first appear on the screen until the subject's response.

## Examples

#### Basic example with multiple questions on a page.

```javascript

```
