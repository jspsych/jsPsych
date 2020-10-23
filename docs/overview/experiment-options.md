# Experiment-wide settings

There are several options that can be set when calling `jsPsych.init()` to launch the experiment.

Options are specified in the object passed to `jsPsych.init`. For example, to specify a set of images to preload and the default inter-trial interval the object would contain:

```js
jsPsych.init({
    timeline: [...],
    preload_images: ['img1.png', 'img2.png'],
    default_iti: 500
});
```

## Controlling where jsPsych renders on the page

By default, jsPsych will render the experiment in the `<body>` element of a page. It is possible to display the experiment in a different element (e.g., a `<div>`) by specifying the `display_element` parameter. 

```html
<body>
    <div id="jspsych-target"></div>
</body>
<script>
    
    // ... //

    jsPsych.init({
        timeline: [...],
        display_element: 'jspsych-target'
    })
</script>
```

This option is useful if the experiment needs to be rendered on a page with other content (e.g., a demo version of the experiment with annotation text), or if additional control over the display element is desired. Custom CSS rules can be applied to position, size, scale, etc. the display element.

## Experiment events

Several experiment-wide events can trigger functions. This is documented in more detail on the [event-related callback functions page](callbacks.md). The events that trigger functions are:

* `on_finish`: Called at the end of the experiment.
* `on_trial_start`: Called at the beginning of every trial.
* `on_trial_finish`: Called at the end of every trial.
* `on_data_update`: Called whenever new data is added to the jsPsych data object.
* `on_interaction_data_update`: Called whenever new interaction data (e.g., the subject enters or exits fullscreen mode) is added.
* `on_close`: Called right before the page closes, such as when a subject closes the experiment early.

## Specify exclusion criteria

Exclusion criteria can be specified based on features of the user's web browser, such as the display size and whether certain features are reported. See the page on [excluding subjects based on browser features](exclude-browser.md).

## Display a progress bar

An automatic or manually updated progress bar can be displayed at the top of the screen. See the [progress bar page](progress-bar.md) for more details.

## Preload media elements

Images, audio files, and movies can be preloaded to reduce latency during the experiment. In many cases, this preloading is automatic. In certain situations, such as using a custom plugin, using [timeline variables](timeline.md#timeline-variables), or using [functions to determine which stimulus to show](trial.md#dynamic-parameters), it is necessary to provide jsPsych with a list of media elements to preload. The [media preloading](media-preloading.md) page describes this process in detail.

## Choose the method for playing audio files

By default, jsPsych uses the WebAudio API to play audio files. Among other features, the WebAudio API allows for more precise measurement of response times relative to the onset of the audio. 

However, loading files through the WebAudio API may not work when running an experiment locally (i.e., not on a live web server). This is due to the [cross-origin security policy](https://security.stackexchange.com/a/190321) implemented by web browsers. One option is to [temporarily disable the security](https://stackoverflow.com/q/4819060/3726673) for testing purposes. Another is to use HTML5 Audio instead of the WebAudio API. This can be done by specifying the `use_webaudio` parameter in `jsPsych.init()`.

```js
jsPsych.init({
    timeline: [...],
    use_webaudio: false
});
```

## Set the default intertrial interval

By default the next trial in a timeline will begin immediately after the conclusion of the previous trial. An experiment-wide delay can be specified using the `default_iti` parameter to `jsPsych.init()`.

```js
jsPsych.init({
    timeline: [...],
    default_iti: 500
});
```

This parameter is specified in milliseconds. A blank screen will display between each trial for the duration of the ITI.

## Specify the maximum width of the experiment

The experiment will, by default, take up 100% of the display element. Usually the display element is the `<body>`, and the experiment is the full width of the screen. (This can be overridden by specifying the `display_element` parameter described above).

Specifying the `experiment_width` parameter will set a maximum width for the display. The parameter is specified in pixels.

```js
jsPsych.init({
    timeline: [...],
    experiment_width: 750
});
```

