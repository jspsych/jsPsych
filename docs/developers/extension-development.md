# Extension development

To create a new extension you must create an object that supports a few event callbacks. A barebones extension file looks like this:

```js
jsPsych.extensions['new-extension'] = (function () {

  var extension = {};

  extension.initialize = function(params){
    // params are passed from the extensions parameter in initJsPsych
  }
  
  extension.on_start = function(params){
    // params are passed from the extensions parameter in the trial object
  }

  extension.on_load = function(params){
    // params are passed from the extensions parameter in the trial object
  }

  extension.on_finish = function(params){
    // params are passed from the extensions parameter in the trial object
    return {
      // any data that the extension returns here will be added to the trial data
    }
  }
  
  return extension;
});
```

The four events that an extension must support are shown in the sample code.

`extension.initialize` is called with `initJsPsych()`. This is where setup code for the extension can happen. This event will happen once per experiment, unlike the other events which occur with each trial. The `params` object can include whatever parameters are necessary to configure the extension. The `params` object is passed from the call to `initJsPsych()` to the `extension.initialize` method. `extension.initialize` must return a `Promise` that resolves when the extension is finished initializing. 

`extension.on_start` is called at the start of the plugin execution, prior to calling `plugin.trial`. This is where trial-specific initialization can happen, such as creating empty containers to hold data or resetting internal state. The `params` object is passed from the declaration of the extension in the trial object. You can use `params` to customize the behavior of the extension for each trial.

`extension.on_load` is called after `plugin.trial` has executed, which is typically when the plugin has finished executing initial DOM-modifying code and has set up various event listeners. This is where the extension can begin actively interacting with the DOM and recording data. The `params` object is passed from the declaration of the extension in the trial object. You can use `params` to customize the behavior of the extension for each trial.

`extension.on_finish` is called after the plugin completes. This can be used for any teardown at the end of the trial. This method should return an object of data to append to the plugin's data. Note that this event fires *before* the `on_finish` event for the plugin, so data added by the extension is accessible in any trial `on_finish` event handlers. The `params` object is passed from the declaration of the extension in the trial object. You can use `params` to customize the behavior of the extension for each trial.

The extension can also include any additional methods that are necessary for interacting with it. See the [webgazer extension](../extensions/jspsych-ext-webgazer.md) for an example.