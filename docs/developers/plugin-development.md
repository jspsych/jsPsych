# Plugin development

## Requirements for a plugin

As of version 7.0, plugins are [JavaScript Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes). A plugin must implement:

* [A `constructor()`](#constructor) that accepts an instance of jsPsych.
* [A `trial()` method](#trial) that accepts an `HTMLElement` as its first argument and an `object` of trial parameters as its second argument. There is an optional third argument to [handle the `on_load` event](#asynchronous-loading) in certain cirumstances. The `trial()` method should invoke `jsPsych.finishTrial()` to [end the trial and save data](#save-data) at the appropriate moment.
* [A static `info` property](#static-info) on the class that contains an object describing the plugin's parameters.

### Templates

Plugins can be written in either plain JavaScript or in TypeScript. Template files for both [JavaScript](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-template/index.js) and [TypeScript](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-template-ts/src/index.ts) are available in the [jspsych-contrib repository](https://github.com/jspsych/jspsych-contrib/).

## Plugin components

### constructor()

The plugin's `constructor()` will be passed a reference to the instance of the `JsPsych` class that is running the experiment. The constructor should store this reference so that the plugin can access functionality from the core library and its modules.

```js
constructor(jsPsych){
  this.jsPsych = jsPsych;
}
```

### trial()

The plugin's `trial()` method is responsible for running a single trial. When the jsPsych timeline reaches a trial using the plugin it will invoke the `trial()` method for the plugin.

There are three parameters that are passed into the trial method. 

* `display_element` is the DOM element where jsPsych content is being rendered. This parameter will be an `HTMLElement`, and you can use it to modify the portion of the document that jsPsych controls.
* `trial` is an object containing all of the parameters specified in the corresponding [TimelineNode](../overview/timeline.md).
* `on_load` is an optional parameter that contains a callback function to invoke when `trial()` has completed its initial loading. See [handling the on_load event](#asynchronous-loading).

The only requirement for the `trial` method is that it calls `jsPsych.finishTrial()` when it is done. This is how jsPsych knows to advance to the next trial in the experiment (or end the experiment if it is the last trial). The plugin can do whatever it needs to do before that point.

### static info

The plugin's `info` property is an object with a `name` and `parameters` property. 

```js
const info = {
  name: 'my-awesome-plugin',
  parameters: { }
}
```

The `parameters` property is an object containing all of the parameters for the plugin. Each parameter has a `type` and `default` property.

```js
const info = {
  name: 'my-awesome-plugin',
  parameters: { 
    image: {
      type: jspsych.ParameterType.IMAGE,
      default: undefined
    },
    image_duration: {
      type: jspsych.ParameterType.INT,
      default: 500
    }
  }
}
```

If the `default` value is `undefined` then a user must specify a value for this parameter when creating a trial using the plugin on the timeline. If they do not, then an error will be generated and shown in the console. If a `default` value is specified in `info` then that value will be used by the plugin unless the user overrides it by specifying that property.

jsPsych allows most [plugin parameters to be dynamic](../overview/dynamic-parameters.md), which means that the parameter value can be a function that will be evaluated right before the trial starts. However, if you want your plugin to have a parameter that is a function that _shouldn't_ be evaluated before the trial starts, then you should make sure that the parameter type is `'FUNCTION'`. This tells jsPsych not to evaluate the function as it normally does for dynamic parameters. See the `canvas-*` plugins for examples.

The `info` object should be a `static` member of the class, as shown below.

```js
const info = {
  name: 'my-awesome-plugin',
  parameters: { 
    image: {
      type: jspsych.ParameterType.IMAGE,
      default: undefined
    },
    image_duration: {
      type: jspsych.ParameterType.INT,
      default: 500
    }
  }
}

class MyAwesomePlugin {
  constructor(...)

  trial(...)
}

MyAwesomePlugin.info = info;
```

## Plugin functionality

Inside the `.trial()` method you can do pretty much anything that you want, including modifying the DOM, setting up event listeners, and making asynchronous requests. In this section we'll highlight a few common things that you might want to do as examples.

### Changing the content of the display

There are a few ways to change the content of the display. The `display_element` parameter of the trial method contains the `HTMLElement` for displaying jsPsych content, so you can use various JavaScript methods for interaction with the display element. A common one is to change the `innerHTML`. Here's an example of using `innerHTML` to display an image specified in the `trial` parameters.

```javascript
trial(display_element, trial){
  let html_content = `<img src="${trial.image}"></img>`;
  
  display_element.innerHTML = html_content;
}
```

jsPsych doesn't clear the display before or after each trial, so it is usually appropriate to use `innerHTML` to clear the display at the end of a trial.

```javascript
display_element.innerHTML = '';
```

### Waiting for specified durations

If you need to delay code execution for a fixed amount of time, we recommend using jsPsych's wrapper of the `setTimeout()` function, `jsPsych.pluginAPI.setTimeout()`. In `7.0` the only advantage of using this method is that it registers the timeout handler so that it can be easily cleared at the end of the trial using `jsPsych.pluginAPI.clearAllTimeouts()`. In future versions we may replace the implementation of `jsPsych.pluginAPI.setTimeout()` with improved timing functionality based on `requestAnimationFrame`. 

```js
trial(display_element, trial){
  // show image
  display_element.innerHTML = `<img src="${trial.image}"></img>`;

  // hide image after trial.image_duration milliseconds
  this.jsPsych.pluginAPI.setTimeout(()=>{
    display_element.innerHTML = '';
  }, trial.image_duration);
}
```

### Responding to keyboard events

While the plugin framework allows you to set up any events that you would like to, including normal handling of `keyup` or `keydown` events, the `jsPsych.pluginAPI` module contains the [`getKeyboardResponse` function](../reference/jspsych-pluginAPI.md#jspsychpluginapigetkeyboardresponse), which implements some additional helpful functionality for key responses in an experiment.

Here's a basic example. See the [`getKeyboardResponse` docs](../reference/jspsych-pluginAPI.md#jspsychpluginapigetkeyboardresponse) for additional examples.

```js
trial(display_element, trial){
  // show image
  display_element.innerHTML = `<img src="${trial.image}"></img>`;

  const after_key_response = (info) => {
    // hide the image
    display_element.innerHTML = '';

    // record the response time as data
    let data = {
      rt: info.rt
    }

    // end the trial
    this.jsPsych.finishTrial(data);
  }

  // set up a keyboard event to respond only to the spacebar
  this.jsPsych.pluginAPI.getKeyboardResponse({
    callback_function: after_key_response,
    valid_responses: [' '],
    persist: false
  });
}
```

### Asynchronous loading

One of the [trial events](../overview/events.md) is `on_load`, which is normally triggered automatically when the `.trial()` method returns. In most cases, this return happens after the plugin has done its initial setup of the DOM (e.g., rendering an image, setting up event listeners and timers, etc.). However, in some cases a plugin may implement an asynchronous operation that needs to complete before the initial loading of the plugin is considered done. An example of this is the `audio-keyboard-response` plugin, in which the check to see if the audio file is loaded is asynchronous and the `.trial()` method returns before the audio file has been initialized and the display updated.

If you would like to manually trigger the `on_load` event for a plugin, the `.trial()` method accepts an optional third parameter that is a callback function to invoke when loading is complete. 

In order to tell jsPsych to *not* invoke the regular callback when the `.trial()` method returns, you need to explicitly return a `Promise`. As of version `7.0` this Promise only serves as a flag to tell jsPsych that the `on_load` event should not be triggered. In future versions we may make the `Promise` functional so that the `trial` operation can be an `async` function.

Here's a sketch of how the `on_load` event can be utilized in a plugin. Note that this example is only a sketch and leaves out all the stuff that happens between loading and finishing the trial. See the source for the `audio-keyboard-response` plugin for a complete exampe.

```js
trial(display_element, trial, on_load){
  let trial_complete;

  do_something_asynchronous().then(()=>{
    on_load();
  });

  const end_trial = () => {
    this.jsPsych.finishTrial({...})
    trial_complete(); // not strictly necessary, but doesn't hurt.
  }

  return new Promise((resolve)=>{
    trial_complete = resolve;
  })
}
```

### Save data

To write data to [jsPsych's data collection](../reference/jspsych-data.md#datacollection) pass an object of data as the parameter to `jsPsych.finishTrial()`.

```javascript
constructor(jsPsych){
  this.jsPsych = jsPsych;
}

trial(display_element, trial){
  let data = {
    correct: true,
    rt: 350
  }

  this.jsPsych.finishTrial(data);
}
```

The data recorded will be that `correct` is `true` and that `rt` is `350`. [Additional data for the trial](../overview/plugins.md#data-collected-by-all-plugins) will also be collected automatically.

## Simulation mode

Plugins can optionally support [simulation modes](../overview/simulation.md).

To add simulation support, a plugin needs a `simulate()` function that accepts four arguments

`simulate(trial, simulation_mode, simulation_options, load_callback)`

* `trial`: This is the same as the `trial` parameter passed to the plugin's `trial()` method. It contains an object of the parameters for the trial.
* `simulation_mode`: A string, either `"data-only"` or `"visual"`. This specifies which simulation mode is being requested. Plugins can optionally support `"visual"` mode. If `"visual"` mode is not supported, the plugin should default to `"data-only"` mode when `"visual"` mode is requested.
* `simulation_options`: An object of simulation-specific options.
* `load_callback`: A function handle to invoke when the simulation is ready to trigger the `on_load` event for the trial. It is important to invoke this at the correct time during the simulation so that any `on_load` events in the experiment execute as expected.

Typically the flow for supporting simulation mode involves:

1. Generating artificial data that is consistent with the `trial` parameters.
2. Merging that data with any data specified by the user in `simulation_options`.
3. Verifying that the final data object is still consistent with the `trial` parameters. For example, checking that RTs are not longer than the duration of the trial.
4. In `data-only` mode, call `jsPsych.finishTrial()` with the artificial data.
5. In `visual` mode, invoke the `trial()` method of the plugin and then use the artificial data to trigger the appropriate events. There are a variety of methods in the [Plugin API module](../reference/jspsych-pluginAPI.md) to assist with things like simulating key presses and mouse clicks.

We plan to add a longer guide about simulation development in the future. For now, we recommend browsing the source code of plugins that support simulation mode to see how the flow described above is implemented.

## Advice for writing plugins

If you are developing a plugin with the aim of including it in the main jsPsych repository we encourage you to follow the [contribution guidelines](contributing.md#contributing-to-the-codebase). 

We also recommend that you make your plugin *as general as possible*. Consider using parameters to give the user of the plugin as many options for customization as possible. For example, if you have any text that displays in the plugin including things like button labels, implement the text as a parameter. This allows users running experiments in other languages to replace text values as needed.


