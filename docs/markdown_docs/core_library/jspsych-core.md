# The jsPsych core library

---
## jsPsych.currentChunkID

```
jsPsych.currentChunkID()
```

### Parameters

None.

### Return value

Returns the chunk ID of the chunk that is currently active.

### Description 

Gets the chunk ID of the active chunk. The chunk ID is a string that follows a specific format:

* `"0-0"` is the chunk ID of the first top-level chunk
* `"1-0"` is the chunk ID of the second top-level chunk
* `"2-0"` is the chunk ID of the third top-level chunk, and so on...

If a chunk iterates multiple times (in a while chunk, for example), then the iterations are indicated in the second number:

* `"0-0"` is the chunk ID of the first top-level chunk during the first iteration
* `"0-1"` is the chunk ID of the first top-level chunk during the second iteration
* `"0-2"` is the chunk ID of the first top-level chunk during the third iteration, and so on...

If chunks are nested in other chunks, then the hierarchical structure is shown with `"."`:

* `"0-0.1-0"` is the chunk ID of the second chunk on the timeline of the first top-level chunk.
* `"0-0.2-0"` is the chunk ID of the third chunk on the timeline of the first top-level chunk, and so on...

The rules about iterations apply throughout the hierarchical ID:

* `"0-2.1-3"` is the chunk ID of the second chunk, executing for the fourth time, on the timeline of the first top-level chunk, executing for the third time.


### Example

```javascript
var chunkid = jsPsych.currentChunkID();

console.log('The current chunk ID is '+chunkid);
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
## jsPsych.finishTrial

```
jsPsych.finishTrial()
```

### Parameters

None.

### Return value

Returns nothing.

### Description 

This method tells jsPsych that the current trial is over. It is used in all of the plugins to end the current trial. When the trial ends a few things happen:

* The on_finish callback function is executed for the trial
* The on_trial_finish callback function is executed
* The progress bar is updated if it is being displayed
* The experiment ends if the trial is the last one (and the on_finish callback function is executed).
* The next trial, if one exists, is started.

### Example

```javascript

// this code would be in a plugin
jsPsych.finishTrial();

```
---
## jsPsych.getDisplayElement

```
jsPsych.getDisplayElement
```

### Parameters

None.

### Return value

Returns the jQuery-object that contains the DOM element used for displaying the experiment.

### Description 

Get the DOM element that displays the experiment.

### Example

```javascript
var el = jsPsych.getDisplayElement();

// hide the jsPsych display
el.hide();
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

The settings object can contain several parameters. The only *required* parameter is `experiment_structure`.

Parameter | Type | Description
--------- | ---- | -----------
experiment_structure | array | An array containing the chunks and/or blocks that describe the experiment to run. See [Creating an Experiment: Chunks, Blocks, & Trials](../features/chunks-blocks-trials).
display_element | jQuery object | A jQuery-selected DOM element, e.g. `$('#target')` selects the element with the `id='target'` attribute. If left blank, then jsPsych will use the `<body>` element to display content (creating it if necessary).
on_finish | function | Function to execute when the experiment ends.
on_trial_start | function | Function to execute when a new trial begins.
on_trial_finish | function | Function to execute when a trial ends.
on_data_update | function | Function to execute every time data is stored using the `jsPsych.data.write` method. All plugins use this method to save data, so this function runs every time a plugin stores new data.
show_progress_bar | boolean | If true, then [a progress bar](../features/progress-bar.md) is shown at the top of the page.


### Return value

Returns nothing.

### Description 

This method configures and starts the experiment. 

### Example

```javascript

```
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
console.log(JSON.stringify(settings.experiment_structure));
```
---
## jsPsych.preloadImages

```
jsPsych.preloadImages(images, callback_complete, callback_load)
```

### Parameters

Parameter | Type | Description
----------|------|------------
images | array | An array of image paths to load. The array can be nested (e.g. if images are in multiple arrays to help sort by condition or task).
callback_complete | function | A function to execute when all the images have been loaded.
callback_load | function | A function to execute after each image has been loaded. A single parameter is passed to this function which contains the number of images that have been loaded so far.

### Return value

Returns nothing.

### Description 

Use this function to preload image files. See [Image Preloading](../features/image-preloading.md) in the documentation.

It is possible to run this function without specifying a callback function. However, in this case the code will continue executing while the images are loaded. Thus, it is possible that an image would be required for display before it is done preloading. The `callback_complete` function will only exectute after all the images are loaded, and can be used to control the flow of the experiment (e.g. by starting the experiment in the `callback_complete` function).

The `callback_load` function can be used to indicate progress, if the number of images to be loaded is known ahead of time. See example below.

### Examples

#### Basic use
```javascript

var images = ['img/file1.png', 'img/file2.png', 'img/file3.png'];

jsPsych.preloadImages(images, function(){ startExperiment(); });

function startExperiment(){
    jsPsych.init({
        experiment_structure: exp
    });
}

```

#### Show progress of loading

```javascript
var images = ['img/file1.png', 'img/file2.png', 'img/file3.png'];

jsPsych.preloadImages(images, function(){ startExperiment(); }, function(nLoaded) { updateLoadedCount(nLoaded); });

function updateLoadedCount(nLoaded){
	var percentcomplete = nLoaded / images.length * 100;
	
	// could put something fancier here, like a progress bar
	// or updating text in the DOM.
	console.log('Loaded '+percentcomplete+'% of images');
}

function startExperiment(){
    jsPsych.init({
        experiment_structure: exp
    });
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
current_trial_local | numeric | Returns the trial index of the current trial relative to the current chunk. For example, if the trial is the 4th trial to execute within a chunk, then the value of this will be `4`.
total_chunks | numeric | Returns the total number of top-level chunks. (Chunks embedded in other chunks don't count).
current_chunk | numeric | Returns the index of the current top-level chunk.


### Description 

This method returns information about the length of the experiment and the subject's current location in the experiment timeline.

### Example

```javascript

var progress = jsPsych.progress();

var percent_complete = progress.current_chunk / progress.total_chunks * 100;

alert('You have completed approximately '+percent_complete+'% of the experiment');

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

```




