# Plugins

In jsPsych, plugins define the kinds of tasks that subjects perform in experiments. Some plugins define very general tasks, like displaying instructions or displaying a visual stimulus and getting a keyboard response. Other plugins are more specific, displaying particular kinds of interactive stimuli, or running a specific kind of perceptual discrimination task. Creating an experiment with jsPsych involves figuring out which plugins are needed for the kinds of tasks you want to have your subjects perform.

Plugins provide a structure for a particular task. For example, the `jspsych-single-stim` plugin defines a simple structure for showing a visual stimulus and collecting a keyboard response. To use the plugin, you need to specify the content, such as what the stimulus is, what keys the subject is allowed to press, and how long the stimulus should be on the screen. Many of these content options have reasonable default values; even though the `jspsych-single-stim` plugin has over a dozen options, you only *need* to specify the stimulus in order to use it. Each plugin has its own documentation page, which describes what the plugin does and what options are available.

## Using a plugin

To use a plugin, you'll need to load the plugin's JavaScript file on your experiment page:

```html
<script src="jspsych/plugins/jspsych-single-stim.js" type="text/javascript"></script>
```

Once a plugin is loaded, you can define a block that uses that plugin. The following JavaScript code defines a trial using the `jspsych-single-stim` plugin to display an image file ('images/happy_face.jpg'). This trial uses the default values for valid keys, length of display, and so on (Learn more about creating blocks).

```javascript
var single_stim_block = {
	type: 'single-stim',
	stimuli: 'images/happy_face.jpg'
}
```

## List of available plugins

This table is a list of all plugins that are currently bundled with jsPsych releases. Click on the name of a plugin to view its documentation page.

 Plugin | Description                                        
 ------ | -----------
 jspsych-animation           | In jsPsych, plugins define the kinds of tasks that subjects perform in experiments. Some plugins define very general tasks, like displaying instructions or displaying a visual stimulus and getting a keyboard response. 
 jspsych-single-stim         | In jsPsych, plugins define the kinds of tasks that subjects perform in experiments. Some plugins define very general tasks, like displaying instructions or displaying a visual stimulus and getting a keyboard response. 

## Creating a plugin

There are many plugins that are bundled with jsPsych, but you aren't limited by what's currently available. Creating a 

