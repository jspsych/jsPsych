# jspsych-survey-multi-choice plugin

The survey-text plugin displays a set of questions with multiple choice response fields. The subject selects a single answer.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
questions | array | *undefined* | Each array element is an array of strings. The strings are the prompts/questions that will be associated with a group of options (radio buttons). All questions within an array will get presented on the same page (trial). The length of the questions array determines the number of trials.
options | array |  *undefined* | Each array element is an array of arrays. The innermost arrays contain a set of options to display for an individual question. The middle level of arrays groups together the sets of labels that appear in a single trial. This level should correspond to the `questions` array.
horizontal | boolean | false | If true, then questions are centred and options are displayed horizontally.
preamble | array | empty string | Array of HTML formatted strings to display at the top of each page above all the questions. Each element of the array corresponds to a trial/page of questions.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
responses | JSON string | A string in JSON format containing the responses for each question. The encoded object will have a separate variable for the response to each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. The responses recorded as the name of the option label.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the questions first appear on the screen until the subject's response.

## Examples

#### Basic example with multiple questions on a page.

```javascript
// defining groups of questions that will go together.
var page_1_questions = ["I like vegetables.", "I hate eggs."];
var page_2_questions = ["I like fruit."];

// definiting two different response scales that can be used.
var page_1_options = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
var page_2_options = ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neural", "Somewhat Agree", "Agree", "Strongly Agree"];

var multi_choice_block = {
    type: 'survey-multi-choice',
    questions: [page_1_questions, page_2_questions],
    options: [[page_1_options, page_1_options], [page_2_options]],  // need one scale for every question on a page
    // horizontal: true  // centers questions and makes options display horizontally
};
```
