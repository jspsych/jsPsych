# jspsych-vsl-animate-occlusion plugin

The VSL (visual statistical learning) animate occlusion plugin displays an animated sequence of shapes that disappear behind an occluding rectangle while they change from one shape to another. This plugin can be used to replicate the experiments described in:

Fiser, J., & Aslin, R. N. (2002). Statistical learning of higher-order temporal structure from visual shape sequences. *Journal of Experimental Psychology: Learning, Memory, and Cognition, 28*(3), 458.

## Dependency

This plugin requires the Snap.svg library, available at [http://www.snapsvg.io](http://www.snapsvg.io). You must include the library in the `<head>` section of your experiment page.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimuli | array | *undefined* | Each element of the array is a stimulus. A stimulus is a path to an image file. The order of stimuli in the array determines the order of the animation sequence.
canvas_size | array | `[400, 400]` | Array specifying the width and height of the area that the animation will display in. Stimuli will move to the edges of this area, so increasing the width without increasing the `timing_cycle` parameter will speed up the images.
image_size | array | `[100, 100]` | Array specifying the width and height of the images to show. The occluding rectangle will have a width equal to the width of image_size.
initial_direction | string | "left" | Which direction the stimulus should move first (subsequent directions will alternate). Choices are "left" or "right".
occlude_center | boolean | true | If true, display a rectangle in the center of the screen that is just wide enough to occlude the image completely as it passes behind.
choices | array | [ ] | This array contains the keys that the subject is allowed to press in order to respond to the stimulus. Keys can be specified as their [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) or as characters (e.g. `'a'`, `'q'`). The default value of an empty array means that all keys will be accepted as valid responses.
timing_cycle | numeric | 1000 | How long it takes for a stimulus in the sequence to make a complete cycle (move to the edge and back to the center) in milliseconds.
timing_pre_movement | numeric | 500 | How long to wait before the stimuli starts moving from behind the center rectangle.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
stimulus | JSON string | A JSON encoded array where each element of the array is a stimulus from the sequence, in the order that they were shown.
responses | JSON string | A JSON encoded array containing all response information. The encoded object is an array containing one element for each valid response. Each response item has three properties: `key` the key code of the response key, `stimulus` the index of the stimulus that was displayed when the response was made, and `rt` the response time measured since the start of the sequence.

## Examples

#### Displaying a simple sequence.

```javascript
var images = ["img/1.gif","img/2.gif","img/3.gif","img/4.gif","img/5.gif","img/6.gif","img/7.gif","img/8.gif","img/9.gif","img/10.gif"];


// create vsl block for jspsych
var vsl_block = {
  type: 'vsl-animate-occlusion',
  stimuli: images
};
```
