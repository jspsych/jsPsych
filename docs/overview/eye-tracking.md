# Eye Tracking

jsPsych supports eye tracking through the [WebGazer](https://webgazer.cs.brown.edu/) library. WebGazer uses computer vision techniques to identify features of the participant's eyes via a webcam and predicts gaze location. The system is calibrated by having the participant click on or look at known locations on the screen. These locations are linked to eye features. Gaze location is predicted using regression.

## Getting Started

### Load webgazer.js

The [official version of WebGazer](https://webgazer.cs.brown.edu/#download) is currently **not** supported by jsPsych. Our [fork of the library](https://github.com/jspsych/WebGazer) contains some minor improvements aimed at the kind of experiments that jsPsych is typically used for, e.g., situations in which the timing of display screens needs to be accurate. 

You must include the `webgazer.js` file in your experiment via a `<script>` tag. 
However, the `webgazer.js` file is not part of any of the jsPsych NPM packages and is therefore not available via the unpkg.com CDN. 
Instead, it can be found on the jsdelivr.net CDN at: "https://cdn.jsdelivr.net/gh/jspsych/jspsych@jspsych@7.0.0/examples/js/webgazer/webgazer.js".

```html
<head>
  <script src="https://unpkg.com/jspsych@7.3.4"></script>
  <script src="https://cdn.jsdelivr.net/gh/jspsych/jspsych@jspsych@7.0.0/examples/js/webgazer/webgazer.js"></script>
</head>
```

!!! note 
  A copy of our forked `webgazer.js` file is also included in the jsPsych release, in the `/examples/js/webgazer` folder. 
  So if you prefer to download and host all of your jsPsych files (i.e. [set-up option 2](../tutorials/hello-world.md#option-2-download-and-host-jspsych) in the Hello World tutorial), then another option is to load that file rather than using the jsdelivr link above. 
  Assuming you downloaded the release and copied the `webgazer.js` file into a folder called `js/webgazer` in your root project directory, then you would load the file like this:
  ```html
  <script src="js/webgazer/webgazer.js"></script>
  ```

### Load the jsPsych webgazer extension

The [webgazer extension](../extensions/webgazer.md) adds functionality to jsPsych for interacting with webgazer. Load it like you would a plugin file.

```html
<head>
  <script src="https://unpkg.com/jspsych@7.3.4"></script>
  <script src="https://cdn.jsdelivr.net/gh/jspsych/jspsych@jspsych@7.0.0/examples/js/webgazer/webgazer.js"></script>
  <script src="https://unpkg.com/@jspsych/extension-webgazer@1.0.3"></script>
</head>
```

To use the WebGazer extension in an experiment, include it in the list of extensions passed to `initJsPsych()`

```js
initJsPsych({
  extensions: [
    {type: jsPsychExtensionWebgazer}
  ]
})
```

### Initialize the camera

To help the participant position their face correctly for eye tracking you can use the [webgazer-init-camera plugin](../plugins/webgazer-init-camera.md). This will show the participant what the camera sees, including facial feature landmarks, and prevent the participant from continuing until their face is in good position for eye tracking. This plugin will also trigger the experiment to request permission to access the user's webcam if it hasn't already been granted.


```js
var init_camera_trial = {
  type: jsPsychWebgazerInitCamera
}
```


### Calibration

To calibrate WebGazer, you can use the [webgazer-calibrate plugin](../plugins/webgazer-calibrate.md). This plugin allows you to specify a set of points on the screen for calibration and to choose the method for calibrating -- either clicking on each point or simply fixating on each point. The location of calibration points is specified in percentages, e.g., `[25,50]` will result in a point that is 25% of the width of the screen from the left edge and 50% of the height of the screen from the top edge. Options for controlling other details of the calibration are explained in the [documentation for the plugin](../plugins/webgazer-calibrate.md).

Note that instructions are not included in the calibration plugin, so you'll likely want to use a different plugin (e.g., `html-button-response`) to display instructions prior to running the calibration. 

```js
var calibration_trial = {
  type: jsPsychWebgazerCalibrate,
  calibration_points: [[25,50], [50,50], [75,50], [50,25], [50,75]],
  calibration_mode: 'click'
}
```


### Validation

To measure the accuracy and precision of the calibration, you can use the [webgazer-vaidate plugin](../plugins/webgazer-validate.md). Like the calibration plugin, you can specify a list of points to perform validation on. Here you can specify the points as either percentages or in terms of the distance from the center of the screen in pixels. Which mode you use will probably depend on how you are defining your stimuli throughout the experiment. You can also specify the radius of tolerance around each point, and the plugin will calculate the percentage of measured gaze samples within that radius. This is a potentially useful heuristic for deciding whether or not to calibrate again. Options for controlling other details of the validation are explained in the [documentation for the plugin](../plugins/webgazer-validate.md).


```js
var validation_trial = {
  type: jsPsychWebgazerValidate,
  validation_points: [[-200,200], [200,200],[-200,-200],[200,-200]],
  validation_point_coordinates: 'center-offset-pixels',
  roi_radius: 100
}
```

The validation procedure stores the raw gaze data for each validation point, the computed average offset from each validation point, the percentage of samples within the `roi_radius` for each validation point, and the number of samples collected per second.

```js
{
  raw_gaze: [...],
  percent_in_roi: [...],
  average_offset: [...],
  samples_per_sec: ...
}
```

We recommend performing calibration and validation periodically throughout your experiment.

### Adding eye tracking to a trial

To enable eye tracking for a trial in your experiment, you can simply add the WebGazer extension to the trial.

```js
var trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<img id="scene" src="my-scene.png"></img>',
  extensions: [
    {
      type: jsPsychExtensionWebgazer, 
      params: { 
        targets: ['#scene']
      }
    }
  ]
}
```

This will turn on WebGazer at the start of the trial. 

The `params` property in the `extensions` declaration allows you to pass in a list of [CSS selector strings](https://www.w3schools.com/cssref/css_selectors.asp). The [bounding rectangle](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) of the DOM element that matches each selector will be recorded in the data for that trial. This allows for easy alignment of the gaze data and objects on the screen.

```js
webgazer_targets : {
  'selector': {x: ..., y: ..., height: ..., width: ..., top: ..., left: ..., right: ..., bottom:...}
  'selector': {x: ..., y: ..., height: ..., width: ..., top: ..., left: ..., right: ..., bottom:...}
}
```

Gaze data will be added to the trial's data under the property `webgazer_data`. The gaze data is an array of objects. Each object has an `x`, a `y`, and a `t` property. The `x` and `y` properties specify the gaze location in pixels and `t` specifies the time in milliseconds since the start of the trial. Note that establishing the precision and accuracy of these measurements across the variety of web browsers and systems that your experiment participants might be using is quite difficult. For example, different browsers may cause small systematic shifts in the accuracy of `t` values. 

```js
webgazer_data: [
  {x: ..., y: ..., t: ...},
  {x: ..., y: ..., t: ...},
  {x: ..., y: ..., t: ...},
  {x: ..., y: ..., t: ...}
]
```

## Tips for Improving Data Quality

These are some anecdotal observations about factors that improve data quality.

1. The quality of the camera feed is essential. Good lighting makes a big difference. You may want to encourage participants to perform any eye tracking experiments in a well-lit room.
2. Participants need to keep their head relatively still during and after calibration. The calibration is not robust to head movements.
3. WebGazer's click-based calibration can be used throughout the experiment. You can turn this on by calling `jsPsych.extensions.webgazer.startMouseCalibration()` at any point in the experiment. If you use a continue button to advance through the experiment and move the location of the continue button around you can be making small adjustments to the calibration throughout. 
4. Computing the gaze predictions consumes more computational resources than most other things that jsPsych is typically used for. The sampling rate that WebGazer is able to achieve will depend on the computing power of the participant's device. You may want to ask the participant to close any non-essential software and browser windows prior to completing the experiment. You may also want to check that the sampling rate is sufficiently high as part of validation.

If you have tips based on your own experience please consider sharing them on our [discussion forum](https://github.com/jspsych/jsPsych/discussions) and we'll add to this list!

## Example

!!! tip 
    Additional example experiments using WebGazer are available in the **/examples** folder of the jsPsych release. See `webgazer.html`, `webgazer_image.html`, and `webgazer_audio.html`. 

!!! example
    Here's an example of putting all of the pieces above together. This example also shows how to use data from the validation to decide whether or not to recalibrate. You can <a href="../../demos/eye-tracking-with-webgazer.html" target="_blank">try this experiment here (opens in new tab)</a>.

    ```html
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://unpkg.com/jspsych@7.3.4"></script>
        <script src="https://unpkg.com/@jspsych/plugin-preload@1.1.3"></script>
        <script src="https://unpkg.com/@jspsych/plugin-html-button-response@1.2.0"></script>
        <script src="https://unpkg.com/@jspsych/plugin-html-keyboard-response@1.1.3"></script>
        <script src="https://unpkg.com/@jspsych/plugin-image-keyboard-response@1.1.3"></script>
        <script src="https://unpkg.com/@jspsych/plugin-webgazer-init-camera@1.0.3"></script>
        <script src="https://unpkg.com/@jspsych/plugin-webgazer-calibrate@1.0.3"></script>
        <script src="https://unpkg.com/@jspsych/plugin-webgazer-validate@1.0.3"></script>
        <script src="https://cdn.jsdelivr.net/gh/jspsych/jspsych@jspsych@7.0.0/examples/js/webgazer/webgazer.js"></script>
        <script src="https://unpkg.com/@jspsych/extension-webgazer@1.0.3"></script>
        <link
          rel="stylesheet"
          href="https://unpkg.com/jspsych@7.3.4/css/jspsych.css"
        />
        <style>
          .jspsych-btn {
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body></body>
      <script>

          var jsPsych = initJsPsych({
            extensions: [
              {type: jsPsychExtensionWebgazer}
            ]
          });

          var preload = {
            type: jsPsychPreload,
            images: ['img/blue.png']
          }

          var camera_instructions = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
              <p>In order to participate you must allow the experiment to use your camera.</p>
              <p>You will be prompted to do this on the next screen.</p>
              <p>If you do not wish to allow use of your camera, you cannot participate in this experiment.<p>
              <p>It may take up to 30 seconds for the camera to initialize after you give permission.</p>
            `,
            choices: ['Got it'],
          }

          var init_camera = {
            type: jsPsychWebgazerInitCamera
          }

          var calibration_instructions = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
              <p>Now you'll calibrate the eye tracking, so that the software can use the image of your eyes to predict where you are looking.</p>
              <p>You'll see a series of dots appear on the screen. Look at each dot and click on it.</p>
            `,
            choices: ['Got it'],
          }

          var calibration = {
            type: jsPsychWebgazerCalibrate,
            calibration_points: [
              [25,25],[75,25],[50,50],[25,75],[75,75]
            ],
            repetitions_per_point: 2,
            randomize_calibration_order: true
          }

          var validation_instructions = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
              <p>Now we'll measure the accuracy of the calibration.</p>
              <p>Look at each dot as it appears on the screen.</p>
              <p style="font-weight: bold;">You do not need to click on the dots this time.</p>
            `,
            choices: ['Got it'],
            post_trial_gap: 1000
          }

          var validation = {
            type: jsPsychWebgazerValidate,
            validation_points: [
              [25,25],[75,25],[50,50],[25,75],[75,75]
            ],
            roi_radius: 200,
            time_to_saccade: 1000,
            validation_duration: 2000,
            data: {
              task: 'validate'
            }
          }

          var recalibrate_instructions = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
              <p>The accuracy of the calibration is a little lower than we'd like.</p>
              <p>Let's try calibrating one more time.</p>
              <p>On the next screen, look at the dots and click on them.<p>
            `,
            choices: ['OK'],
          }

          var recalibrate = {
            timeline: [recalibrate_instructions, calibration, validation_instructions, validation],
            conditional_function: function(){
              var validation_data = jsPsych.data.get().filter({task: 'validate'}).values()[0];
              return validation_data.percent_in_roi.some(function(x){
                var minimum_percent_acceptable = 50;
                return x < minimum_percent_acceptable;
              });
            },
            data: {
              phase: 'recalibration'
            }
          }

          var calibration_done = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
              <p>Great, we're done with calibration!</p>
            `,
            choices: ['OK']
          }

          var begin = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: `<p>The next screen will show an image to demonstrate adding the webgazer extension to a trial.</p>
              <p>Just look at the image while eye tracking data is collected. The trial will end automatically.</p>
              <p>Press any key to start.</p>
            `
          }

          var trial = {
            type: jsPsychImageKeyboardResponse,
            stimulus: 'img/blue.png',
            choices: "NO_KEYS",
            trial_duration: 2000,
            extensions: [
              {
                type: jsPsychExtensionWebgazer, 
                params: {targets: ['#jspsych-image-keyboard-response-stimulus']}
              }
            ]
          }

          var show_data = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: function() {
              var trial_data = jsPsych.data.getLastTrialData().values();
              var trial_json = JSON.stringify(trial_data, null, 2);
              return `<p style="margin-bottom:0px;"><strong>Trial data:</strong></p>
                <pre style="margin-top:0px;text-align:left;">${trial_json}</pre>`;
            },
            choices: "NO_KEYS"
          };
          
          jsPsych.run([
            preload, 
            camera_instructions, 
            init_camera, 
            calibration_instructions, 
            calibration, 
            validation_instructions, 
            validation, 
            recalibrate,
            calibration_done,
            begin, 
            trial, 
            show_data
          ]);
          
      </script>
    </html>
    ```

    Below is example data from the image-keyboard-response trial taken from the experiment above. In addition to the standard data that is collected for this plugin, you can see the additional `webgazer_data` and `webgazer_targets` arrays. The `webgazer_data` shows 21 gaze location estimates during the 1-second image presentation. The `webgazer_targets` array shows that there was one target, the image-keyboard-response stimulus, and tells you the x- and y-coordinate boundaries for the target (image) rectangle. By comparing each of the x/y locations from the `webgazer_data` locations array with the target boundaries in `webgazer_targets`, you can determine if/when the estimated gaze location was inside the target area.

    ```js
    {
      "rt": null,
      "stimulus": "img/blue.png",
      "response": null,
      "trial_type": "image-keyboard-response",
      "trial_index": 4,
      "time_elapsed": 30701,
      "internal_node_id": "0.0-4.0",
      "webgazer_data": [
        { "x": 1065, "y": 437, "t": 39},
        { "x": 943, "y": 377, "t": 79},
        { "x": 835, "y": 332, "t": 110},
        { "x": 731, "y": 299, "t": 146},
        { "x": 660, "y": 271, "t": 189},
        { "x": 606, "y": 251, "t": 238},
        { "x": 582, "y": 213, "t": 288},
        { "x": 551, "y": 200, "t": 335},
        { "x": 538, "y": 183, "t": 394},
        { "x": 514, "y": 177, "t": 436},
        { "x": 500, "y": 171, "t": 493},
        { "x": 525, "y": 178, "t": 542},
        { "x": 537, "y": 182, "t": 592},
        { "x": 543, "y": 178, "t": 633},
        { "x": 547, "y": 177, "t": 691},
        { "x": 558, "y": 174, "t": 739},
        { "x": 574, "y": 183, "t": 789},
        { "x": 577, "y": 197, "t": 838},
        { "x": 584, "y": 214, "t": 889},
        { "x": 603, "y": 218, "t": 937},
        { "x": 606, "y": 221, "t": 987}
      ],
      "webgazer_targets": [
        "#jspsych-image-keyboard-response-stimulus": {
          "x": 490,
          "y": 135,
          "height": 300,
          "width": 300,
          "top": 135,
          "bottom": 435,
          "left": 490,
          "right": 790
        }
      ]
    }
    ```
