# Experiment-wide settings

There are several options that can be set when calling `initJsPsych()` to initialize the jsPsych experiment.

Options are specified in the object passed to `initJsPsych`. For example, to specify a default inter-trial interval, a minimum valid response time duration, and a maximum width for all of the experiment's page content, the object would contain:

```js
initJsPsych({
    default_iti: 250, 
    minimum_valid_rt: 100, 
    experiment_width: 800 
});
```

## Controlling where jsPsych renders on the page

By default, jsPsych will render the experiment in the `<body>` element of a page. It is possible to display the experiment in a different element (e.g., a `<div>`) by specifying the `display_element` parameter. 

```html
<body>
    <div id="jspsych-target"></div>
</body>
<script>

    initJsPsych({
        display_element: 'jspsych-target'
    });

</script>
```

This option is useful if the experiment needs to be rendered on a page with other content (e.g., a demo version of the experiment with annotation text), or if additional control over the display element is desired. Custom CSS rules can be applied to position, size, scale, etc. the display element.

## Experiment events

Several experiment-wide events can trigger functions. This is documented in more detail on the [event-related callback functions page](events.md). The events that trigger functions are:

* `on_finish`: Called at the end of the experiment.
* `on_trial_start`: Called at the beginning of every trial.
* `on_trial_finish`: Called at the end of every trial.
* `on_data_update`: Called whenever new data is added to the jsPsych data object.
* `on_interaction_data_update`: Called whenever new interaction data (e.g., the participant enters or exits fullscreen mode) is added.
* `on_close`: Called right before the page closes, such as when a participant closes the experiment early.

## Specify exclusion criteria

Exclusion criteria can be specified based on features of the user's web browser, such as the display size and whether certain features are reported. See the page on [excluding participants based on browser features](exclude-browser.md).

## Display a progress bar

An automatic or manually updated progress bar can be displayed at the top of the screen. By default, the text next to the progress bar is "Completion Progress", but this text can be changed with the `message_progress_bar` parameter in `initJsPsych`. See the [progress bar page](progress-bar.md) for more details.

## Choose the method for playing audio files

Specifying the `use_webaudio` parameter in `initJsPsych()` allows you to choose whether to use the WebAudio API or HTML5 audio for playing audio files during your experiment. By default, jsPsych uses the WebAudio API to play audio files. Among other features, the WebAudio API allows for more precise measurement of response times relative to the onset of the audio. 

However, loading files through the WebAudio API causes errors when running an experiment offline (i.e., by double-clicking on the HTML file, rather than hosting it on a web server). This is due to the [cross-origin security policy](https://security.stackexchange.com/a/190321) implemented by web browsers. For this reason, jsPsych switches to a 'safe mode' when it detects that the webpage is running offline, and automatically uses HTML5 audio to prevent errors, even when `use_webaudio` has been explicitly set to `true`. For more information, see the section [Cross-origin requests (CORS) and safe mode](running-experiments.md#cross-origin-requests-cors-and-safe-mode) on the Running Experiments page.

```js
initJsPsych({
    use_webaudio: false
});
```

## Set the default intertrial interval

By default the next trial in a timeline will begin immediately after the conclusion of the previous trial. An experiment-wide delay can be specified using the `default_iti` parameter to `initJsPsych()`.

```js
initJsPsych({
    default_iti: 500
});
```

This parameter is specified in milliseconds. A blank screen will display between each trial for the duration of the ITI.

## Specify the maximum width of the experiment

The experiment will, by default, take up 100% of the display element. Usually the display element is the `<body>`, and the experiment is the full width of the screen. (This can be overridden by specifying the `display_element` parameter described above).

Specifying the `experiment_width` parameter will set a maximum width for the display. The parameter is specified in pixels.

```js
initJsPsych({
    experiment_width: 750
});
```

## Specify a minimum valid response time

By default, jsPsych will treat any keyboard response time as valid. However, it's possible to specify a minimum valid response time (in ms) for key presses. Any key press that is less than this value will be treated as invalid and ignored. Note that this parameter only applies to _keyboard responses_, and not to other response types such as buttons and sliders. The default value is 0.

```js
// ignore any keyboard responses that are less than 100 ms
initJsPsych({
    minimum_valid_rt: 100
});
```

## Choose whether you want keyboard choices/responses to be case-sensitive

JavaScript keyboard events make a distinction between uppercase and lowercase key responses (e.g. 'a' and 'A'). Often the researcher just cares about which physical key was pressed, and not whether the key press would result in an uppercase letter (for instance, if CapsLock is on or if the Shift key is held down). For this reason, jsPsych converts all key choice parameters and key responses as lowercase by default. This makes it easier to specify key choices (e.g. `choices: ['a']`, instead of `choices: ['a','A']`), and it makes it easier to check and score a participant's response. 

There may be situations when you want key choices and responses to be case-sensitive. You can change this by setting the `case_sensitive_responses` parameter to `true` in `initJsPsych`.

```js
// use case-sensitive key choices and responses, 
// i.e. uppercase and lower case letters ('a' and 'A') will be treated as different key choices, 
// and will be recorded this way in the data
initJsPsych({
    case_sensitive_responses: true
});
```

Note that this setting only applies to key choices and responses that use jsPsych's keyboard response listener, such as in the *`-keyboard-response` plugins. This does NOT apply to responses that are made by typing into a text box, such as in the `survey-text` and `cloze` plugins.

## Override 'safe mode' when running experiments offline

By default, jsPsych switches to a 'safe mode' when it detects that the webpage is running offline (via the `file://` protocol) in order to prevent certain errors. Specifically, in safe mode, HTML5 audio is used to play audio files (even when `use_webaudio` has been explicitly set to `true`) and video preloading is disabled (both automatic and manual preloading). For more information, see the [Cross-origin requests (CORS) and safe mode](running-experiments.md#cross-origin-requests-cors-and-safe-mode) section on the Running Experiments page.

It's possible to override this safe mode feature by setting the `override_safe_mode` parameter to `true` in `initJsPsych`. This is something you might do if you've disabled certain security settings in your browser for testing purposes. This parameter has no effect when your experiment is running online (on a server), because it will be using the `http://` or `https://` protocol, which does not trigger safe mode. 

```js
initJsPsych({
    override_safe_mode: true
});
```

## Add extensions

[Extensions](extensions.md) are jsPsych modules that can run throughout the experiment and interface with any plugin to extend the functionality of the plugin. One example of an extension is eye tracking, which allows you to gather gaze data during any trial and add it to that trial's data object. If you want to use extensions in your experiment, you must specify this when you initialize the experiment with `initJsPsych`. The `extensions` parameter in `initJsPsych` is an array of objects, where each object specifies the extension that you'd like to use in the experiment. Below is an example of adding the webgazer extension.

```js
initJsPsych({
    extensions: [
        {type: jsPsychExtensionWebgazer}
    ]
});
```
