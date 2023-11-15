# call-function

Current version: 1.1.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-call-function/CHANGELOG.md).

This plugin executes a specified function. This allows the experimenter to run arbitrary code at any point during the experiment.

The function cannot take any arguments. If arguments are needed, then an anonymous function should be used to wrap the function call (see examples below).

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
func | function | *undefined* | The function to call.
async | boolean | `false` | Set to true if `func` is an asynchoronous function. If this is true, then the first argument passed to `func` will be a callback that you should call when the async operation is complete. You can pass data to the callback. See example below.


## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
value | any | The return value of the called function.

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-call-function@1.1.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-call-function.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-call-function
```
```js
import callFunction from '@jspsych/plugin-call-function';
```

## Examples

???+ example "Calling a simple function"
    === "Code"
        ```javascript
		var myfunc = function() {
			return 'you called?';
		}

		var trial = {
			type: jsPsychCallFunction,
			func: myfunc
		}
		```

	=== "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-call-function-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-call-function-demo1.html">Open demo in new tab</a>
    

???+ example "Using an anonymous function to pass variables"
    === "Code"
        ```javascript
		var myfunc = function(data){
			// data contains all the experiment data so far,
			// so this function could implement code to write
			// the data to a database.
			console.log(data.values())
		}

		var trial = {
			type: jsPsychCallFunction,
			func: function(){ myfunc(jsPsych.data.get()) }
		}
		```

	=== "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-call-function-demo2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-call-function-demo2.html">Open demo in new tab</a>

???+ example "Async function call: wait for data to be saved to a server"
	=== "Code"
	There's no demo for this code, because it requires a server to communicate with.
		```javascript
		var trial = {
			type: jsPsychCallFunction,
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

???+ example "Async function call: simulate waiting for an event to finish"
	=== "Code"
        ```javascript
		var trial = {
			type: jsPsychCallFunction,
			async: true,
			func: function(done){
				// generate a delay between 1500 and 3000 milliseconds to simulate  
				// waiting for an event to finish after an unknown duration,
				// then move on with the experiment
				var rand_delay = (Math.floor(Math.random() * (3000 - 1500 + 1) + 1500));
				jsPsych.pluginAPI.setTimeout(function() {
					// end the trial and save the delay duration to the data
					done(rand_delay.toString()+"ms");
				}, rand_delay)
			}
		};
  		```
	=== "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-call-function-demo3.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-call-function-demo3.html">Open demo in new tab</a>


