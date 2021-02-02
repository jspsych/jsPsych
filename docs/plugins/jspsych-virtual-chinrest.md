## jspsych-virtual-chin-rest plugin

This plugin consists in two parts:

To first calculate a participant’s display, participants are asked to place a credit card-sized card on the screen and adjust the slider on the screen to fit the card. This allows the researchers to calculate the pixel density on the monitor.

To measure the user’s distance from their monitor, there is also a blind spot task. Participants are asked to focus on a black square on the screen with their right eye closed, while a red dot repeatedly sweeps from right to left. They must hit the spacebar on their keyboards whenever it appears that the red dot has disappeared. This part allows researchers to determine the distance between the center of the black square and the center of the red dot when it disappears from eyesight and estimate how far the participant is from the monitor.


We would appreciate it if you cited this paper when you use the virtual-chinrest plugin: 

**Li, Q., Joo, S. J., Yeatman, J. D., & Reinecke, K. (2020). Controlling for Participants’ Viewing Distance in Large-Scale, Psychophysical Online Experiments Using a Virtual Chinrest. Scientific Reports, 10(1), 1-11. DOI: [10.1038/s41598-019-57204-1]**



## Parameters

Parameters can be left unspecified if the default value is acceptable.

|Parameter|Type|Default Value| Descripton|
|---------|----|-------------|-----------|
resize_units| string | "none" | units to resize: `"none"` `"cm"` `"inch"` or `"deg"`. If `"none"`, no resize will be done.|
pixels_per_unit | numeric | 100 | After the scaling factor is applied, this many pixels will equal one unit of measurement. |
mouse_adjustment | boolean | true | If `true`, the size of the card will be adjusted by dragging the mouse; otherwise, the slider method will be used.
adjustment_prompt | string | "Let’s find out how big your monitor is! Please use any credit card that you have available. It can also be a grocery store membership card, your drivers license or anything else of the same format. Place your card flat onto the screen, and adjust the slider below to match its size. If you do not have access to a real card, you can use a ruler to measure the image width to 3.37 inches or 85.6 mm." | This string can contain HTML markup. Any content here will be displayed **above the card stimulus**. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which key to press).
adjustment_button_prompt | string | "Click here when the card has the right size!" | Content of the button displayed below the card stimulus.
item_height_mm | numeric | 1	| The height of the item to be measured.
item_width_mm | numeric | 1 | The width of the item to be measured.
item_init_size | numeric | 250 | The initial size of the card, in pixels, along its largest dimension.
blindspot_reps | numeric | 5 | How many times to measure the blindspot location. If `0`, blindspot will not be detected and viewing distance will not be computed. 
blindspot_prompt | string | "Now, let’s quickly test how far away you are sitting. You might know that vision tests at a doctor’s practice often involve chinrests. The doctor basically asks you to sit away from a screen in a specific distance. We do this here with a “virtual chinrest”. Instructions: put your finger on space bar on the keyboard. Close your right eye (Tips: it might be easier to cover your right eye by hand!) Using your left eye, focus on the black square. Click the button below to start the animation of the red ball. The red ball will disappear as it moves from right to left. Press the “Space” key as soon as the ball disappears from your eye sight. Keep your right eye closed and hit the “Space” key fast! | This string can contain HTML markup. Any content here will be displayed above the blindspot task.
blindspot_start_prompt | string | 'Start' | Content of the 'start' button for the blindspot tasks.
blindspot_done_prompt | string | 'Done' | Content of the 'done' button for the blindspot tasks.
blindspot_measurements_prompt | string | 'Remaining measurements: ' | Text accompanying the remaining measures counter that appears below the blindspot task.
viewing_distance_report | string  |'Estimated viewing distance (cm):' |  Estimated viewing distance data displayed after blidspot task. If `"none"` is given, viewing distance will not be reported to the participant



## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

|Name|Type|Value|
|----|----|-----|
rt |numeric| The response time in milliseconds.
item_height_mm | numeric | The height in millimeters of the item to be measured.
item_width_mm | numeric | The width in millimeters of the item to be measured
item_height_deg | numeric | Final height of the resizable div container, in degrees.
item_width_deg| numeric | Final width of the resizable div container, in degrees.
item_width_px | numeric | Final width of the resizable div container, in pixels.
px2deg | numeric | Pixels to degrees conversion factor.
px2mm | numeric | Pixels to millimeters conversion factor.
scale_factor | numeric | Scaling factor that will be applied to the div containing jsPsych content.
win_width_deg| numeric |  The interior width of the window in degrees.
win_height_deg | numeric | The interior height of the window in degrees.
view_dist_mm | numeric | Estimated distance to the screen in millimeters.

## Example

```javascript
  // measure px2mm, viewing distance and px2deg
  // do not resize
  // note: pixels_per_unit will be ignored
  let no_resize = {
    type: 'virtual-chinrest',
    blindspot_reps: 3,
    resize_units: "none",
    pixels_per_unit: 50 
  };

  // measure px2mm, but not viewing distance and px2deg
  // resize to cm (50 pixels per unit)
  // note, you may still choose to estimate viewing distance even if resizing to cm or inches
  let cm_resize = {
    type: 'virtual-chinrest',
    blindspot_reps: 0, 
    resize_units: "cm",
    pixels_per_unit: 50
  };

  // measure px2mm, viewing distance and px2deg
  // resize to degrees of visual angle (50 pixels per unit)
  // don't report viewing distance to subject
  let deg_resize = {
    type: 'virtual-chinrest',
    blindspot_reps: 3,
    resize_units: "deg",
    pixels_per_unit: 50,
    viewing_distance_report: 'none'
  };

  // resizing to degrees with no blindspot measurment is not possible
  // this trial will throw an error
  let error_trial = {
    type: 'virtual-chinrest',
    blindspot_reps: 0, 
    resize_units: "deg",
    pixels_per_unit: 50
  }
```
