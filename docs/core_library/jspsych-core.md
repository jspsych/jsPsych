# The jsPsych core library

---
## jsPsych.addNodeToEndOfTimeline
```
jsPsych.addNodeToEndOfTimeline(node_parameters)
```

### Parameters

Parameter | Type | Description
--------- | ---- | -----------
node_parameters | object | An object defining a timeline. It must have, at a minimum, a `timeline` parameter with a valid timeline array as the value for that parameter.

### Return value

None.

### Description

Adds the timeline to the end of the experiment.

### Example

```javascript
var trial = {
  type: 'html-keyboard-response',
  stimulus: 'This is a new trial.'
}

var new_timeline = {
  timeline: [trial]
}

jsPsych.addNodeToEndOfTimeline(new_timeline)
```

---
## jsPsych.currentTimelineNodeID

```
jsPsych.currentTimelineNodeID()
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

If TimelineNodes are nested in other TimelineNodes, then the hierarchical structure is shown with `"."`:

* `"0.0-1.0"` is the ID of the second TimelineNode on the timeline of the first top-level TimelineNode.
* `"0.0-2.0"` is the ID of the third TimelineNode on the timeline of the first top-level TimelineNode, and so on...

The rules about iterations apply throughout the hierarchical ID:

* `"0.2-1.3"` is the ID of the second TimelineNode, executing for the fourth time, on the timeline of the first top-level TimelineNode, executing for the third time.


### Example

```javascript
var id = jsPsych.currentTimelineNodeID();

console.log('The current TimelineNode ID is '+id);
```

---
## jsPsych.currentTrial

```
jsPsych.currentTrial()
```

### Parameters

None.

### Return value

Returns the object describing the current trial. The object will contain all of the parameters associated with the current trial.

### Description

Get a description of the current trial

### Example

```javascript

var trial = jsPsych.currentTrial();

console.log('The current trial is using the '+trial.type+' plugin');
```
---
## jsPsych.endCurrentTimeline

```
jsPsych.endCurrentTimeline
```

### Parameters

None.

### Return value

None.

### Description

Ends the current timeline. If timelines are nested, then only the timeline that contains the current trial is ended.

### Example

#### Loop indefinitely until a particular key is pressed

```javascript

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
  type: 'image-keyboard-response',
  choices: [89, 78], // Y or N
  prompt: '<p>Press Y to Continue. Press N to end this node of the experiment.</p>',
  on_finish: function(data) {
    if (data.key_press == 78) {
      jsPsych.endCurrentTimeline();
    }
  },
  timeline: trials
}

var after_block = {
  type: 'html-keyboard-response',
  stimulus: '<p>The next node</p>',
  is_html: true
}

jsPsych.init({
  timeline: [block, after_block],
  on_finish: function() {
    jsPsych.data.displayData();
  }
});

```

---
## jsPsych.endExperiment

```
jsPsych.endExperiment(end_message)
```

### Parameters

Parameter | Type | Description
--------- | ---- | -----------
end_message | string | A message to display on the screen after the experiment is over.

### Return value

None.

### Description

Ends the experiment, skipping all remaining trials.

### Example

#### End the experiment if a particular response is given

```javascript
var trial = {
  type: 'image-keyboard-response',
  stimulus: 'image1.jpg',
  choices: [89,78], // Y or N
  prompt: '<p>Press Y to Continue. Press N to end the experiment</p>',
  on_finish: function(data){
    if(data.key_press == 78){
      jsPsych.endExperiment('The experiment was ended by pressing N.');
    }
  }
}
```

---
## jsPsych.finishTrial

```
jsPsych.finishTrial(data)
```

### Parameters

Parameter | Type | Description
----------|------|------------
data | object | The data to store for the trial.


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
## jsPsych.getDisplayElement

```
jsPsych.getDisplayElement
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
## jsPsych.init

```
jsPsych.init(settings)
```

### Parameters

Parameter | Type | Description
----------|------|------------
settings | object | The settings object for initializing jsPsych. See table below.

The settings object can contain several parameters. The only *required* parameter is `timeline`.

