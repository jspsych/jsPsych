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
  extensions: [
    {type: 'some-extension', params: {...}
  ]
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

To create a new extension you must create an object that supports a few event callbacks. A barebones extension file looks like this:

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
    return {
      // any data that the extension will add to a trial
    }
  }
  
  return extension;
});
```

The four events that an extension must support are shown in the sample code.

`extension.initialize` is called with `jsPsych.init()`. This is where setup code for the extension can happen. This event will happen once per experiment, unlike the other events which occur with each trial. The `params` object can include whatever parameters are necessary to configure the extension. The params object is passed from the call to `jsPsych.init()` to the `extension.initialize` method. This method must return a `Promise` that resolves when the extension is finished initializing. 

`extension.on_start` is called at the start of the plugin execution, prior to calling `plugin.trial`. This is where trial-specific initialization can happen, such as creating empty containers to hold data or resetting internal state.

`extension.on_load` is called after `plugin.trial` has executed, which is typically when the plugin has finished executing initial DOM-modifying code and has set up various event listeners. This is where the extension can begin actively interacting with the DOM and recording data.

`extension.on_finish` is called after the plugin completes. This can be used for any teardown at the end of the trial. This method should return an object of data to append to the plugin's data. Note that this event fires *before* the `on_finish` event for the plugin, so data added by the extension is accessible in any trial `on_finish` event handlers.

The extension can also include any additional methods that are necessary for interacting with it. See the [webgazer extension](/extensions/jspsych-ext-webgazer.md) for an example.