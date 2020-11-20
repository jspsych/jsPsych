# jspsych-free-sort plugin

The free-sort plugin displays one or more images on the screen that the participant can interact with by clicking and dragging. All images must be moved into the sorting area before the participant can click a button to end the trial. All of the moves that the participant performs are recorded, as well as the final positions of all images. This plugin could be useful when asking participants to position images based on similarity to one another, or to recall image spatial locations.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimuli | array | *undefined* | Each element of this array is an image path.
stim_height | numeric | 100 | The height of the images in pixels.
stim_width | numeric | 100 | The width of the images in pixels.
scale_factor | numeric | 1.5 | How much larger to make the stimulus while moving (1 = no scaling).
sort_area_height | numeric | 800 | The height of the container that participants can move the stimuli in. Stimuli will be constrained to this area.
sort_area_width | numeric | 800 | The width of the container that participants can move the stimuli in. Stimuli will be constrained to this area.
sort_area_shape | string | "ellipse" | The shape of the sorting area, can be "ellipse" or "square".
prompt | string | null | This string can contain HTML markup. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).
prompt_location | string | "above" | Indicates whether to show the prompt `"above"` or `"below"` the sorting area.
button_label | string | 'Continue' | The text that appears on the button to continue to the next trial.
change_border_background_color | boolean | true | If `true`, the sort area border color will change while items are being moved in and out of the sort area, and the background color will change once all items have been moved into the sort area. If `false`, the border will remain black and the background will remain white throughout the trial.
border_color_in | string | '#a1d99b' | If `change_border_background_color` is `true`, the sort area border will change to this color when an item is being moved into the sort area, and the background will change to this color when all of the items have been moved into the sort area.
border_color_out | string | '#fc9272' | If `change_border_background_color` is `true`, this will be the color of the sort area border when there are one or more items that still need to be moved into the sort area.
border_width | numeric | null | The width in pixels of the border around the sort area. If `null`, the border width will be 3% of the `sort_area_height`.

## Data Generated

In addition to the [default data collected by all plugins](overview#data-collected-by-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
init_locations | JSON string | A JSON-encoded object representing the initial locations of all the stimuli in the sorting area. The object is an array with one element per stimulus. Each element in the array has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location.
moves | JSON string |  A JSON-encoded object representing all of the moves the participant made when sorting. The object is an array with each element representing a move. Each element in the array has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location after the move.
final_locations | JSON string | A JSON-encoded object representing the final locations of all the stimuli in the sorting area. The object is an array with one element per stimulus. Each element in the array has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location.
rt | numeric | The response time in milliseconds for the participant to finish all sorting.

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