Parameter | Type | Description
--------- | ---- | -----------
timeline | array | An array containing the objects that describe the experiment timeline. See [Creating an Experiment: The Timeline](../overview/timeline.md).
display_element | string | The ID of an HTML element to display the experiment in. If left blank, then jsPsych will use the `<body>` element to display content (creating it if necessary). You can override this parameter at the trial level as well by specifying a display_element property on any timeline.
on_finish | function | Function to execute when the experiment ends.
on_trial_start | function | Function to execute when a new trial begins.
on_trial_finish | function | Function to execute when a trial ends.
on_data_update | function | Function to execute every time data is stored using the `jsPsych.data.write` method. All plugins use this method to save data (via a call to `jsPsych.finishTrial`, so this function runs every time a plugin stores new data.
on_interaction_data_update | function | Function to execute every time a new interaction event occurs. Interaction events include clicking on a different window (blur), returning to the experiment window (focus), entering full screen mode (fullscreenenter), and exiting full screen mode (fullscreenexit).
exclusions | object | Specifies restrictions on the browser the subject can use to complete the experiment. See list of options below.
show_progress_bar | boolean | If true, then [a progress bar](../overview/progress-bar.md) is shown at the top of the page.
auto_update_progress_bar | boolean | If true, then the progress bar at the top of the page will automatically update as every top-level timeline or trial is completed.
show_preload_progress_bar | boolean | If true, then a progress bar is displayed while media files are automatically preloaded.
preload_audio | array | An array of audio files to preload before starting the experiment.
preload_images | array | An array of image files to preload before starting the experiment.
max_load_time | numeric | The maximum number of milliseconds to wait for content to preload. If the wait time is exceeded an error message is displayed and the experiment stops. The default value is 60 seconds.
default_iti | numeric | The default inter-trial interval in ms. The default value if none is specified is 0ms.

Possible values for the exclusions parameter above.

Parameter | Type | Description
--------- | ---- | -----------
min_width | numeric | The minimum width of the browser window. If the width is below this value, a message will be displayed to the subject asking them to maximize their browser window. The experiment will sit on this page until the browser window is large enough.
min_height | numeric | Same as above, but with height.
audio | boolean | Set to true to require support for the WebAudio API (used by plugins that play audio files).

### Return value

Returns nothing.

### Description

This method configures and starts the experiment.

### Example

See any of the plugin examples in the [examples folder](https://github.com/jodeleeuw/jsPsych/tree/master/examples) in the GitHub repository.

---
## jsPsych.initSettings

```
jsPsych.initSettings()
```

### Parameters

None

### Return value

Returns the settings object used to initialize the experiment.

### Description

Gets the object containing the settings for the current experiment.

### Example

```javascript
var settings = jsPsych.initSettings();

// check the experiment structure
console.log(JSON.stringify(settings.timeline));
```

---
## jsPsych.pauseExperiment
```
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
  type: 'html-keyboard-response',
  stimulus: 'Press p to take a 30 second break. Otherwise, press c to continue immediately.',
  choices: ['p','c'],
  on_finish: function(data){
    if(data.key_press == 80) { // 80 = p
      jsPsych.pauseExperiment();
      setTimeout(jsPsych.resumeExperiment, 30000);
    }
  }
}
```

---
## jsPsych.progress

```
jsPsych.progress()
```

### Parameters

None.

### Return value

Returns an object with the following properties:

Property  | Type | Description
----------|------|------------
total_trials | numeric | Indicates the number of trials in the experiment. Note that this does not count possible loops or skipped trials due to conditional statements.
current_trial_global | numeric | Returns the trial index of the current trial in a global scope. Every trial will increase this count by 1.
percent_complete | numeric | Estimates the percent of the experiment that is complete. Works as expected for experiments without conditional or looping timelines. For complex timelines, the percent is an approximation.


### Description

This method returns information about the length of the experiment and the subject's current location in the experiment timeline.

### Example

```javascript

var progress = jsPsych.progress();

alert('You have completed approximately '+progress.percent_complete+'% of the experiment');

```
---
## jsPsych.resumeExperiment
```
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
  type: 'html-keyboard-response',
  stimulus: 'Press p to take a 30 second break. Otherwise, press c to continue immediately.',
  choices: ['p','c'],
  on_finish: function(data){
    if(data.key_press == 80) { // 80 = p
      jsPsych.pauseExperiment();
      setTimeout(jsPsych.resumeExperiment, 30000);
    }
  }
}
```

---
## jsPsych.startTime

```
jsPsych.startTime()
```

### Parameters

None.

### Return value

Returns a `Date` object indicating when the experiment began.

### Description

Get the time that the experiment began.

### Example

```javascript
var start_time = jsPsych.startTime();
```
---
## jsPsych.totalTime

```
jsPsych.totalTime()
```

### Parameters

None.

### Return value

Returns a numeric value indicating the number of milliseconds since `jsPsych.init` was called.

### Description

Gets the total time the subject has been in the experiment.

### Example

```javascript

var time = jsPsych.totalTime();
console.log(time);

```
