# jspsych-survey-multi-choice plugin

The survey-multi-choice plugin displays a set of questions with multiple choice response fields. The subject selects a single answer.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
questions | array | *undefined* | An array of objects, each object represents a question that appears on the screen. Each object contains a prompt, options, required, and horizontal parameter that will be applied to the question. See examples below for further clarification.`prompt`: Type string, default value is *undefined*. The string is prompt/question that will be associated with a group of options (radio buttons). All questions will get presented on the same page (trial).`options`: Type array, defualt value is *undefined*. An array of strings. The array contains a set of options to display for an individual question.`required`: Type boolean, default value is null. The boolean value indicates if a question is required('true') or not ('false'), using the HTML5 `required` attribute. If this parameter is undefined, the question will be optional. Note: The HTML5 `required` attribute is [not currently supported by the Safari browser][1].`horizontal`:Type boolean, default value is false. If true, then the question is centered and the options are displayed horizontally.
preamble | string | empty string | HTML formatted string to display at the top of the page above all the questions.
button_label | string |  'Continue' | Label of the button.

[1]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Browser_compatibility

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
responses | JSON string | A string in JSON format containing the response for each question. The encoded object will have a separate variable for the response to each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. The responses are recorded as the name of the option label.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the questions first appear on the screen until the subject's response.

## Examples

#### Basic example with multiple questions on a page.

```javascript
    // defining groups of questions that will go together.
    var page_1_questions = ["I like vegetables.", "I like fruit."];

    // definiting two different response scales that can be used.
    var page_1_options = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
    var page_2_options = ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neural", "Somewhat Agree", "Agree", "Strongly Agree"];

    var multi_choice_block = {
      type: 'survey-multi-choice',
      questions: [{prompt: "I like vegetables", options: page_1_options, required:true,}, {prompt: "I like fruit", options: page_2_options, required: false}],
    };

    var multi_choice_block_horizontal = {
      type: 'survey-multi-choice',
      questions: [{prompt: "I like vegetables", options: page_1_options, required: true, horizontal: true,}, {prompt: "I like fruit", options: page_2_options, required: false, horizontal: false}],
    };

    jsPsych.init({
      timeline: [multi_choice_block, multi_choice_block_horizontal],
      on_finish: function() {
        jsPsych.data.displayData();
      }
    });
```
