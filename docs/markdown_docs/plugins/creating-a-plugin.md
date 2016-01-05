# Creating a new plugin

Creating new plugins is the way to add new kinds of tasks to jsPsych. A task can be virtually any kind of activity. If it can be implemented in JavaScript, then it almost certainly can be turned into a plugin.

## What's in a plugin file?

Plugin files follow a specific template. Adherence to the template is what allows jsPsych to run a plugin without knowing anything about what the plugin is doing. What makes plugins so flexible is that the template imposes very few requirements on the code. Here's what an empty plugin template looks like:

```
jsPsych.plugins['plugin-name'] = (function(){

  var plugin = {};

  plugin.trial = function(display_element, trial){
    jsPsych.finishTrial();
  }

  return plugin;

})();
```

This plugin will work! It defines a plugin called 'plugin-name', and it does absolutely nothing. However, it won't break the experiment, and jsPsych will understand that this is a valid plugin.

Let's examine it in more detail.

The overall structure of the plugin is defined using a module JavaScript design pattern. This pattern uses a technique called an anonymous closure. This is why the first line has `(function(){` and the last line is `})();`. The details aren't important, but if you want to learn more about it, [this is a nice overview](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html). The reason this pattern is useful is because it allows for persistent state and private scope. In other words, the plugin is isolated can't be altered by other plugins.

The module, created by the `(function(){`  `})();` expressions, contains an object called `plugin` that has two properties, `create` and `trial`. Both properties define functions. The `plugin` object is returned at the end of the module, which is what assigns the defined properties of `plugin` to `jsPsych['plugin-name']`.

### plugin.trial

The `trial` method is responsible for running a single trial. There are two parameters that are passed into the trial method. The first, `display_element`, is the DOM element where jsPsych content is being rendered. This parameter needs to be a jQuery object containing a collection of one DOM element. Generally, you don't need to worry about this parameter being in the correct format, and can assume that it is a jQuery object that you can use various jQuery methods on. The second, `trial`, is an object containing all of the parameters specified in the corresponding TimelineNode.

The only requirement for the `trial` method is that it calls `jsPsych.finishTrial()` when it is done. This is how jsPsych knows to advance to the next trial in the experiment (or end the experiment if it is the last trial). The plugin can do whatever it needs to do before that point.

Of course, there are other things that you will probably want the plugin to do besides just end. Here are some examples:

#### Change the content of the display

There are a few ways to change the content of the display. The `display_element` parameter of the trial method contains the jQuery representation of the DOM element for displaying content, so you can use various jQuery methods for manipulating the content. Two common ones are `append` and `html`.

```javascript
display_element.append('<p>This is the first paragraph</p>');
display_element.append('<p>This is the second paragraph</p>');
```

`append` will *add* content to the display. The above calls would result in two paragraphs being rendered.

```javascript
display_element.html('<p>This is the first paragraph</p>');
display_element.html('<p>This paragraph will replace the first one</p>');
```

`html` will *replace* the content on the display. The above calls will result in only the second paragraph appearing on the screen. It is often appropriate to use the `html` method to clear the display at the end of a trial:

```javascript
// clear the display
display_element.html('');
```

#### Write data

Plugins exist to collect data, so saving data is obviously a crucial thing to do! You can pass an object of data as the parameter to `jsPsych.finishTrial()`:

```javascript
var data = {
  correct: true,
  rt: 350
}

jsPsych.finishTrial(data)
```

The data recorded will be that `correct` is `true` and that `rt` is `350`. Additional data for the trial will also be collected automatically by the jsPsych library.

## The plugin template

An empty plugin template is included in the `plugins/template` folder.
