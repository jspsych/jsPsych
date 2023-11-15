# free-sort

Current version: 1.0.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-free-sort/CHANGELOG.md).

The free-sort plugin displays one or more images on the screen that the participant can interact with by clicking and dragging with a mouse, or touching and dragging with a touchscreen device. When the trial starts, the images can be positioned outside or inside the sort area. All images must be moved into the sorting area before the participant can click a button to end the trial. All of the moves that the participant performs are recorded, as well as the final positions of all images. This plugin could be useful when asking participants to position images based on similarity to one another, or to recall image spatial locations.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

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
counter_text_unfinished | string | You still need to place %n% item%s% inside the sort area. | Text to display when there are one or more items that still need to be placed in the sort area. If "%n%" is included in the string, it will be replaced with the number of items that still need to be moved inside. If "%s%" is included in the string, a "s" will be included when the number of items remaining is greater than one.
counter_text_finished | string | All items placed. Feel free to reposition items if necessary. | Text that will take the place of the counter_text_unfinished text when all items have been moved inside the sort area.
stim_starts_inside | boolean | false | If `false`, the images will be positioned to the left and right of the sort area when the trial loads. If `true`, the images will be positioned at random locations inside the sort area when the trial loads.
column_spread_factor | numeric | 1 | When the images appear outside the sort area, this determines the x-axis spread of the image columns. Default value is 1. Values less than 1 will compress the image columns along the x-axis, and values greater than 1 will spread them farther apart.

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
init_locations | array | An array containing objects representing the initial locations of all the stimuli in the sorting area. Each element in the array represents a stimulus, and has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. 
moves | array | An array containing objects representing all of the moves the participant made when sorting. Each object represents a move. Each element in the array has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location after the move. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. 
final_locations | array | An array containing objects representing the final locations of all the stimuli in the sorting area. Each element in the array represents a stimulus, and has a "src", "x", and "y" value. "src" is the image path, and "x" and "y" are the object location. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. 
rt | numeric | The response time in milliseconds for the participant to finish all sorting.

## Simulation Mode

This plugin does not yet support [simulation mode](../overview/simulation.md).

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-free-sort@1.0.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-free-sort.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-free-sort
```
```js
import freeSort from '@jspsych/plugin-free-sort';
```

## Examples

???+ example "Basic example"
    === "Code"
        ```javascript
        var sort_trial = {
            type: jsPsychFreeSort,
            stimuli: sorting_stimuli,
            stim_width: 80,
            stim_height: 60,
            sort_area_width: 500,
            sort_area_height: 500,
            prompt: "<p>Click and drag the images below to sort them so that similar items are close together.</p>"
        };
        ```
    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-free-sort-demo1.html" width="90%;" height="700px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-free-sort-demo1.html">Open demo in new tab</a>

