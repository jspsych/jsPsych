# The jsPsych core library

## jsPsych.currentChunkID

```
jsPsych.currentChunkID()
```

### Parameters

Parameter | Type | Description
----------|------|------------

### Return value

### Description 


### Example

```javascript

```

## jsPsych.currentTrial

```
jsPsych.currentTrial()
```

### Parameters

Parameter | Type | Description
----------|------|------------

### Return value

### Description 


### Example

```javascript

```
## jsPsych.finishTrial

```
jsPsych.finishTrial()
```

### Parameters

Parameter | Type | Description
----------|------|------------

### Return value

### Description 


### Example

```javascript

```
## jsPsych.getDisplayElement

```
jsPsych.getDisplayElement
```

### Parameters

Parameter | Type | Description
----------|------|------------

### Return value

### Description 


### Example

```javascript

```
## jsPsych.init

```
jsPsych.init(settings)
```

### Parameters

Parameter | Type | Description
----------|------|------------

### Return value

### Description 


### Example

```javascript

```
## jsPsych.initSettings

```
jsPsych.initSettings()
```

### Parameters

Parameter | Type | Description
----------|------|------------

### Return value

### Description 


### Example

```javascript

```
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




