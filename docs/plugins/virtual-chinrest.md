# virtual-chinrest

Current version: 2.0.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-virtual-chinrest/CHANGELOG.md).

This plugin provides a "virtual chinrest" that can measure the distance between the participant and the screen. It can also standardize the jsPsych page content to a known physical dimension (e.g., ensuring that a 200px wide stimulus is 2.2cm wide on the participant's monitor). This is based on the work of [Li, Joo, Yeatman, and Reinecke (2020)](https://doi.org/10.1038/s41598-019-57204-1), and the plugin code is a modified version of [their implementation](https://github.com/QishengLi/virtual_chinrest). We recommend citing their work in any paper that makes use of this plugin.

!!! note "Citation"
    Li, Q., Joo, S. J., Yeatman, J. D., & Reinecke, K. (2020). Controlling for Participants’ Viewing Distance in Large-Scale, Psychophysical Online Experiments Using a Virtual Chinrest. _Scientific Reports, 10_(1), 1-11. doi: [10.1038/s41598-019-57204-1](https://doi.org/10.1038/s41598-019-57204-1)

The plugin works in two phases.

**Phase 1**. To calculate the pixel-to-cm conversion rate for a participant’s display, participants are asked to place a credit card or other item of the same size on the screen and resize an image until it is the same size as the credit card. Since we know the physical dimensions of the card, we can find the conversion rate for the participant's display.

**Phase 2**. To measure the participant's viewing distance from their screen we use a [blind spot](<https://en.wikipedia.org/wiki/Blind_spot_(vision)>) task. Participants are asked to focus on a black square on the screen with their right eye closed, while a red dot repeatedly sweeps from right to left. They press the spacebar on their keyboard whenever they perceive that the red dot has disappeared. This part allows the plugin to use the distance between the black square and the red dot when it disappears from eyesight to estimate how far the participant is from the monitor. This estimation assumes that the blind spot is located at 13.5° temporally.

## Parameters

Parameters can be left unspecified if the default value is acceptable.

| Parameter                     | Type    | Default Value                                                                                                                                                                                                                                                                                                                                                                                    | Descripton                                                                                                                                                                                                                 |
| ----------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| resize_units                  | string  | "none"                                                                                                                                                                                                                                                                                                                                                                                           | Units to resize the jsPsych content to after the trial is over: `"none"` `"cm"` `"inch"` or `"deg"`. If `"none"`, no resizing will be done to the jsPsych content after the virtual-chinrest trial ends.                                                                                                                                 |
| pixels_per_unit               | numeric | 100                                                                                                                                                                                                                                                                                                                                                                                              | After the scaling factor is applied, this many pixels will equal one unit of measurement, where the units are indicated by `resize_units`. This is only used when resizing is done after the trial ends (i.e. the `resize_units` parameter is not "none").                                                                                                                                  |
| adjustment_prompt             | HTML string  | "Click and drag the lower right corner of the image until it is the same size as a credit card held up to the screen. You can use any card that is the same size as a credit card, like a membership card or driver's license. If you do not have access to a real card you can use a ruler to measure the image width to 3.37 inches or 85.6 mm."                                               | This string can contain HTML markup. Any content here will be displayed **below the card stimulus** during the resizing phase.                                                                                                                       |
| adjustment_button_prompt      | HTML string  | "Click here when the image is the correct size"                                                                                                                                                                                                                                                                                                                                                  | Content of the button displayed below the card stimulus during the resizing phase.                                                                                                                                                                   |
| item_path                     | string  | null                                                                                                                                                                                                                                                                                                                                    | Path of the item to be presented in the card stimulus during the resizing phase. If `null` then no image is shown, and a solid color background is used instead. _An example image is available in `/examples/img/card.png`_                                                                                                                                |
| item_height_mm                | numeric | 53.98                                                                                                                                                                                                                                                                                                                                                                                            | The known height of the physical item (e.g. credit card) to be measured, in mm.                                                                                                                                                                                     |
| item_width_mm                 | numeric | 85.6                                                                                                                                                                                                                                                                                                                                                                                             | The known width of the physical item (e.g. credit card) to be measured, in mm.                                                                                                                                                                                      |
| item_init_size                | numeric | 250                                                                                                                                                                                                                                                                                                                                                                                              | The initial size of the card stimulus, in pixels, along its largest dimension.                                                                                                                                                      |
| blindspot_reps                | numeric | 5                                                                                                                                                                                                                                                                                                                                                                                                | How many times to measure the blindspot location. If `0`, blindspot will not be detected, and viewing distance and degree data will not be computed.                                                                                        |
| blindspot_prompt              | HTML string  | "Now we will quickly measure how far away you are sitting. Put your left hand on the space bar. Cover your right eye with your right hand. Using your left eye, focus on the black square. Keep your focus on the black square. The red ball will disappear as it moves from right to left. Press the space bar as soon as the ball disappears. Press the space bar when you are ready to begin. | This string can contain HTML markup. Any content here will be displayed **above the blindspot task**.                                                                                                                      |                                                                                                                                                                    |
| redo_measurement_button_label | HTML string  | 'No, that is not close. Try again'                                                                                                                                                                                                                                                                                                                                                               | Text for the button on the viewing distance report page to re-do the viewing distance estimate. If the participant click this button, the blindspot task starts again.                                                                                                                                         |
| blindspot_done_prompt         | HTML string  | "Yes"                                                                                                                                                                                                                                                                                                                                                                                            | Text for the button on the viewing distance report page that can be clicked to accept the viewing distance estimate.                                                                                                                                                                                                      |
| blindspot_measurements_prompt | HTML string  | 'Remaining measurements: '                                                                                                                                                                                                                                                                                                                                                                       | Text accompanying the remaining measurements counter that appears below the blindspot task.                                                                                                                                    |
| viewing_distance_report       | HTML string  | "Based on your responses, you are sitting about `<span id='distance-estimate' style='font-weight: bold;'></span>` from the screen. Does that seem about right?"                                                                                                                                                                                                                                  | Estimated viewing distance data displayed after blindspot task. If `"none"` is given, viewing distance will not be reported to the participant. The HTML `span` element with `id = distance-estimate` returns the distance. |

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#datacollectedbyplugins), this plugin collects the following data for each trial.

_Note: The deg data are **only** returned if viewing distance is estimated with the blindspot method (px2deg, win_height_deg, win_width_deg, item_width_deg)._

| Name            | Type    | Value                                                                      |
| --------------- | ------- | -------------------------------------------------------------------------- |
| rt              | numeric | The response time in milliseconds.                                         |
| item_height_mm  | numeric | The height in millimeters of the item to be measured.                      |
| item_width_mm   | numeric | The width in millimeters of the item to be measured                        |
| item_height_deg | numeric | Final height of the resizable div container, in degrees.                   |
| item_width_deg  | numeric | Final width of the resizable div container, in degrees.                    |
| item_width_px   | numeric | Final width of the resizable div container, in pixels.                     |
| px2deg          | numeric | Pixels to degrees conversion factor.                                       |
| px2mm           | numeric | Pixels to millimeters conversion factor.                                   |
| scale_factor    | numeric | Scaling factor that will be applied to the div containing jsPsych content. |
| win_width_deg   | numeric | The interior width of the window in degrees.                               |
| win_height_deg  | numeric | The interior height of the window in degrees.                              |
| view_dist_mm    | numeric | Estimated distance to the screen in millimeters.                           |

## Simulation Mode

This plugin does not yet support [simulation mode](../overview/simulation.md).

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-virtual-chinrest@2.0.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-virtual-chinrest.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-virtual-chinrest
```
```js
import virtualChinrest from '@jspsych/plugin-virtual-chinrest';
```

## Example

???+ example "Measure distance to screen and pixel ratio; no resizing"
    === "Code"
        ```javascript
        var trial = {
            type: jsPsychVirtualChinrest,
            blindspot_reps: 3,
            resize_units: "none"
        };
        ```
    === "Demo"
        This demo requires a larger viewing area to complete. Please <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-virtual-chinrest-demo1.html">open the demo in a new tab</a>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-virtual-chinrest-demo1.html">Open demo in new tab</a>

???+ example "Resizing based on centimeters per pixel"
    === "Code"
        ```javascript
        var trial = {
          type: jsPsychVirtualChinrest,
          blindspot_reps: 3,
          resize_units: "cm",
          pixels_per_unit: 50
        };

        var resized_stimulus = {
          type: jsPsychHtmlButtonResponse,
          stimulus: `
            <p>If the measurements were done correctly, the square below should be 10 cm x 10 cm.</p>
            <div style="background-color: black; width: 500px; height: 500px; margin: 20px auto;"></div>
          `,
          choices: ['Continue']
        }
        ```
    === "Demo"
        This demo requires a larger viewing area to complete. Please <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-virtual-chinrest-demo2.html">open the demo in a new tab</a>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-virtual-chinrest-demo2.html">Open demo in new tab</a>

???+ example "Resizing based on degrees of visual angle per pixel"
    === "Code"
        ```javascript
        var trial = {
          type: jsPsychVirtualChinrest,
          blindspot_reps: 3,
          resize_units: "deg",
          pixels_per_unit: 50
        };

        var resized_stimulus = {
          type: jsPsychHtmlButtonResponse,
          stimulus: `
            <p>If the measurements were done correctly, the square below should take up about 10 degrees of visual angle.</p>
            <div style="background-color: black; width: 500px; height: 500px; margin: 20px auto;"></div>
          `,
          choices: ['Continue']
        }
        ```
    === "Demo"
        This demo requires a larger viewing area to complete. Please <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-virtual-chinrest-demo3.html">open the demo in a new tab</a>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-virtual-chinrest-demo3.html">Open demo in new tab</a>
