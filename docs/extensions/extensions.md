# Extensions

Extensions are jsPsych modules that can interface with any plugin to extend the functionality of the plugin. A canonical example of an extension is eye tracking. An eye tracking extension allows a plugin to gather gaze data and add it to the plugin's data object.

## Using an Extension

To use an extension in an experiment, you'll load the extension file via a `<script>` tag (just like adding a plugin) and then initialize the extension in the parameters of `jsPsych.init()`.

```html
<head>
  <script src="jspsych/jspsych.js"></script>
  <script src="jspsych/extensions/some-extension.js"></script>
</head>
```

```js
jsPsych.init({
  timeline: [...],
  extensions: ['some-extension']
})
```

To enable an extension during a trial, add the extension name to the `extensions` parameter list for the trial:

```js
var trial = {
  extensions: ['some-extension']
}
```

## List of Extensions

Extension | Description
------ | -----------
[jspsych&#8209;ext&#8209;webgazer.js](/extensions/jspsych-ext-webgazer.md) | Enables eye tracking using the [WebGazer](https://webgazer.cs.brown.edu/) library.

## Writing an Extension

To create a new extension you must create an object that supports a few event callbacks. A barebones extension file might look like this:

```js
jsPsych.extensions['new-extension'] = (function () {

  var extension = {};

  extension.initialize = function(params){

  }
  
  extension.on_start = function(){

  }

  extension.on_load = function(){

  }

  extension.on_finish = function(){

  }
  
});
```