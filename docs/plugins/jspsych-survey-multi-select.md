# jspsych-survey-multi-select plugin

The survey-multi-select plugin displays a set of questions with multiple select response fields. The subject could select multiple answers.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
questions | array | *undefined* | An array of objects, each object represents a question that appears on the screen. Each object contains a prompt, options and horizontal parameter that will be applied to the question. See examples below for further clarification.`prompt`: Type string, default value of *undefined*. The string is the prompt/question that will be associated with a group of options (check boxes). All questions will get presented on the same page (trial).`options`: Type array, default value of *undefined*. The array contains a set of options to display for an individual question.`horizontal`: Type boolean, default value of false. If true, the questions are centered and options are displayed horizontally. `required`: Type boolean, default value of true. If true, then at least one option must be selected. `name`: Name of the question. Used for storing data. If left undefined then default names (`Q0`, `Q1`, `...`) will be used for the questions.
randomize_question_order | boolean | `false` | If true, the display order of `questions` is randomly determined at the start of the trial. In the data object, `Q0` will still refer to the first question in the array, regardless of where it was presented visually.
preamble | string | empty string | HTML formatted string to display at the top of the page above all the questions.
button_label | string |  'Continue' | Label of the button.
required_message | string | 'You must choose at least one response for this question' | Message to display if required response is not given.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
responses | JSON string | An array containing all selected choices in JSON format for each question. The encoded object will have a separate variable for the response to each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. The responses are recorded as the name of the option label. If the `name` parameter is defined for the question, then the response will use the value of `name` as the key for the response in the `responses` object.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the questions first appear on the screen until the subject's response.
question_order | JSON string | A string in JSON format containing an array with the order of questions. For example `[2,0,1]` would indicate that the first question was `trial.questions[2]` (the third item in the `questions` parameter), the second question was `trial.questions[0]`, and the final question was `trial.questions[1]`.

## Examples

#### Basic example with multiple questions on a page.

```javascript
var multi_select_block = {
    type: 'survey-multi-select',
    questions: [
      {
        prompt: "Which of these colors do you like?", 
        options: ["Red", "Yellow", "Green", "Blue", "Black"], 
        horizontal: true,
        required: true,
        name: 'Colors'
      }, 
      {
        prompt: "Which of these foods do you like?", 
        options: ["Apples", "Bananas", "Carrots", "Donuts", "Eggplant"], 
        horizontal: true,
        required: true,
        name: 'Foods'
      }
    ], 
    randomize_question_order: true
};
```
