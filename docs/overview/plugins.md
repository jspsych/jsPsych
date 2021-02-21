# Plugins

In jsPsych, plugins define the kinds of trials or events that should occur during the experiment. Some plugins define very general events, like displaying a set of instructions pages, displaying an image and recording a keyboard response, or playing a sound file and recording a button response. Other plugins are more specific, like those that display particular kinds of stimuli (e.g. Random-Dot Kinematogram, visual search circle), or run a specific version of particular kind of task (e.g. the Implicit Association Test). Creating an experiment with jsPsych involves figuring out which plugins are needed to create the tasks you want your participants to perform.

Plugins provide a structure for a particular trial or task, but often allow for significant customization and flexibility. For example, the `image-keyboard-response` plugin defines a simple structure for showing an image and collecting a keyboard response. You can specify the what the stimulus is, what keys the subject is allowed to press, and how long the stimulus should be on the screen, how long the subject has to respond, and so on. Many of these options have reasonable default values; even though the image plugin has many different parameters, you only *need* to specify the image stimulus in order to use it. Each plugin has its own documentation page, which describes what the plugin does, what options are available, and what kind of data it collects.

## Using a plugin

To use a plugin, you'll need to load the plugin's JavaScript file in your experiment's HTML page. All jsPsych experiments also need to load the "jsPsych.js" file.

```html
<head>
  <script src="jsPsych/jspsych.js" type="text/javascript"></script>
  <script src="jsPsych/plugins/jspsych-image-keyboard-response.js" type="text/javascript"></script>
</head>
```

Once a plugin is loaded, you can use JavaScript to define a trial that uses that plugin. All jsPsych trials have a `type`, which tells jsPsych what plugin to use to run the trial. The trial's `type` is the plugin name, which usually the same as the plugin file name, but with the "jspsych-" prefix removed.

The following JavaScript code defines a trial using the `image-keyboard-response` plugin to display an image file. This trial uses the default values for valid keys, stimulus duration, trial duration, and other parameters. 

```javascript
var image_trial = {
	type: 'image-keyboard-response', 
	stimulus: 'images/happy_face.jpg'
}
```

You can override any default parameter values by adding them into your trial object. Here's an exampe of overriding the default values for `trial_duration` and `post_trial_gap`:

```javascript
var image_trial = {
  type: 'image-keyboard-response',
  stimulus: 'images/happy_face.jpg',
  trial_duration: 3000,
  post_trial_gap: 2000
}
```

## Parameters available in all plugins

Each plugin specifies its own set of parameters. Check the documentation for a plugin to see what parameters are available and what they do.

There is also a set of parameters that can be specified for any plugin:

| Parameter      | Type     | Default Value           | Description                              |
| -------------- | -------- | ----------------------- | ---------------------------------------- |
| data           | object   | *undefined*             | An object containing additional data to store for the trial. See [the Data page](../overview/data.md) for more details. |
| post_trial_gap | numeric  | null                    | Sets the time, in milliseconds, between the current trial and the next trial. If null, there will be no gap. |
| on_start       | function | `function(){ return; }` | A callback function to execute when the trial begins, before any loading has occurred. See [the Event-Related Callbacks page](../overview/callbacks.md) for more details. |
| on_finish      | function | `function(){ return; }` | A callback function to execute when the trial finishes, and before the next trial begins. See [the Event-Related Callbacks page](../overview/callbacks.md) for more details. |
| on_load        | function | `function(){ return; }` | A callback function to execute when the trial has loaded, which typically happens after the initial display of the plugin has loaded. See [the Event-Related Callbacks page](../overview/callbacks.md) for more details. |
| css_classes    | string   | null                    | A list of CSS classes to add to the jsPsych display element for the duration of this trial. This allows you to create custom formatting rules (CSS classes) that are only applied to specific trials. For more information and examples, see the [Controlling Visual Appearance page](../overview/style.md) and the "css-classes-parameter.html" file in the jsPsych examples folder. |
| save_trial_parameters | object | `{}` | An object containing any trial parameters that should or should not be saved to the trial data. Each key is the name of a trial parameter, and its value should be `true` or `false`, depending on whether or not its value should be saved to the data. If the parameter is a function that returns the parameter value, then the value that is returned will be saved to the data. If the parameter is always expected to be a function (e.g. an event-related callback function), then the function itself will be saved as a string. For more examples, see the "save-trial-parameters.html" file in the jsPsych examples folder. |

### The data parameter

The `data` parameter allows you to add additional properties to the trial data. This can be useful for storing properties of the trial that are not directly apparent from the values that the plugin records. The `data` parameter value should be an object that contains key-value pairs.

