# jspsych-maxdiff plugin

The maxdiff plugin displays a table with rows of alternatives to be selected for two mutually-exclusive categories, typically as 'most' or 'least' on a particular criteria (e.g. importance, preference, similarity). The participant responds by selecting one radio button corresponding to an alternative in both the left and right response columns. The same alternative cannot be endorsed on both the left and right response columns (e.g. 'most' and 'least') simultaneously.

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
alternatives | array | *undefined* | An array of one or more alternatives of string type to fill the rows of the maxdiff table. If `required` is true, then the array must contain two or more alternatives, so that at least one can be selected for both the left and right columns.
labels | array | *undefined* | An array with exactly two labels of string type to display as column headings (to the left and right of the alternatives) for responses on the criteria of interest.
randomize_alternative_order | boolean | `false` | If true, the display order of `alternatives` is randomly determined at the start of the trial.
preamble | string | empty string | HTML formatted string to display at the top of the page above the maxdiff table.
required | boolean | `false` | If true, prevents the user from submitting the response and proceeding until a radio button in both the left and right response columns has been selected.
button_label | string |  'Continue' | Label of the button.


## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the maxdiff table first appears on the screen until the subject's response.
labels | object | An object with two keys, `left` and `right`, containing the labels (strings) corresponding to the left and right response columns. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. 
response | object | An object with two keys, `left` and `right`, containing the alternatives selected on the left and right columns. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. 


## Examples

#### Basic example

```javascript
var maxdiff_page = {
  type: 'maxdiff',
  alternatives: ['apple', 'orange', 'pear', 'banana'],
  labels: ['Most Preferred', 'Least Preferred'],
  preamble: '<p> Please select your <b>most preferred</b> and <b>least preferred</b> fruits. </p>'
};
```