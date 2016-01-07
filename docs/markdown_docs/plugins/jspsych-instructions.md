# jspsych-instructions plugin

This plugin is for showing instructions to the subject. Navigation can be done using the mouse or keyboard.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
pages | array | *undefined* | Each element of the array is the content for a single page. Each page should be an HTML-formatted string.
key_forward | key code | 'rightarrow' | This is the key that the subject can press in order to advance to the next page. Keys can be specified as their [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) or as characters (e.g. `'a'`, `'q'`).
key_backward | key code | 'leftarrow' | This is the key that the subject can press to return to the previous page.
allow_backward | boolean | true | If true, the subject can return to previous pages of the instructions. If false, they may only advace to the next page.
allow_keys | boolean | true | If true, the subject can use keyboard keys to navigate the pages. If false, they may not.
show_clickable_nav | boolean | false | If true, then a `Previous` and `Next` button will be displayed beneath the instructions. Subjects can click the buttons to navigate.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
view_history | JSON string | A JSON string containing the order of pages the subject viewed (including when the subject returned to previous pages) and the time spent viewing each page.
rt | numeric | The response time in milliseconds for the subject to view all of the pages.

## Example

#### Showing simple text instructions

```javascript
var trial = {
	type: 'instructions',
	pages: [
		'Welcome to the experiment. Click next to begin.',
		'This is the second page of instructions.',
		'This is the final page.'
	],
	show_clickable_nav: true
}
```

#### Including images

```javascript
var trial = {
	type: 'instructions',
	pages: [
		'Welcome to the experiment. Click next to begin.',
		'Here is a picture of what you will do: <img src="instruction_image.jpg"></img>'
	],
	show_clickable_nav: true
}
```