A simple example is the [Flanker Task](https://en.wikipedia.org/wiki/Eriksen_flanker_task). In this experiment, participants respond to the direction of a central arrow by pressing a key to the left for a left-pointing arrow (<) and a key to the right for a right-pointing arrow (>). The arrow appears in the center of *flankers*, or arrows that the participant should ignore. Those flankers can be congruent (>>>>>) or incongruent (<<><<).

A trial for the Flanker Task written with jsPsych might look like this:

```javascript
var trial = {
  type: 'html-keyboard-response',
  stimulus: '<<<<<',
  choices: ['f','j'],
  data: {
    stimulus_type: 'congruent',
    target_direction: 'left'
  }
}
```

Note the use of the data parameter to add a property `stimulus_type` with the value `congruent` and a property `target_direction` with the value `left`. Having these properties recorded directly in the data simplifies data analysis, making it easy to aggregate data by `stimulus_type` and/or `target_direction`.

### The post_trial_gap (ITI) parameter

The default inter-trial interval (ITI) in jsPsych is 0 ms. This can be adjusted at the experiment-wide level by changing the `default_iti` parameter in `jsPsych.init()`.

The ITI can also be controlled at the trial level through the `post_trial_gap` parameter. Setting this parameter to a positive integer *x* will cause a blank screen to display after the trial for *x* milliseconds. Setting this parameter for a trial will override the `default_iti` value set in `jsPsych.init`.

```javascript
var trial = {
  type: 'html-keyboard-response',
  stimulus: 'There will be a 1.5 second blank screen after this trial.',
  post_trial_gap: 1500
}
```

### The on_start parameter

Immediately before a trial runs, there is an opportunity to run an arbitrary function through the `on_start` event handler. This event handler is passed a single argument containing an *editable* copy of the trial parameters. This function can therefore be used to alter the trial based on the state of the experiment, among other uses.

```javascript
// when this trial runs, the on_start function will change the trial's stimulus and data parameters,
// so the trial will display an incongruent Flanker stimulus with a right-facing central arrow
var trial = {
  type: 'html-keyboard-response',
  stimulus: '<<<<<',
  choices: ['f','j'],
  data: {
    stimulus_type: 'congruent',
    target_direction: 'left'
  },
  on_start: function(trial){
    trial.stimulus = '<<><<';
    trial.data.stimulus_type = 'incongruent';
    trial.data.target_direction = 'right';
  }
}
```

### The on_finish parameter

After a trial is completed, there is an opportunity to run an arbitrary function through the `on_finish` event handler. This function is passed a single argument containing an *editable* copy of the data recorded for that trial. This function can therefore be used to update the state of the experiment based on the data collected, or modify the data collected.

The `on_finish` function can be useful to calculate new data properties that were unknowable at the start of the trial. For example, with the Flanker Task example above, the `on_finish` function could check the response and use to this information to add a new property to the data called `correct`, which is either `true` or `false`.

```javascript
// in addition to all of the standard data collected for this trial, 
// this on_finish function adds a property called 'correct' 
// which is either 'true' or 'false'
// depending on the response that was made
var trial = {
  type: 'html-keyboard-response',
  stimulus: '<<<<<',
  choices: ['f','j'],
  data: {
    stimulus_type: 'congruent',
    target_direction: 'left',
    correct_response: 'f'
  },
  on_finish: function(data){
    if(jsPsych.pluginAPI.compareKeys(data.response, data.correct_response)){
      data.correct = true;
    } else {
      data.correct = false;
    }
  }
}
```

### The on_load parameter

The `on_load` callback function will trigger once the trial has completed loading. For most plugins, this will occur once the display has been initially updated but before any user interactions or timed events (e.g., animations) have occurred. This can be useful for changing various aspects of the page elements and their properties that would otherwise require modifying the plugin file.

```javascript
var trial = {
  type: 'image-keyboard-response',
  stimulus: 'imgA.png',
  on_load: function() {
    // this will change the src attribute of the image after 500ms
    setTimeout(function(){
      document.querySelector('img').src = 'imgB.png'
    }, 500);
  }
};
```

### The css_classes parameter

The `css_classes` parameter allows you to add an array of CSS class names to the jsPsych display element on that specific trial. This allows you to create custom style and formatting rules that are only applied to specific trials. If you want CSS rules that only apply to specific elements during a trial, you can use additional CSS selectors.

```html
<style>
  .flanker-stimulus {
    font-size: 500%;
  }
  .flanker-stimulus #prompt {
    font-size: 18px;
  }
  .fixation {
    font-size: 80px;
  }
</style>
<script>
  var fixation_trial = {
    type: 'html-keyboard-response',
    choices: jsPsych.NO_KEYS,
    stimulus: '+',
    css_classes: ['fixation']
  };
  var flanker_trial = {
    type: 'html-keyboard-response',
    choices: ["ArrowLeft", "ArrowRight"],
    stimulus: '>>>>>',
    prompt: '<span id="prompt">Press the left or right arrow key.</span>',
    css_classes: ['flanker-stimulus']
  };
</script>
```

### The save_trial_parameters parameter

The `save_trial_parameters` parameter allows you to tell jsPsych what parameters you want to be saved to the data. This can be used to override the parameter values that the plugin saves by default. You can add more parameter values to the data that are not normally saved, or remove parameter values that normally are saved. This can be especially useful when the parameter value is dynamic (i.e. a function) and you want to record the value that was used during the trial.

```javascript
var trial = {
  type: 'html-button-response',
  stimulus: '<p style="color: orange; font-size: 48px; font-weight: bold;">BLUE</p>',
  choices: function() {
    return jsPsych.randomization.shuffle(['Yes','No']);
  },
  post_trial_gap: function() {
    return jsPsych.randomization.sampleWithoutReplacement([200,300,400,500],1)[0];
  },
  save_trial_parameters: {
    // save the randomly-selected button order and post trial gap duration to the trial data
    choices: true,
    post_trial_gap: true,
    // don't save the stimulus
    stimulus: false
  }
}
```

!!! note 
    You cannot remove the `internal_node_id` and `trial_index` values from the trial data, because these are used internally by jsPsych.

## Data collected by all plugins

Each plugin defines what data is collected on the trial. The documentation for each plugin specifies what information will be stored in the trial data.

In addition to the data collected by a plugin, there is a default set of data that is collected on every trial.

| Name             | Type    | Value                                    |
| ---------------- | ------- | ---------------------------------------- |
| trial_type       | string  | The name of the plugin used to run the trial. |
| trial_index      | numeric | The index of the current trial across the whole experiment. |
| time_elapsed     | numeric | The number of milliseconds between the start of the experiment and when the trial ended. |
| internal_node_id | string  | A string identifier for the current TimelineNode. |

## Creating a new plugin

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

#### plugin.info

The plugin's `info` property is an object that contains all of the available parameters for the plugin. Each parameter name is a property, and the value is an object that includes a description of the parameter, the value's type (string, integer, etc.), and the default value. See some of the plugin files in the jsPsych plugins folder for examples.

jsPsych allows most [plugin parameters to be dynamic](dynamic-parameters.md), which means that the parameter value can be a function that will be evaluated right before the trial starts. However, if you want your plugin to have a parameter that is a function that _shouldn't_ be evaluated before the trial starts, then you should make sure that the parameter type is `'FUNCTION'`. This tells jsPsych not to evaluate the function as it normally does for dynamic parameters. See the `canvas-*` plugins for examples.

#### plugin.trial

The plugin's `trial` property is a function that runs a single trial. There are two parameters that are passed into the trial method. The first, `display_element`, is the DOM element where jsPsych content is being rendered. This parameter will be an `HTMLElement`. Generally, you don't need to worry about this parameter being in the correct format, and can assume that it is an `HMTLElement` and use methods of that class. The second, `trial`, is an object containing all of the parameters specified in the corresponding TimelineNode. If you have specified all of your parameters in `plugin.info`, along with default values for each one, then the `trial` object will contain the default values for any parameters that were not specified in the trial's definition.

The only requirement for the `trial` method is that it calls `jsPsych.finishTrial()` when it is done. This is how jsPsych knows to advance to the next trial in the experiment (or end the experiment if it is the last trial). The plugin can do whatever it needs to do before that point.

Of course, there are other things that you will probably want the plugin to do inside the `plugin.trial` function, besides just end. Here are some examples:

### Changing the content of the display

There are a few ways to change the content of the display. The `display_element` parameter of the trial method contains the DOM element for displaying content, so you can use various JavaScript methods for interaction with the display element. A common one is to change the `innerHTML`.

```javascript
var html_content = '<p>This is the first paragraph</p>';
html_content += '<p>This is the second paragraph</p>';

display_element.innerHTML = html_content;
```

jsPsych doesn't clear the display before or after each trial, so it is often appropriate to use `innerHTML` to clear the display at the end of a trial:

```javascript
// clear the display
display_element.innerHTML = '';
```

### Writing data

Plugins exist to collect data, so saving data is obviously a crucial thing to do. You can pass an object of data as the parameter to `jsPsych.finishTrial()`:

```javascript
var data = {
  correct: true,
  rt: 350
}

jsPsych.finishTrial(data);
```

The data recorded will be that `correct` is `true` and that `rt` is `350`. Additional data for the trial will also be collected automatically by the jsPsych library.

### The plugin template

An empty plugin template is included in the `plugins/template` folder.