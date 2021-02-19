# jspsych-call-function

This plugin executes a specified function. This allows the experimenter to run arbitrary code at any point during the experiment.

The function cannot take any arguments. If arguments are needed, then an anonymous function should be used to wrap the function call (see examples below).

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
func | function | *undefined* | The function to call.
async | boolean | `false` | Set to true if `func` is an asynchoronous function. If this is true, then the first argument passed to `func` will be a callback that you should call when the async operation is complete. You can pass data to the callback. See example below.


## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
value | any | The return value of the called function.

## Examples

#### Calling a simple function

```javascript

var myfunc = function() {
	return 'you called?';
}

var trial = {
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

var trial = {
	type: 'call-function',
	func: function(){ myfunc(jsPsych.data.get())}
}
```

#### Async function call

```javascript
var trial = {
	type: 'call-function',
	async: true,
	func: function(done){
		// can perform async operations here like
		// creating an XMLHttpRequest to communicate
		// with a server
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var response_data = xhttp.responseText;
				// line below is what causes jsPsych to 
				// continue to next trial. response_data
				// will be stored in jsPsych data object.
				done(response_data);
			}
		};
		xhttp.open("GET", "path_to_server_script.php", true);
		xhttp.send();
	}
}
```