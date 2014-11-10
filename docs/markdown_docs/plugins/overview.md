# Plugins

In jsPsych, plugins define the kinds of tasks that subjects perform in experiments. Some plugins define very general tasks, like displaying instructions or displaying a visual stimulus and getting a keyboard response. Other plugins are more specific, displaying particular kinds of interactive stimuli, or running a specific kind of perceptual discrimination task. Creating an experiment with jsPsych involves figuring out which plugins are needed for the kinds of tasks you want to have your subjects perform.

Plugins provide a structure for a particular task. For example, the `jspsych-single-stim` plugin defines a simple structure for showing a visual stimulus and collecting a keyboard response. To use the plugin, you need to specify the content, such as what the stimulus is, what keys the subject is allowed to press, and how long the stimulus should be on the screen. Many of these content options have reasonable default values; even though the `jspsych-single-stim` plugin has many different options, you only *need* to specify the stimulus in order to use it. Each plugin has its own documentation page, which describes what the plugin does and what options are available.

## Using a plugin

To use a plugin, you'll need to load the plugin's JavaScript file on your experiment page:

```html
<script src="jspsych/plugins/jspsych-single-stim.js" type="text/javascript"></script>
```

Once a plugin is loaded, you can define a block that uses that plugin. The following JavaScript code defines a trial using the `jspsych-single-stim` plugin to display an image file ('images/happy_face.jpg'). This trial uses the default values for valid keys, length of display, and so on. You could override these values by adding them to the object.

```javascript
var single_stim_block = {
	type: 'single-stim',
	stimuli: 'images/happy_face.jpg'
}
```

Here's an exampe of overriding the default value for `timing_post_trial`:

```javascript
var single_stim_block = {
	type: 'single-stim',
	stimuli: 'images/happy_face.jpg',
	timing_post_trial: 2000
}
```

## List of available plugins

This table is a description of all plugins that are currently bundled with jsPsych. Click on the name of a plugin to view its documentation page.

 Plugin | Description
 ------ | -----------
 [jspsych&#8209;animation](plugins/jspsych-animation) | Shows a sequence of images at a specified frame rate. Records key presses (including timing information) made by the subject while they are viewing the animation.
 [jspsych&#8209;call&#8209;function](plugins/jspsych-call-function) | Executes an arbitrary function call. Doesn't display anything to the subject, and the subject is usually unaware that this plugin has even executed. It's useful for performing tasks at specified times in the experiment, such as saving data.
 [jspsych&#8209;categorize](plugins/jspsych-categorize) | The subject responds to a stimulus using the keyboard and can be given feedback about the correctness of their response.
 [jspsych&#8209;categorize&#8209;animation](plugins/jspsych-categorize-animation) | A mash-up of the animation and categorize plugin. The subject responds to an animation and can be given feedback about their response.
 [jspsych&#8209;free&#8209;sort](plugins/jspsych-free-sort) | Displays a set of images on the screen in random locations. Subjects can click and drag the images to move them around the screen. Records all the moves made by the subject, so the sequence of moves can be recovered from the data.
 [jspsych&#8209;html](plugins/jspsych-html) | Displays an external HTML page (such as a consent form) and lets the subject respond by clicking a button or pressing a key. Plugin can validate their response, which is useful for making sure that a subject has granted consent before starting the experiment.
 [jspsych&#8209;multi&#8209;stim&#8209;multi&#8209;response](plugins/jspsych-multi-stim-multi-response) | A more generalized version of the single-stim plugin. Can display multiple stimuli in a single trial, and collect multiple responses in a single trial.
 [jspsych&#8209;palmer](plugins/jspsych-palmer) | Shows grid-like stimuli inspired by Stephen Palmer's work. The stimuli are editable: subjects can add and subtract parts interactively. Also contains a method for generating the HTML code to render the stimuli, allowing them to be used in other plugins.  
 [jspsych&#8209;same&#8209;different](plugins/jspsych-same-different) | A same-different judgment task. A stimulus is shown, followed by a brief gap, and then another stimulus is shown. The subject indicates whether the stimuli are the same or different.
 [jspsych&#8209;similarity](plugins/jspsych-similarity) | Two stimuli are shown sequentially, and the subject indicates how similar they are by dragging a slider object.
 [jspsych&#8209;single&#8209;stim](plugins/jspsych-single-stim) | A basic plugin for displaying a stimulus and getting a keyboard response.
 [jspsych&#8209;survey&#8209;likert](plugins/jspsych-survey-likert) | Displays likert-style questions. The subject responds by dragging a slider.
 [jspsych&#8209;survey&#8209;text](plugins/jspsych-survey-text) | Shows a prompt with a text box. The subject writes a response and then submits by clicking a button.
 [jspsych&#8209;text](plugins/jspsych-text) | Shows HTML-formatted text on the screen.
 [jspsych&#8209;visual&#8209;search&#8209;circle](plugins/jspsych-visual-search-circle) | A customizable visual-search task modelled after [Wang, Cavanagh, & Green (1994)](http://dx.doi.org/10.3758/BF03206946). The subject indicates whether or not a target is present among a set of distractors. The stimuli are displayed in a circle, evenly-spaced, equidistant from a fixation point.
 [jspsych&#8209;vsl&#8209;animate&#8209;occlusion](plugins/jspsych-vsl-animate-occlusion) | A visual statistical learning paradigm based on [Fiser & Aslin (2002)](http://dx.doi.org/10.1037//0278-7393.28.3.458). A sequence of stimuli are shown in an oscillatory motion. An occluding rectangle is in the center of the display, and the stimuli change when they are behind the rectangle.
 [jspsych&#8209;vsl&#8209;grid&#8209;scene](plugins/jspsych-vsl-grid-scene) | A visual statistical learning paradigm based on [Fiser & Aslin (2001)](http://dx.doi.org/10.1111/1467-9280.00392). A scene made up of individual stimuli arranged in a grid is shown. This plugin can also generate the HTML code to render the stimuli for use in other plugins.
 [jspsych&#8209;xab](plugins/jspsych-xab) | A two-alternative forced choice task. A target (X) is shown, followed by a brief gap, and then two choices (A & B) are displayed. The subject must pick whichever one matches X (matches is defined however the experimenter wishes; it could be a literal match, or it could be a match on some particular property).
