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
intervals | array | *undefined* | Each array 
show_ticks | boolean | If true, then tick marks will be displayed on the sliders to indicate where the acceptable responses lie on the slider.

## Data Generated

In addition to the [default data collected by all plugins](), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
stimulus | string | Either the path to the image file or the string containing the HTML formatted content that the subject saw on this trial.
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response. 

## Examples

These examples show how to define a block using the single-stim plugin to achieve various goals.

#### Displaying images until subject gives a response

```javascript
var block = {
	type: 'single-stim',
	stimuli: ['img/happy_face.png', 'img/sad_face.png']
}
```

#### Restricting which keys the subject can use to respond

```javascript
var block = {
	type: 'single-stim',
	stimuli: ['img/happy_face.png', 'img/sad_face.png'],
	choices: ['h','s']
}
```

#### Displaying HTML content for a fixed length of time

```javascript
var block = {
	type: 'single-stim',
	stimuli: ['<p>Radio</p>', '<p>Towel</p>', '<p>Match</p>'],
	is_html: true,
	timing_response: 1500,
	continue_after_response: false
}
```
