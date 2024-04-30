# jsPsych

---
## initJsPsych

```javascript
var jsPsych = initJsPsych(settings);
```

### Parameters

| Parameter | Type   | Description                              |
| --------- | ------ | ---------------------------------------- |
| settings  | object | The settings object for initializing jsPsych. See table below. |

The settings object can contain several parameters. None of the parameters are required.

| Parameter                  | Type     | Description                              |
| -------------------------- | -------- | ---------------------------------------- |
| display_element            | string   | The ID of an HTML element to display the experiment in. If left blank, jsPsych will use the `<body>` element to display content. All keyboard event listeners are bound to this element. In order for a keyboard event to be detected, this element must have focus (be the last thing that the participant clicked on). |
| on_finish                  | function | Function to execute when the experiment ends. |
| on_trial_start             | function | Function to execute when a new trial begins. |
| on_trial_finish            | function | Function to execute when a trial ends.   |
| on_data_update             | function | Function to execute every time data is stored using the `jsPsych.data.write` method. All plugins use this method to save data (via a call to `jsPsych.finishTrial`, so this function runs every time a plugin stores new data. |
| on_interaction_data_update | function | Function to execute every time a new interaction event occurs. Interaction events include clicking on a different window (blur), returning to the experiment window (focus), entering full screen mode (fullscreenenter), and exiting full screen mode (fullscreenexit). |
| on_close                   | function | Function to execute when the user leaves the page. Can be used, for example, to save data before the page is closed. |
| exclusions                 | object   | Specifies restrictions on the browser the participant can use to complete the experiment. See list of options below. *This feature is deprecated as of v7.1 and will be removed in v8.0. The [browser-check plugin](../plugins/browser-check.md) is an improved way to handle exclusions.* |
| show_progress_bar          | boolean  | If `true`, then [a progress bar](../overview/progress-bar.md) is shown at the top of the page. Default is `false`. |
| message_progress_bar       | string   | Message to display next to the progress bar. The default is 'Completion Progress'. |
| auto_update_progress_bar   | boolean  | If true, then the progress bar at the top of the page will automatically update as every top-level timeline or trial is completed. |
| use_webaudio               | boolean  | If false, then jsPsych will not attempt to use the WebAudio API for audio playback. Instead, HTML5 Audio objects will be used. The WebAudio API offers more precise control over the timing of audio events, and should be used when possible. The default value is `true`. |
| default_iti                | numeric  | The default inter-trial interval in ms. The default value if none is specified is 0ms. |
| experiment_width           | numeric  | The desired width of the jsPsych container in pixels. If left undefined, the width will be 100% of the display element. Usually this is the `<body>` element, and the width will be 100% of the screen size. |
| minimum_valid_rt           | numeric  | The minimum valid response time for key presses during the experiment. Any key press response time that is less than this value will be treated as invalid and ignored. Note that this parameter only applies to _keyboard responses_, and not to other response types such as buttons and sliders. The default value is 0. |
| override_safe_mode         | boolean  | Running a jsPsych experiment directly in a web browser (e.g., by double clicking on a local HTML file) will load the page using the `file://` protocol. Some features of jsPsych don't work with this protocol. By default, when jsPsych detects that it's running on a page loaded via the `file://` protocol, it runs in _safe mode_, which automatically disables features that don't work in this context. Specifically, the use of Web Audio is disabled (audio will be played using HTML5 audio instead, even if `use_webaudio` is `true`) and video preloading is disabled. The `override_safe_mode` parameter defaults to `false`, but you can set it to `true` to force these features to operate under the `file://` protocol. In order for this to work, you will need to disable web security (CORS) features in your browser - this is safe to do if you know what you are doing. Note that this parameter has no effect when you are running the experiment on a web server, because the page will be loaded via the `http://` or `https://` protocol. |
| case_sensitive_responses   | boolean  | If `true`, then jsPsych will make a distinction between uppercase and lowercase keys when evaluating keyboard responses, e.g. "A" (uppercase) will not be recognized as a valid response if the trial only accepts "a" (lowercase). If false, then jsPsych will not make a distinction between uppercase and lowercase keyboard responses, e.g. both "a" and "A" responses will be valid when the trial's key choice parameter is "a". Setting this parameter to false is useful if you want key responses to be treated the same way when CapsLock is turned on or the Shift key is held down. The default value is `false`. |
extensions | array | Array containing information about one or more jsPsych extensions that are used during the experiment. Each extension should be specified as an object with `type` (required), which is the name of the extension, and `params` (optional), which is an object containing any parameter-value pairs to be passed to the extension's `initialize` function. Default value is an empty array. |

Possible values for the exclusions parameter above.

| Parameter  | Type    | Description                              |
| ---------- | ------- | ---------------------------------------- |
| min_width  | numeric | The minimum width of the browser window. If the width is below this value, a message will be displayed to the participant asking them to maximize their browser window. The experiment will sit on this page until the browser window is large enough. |
| min_height | numeric | Same as above, but with height.          |
| audio      | boolean | Set to true to require support for the WebAudio API (used by plugins that play audio files). |

### Return value

Returns a jsPsych instance, which all jsPsych methods on this page are called on. Therefore it is not possible to call any of the jsPsych methods listed on this page until this `initJsPsych` function is called and a jsPsych instance is created.

### Description

This function initializes jsPsych with the specified experiment settings.

### Example

```javascript
var jsPsych = initJsPsych({
  on_finish: function() {
    jsPsych.data.displayData();
  }, 
  show_progress_bar: true,
  default_iti: 500
});
```

For more examples, see the HTML files in the [examples folder](https://github.com/jspsych/jsPsych/tree/main/examples).

---
## jsPsych.addNodeToEndOfTimeline

```javascript
jsPsych.addNodeToEndOfTimeline(node_parameters)
```

### Parameters

| Parameter       | Type     | Description                              |
| --------------- | -------- | ---------------------------------------- |
| node_parameters | object   | An object defining a timeline. It must have, at a minimum, a `timeline` parameter with a valid timeline array as the value for that parameter. |

### Return value

None.

### Description

Adds the timeline to the end of the experiment.

### Example

```javascript
var trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'This is a new trial.'
}

var new_timeline = {
  timeline: [trial]
}

jsPsych.addNodeToEndOfTimeline(new_timeline)
```

---
## jsPsych.endCurrentTimeline

```javascript
jsPsych.endCurrentTimeline()
```

### Parameters

None.

### Return value

None.

### Description

Ends the current timeline. If timelines are nested, then only the timeline that contains the current trial is ended.

### Example

#### End timeline if a particular key is pressed

```javascript
var jsPsych = initJsPsych({
  on_finish: function() {
    jsPsych.data.displayData();
  }
});

var images = [
  "img/1.gif", "img/2.gif", "img/3.gif", "img/4.gif",
  "img/5.gif", "img/6.gif", "img/7.gif", "img/8.gif",
  "img/9.gif", "img/10.gif"
];

var trials = [];
for (var i = 0; i < images.length; i++) {
  trials.push({
    stimulus: images[i]
  });
}

var block = {
  type: jsPsychImageKeyboardResponse,
  choices: ['y', 'n'], 
  prompt: '<p>Press "y" to Continue. Press "n" to end this node of the experiment.</p>',
  on_finish: function(data) {
    if (jsPsych.pluginAPI.compareKeys(data.response, 'n')) {
      jsPsych.endCurrentTimeline();
    }
  },
  timeline: trials
}

var after_block = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<p>The next node</p>'
}

jsPsych.run([block, after_block]);
```

---
## jsPsych.endExperiment

```javascript
jsPsych.endExperiment(end_message, data)
```

### Parameters

| Parameter   | Type   | Description                              |
| ----------- | ------ | ---------------------------------------- |
| end_message | string | A message to display on the screen after the experiment is over. Can include HTML formatting. |
| data | object | An optional object of key-value pairs to store as data in the final trial of the experiment. 

### Return value

None.

### Description

Ends the experiment, skipping all remaining trials. If the `on_finish` event handler for `jsPsych` returns a `Promise` then the `end_message` will not be displayed until the promise is resolved.

### Example

#### End the experiment if a particular response is given

```javascript
var trial = {
  type: jsPsychImageKeyboardResponse,
  stimulus: 'image1.jpg',
  choices: ['y', 'n']
  prompt: '<p>Press "y" to Continue. Press "n" to end the experiment</p>',
  on_finish: function(data){
    if(jsPsych.pluginAPI.compareKeys(data.response, "n")){
      jsPsych.endExperiment('The experiment was ended by pressing "n".');
    }
  }
}
```

---
## jsPsych.finishTrial

```javascript
jsPsych.finishTrial(data)
```

### Parameters

| Parameter | Type   | Description                      |
| --------- | ------ | -------------------------------- |
| data      | object | The data to store for the trial. |


### Return value

Returns nothing.

### Description

This method tells jsPsych that the current trial is over. It is used in all of the plugins to end the current trial. When the trial ends a few things happen:

* The data is stored using `jsPsych.data.write()`
* The on_finish callback function is executed for the trial
* The on_trial_finish callback function is executed
* The progress bar is updated if it is being displayed
* The experiment ends if the trial is the last one (and the on_finish callback function is executed).
* The next trial, if one exists, is started.

### Example

```javascript
// this code would be in a plugin
jsPsych.finishTrial({correct_response: true});
```

---
## jsPsych.getAllTimelineVariables

```javascript
jsPsych.getAllTimelineVariables()
```

### Parameters

None.

### Return value

Returns an object with all available timeline variables at this moment in the experiment, represented as `key: value` pairs.

### Description

This function can be used to get all the timeline variables at a particular moment in the experiment. Can be useful for annotating
data, such as in the example below.

### Example

```javascript
var trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'Just a demo',
  on_finish: function(data){
    // merge all timeline variables available at this trial into the data for this trial
    Object.assign(data, jsPsych.getAllTimelineVariables())
  }
}
```

---
## jsPsych.getCurrentTimelineNodeID

```javascript
jsPsych.getCurrentTimelineNodeID()
```

### Parameters

None.

### Return value

Returns the ID of the TimelineNode that is currently active.

### Description

Gets the ID of the active TimelineNode. The ID is a string that follows a specific format:

* `"0.0"` is the ID of the first top-level TimelineNode
* `"1.0"` is the ID of the second top-level TimelineNode
* `"2.0"` is the ID of the third top-level TimelineNode, and so on...

If a TimelineNode iterates multiple times (using the loop function, for example), then the iterations are indicated in the second number:

* `"0.0"` is the ID of the first top-level TimelineNode during the first iteration
* `"0.1"` is the ID of the first top-level TimelineNode during the second iteration
* `"0.2"` is the ID of the first top-level TimelineNode during the third iteration, and so on...

If TimelineNodes are nested in other TimelineNodes, then the hierarchical structure is shown with `"-"`:

* `"0.0-1.0"` is the ID of the second TimelineNode on the timeline of the first top-level TimelineNode.
* `"0.0-2.0"` is the ID of the third TimelineNode on the timeline of the first top-level TimelineNode, and so on...

The rules about iterations apply throughout the hierarchical ID:

* `"0.2-1.3"` is the ID of the second TimelineNode, executing for the fourth time, on the timeline of the first top-level TimelineNode, executing for the third time.


### Example

```javascript
var id = jsPsych.getCurrentTimelineNodeID();
console.log('The current TimelineNode ID is '+id);
```

---
## jsPsych.getCurrentTrial

```javascript
jsPsych.getCurrentTrial()
```

### Parameters

None.

### Return value

Returns the object describing the current trial. The object will contain all of the parameters associated with the current trial.

### Description

Get a description of the current trial

### Example

```javascript
var trial = jsPsych.getCurrentTrial();
console.log('The current trial is using the '+trial.type+' plugin');
```


---
## jsPsych.getDisplayElement

```javascript
jsPsych.getDisplayElement()
```

### Parameters

None.

### Return value

Returns the HTML DOM element used for displaying the experiment.

### Description

Get the DOM element that displays the experiment.

### Example

```javascript
var el = jsPsych.getDisplayElement();

// hide the jsPsych display
el.style.visibility = 'hidden';
```
---

## jsPsych.getInitSettings

```javascript
jsPsych.getInitSettings()
```

### Parameters

None

### Return value

Returns the settings object used to initialize the experiment.

### Description

Gets the object containing the settings for the current experiment.

### Example

```javascript
var settings = jsPsych.getInitSettings();

// check the experiment structure
console.log(JSON.stringify(settings.timeline));
```


---

## jsPsych.getProgress

```javascript
jsPsych.getProgress()
```

### Parameters

None.

### Return value

Returns an object with the following properties:

| Property             | Type    | Description                              |
| -------------------- | ------- | ---------------------------------------- |
| total_trials         | numeric | Indicates the number of trials in the experiment. Note that this does not count possible loops or skipped trials due to conditional statements. |
| current_trial_global | numeric | Returns the trial index of the current trial in a global scope. Every trial will increase this count by 1. |
| percent_complete     | numeric | Estimates the percent of the experiment that is complete. Works as expected for experiments without conditional or looping timelines. For complex timelines, the percent is an approximation. |


### Description

This method returns information about the length of the experiment and the participant's current location in the experiment timeline.

### Example

```javascript
var progress = jsPsych.getProgress();
alert('You have completed approximately '+progress.percent_complete+'% of the experiment');
```


---
## jsPsych.getProgressBarCompleted

```javascript
jsPsych.getProgressBarCompleted()
```

### Parameters

None.

### Return value

Returns a value between 0 and 1 representing how full the progress bar currently is.

### Description

Used to get the current value of the progress bar. Works for automated and manual control.

### Example

```javascript
var progress_bar_amount = jsPsych.getProgressBarCompleted();
```

---

## jsPsych.getStartTime

```javascript
jsPsych.getStartTime()
```

### Parameters

None.

### Return value

Returns a `Date` object indicating when the experiment began.

### Description

Get the time that the experiment began.

### Example

```javascript
var start_time = jsPsych.getStartTime();
```

---

## jsPsych.getTotalTime

```javascript
jsPsych.getTotalTime()
```

### Parameters

None.

### Return value

Returns a numeric value indicating the number of milliseconds since `jsPsych.run` was called.

### Description

Gets the total time the participant has been in the experiment.

### Example

```javascript
var time = jsPsych.getTotalTime();
console.log(time);
```

---
## jsPsych.pauseExperiment

```javascript
jsPsych.pauseExperiment()
```

### Parameters

None.

### Return value

None.

### Description

Pauses the experiment. The experiment will finish the current trial, but will not execute any additional trials until `jsPsych.resumeExperiment()` is called.

### Example

```javascript
var trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'Press p to take a 30 second break. Otherwise, press c to continue immediately.',
  choices: ['p','c'],
  on_finish: function(data){
    if(jsPsych.pluginAPI.compareKeys(data.response, "p")) { 
      jsPsych.pauseExperiment();
      setTimeout(jsPsych.resumeExperiment, 30000);
    }
  }
}
```

---

## jsPsych.resumeExperiment

```javascript
jsPsych.resumeExperiment()
```

### Parameters

None.

### Return value

None.

### Description

Resumes the experiment after a call to `jsPsych.pauseExperiment()`. If the post trial delay (`post_trial_gap`) has not yet been reached, then the experiment will not continue until the delay is finished. For example, if `post_trial_gap` was 10,000ms and `jsPsych.resumeExperiment()` was called 6,000ms after the previous trial finished, then the experiment would not continue for another 4,000ms.

### Example

```javascript
var trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'Press p to take a 30 second break. Otherwise, press c to continue immediately.',
  choices: ['p','c'],
  on_finish: function(data){
    if(jsPsych.pluginAPI.compareKeys(data.response, "p")) { 
      jsPsych.pauseExperiment();
      setTimeout(jsPsych.resumeExperiment, 30000);
    }
  }
}
```

---

## jsPsych.run

```javascript
jsPsych.run(timeline)
```

### Parameters

| Parameter | Type    | Description                              |
| --------- | ------- | ---------------------------------------- |
| timeline  | array   | An array containing the objects that describe the experiment timeline. See [Creating an Experiment: The Timeline](../overview/timeline.md). |

### Return value

None.

### Description

Start the jsPsych experiment with the specified timeline.

### Example

```javascript
var timeline = [trial1, trial2, trial3];

jsPsych.run(timeline);
```

---

## jsPsych.setProgressBar

```javascript
jsPsych.setProgressBar(value)
```

### Parameters

| Parameter | Type    | Description                              |
| --------- | ------- | ---------------------------------------- |
| value     | numeric | Proprotion (between 0 and 1) to fill the progress bar. |


### Return value

None.

### Description

Set the progress bar to a custom amount. Proportion must be between 0 and 1. Values larger than 1 are treated as 1.

### Example

```javascript
jsPsych.setProgressBar(0.85);
```

---

## jsPsych.timelineVariable

```javascript
jsPsych.timelineVariable(variable, call_immediate)
```

### Parameters

Parameter | Type | Description
----------|------|------------
variable | string | Name of the timeline variable
call_immediate | bool | This parameter is optional and can usually be omitted. It determines the return value of `jsPsych.timelineVariable`. If `true`, the function returns the _value_ of the current timeline variable. If `false`, the function returns _a function that returns the value_ of the current timeline variable. When `call_immediate` is omitted, the appropriate option is determined automatically based on the context in which this function is called. When `jsPsych.timelineVariable` is used as a parameter value, `call_immediate` will be `false`. This allows it to be used as a [dynamic trial parameter](../overview/dynamic-parameters.md). When `jsPsych.timelineVariable` is used inside of a function, `call_immediate` will be `true`. It is possible to explicitly set this option to `true` to force the function to immediately return the current value of the timeline variable.

### Return value

Either a function that returns the value of the timeline variable, or the value of the timeline variable, depending on the context in which it is used. See `call_immediate` description above.

### Description

[Timeline variables](../overview/timeline.md#timeline-variables) are a powerful technique for generating experiments with repetitive procedures but different parameter values. This function fetches the current value of a particular timeline variable. It must be used in conjunction with a timeline that has timeline variables. See the [timeline variable section](../overview/timeline.md#timeline-variables) for details.

### Examples

#### Standard use as a parameter for a trial

```javascript
var trial = {
  type: jsPsychImageKeyboardResponse,
  stimulus: jsPsych.timelineVariable('image')
}

var procedure = {
  timeline: [trial],
  timeline_variables: [
    {image: 'face1.png'},
    {image: 'face2.png'},
    {image: 'face3.png'},
    {image: 'face4.png'}
  ]
}
```

#### Invoking immediately in a function

```javascript
var trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function(){
    return "<img style='width:100px; height:100px;' src='"+jsPsych.timelineVariable('image')+"'></img>";
  }
}

var procedure = {
  timeline: [trial],
  timeline_variables: [
    {image: 'face1.png'},
    {image: 'face2.png'},
    {image: 'face3.png'},
    {image: 'face4.png'}
  ]
}
```

Prior to jsPsych v6.3.0, the `call_immediate` parameter must be set to `true` when `jsPsych.timelineVariable` is called from within a function, such as a [dynamic parameter](../overview/dynamic-parameters.md):

```javascript
var trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function(){
    return "<img style='width:100px; height:100px;' src='"+jsPsych.timelineVariable('image', true)+"'></img>";
  }
}

var procedure = {
  timeline: [trial],
  timeline_variables: [
    {image: 'face1.png'},
    {image: 'face2.png'},
    {image: 'face3.png'},
    {image: 'face4.png'}
  ]
}
```


---

## jsPsych.version

```javascript
jsPsych.version()
```

### Parameters

None.

### Return value

Returns the version number as a string.

### Description

Gets the version of jsPsych.

### Example

```javascript
var version = jsPsych.version();
console.log(version);
```
