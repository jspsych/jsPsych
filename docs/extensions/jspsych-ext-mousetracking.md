# jspsych-ext-mousetracking

This extension supports mouse tracking (i.e. position of participant's mouse cursor) during experiment.

## Parameters

### Initialization Parameters

Initialization parameters can be set when calling `jsPsych.init()`

```js
jsPsych.init({
  extensions: [
    {type: 'mousetracking', params: {...}}
  ]
})
```

Parameter | Type | Default Value | 
----------|------|---------------|
mousetracking  | object | `undefined` |

### Trial Parameters

Trial parameters can be set when adding the extension to a trial object.

```js
var trial = {
  type: '...',
  extensions: [
    {type: 'mousetracking', params: {...}}
  ]
}
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
targets | array | [] | A list of elements on the page that you would like to record the coordinates of for comparison with the mousetracking data. Each entry in the array should be a valid [CSS selector string](https://www.w3schools.com/cssref/css_selectors.asp) that identifies the element. The selector string should be valid for exactly one element on the page. If the selector is valid for more than one element then only the first matching element will be recorded.

## Data Generated

Name | Type | Value
-----|------|------
mousetracking_data | array | An array of objects containing cursor data for the trial. Each object has an `x`, a `y`, and a `t` property. The `x` and `y` properties specify the cursor location in pixels and `t` specifies the time in milliseconds since the start of the trial.
mousetracking_targets | array | An array of objects contain the pixel coordinates of elements on the screen specified by the `.targets` parameter. Each object contains a `selector` property, containing the CSS selector string used to find the element, plus `top`, `bottom`, `left`, and `right` parameters which specify the [bounding rectangle](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) of the element. 



