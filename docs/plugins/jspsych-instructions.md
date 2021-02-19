# jspsych-instructions plugin

This plugin is for showing instructions to the subject. It allows subjects to navigate through multiple pages of instructions at their own pace, recording how long the subject spends on each page. Navigation can be done using the mouse or keyboard. Subjects can be allowed to navigate forwards and backwards through pages, if desired.

## Parameters	

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter             | Type    | Default Value | Description                              |
| --------------------- | ------- | ------------- | ---------------------------------------- |
| pages                 | array   | *undefined*   | Each element of the array is the content for a single page. Each page should be an HTML-formatted string. |
| key_forward           | string  | 'ArrowRight'  | This is the key that the subject can press in order to advance to the next page. This key should be specified as a string (e.g., `'a'`, `'ArrowLeft'`, `' '`, `'Enter'`). |
| key_backward          | string  | 'ArrowLeft'   | This is the key that the subject can press to return to the previous page. This key should be specified as a string (e.g., `'a'`, `'ArrowLeft'`, `' '`, `'Enter'`). |
| allow_backward        | boolean | true          | If true, the subject can return to previous pages of the instructions. If false, they may only advace to the next page. |
| allow_keys            | boolean | true          | If `true`, the subject can use keyboard keys to navigate the pages. If `false`, they may not. |
| show_clickable_nav    | boolean | false         | If true, then a `Previous` and `Next` button will be displayed beneath the instructions. Subjects can click the buttons to navigate. |
| button_label_previous | string  | 'Previous'    | The text that appears on the button to go backwards. |
| button_label_next     | string  | 'Next'        | The text that appears on the button to go forwards. |
| show_page_number      | boolean | false         | If true, and clickable navigation is enabled, then Page x/y will be shown between the nav buttons. |
| page_label            | string  | 'Page'        | The text that appears before x/y pages displayed when show_page_number is true. |

## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name         | Type        | Value                                    |
| ------------ | ----------- | ---------------------------------------- |
| view_history | array       | An array containing the order of pages the subject viewed (including when the subject returned to previous pages) and the time spent viewing each page. Each object in the array represents a single page view, and contains keys called `page_index` (the page number, starting with 0) and `viewing_time` (duration of the page view). This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
| rt           | numeric     | The response time in milliseconds for the subject to view all of the pages. |

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
