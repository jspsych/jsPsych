# jspsych-survey-text plugin

The survey-text plugin displays a set of questions with free response text fields. The subject types in answers.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
questions | array | *undefined* | Each array is an array of strings. The strings are the prompts for the subject to respond to. Each string gets its own response field. Each set of strings (inner arrays) will be presented on the same page (trial). The length of the outer array sets the number of trials in the block.

## Data Generated

In addition to the [default data collected by all plugins](), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
Q0, Q1, ... , Q_n_ | string | Each question in the trial gets its own response in the data object. The first question will be `Q0`, the second `Q1`, and so on. Each response is a string containing whatever the subject typed into the associated text box.
rt | numeric | The response time in milliseconds for the subject to make a response. 

## Examples

### Basic example

```javascript
// defining groups of questions that will go together.
var page_1_questions = ["How old are you?", "Where were you born?"];
var page_2_questions = ["What is your favorite food?"];

var survey_block = {
    type: 'survey-text',
    questions: [page_1_questions, page_2_questions],
};
```
