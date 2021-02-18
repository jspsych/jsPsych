# jspsych-resize

This plugin displays a resizable div container that allows the user to drag until the container is the same size as the item being measured. Once the user measures the item as close as possible, clicking the button sets a scaling factor for the div containing jsPsych content. This causes the stimuli that follow to have a known size, independent of monitor resolution.

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
item_height | numeric | 1 | The height of the item to be measured. Any units can be used as long as you are consistent with using the same units for all parameters.
item_width | numeric | 1 | The width of the item to be measured.
pixels_per_unit | numeric | 100 | After the scaling factor is applied, this many pixels will equal one unit of measurement.
prompt | string | `''` | HTML content to display below the resizable box, and above the button.
button_label | string | 'Continue' | Label to display on the button to complete calibration.
starting_size | numeric | 100 | The initial size of the box, in pixels, along the largest dimension. The aspect ratio will be set automatically to match the item width and height.

## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
final_width_px | numeric | Final width of the resizable div container, in pixels.
scale_factor | numeric | Scaling factor that will be applied to the div containing jsPsych content.

## Examples

#### Measuring a credit card and resizing the display to have 150 pixels equal an inch.

```javascript
var inputs = {
  type: 'resize',
  item_width: 3 + 3/8,
  item_height: 2 + 1/8,
  prompt: "<p>Click and drag the lower right corner of the box until the box is the same size as a credit card held up to the screen.</p>",
  pixels_per_unit: 150
};
```
