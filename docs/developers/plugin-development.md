# Plugin development

## Requirements for a plugin

Plugins are implemented as [JavaScript Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes). A plugin must implement:

* A `constructor()` that accepts an instance of jsPsych.
* A `trial()` method that accepts an `HTMLElement` as its first argument and an object of trial parameters as its second argument. There is an optional third argument to [handle the `on_load` event]() in certain cirumstances. The `trial()` method should invoke `jsPsych.finishTrial()` to [end the trial and save data]() at the appropriate moment.
* A static `info` property on the class that contains an [object describing the plugin's parameters]().

Plugins can be written in either plain JavaScript or in TypeScript. Template files for both [JavaScript](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-template/index.js) and [TypeScript](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-template-ts/src/index.ts) are available in the [jspsych-contrib repository](https://github.com/jspsych/jspsych-contrib/).

## Plugin components

### .constructor()



### .trial()

The plugin's `trial` property is a function that runs a single trial. There are two parameters that are passed into the trial method. The first, `display_element`, is the DOM element where jsPsych content is being rendered. This parameter will be an `HTMLElement`. Generally, you don't need to worry about this parameter being in the correct format, and can assume that it is an `HMTLElement` and use methods of that class. The second, `trial`, is an object containing all of the parameters specified in the corresponding TimelineNode. If you have specified all of your parameters in `plugin.info`, along with default values for each one, then the `trial` object will contain the default values for any parameters that were not specified in the trial's definition.

The only requirement for the `trial` method is that it calls `jsPsych.finishTrial()` when it is done. This is how jsPsych knows to advance to the next trial in the experiment (or end the experiment if it is the last trial). The plugin can do whatever it needs to do before that point.

### .info

The plugin's `info` property is an object that contains all of the available parameters for the plugin. Each parameter name is a property, and the value is an object that includes a description of the parameter, the value's type (string, integer, etc.), and the default value. See some of the plugin files in the jsPsych plugins folder for examples.

jsPsych allows most [plugin parameters to be dynamic](dynamic-parameters.md), which means that the parameter value can be a function that will be evaluated right before the trial starts. However, if you want your plugin to have a parameter that is a function that _shouldn't_ be evaluated before the trial starts, then you should make sure that the parameter type is `'FUNCTION'`. This tells jsPsych not to evaluate the function as it normally does for dynamic parameters. See the `canvas-*` plugins for examples.

## Plugin functionality

Inside the .trial() method you can do pretty much anything that you want, including modifying the DOM, setting up event listeners, and making asynchronous requests. In this section we'll highlight a few common things that you might want to do as examples.

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



### Responding to keyboard events

### Writing data

To write data to [jsPsych's data collection](/reference/jspsych-data/#datacollection) pass an object of data as the parameter to `jsPsych.finishTrial()`:

```javascript
constructor(jsPsych){
  this.jsPsych = jsPsych;
}

trial(display_element, trial){
  var data = {
    correct: true,
    rt: 350
  }

  this.jsPsych.finishTrial(data);
}
```

The data recorded will be that `correct` is `true` and that `rt` is `350`. [Additional data for the trial](/overview/plugins/#data-collected-by-all-plugins) will also be collected automatically.






- Writing a plugin with TS
- Writing a plugin with JS





## Writing new plugins

New plugins are welcome additions to the library. Plugins can be distributed independently of the main library or added to the GitHub repository via a pull request, following the process described above. If you want to add your plugin to the main library then there are a few guidelines to follow.

#### Make the plugin as general as possible

Plugins are most useful when they are flexible. Avoid fixing the value of parameters that could be variables. This is especially important for any text that displays on the screen in order to facilitate use in multiple languages.

#### Use the jsPsych.pluginAPI module when appropriate

The [pluginAPI module](/reference/jspsych-pluginAPI.md) contains functions relevant to plugin development. Avoid duplicating the functions defined within the library in your plugin, and instead use the pluginAPI whenever possible. If you have a suggestion for improving pluginAPI methods, then go ahead and submit a pull request to modify it directly.

#### Document your plugin

When submitting a pull request to add your plugin, make sure to include a documentation page in the same style as the other docs pages. Documentation files exist in the `docs` directory.

#### Include an example file

Write a short example HTML file to include in the `examples` directory. This should demonstrate the basic use cases of the plugin as clearly as possible.

#### Include a testing file

Automated code testing for jsPsych is implemented with [Jest](https://facebook.github.io/jest/). To run the tests, install Node and npm. Run `npm install` in the root jsPsych directory. Then run `npm test`. Plugins should have a testing file that validates the behavior of all the plugin parameters. See the `/tests/plugins` directory for examples.

You can add new kinds of tasks to jsPsych by creating new plugins, or modifying existing plugins. A task can be virtually any kind of activity. If it can be implemented in JavaScript, then it almost certainly can be turned into a jsPsych plugin.

### What's in a plugin file?

Plugin files follow a specific template. Adherence to the template is what allows jsPsych to run a plugin without knowing anything about what the plugin is doing. What makes plugins so flexible is that the template imposes very few requirements on the code. Here's what an empty plugin template looks like:

```js
jsPsych.plugins['plugin-name'] = (function(){

  var plugin = {};

  plugin.info = {
    name: 'plugin-name',
    parameters: {
    }
  }

  plugin.trial = function(display_element, trial){
    jsPsych.finishTrial();
  }

  return plugin;

})();
```

This plugin will work! It defines a plugin called 'plugin-name', and it does absolutely nothing. However, it won't break the experiment, and jsPsych will understand that this is a valid plugin.

Let's examine it in more detail.

The overall structure of the plugin is defined using a module JavaScript design pattern. This pattern uses a technique called an anonymous closure. This is why the first line has `(function(){` and the last line is `})();`. The details aren't important, but if you want to learn more about it, [this is a nice overview](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html). The reason this pattern is useful is because it allows for persistent state and private scope. In other words, the plugin is isolated and can't be altered by other plugins.

The module, created by the `(function(){`  `})();` expressions, contains an object called `plugin`. The `plugin` object has two properties: `info` and `trial`. The `plugin` object is returned at the end of the module, which is what assigns the defined properties of `plugin` to `jsPsych['plugin-name']`.



### The plugin template

An empty plugin template is included in the `plugins/template` folder.
