# jspsych-survey-multi-select plugin

The survey-multi-select plugin displays a set of questions with multiple select response fields. The subject could select multiple answers.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
questions | array | *undefined* | An array of strings. The strings are the prompts/questions that will be associated with a group of options (check boxes). All questions will get presented on the same page (trial).
options | array |  *undefined* | An array of arrays. The innermost arrays contain a set of options to display for an individual question. The length of the outer array should be the same as the number of questions.
required | boolean | true | If true, then at least one option must be selected.
required_msg | string | `*please select at least one option!` | Message to display if required check is not met.
horizontal | boolean | false | If true, then questions are centered and options are displayed horizontally.
preamble | string | empty string | HTML formatted string to display at the top of the page above all the questions.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
responses | JSON string | An array containing all selected choices in JSON format for each question. The encoded object will have a separate variable for the response to each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. The responses are recorded as the name of the option label.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the questions first appear on the screen until the subject's response.

## Examples

#### Basic example with multiple questions on a page.

```javascript
    // defining groups of questions that will go together.
    var page_1_questions = ["I like vegetables.", "I like fruit."];

    // definiting two different response scales that can be used.
    var page_1_options = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
    var page_2_options = ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neural", "Somewhat Agree", "Agree", "Strongly Agree"];

    var multi_select_block = {
        type: 'survey-multi-select',
        questions: page_1_questions,
        options: [page_1_options, page_2_options],  // need one scale for every question on a page
    };

    var multi_select_block_horizontal = {
        type: 'survey-multi-select',
        questions: page_1_questions,
        options: [page_1_options, page_2_options],  // need one scale for every question on a page
        horizontal: true  // centers questions and makes options display horizontally
    };

    jsPsych.init({
      timeline: [multi_select_block, multi_select_block_horizontal],
      on_finish: function() {
        jsPsych.data.displayData();
      }
    });
```
