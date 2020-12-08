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

An automatic or manually updated progress bar can be displayed at the top of the screen. By default, the text next to the progress bar is "Completion Progress", but this text can be changed with the `message_progress_bar` parameter in `jsPsych.init`. See the [progress bar page](progress-bar.md) for more details.

## Preload media elements

Images, audio files, and movies can be preloaded to reduce latency during the experiment. In many cases, this preloading is automatic. In certain situations, such as using a custom plugin, using [timeline variables](timeline.md#timeline-variables), or using [functions to determine which stimulus to show](trial.md#dynamic-parameters), it is necessary to provide jsPsych with a list of media elements to preload. The [media preloading](media-preloading.md) page describes this process in detail.

## Choose the method for playing audio files

Specifying the `use_webaudio` parameter in `jsPsych.init()` allows you to choose whether to use the WebAudio API or HTML5 audio for playing audio files during your experiment. By default, jsPsych uses the WebAudio API to play audio files. Among other features, the WebAudio API allows for more precise measurement of response times relative to the onset of the audio. 

However, loading files through the WebAudio API causes errors when running an experiment offline (i.e., by double-clicking on the HTML file, rather than hosting it on a web server). This is due to the [cross-origin security policy](https://security.stackexchange.com/a/190321) implemented by web browsers. For this reason, jsPsych switches to a 'safe mode' when it detects that the webpage is running offline, and automatically uses HTML5 audio to prevent errors, even when `use_webaudio` has been explicitly set to `true`. For more information, see the section [Cross-origin requests (CORS) and safe mode](running-experiments.md#cross-origin-requests-cors-and-safe-mode) on the Running Experiments page.

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

## Specify a minimum valid response time

By default, jsPsych will treat any keyboard response time as valid. However, it's possible to specify a minimum valid response time (in ms) for key presses. Any key press that is less than this value will be treated as invalid and ignored. Note that this parameter only applies to _keyboard responses_, and not to other response types such as buttons and sliders. The default value is 0.

```js
// ignore any keyboard responses that are less than 100 ms
jsPsych.init({
    timeline: [...],
    minimum_valid_rt: 100
});
```

## Override 'safe mode' when running experiments offline

By default, jsPsych switches to a 'safe mode' when it detects that the webpage is running offline (via the `file://` protocol) in order to prevent certain errors. Specifically, in safe mode, HTML5 audio is used to play audio files (even when `use_webaudio` has been explicitly set to `true`) and video preloading is disabled (both automatic and manual preloading). For more information, see the [Cross-origin requests (CORS) and safe mode](running-experiments.md#cross-origin-requests-cors-and-safe-mode) section on the Running Experiments page.

It's possible to override this safe mode feature by setting the `override_safe_mode` parameter to `true` in `jsPsych.init`. This is something you might do if you've disabled certain security settings in your browser for testing purposes. This parameter has no effect when your experiment is running online (on a server), because it will be using the `http://` or `https://` protocol, which does not trigger safe mode. 

```js
jsPsych.init({
    timeline: [...],
    override_safe_mode: true
});
```