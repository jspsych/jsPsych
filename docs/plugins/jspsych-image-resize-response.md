# jspsych-image-resize-response

This plugin displays a resizable image and records the resize response (final width and height of the image in pixels). Starting width and height of the resizable image can be adjusted. The user can choose to either fix the aspect ratio of the resizable image or let the aspect ratio vary freely. The trial can also contain an example image with specified width and height, which will be shown next to the resizable image. A reset button is available that will reset the resizable image to the starting width and height.

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | string | undefined | The source for the stimulus image to be resized.
stim_height | numeric | 1 | The height of the stimulus to be resized in pixels. 
stim_width | numeric | 1 | The width of the stimulus to be resized in pixels.
fixed_aspectratio | bool | false | If true, then aspect ratio will be fixed during resizing.
example | string | null | The source for the example image.
example_height | numeric | 1 | The height of the example image in pixels. 
example_width | numeric | 1 | The width of the example image in pixels.
prompt | string | `''` | HTML content to display below the resizable image, and above the button.
reset_label | string | null | If not null, a button with this label will be displayed to function as a reset button for the resizing of the image.
button_label | string | 'Continue' | Label to display on the button to complete calibration.


## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
final_width_px | numeric | Final width of the resizable image, in pixels.
final_height_px | numeric | Final height of the resizable image, in pixels.

## Examples

```javascript
var trial = {
  type: 'image-resize-response',
  example: 'img/purple_circle.svg',
  stimulus: 'img/blue_circle.svg',
  example_width: 200,
  example_height: 300,
  stim_width: 250,
  stim_height: 250,
  prompt: "<p>Resize the stimulus on the right to match the size of the example on the left.</p>",
  reset_label: 'Reset',
  fixed_aspectratio: false
};
```
