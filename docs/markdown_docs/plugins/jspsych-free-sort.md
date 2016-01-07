# jspsych-free-sort plugin

The free-sort plugin displays a collection of images on the screen that the subject can interact with by clicking and dragging. All of the moves that the subject performs are recorded.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimuli | array | *undefined* | Each element of this array is an image path.
stim_height | numeric | 100 | The height of the images in pixels.
stim_width | numeric | 100 | The width of the images in pixels.
sort_area_height | numeric | 800 | The height of the container that subjects can move the stimuli in. Stimuli will be constrained to this area.
sort_area_width | numeric | 800 | The width of the container that subjects can move the stimuli in. Stimuli will be constrained to this area.
prompt | string | "" | This string can contain HTML markup. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g. which key to press).
prompt_location | string | "above" | Indicates whether to show the prompt `"above"` or `"below"` the sorting area.


## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
init_locations | JSON string | A JSON-encoded object representing the initial locations of all the stimuli in the sorting area. The object is an array with one element per stimulus. Each element in the array has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location.
moves | JSON string |  A JSON-encoded object representing all of the moves the participant made when sorting. The object is an array with each element representing a move. Each element in the array has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location after the move.
final_locations | JSON string | A JSON-encoded object representing the final locations of all the stimuli in the sorting area. The object is an array with one element per stimulus. Each element in the array has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location.
rt | numeric | The response time in milliseconds for the subject to finish all sorting.

## Examples

#### Basic example

```javascript
var sorting_stimuli = [];
for (var i = 1; i <= 12; i++) {
    sorting_stimuli.push("img/cell_img_" + i + ".jpg");
}

var sort_trial = {
    type: 'free-sort',
    stimuli: sorting_stimuli,
    prompt: "<p>Click and drag the images below to sort them so that similar items are close together.</p>"
};
```
