# jspsych-survey-multi-select plugin

The survey-multi-select plugin displays a set of questions with multiple select response fields. The subject could select multiple answers.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
questions | array | *undefined* | An array of objects, each object represents a question that appears on the screen. Each object contains a prompt, options and horizontal parameter that will be applied to the question. See examples below for further clarification.`prompt`: Type string, default value of *undefined*. The string is the prompt/question that will be associated with a group of options (check boxes). All questions will get presented on the same page (trial).`options`: Type array, default value of *undefined*. The array contains a set of options to display for an individual question.`horizontal`: Type boolean, default value of false. If true, the questions are centered and options are displayed horizontally.
required | boolean | true | If true, then at least one option must be selected.
preamble | string | empty string | HTML formatted string to display at the top of the page above all the questions.
button_label | string |  'Continue' | Label of the button.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
responses | JSON string | An array containing all selected choices in JSON format for each question. The encoded object will have a separate variable for the response to each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. The responses are recorded as the name of the option label.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the questions first appear on the screen until the subject's response.

## Examples

#### Basic example with multiple questions on a page.

```javascript
    // definiting two different response scales that can be used.
    var page_1_options = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
    var page_2_options = ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neural", "Somewhat Agree", "Agree", "Strongly Agree"];

    var multi_select_block = {
        type: 'survey-multi-select',
        questions: [{prompt: "I like vegetables", options: page_1_options}, {prompt: "I like fruit", options: page_2_options}]
    };

    var multi_select_block_horizontal = {
        type: 'survey-multi-select',
        questions: [{prompt: "I like vegetables", options: page_1_options, horizontal: true}, {prompt: "I like fruit", options: page_2_options, horiztonal: false}]
    };

    jsPsych.init({
      timeline: [multi_select_block, multi_select_block_horizontal],
      on_finish: function() {
        jsPsych.data.displayData();
      }
    });
```
