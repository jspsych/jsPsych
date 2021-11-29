# Migrating an experiment to v7.x

The release of version 7.0 changes a number of core components of jsPsych. 
We made these changes to improve jsPsych's compatibility with modern JavaScript tools like package managers and bundlers and to improve the developer experience for people contributing to jsPsych's codebase. 
We hope these changes will improve the long-term viability of the project and encourage more developers to contribute to jsPsych.

Our aim was to accomplish these goals with minimal changes to the user experience of jsPsych. 
However, we did have to change a few critical things. 
This guide is aimed at users who are familiar with v6.x of jsPsych and would like to understand what's changed in v7.x.

## Loading jsPsych

There are now three different ways you can load jsPsych into your HTML file. 
We've updated the [hello world tutorial](../tutorials/hello-world.md) to walk through each of the three options. 
If you are looking for the option that is most similar to the version 6.x experience, check out [option 2](../tutorials/hello-world.md#option-2-download-and-host-jspsych). 
The biggest difference from what you are used to is that the directory structure of the downloaded library is slightly different and plugin files are named a little bit differently.

## Initializing and running jsPsych

We've removed `jsPsych.init()` and split the features into two different functions. 

At the start of your experiment script, you'll now call `initJsPsych()` to get a new instance of jsPsych and store it in a variable called `jsPsych`. 
This is where you will pass in the variety of parameters that used to go into `jsPsych.init()`, with the exception of the `timeline` parameter.

```js
var jsPsych = initJsPsych({
  use_webaudio: false,
  on_finish: function(){
    jsPsych.data.displayData();
  }
});
```

Once you've created your timeline, then you'll launch the experiment by calling `jsPsych.run()`, passing in the timeline as the only argument. 
This is the point in your script where you've used the `jsPsych.init` function in jsPsych v6.x. 
Because the `jsPsych.run` function only needs the experiment timeline, this argument should be an _array_ (rather than an object like `{timeline: timeline}` in jsPsych v6.x).

```js
var timeline = [...]

jsPsych.run(timeline);
```

## The `type` parameter for trials

The `type` parameter now expects the value to be a plugin class rather than a string. 

For example, if you load the `html-keyboard-response` plugin from the CDN...

```html
<script src="http://unpkg.com/@jspsych/plugin-html-keyboard-response@1.1.0"></script>
```

... or from the `plugin-html-keyboard-response.js` file in the release archive...

```html
<script src="plugin-html-keyboard-response.js"></script>
```

... then a global variable defining the plugin's class called `jsPsychHtmlKeyboardResponse` is available.

To create a trial using the plugin, pass this class as the `type` parameter. 
The plugin classes are named starting with `jsPsych`, followed by the plugin name written in camel case (rather than with dashes between words).
See the ["Using a plugin" section](../overview/plugins.md#using-a-plugin) of the Plugins overview page for more examples.
Note that the value is *not a string*.

```js
var trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'Hello, version 7.0!'
}
```

## The `choices` parameter for keyboard response trials

The `choices` parameter for keyboard response trials no longer supports `jsPsych.NO_KEYS` and `jsPsych.ALL_KEYS`, and they have been replaced by the strings `"NO_KEYS"` and `"ALL_KEYS"` respectively.

For example, if you load the `audio-keyboard-response` plugin, you can prevent any user input like...

```js
var trial = {
  type: jsPsychAudioKeyboardResponse,
  choices: "NO_KEYS",
  stimulus: 'example.ogg',
  trial_ends_after_audio: true
}
```

## Using extensions

Like plugins, extensions are now also referenced by their class. 
Extensions are initiliazed in `initJsPsych()` instead of `jsPsych.init()`.
Extension classes are named similarly to plugins, except that they start with `jsPsychExtension`.

```js
var jsPsych = initJsPsych({
  extensions: [
    {type: jsPsychExtensionWebgazer}
  ]
})
```

The class is also used in trials that use the extension.

```js
var trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'Hello, version 7.0!',
  extensions: [
    {type: jsPsychExtensionWebgazer}
  ]
}
```

## Custom plugins

If you have custom plugins that you would like to upgrade to be compatible with v7.x we recommend using our [plugin template](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-template/index.js).

The new template implements plugins as a class, but the core components are essentially unchanged. 

* Anything in `plugin.info` from a v6.x plugin should be moved into the `info` object. Note that the `type` argument for the parameters follows a slightly different syntax in the v7.x plugins. This object is then [assigned as a static property of the class](https://github.com/jspsych/jspsych-contrib/blob/6a27c3fc72fdb1feb1a4041cd670775a7c4bf51d/packages/plugin-template/index.js#L39).
* Anything in `plugin.trial` from a v6.x plugin should be moved into the `trial` method inside the class. 
* The new template has a `constructor()` function that accepts an instance of jsPsych. You do not need to adjust this portion of the plugin.

There are a few changes to be aware of that may affect your plugin code.

* We removed the `registerPreload` function and we now auto-detect media to preload via the `type` argument specified in the `info` object. If a parameter is listed as `IMAGE`, `AUDIO`, or `VIDEO`, it will be automatically preloaded. If you wish to disable preloading you can set the `preload` flag to `false` for the parameter.
* If you invoke any functions from jsPsych, like `jsPsych.finishTrial()`, note that `jsPsych` is no longer a global variable and you must use the reference to jsPsych that is passed to the constructor. To do this, simply prefix all `jsPsych` references with `this.`, e.g., `jsPsych.finishTrial()` becomes `this.jsPsych.finishTrial()`. If your reference to a jsPsych function is inside of another function, then in order for the `this` keyword to appropriately reference the jsPsych instance, you must also use a JavaScript [arrow function expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) for the outer function. 
    For example, this:
    ```js
    function end_trial() {
      // ...
      jsPsych.finishTrial(data);
    }
    ```
    Would be re-written as:
    ```js
    const end_trial = () => {
      // ...
      this.jsPsych.finishTrial(data);
    }
    ```

## Need help?

If you encounter issues migrating code to v7.x, feel free to post in our [support thread for migration](https://github.com/jspsych/jsPsych/discussions/2179).




