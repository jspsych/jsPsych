# jspsych-maxdfff plugin

The maxdiff plugin displays a table with rows of alternatives to be endorsed as 'most' or 'least' on a particular criteria (e.g. importance, preference, similarity). The subject responds by selecting one radio button corresponding to an alternative in both the 'most' and 'least' column. The same alternative cannot be endorsed as both 'most' and 'least' simultaneously.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
alternatives | array | *undefined* | An array of alternatives of string type to fill the rows of the maxdiff table.
labels | array | *undefined* | An array with exactly two labels of string type to display as column headings for the criteria of interest. Must be in the order of 'most' (first), then 'least' (second).
randomize_alternative_order | boolean | `false` | If true, the display order of `alternatives` is randomly determined at the start of the trial.
preamble | string | empty string | HTML formatted string to display at the top of the page above the maxdiff table.
required | boolean | `false` | If true, prevents the user from submitting the response and proceeding until a radio button in both the 'most' and 'least' columns has been selected.
button_label | string |  'Continue' | Label of the button.


## Data Generated

In addition to the [default data collected by all plugins](overview#data-collected-by-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the maxdiff table first appears on the screen until the subject's response.
most | string | The alternative endorsed as 'most' on the criteria of interest.
least | string | The alternative endorsed as 'least' on the criteria of interest.


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

