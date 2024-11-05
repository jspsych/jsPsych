# Extension development

## Requirements for an extension

As of version 7.0, extensions are [JavaScript Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes). An extension must implement:

- [A `constructor()`](#constructor) that accepts an instance of jsPsych.
- [An `initialize()` function](#initialize) to handle the initialize event of the extension.
- [An `on_start()` function](#on_start) to handle the on_start event of the extension.
- [An `on_load()` function](#on_load) to handle the on_load event of the extension.
- [An `on_finish()` function](#on_finish) to handle the on_finish event of the extension and store data that the extension collects.
- [A static `info`](#static-info) property containing a unique name, version parameter, and data property for the extension.

### Templates

Plugins can be written in either plain JavaScript or in TypeScript. Template files for both [JavaScript](https://github.com/jspsych/jspsych-contrib/blob/main/packages/extension-template/index.js) and [TypeScript](https://github.com/jspsych/jspsych-contrib/blob/main/packages/extension-template-ts/src/index.ts) are available in the [jspsych-contrib repository](https://github.com/jspsych/jspsych-contrib/).

## Extension components

### constructor()

The extension's `constructor()` will be passed a reference to the instance of the `JsPsych` class that is running the experiment. The constructor should store this reference so that the plugin can access functionality from the core library and its modules.

```js
class MyAwesomeExtension {
  constructor(jsPsych){
    this.jsPsych = jsPsych;
  }
}
```

### initialize()

The `initialize()` function is called when an instance of jsPsych is first initialized, either through `initJsPsych()` or `new JsPsych()`. This is where setup code for the extension should be run. This event will happen once per experiment, unlike the other events which occur with each trial. The `params` object can include whatever parameters are necessary to configure the extension. The `params` object is passed from the call to `initJsPsych()` to `initialize()` method. `initialize()` must return a `Promise` that resolves when the extension is finished initializing.

```js
//... experiment code ...//
let jsPsych = initJsPsych({
  extensions: [
    {type: myAwesomeExtension, params: {demo: 'value'}}
  ]
});

//... extension code ...//
class MyAwesomeExtension {

  initialize(params){
    return new Promise((resolve, reject)=>{
      console.log(params.demo); // will output 'value'

      resolve(); // finish initialzing
    })
  }
}
```

### on_start()

`on_start()` is called at the start of the plugin execution, prior to calling `plugin.trial`. This is where trial-specific initialization can happen, such as creating empty containers to hold data or resetting internal state. The `params` object is passed from the declaration of the extension in the trial object. You can use `params` to customize the behavior of the extension for each trial.

```js
//... experiment code ...//
let trial = {
  type: htmlKeyboardResponse,
  stimulus: "You're awesome!",
  extensions: [
    {type: myAwesomeExtension, params: {demo: 'value'}}
  ]
});

//... extension code ...//
class MyAwesomeExtension {

  initialize(params){ ... }

  on_start(params){
    console.log(params.demo); // outputs 'value' before the trial begins.
  }
}
```

### on_load()

`on_load()` is called after the `on_load` event for the plugin has completed, which is typically when the plugin has finished executing initial DOM-modifying code and has set up various event listeners. This is where the extension can begin actively interacting with the DOM and recording data. The `params` object is passed from the declaration of the extension in the trial object. You can use `params` to customize the behavior of the extension for each trial.

```js
//... experiment code ...//
let trial = {
  type: htmlKeyboardResponse,
  stimulus: "You're awesome!",
  extensions: [
    {type: myAwesomeExtension, params: {demo: 'value'}}
  ]
});

//... extension code ...//
class MyAwesomeExtension {

  initialize(params){ ... }

  on_start(params){ ... }

  on_load(params){
    // replaces the contents of the display with 'value';
    this.jsPsych.getDisplayElement().innerHTML = params.demo;
  }
}
```

### on_finish()

`on_finish()` is called after the plugin invokes `jsPsych.finishTrial()`. This can be used for any teardown at the end of the trial. This method should return an object of data to append to the plugin's data. Note that this event fires _before_ the `on_finish` event for the plugin, so data added by the extension is accessible in any trial `on_finish` event handlers. The `params` object is passed from the declaration of the extension in the trial object. You can use `params` to customize the behavior of the extension for each trial.

```js
//... experiment code ...//
let trial = {
  type: htmlKeyboardResponse,
  stimulus: "You're awesome!",
  extensions: [
    {type: myAwesomeExtension, params: {demo: 'value'}}
  ],
  on_finish: (data) => {
    console.log(data.awesome); // will output 'value'.
  }
});

//... extension code ...//
class MyAwesomeExtension {

  initialize(params){ ... }

  on_start(params){ ... }

  on_load(params){ ... }

  on_finish(params){
    return {
      awesome: params.value
    }
  }
}
```

### static .info

The `info` property for the class must contain an object with a `name` property that has a unique name for the extension, a `version` property that has the version string, and a `data` parameter that includes information about the `data` generated by the extension.

```js
import { version } from '../package.json';

class MyAwesomeExtension {

}

MyAwesomeExtension.info = {
  name: 'awesome',
  version: version, // Should be hardcoded as `version: "1.0.1"` if not using build tools.
  data: {
    /** This will be scraped as metadata describing tracking_data and used to create the JsPsych docs */
    tracking_data: {
      type: ParameterType.STRING,
    }
  }
}
```

The `version` field describes the version of the extension used and then durin the experiment will be part of the generated data. This is used generate metadata and help maintain the Psych-DS standard. It should imported from the package.json file by including an import statement in the top of the index.ts file. This allows the `version` field be automatically updated with each changeset. If you are not using a build environment and instead writing a plain JS file, you can manually enter the `version` as a string as done in the comment.

The `data` field is an object containing all of the `data` generated for the plugin. Each 'data' object has a `type` and `default` property. Additionally, this should be only used for data you choose to generate. Any jsdoc (comments included in the /** */ tags) you include will be scraped as metadata if you are choosing to generate metadata. This scraped metadata will also be used to create the JsPsych documentation.

### Optional methods

The extension can also include any additional methods that are necessary for interacting with it. See the [webgazer extension](../extensions/webgazer.md) for an example.

## Advice for writing extensions

If you are developing an extension with the aim of including it in the main jsPsych repository we encourage you to follow the [contribution guidelines](contributing.md#contributing-to-the-codebase).

In general, extensions should be able to work with any plugin. They should make very few assumptions about what the DOM will contain beyond the container elements generated by jsPsych. If you are making an extension targeted at one or a small number of specific plugins, consider modifying the plugin code instead.
