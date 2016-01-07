# jspsych-similarity plugin

The similarity plugin displays two stimuli sequentially. The stimuli can be images or HTML objects. The subject uses a draggable slider that is shown on screen to give a response. The anchor labels for the slider can be specified.

## Dependency

This plugin requires the jQuery UI javascript library and accompanying CSS theme. To use this library, you must include both. Google hosts versions of both, which you can use in your project by including the following two lines in the `<head>` section of the HTML document:

```html
<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>
<link href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/themes/black-tie/jquery-ui.min.css" rel="stylesheet" type="text/css"></link>
```

This example uses the 'black-tie' theme, but any theme should work.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimuli | array | *undefined* | A pair of stimuli. Each pair is represented as an array with two entries, one for each stimulus. A stimulus can be either a path to an image file or a string containing valid HTML markup. Stimuli will be shown in the order that they are defined in the array.
is_html | boolean | false | If the elements of the `stimuli` array are strings containing HTML content, then this parameter must be set to true.
labels | array | `['Not at all similar', 'Identical']` | Array of strings to label the slider. Labels will be evenly spaced based on how many are in the array, with the outermost elements always anchored to the ends of the slider.
intervals | numeric | 100 | How many different choices are available on the slider. For example, 5 will limit the options to 5 different places on the slider. Default value is 100, to simulate a smooth slider.
show_ticks | boolean | false | If true, then the slider will have tick marks indicating where the response options lie on the slider.
show_response | string | `"SECOND_STIMULUS"` | Determines when the response slider will appear in the trial. `"FIRST_STIMULUS"` will show the response slider as soon as the first stimulus is shown. `"SECOND_STIMULUS"` will show the response slider as soon as the second stimulus is shown. `"POST_STIMULUS"` will show the response slider after the second stimulus disappears. Response time measure will start when the response slider appears.
timing_first_stim | numeric | 1000 | How long to show the first stimulus for in milliseconds.
timing_second_stim | numeric | -1 |  How long to show the second stimulus for in milliseconds. -1 will show the stimulus until a response is made by the subject.
timing_image_gap | numeric | 1000 | How long to show a blank screen in between the two stimuli.
prompt | string | "" | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take.


## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
stimulus | string | A JSON-encoded array of the two stimuli presented in the trial.
sim_score | numeric | The position of the slider when the subject submitted their response. Larger numbers are to the right on the slider. The range will depend on the value of the `intervals` parameter.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the response slider first appears on the screen until the subject's response.

## Example
