# Image Preloading

If an experiment uses images as stimuli, it is important to preload the image files before running the experiment. Preloading images means that the subject's browser will download all of the image files and store them in memory on the subject's computer. This is important because loading an image file is much faster if it is already in memory on the subject's computer. Without preloading, there will be noticeable delays in the display of images, which will affect any timing measurements (such as how long the image is displayed, or a subject's response time since first viewing an image).

jsPsych has an image preloading function in the core library. For full documentation, see the [API reference page](../core_library/jspsych-core.md#jspsychpreloadimages). The function will load all of the images listed in an array, and then call a function when the loading is complete.

```javascript
// an array of paths to images that need to be loaded
var images = ['img/file1.png', 'img/file2.png', 'img/file3.png'];

jsPsych.preloadImages(images, function(){ startExperiment(); });

function startExperiment(){
	jsPsych.init({
		experiment_structure: exp
	});
}
```