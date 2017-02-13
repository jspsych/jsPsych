# jspsych-survey-multi-picture plugin

The survey-multi-picture plugin displays a set of questions with multiple choice response fields. The subject selects a single answer.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
questions | array | *undefined* | An array of strings. The strings are the prompts/questions that will be associated with a group of options (images). All questions will get presented on the same page (trial).
options | array |  *undefined* | An array of arrays of objects containing url key and label key(label is optional). The innermost arrays contain a set of options to display for an individual question. The length of the outer array should be the same as the number of questions.
horizontal | boolean | false | If true, then questions are centered and options are displayed horizontally.
preamble | string | empty string | HTML formatted string to display at the top of the page above all the questions. 

[1]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Browser_compatibility

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
responses | JSON string | A string in JSON format containing the response for each question. The encoded object will have a separate variable for the response to each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. The responses are recorded as the image url for the picture clicked on.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the questions first appear on the screen until the subject's response.

## Examples

#### Basic example with multiple questions on a page.

```javascript
    // defining groups of questions that will go together.
    var page_1_questions = ["I like vegetables.", "I like fruit."];

    // definiting two different response scales that can be used.
    var page_1_options = [{url: "http://www.thetechconnectioninc.com/assets/img/Twitter.png", label: "twitter"}, {url: "http://www.freeiconspng.com/uploads/facebook-logo-png-20.png", label: "facebook"}];
    var page_2_options = [{url: "http://www.gameswithwords.org/WhichEnglish/images/1_1.jpg", label: "dog chase cat"}, {url: "http://www.gameswithwords.org/WhichEnglish/images/1_2.jpg", label: "cat chase dog"}];

    var multi_picture_block = {
        type: 'survey-multi-picture',
        questions: page_1_questions,
        options: [page_1_options, page_2_options],  // need one scale for every question on a page
    };

    var multi_picture_block_horizontal = {
        type: 'survey-multi-picture',
        questions: page_1_questions,
        options: [page_1_options, page_2_options],  // need one scale for every question on a page
        horizontal: true  // centers questions and makes options display horizontally
    };

    jsPsych.init({
      timeline: [multi_picture_block, multi_picture_block_horizontal],
      on_finish: function() {
        jsPsych.data.displayData();
      }
    });
```
