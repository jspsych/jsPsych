# jspsych-call-function

This plugin executes a specified function. This allows the experimenter to run arbitrary code at any point during the experiment.

The function cannot take any arguments. If arguments are needed, then an anonymous function should be used to wrap the function call (see examples below).

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
func | function | *undefined* | The function to call.
timing_post_trial | numeric | 0 | Unlike other plugins where the default value of this parameter is 1,000ms, the default here is 0.


## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
value | any | The return value of the called function.

## Examples

#### Calling a simple function

```javascript

var myfunc = function() {
	return 'you called?';
}

var block = {
	type: 'call-function',
	func: myfunc
}
```

#### Using an anonymous function to pass variables

```javascript

var myfunc = function(data){
	// data contains all the experiment data so far,
	// so this function could implement code to write
	// the data to a database.
}

var block = {
	type: 'call-function',
	func: function(){ myfunc(jsPsych.data.getData())}
}
```
