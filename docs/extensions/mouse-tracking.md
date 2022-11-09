# mouse-tracking

This extension supports mouse tracking. 
Specifically, it can record the `x` and `y` coordinates, along with the time of [mousemove events](https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event), [mousedown events](https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event), and [mouseup events](https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseup_event).
It also allows recording of the [bounding rectangle](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) of elements on the screen to support the calculation of mouse events relative to different elements.

## Parameters

### Initialization Parameters

Initialization parameters can be set when calling `initJsPsych()`

```js
initJsPsych({
  extensions: [
    {type: jsPsychExtensionMouseTracking, params: {...}}
  ]
})
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
minimum_sample_time | number | 0 | The minimum time between samples for `mousemove` events in milliseconds. If `mousemove` events occur more rapidly than this limit, they will not be recorded. Use this if you want to keep the data files smaller and don't need high resolution tracking data. The default value of 0 means that all events will be recorded.

### Trial Parameters

Trial parameters can be set when adding the extension to a trial object.

```js
var trial = {
  type: jsPsych...,
  extensions: [
    {type: jsPsychExtensionMouseTracking, params: {...}}
  ]
}
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
targets | array | [] | A list of elements on the page that you would like to record the coordinates of for comparison with the mouse tracking data. Each entry in the array should be a valid [CSS selector string](https://www.w3schools.com/cssref/css_selectors.asp) that identifies the element. The selector string should be valid for exactly one element on the page. If the selector is valid for more than one element then only the first matching element will be recorded.
events | array | ['mousemove'] | A list of events to track. Can include 'mousemove', 'mousedown', and 'mouseup'. 

## Data Generated

Name | Type | Value
-----|------|------
mouse_tracking_data | array | An array of objects containing mouse movement data for the trial. Each object has an `x`, a `y`,  a `t`, and an `event` property. The `x` and `y` properties specify the mouse coordinates in pixels relative to the top left corner of the viewport and `t` specifies the time in milliseconds since the start of the trial. The `event` will be either 'mousemove', 'mousedown', or 'mouseup' depending on which event was generated.
mouse_tracking_targets | object | An object contain the pixel coordinates of elements on the screen specified by the `.targets` parameter. Each key in this object will be a `selector` property, containing the CSS selector string used to find the element. The object corresponding to each key will contain `x` and `y` properties specifying the top-left corner of the object, `width` and `height` values, plus `top`, `bottom`, `left`, and `right` parameters which specify the [bounding rectangle](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) of the element. 

## Examples

???+ example "Record mouse movement data and play it back"
    === "Code"
        ```javascript
        var trial = {
          type: jsPsychHtmlButtonResponse,
          stimulus: '<div id="target" style="width:250px; height: 250px; background-color: #333; margin: auto;"></div>',
          choices: ['Done'],
          prompt: "<p>Move your mouse around inside the square.</p>",
          extensions: [
            {type: jsPsychExtensionMouseTracking, params: {targets: ['#target']}}
          ],
          data: {
            task: 'draw'
          }
        };

        var replay = {
          type: jsPsychHtmlButtonResponse,
          stimulus: '<div id="target" style="width:250px; height: 250px; background-color: #333; margin: auto; position: relative;"></div>',
          choices: ['Done'],
          prompt: "<p>Here's the recording of your mouse movements</p>",
          on_load: function(){
            var mouseMovements = jsPsych.data.get().last(1).values()[0].mouse_tracking_data;
            var targetRect = jsPsych.data.get().last(1).values()[0].mouse_tracking_targets['#target'];
            
            var startTime = performance.now();

            function draw_frame() {
              var timeElapsed = performance.now() - startTime;
              var points = mouseMovements.filter((x) => x.t <= timeElapsed);
              var html = ``;
              for(var p of points){
                html += `<div style="width: 3px; height: 3px; background-color: blue; position: absolute; top: ${p.y - 1 - targetRect.top}px; left: ${p.x - 1 - targetRect.left}px;"></div>`
              }
              document.querySelector('#target').innerHTML = html;
              if(points.length < mouseMovements.length) {
                requestAnimationFrame(draw_frame);
              }
            }

            requestAnimationFrame(draw_frame);

          },
          data: {
            task: 'replay'
          }
        }
        ```
        
    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-extension-mouse-tracking-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-extension-mouse-tracking-demo1.html">Open demo in new tab</a>