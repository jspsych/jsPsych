# jspsych-reconstruction plugin

This plugin allows a subject to interact with a stimulus by modifying a parameter of the stimulus and observing the change in the stimulus in real-time.

The stimulus must be defined through a function that returns an HTML-formatted string. The function should take a single value, which is the parameter that can be modified by the subject. The value can only range from 0 to 1. See the example at the bottom of the page for a sample function.

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stim_function | function | *undefined* | A function with a single parameter that returns an HTML-formatted string representing the stimulus.
starting_value | numeric | 0.5 | The starting value of the stimulus parameter.
step_size | numeric | 0.05 | The change in the stimulus parameter caused by pressing one of the modification keys.
key_increase | string | 'h' | The key to press for increasing the parameter value.
key_decrease | string | 'g' | The key to press for decreasing the parameter value.
button_label | string | 'Continue' | The text that appears on the button to finish the trial.

## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
start_value | numeric | The starting value of the stimulus parameter.
final_value | numeric | The final value of the stimulus parameter.
rt | numeric | The length of time, in milliseconds, that the trial lasted.

## Examples

#### Make a block larger and smaller

```javascript
var sample_function = function(param){
	var size = 50 + Math.floor(param*250);
	var html = '<div style="display: block; margin: auto; height: 300px;">'+
	'<div style="display: block; margin: auto; background-color: #000000; '+
	'width: '+size+'px; height: '+size+'px;"></div></div>';
	return html;
}

var trial = {
	type: 'reconstruction',
	stim_function: sample_function,
	starting_value: 0.25
}
```
