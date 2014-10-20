# jspsych-survey-likert plugin

The survey-likert plugin displays a set of questions with Likert scale responses. The subject uses a draggable slider to respond to the questions.

## Dependency

This plugin requires the jQuery UI javascript library and accompanying CSS theme. To use this library, you must include both. Google hosts versions of both, which you can use in your project by including the following two lines in the `<head>` section of the HTML document:

```html
<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>
<link href="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/themes/black-tie/jquery-ui.min.css" rel="stylesheet" type="text/css"></link>
```

This example uses the 'black-tie' theme, but any theme should work.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
questions | array | *undefined* | Each array element is an array of strings. The strings are the prompts/questions that will be associated with a slider. All questions within an array will get presented on the same page (trial). The length of the questions array determines the number of trials.
labels | array |  *undefined* | Each array element is an array of arrays. The innermost arrays contain a set of labels to display for an individual question. The middle level of arrays groups together the sets of labels that appear in a single trial. This level should correspond to the `questions` array.
intervals | array | *undefined* | Each array element is an array of integers. The integers define how many different levels of a response there are (i.e. how many choices exist for each question). The length of the inner arrays should correspond the the length of the inner arrays for the `questions` array. The number of intervals does not have to match the number of labels.
show_ticks | boolean | true | If true, then tick marks will be displayed on the sliders to indicate where the acceptable responses lie on the slider.

## Data Generated

In addition to the [default data collected by all plugins](), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
Q0, Q1, ... , Q*n* | numeric | The response to each question will be recorded in its own variable, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. The responses are recorded as integers, representing the position of the slider on the scale.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the questions first appear on the screen until the subject's response. 

## Examples

#### Basic example with multiple questions on a page.

```javascript
// defining groups of questions that will go together.
var page_1_questions = ["I like vegetables.", "I hate eggs."];
var page_2_questions = ["I like fruit."];

// definiting two different response scales that can be used.
var scale_1 = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
var scale_2 = ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neural", "Somewhat Agree", "Agree", "Strongly Agree"];

var likert_block = {
    type: 'survey-likert',
    questions: [page_1_questions, page_2_questions],
    labels: [[scale_1, scale_2], [scale_1]], // need one scale for every question on a page
    intervals: [[5,7], [9]] // note the the intervals and labels don't necessarily need to match.
};
```
