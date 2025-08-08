![jspsych logo](http://www.jspsych.org/7.0/img/jspsych-logo.jpg)

jsPsych is a JavaScript framework for creating behavioral experiments that run in a web browser.

## Plugin Description

The html-video-response plugin displays HTML content and records video from the participant via a webcam. In order to get access to the webcam, use the [initialize-camera plugin](https://www.jspsych.org/7.3/plugins/initialize-camera/) before this plugin.

The video data is by default recorded in base 64 format, which is a text representation of the video that may be converted into others. Note that this plugin will _quickly_ generate large amounts of data, so if a large amount of video needs to be recorded, consider storing the data on a server immediately and deleting it from the data object (This is shown in the documentation link below).

Optionally, in addition to saving video data in the trial’s `response` field in base 64 format, this plugin can:
- **Upload recordings directly to a server API endpoint** via the `save_via_api` parameter.
- **Save recordings locally** to the participant’s default Downloads folder via the `save_locally` parameter.

Both options automatically generate a unique filename for each recording (e.g., `a7fj2sd9.webm`). If `save_via_api` is used, the plugin expects the server to return a JSON object containing a `ref_id` field, which will be stored in the trial data for linking the trial to the saved file.  
If neither option is enabled, the plugin behaves as before, storing the base 64 string in the trial data.

Note that this plugin will _quickly_ generate large amounts of data, so if a large amount of video needs to be recorded, consider storing the data on a server immediately and deleting it from the data object (This is shown in the documentation link below).

## Examples

Several example experiments and plugin demonstrations are available in the `/examples` folder.

After you've downloaded the [latest release](https://github.com/jspsych/jsPsych/releases), double-click on an example HTML file to run it in your web browser, and open it with a programming-friendly text editor to see how it works.

## Documentation

Documentation for this plugin is available [here](https://www.jspsych.org/latest/plugins/html-video-response).

## Getting help

For questions about using the library, please use the GitHub [discussions forum](https://github.com/jspsych/jsPsych/discussions).
You can also browse through the history of Q&A on the forum to find related questions.

## Contributing

We :heart: contributions!
See the [contributing to jsPsych](https://www.jspsych.org/latest/developers/contributing/) documentation page for more information about how you can help.

## Citation

If you use this library in academic work, the preferred citation is:

de Leeuw, J.R., Gilbert, R.A., & Luchterhandt, B. (2023). jsPsych: Enabling an open-source collaborative ecosystem of behavioral experiments. *Journal of Open Source Software*, *8*(85), 5351, [https://joss.theoj.org/papers/10.21105/joss.05351](https://joss.theoj.org/papers/10.21105/joss.05351).

This paper is an updated description of jsPsych and includes all current core team members. It replaces the earlier paper that described jsPsych:

de Leeuw, J.R. (2015). jsPsych: A JavaScript library for creating behavioral experiments in a Web browser. *Behavior Research Methods*, _47_(1), 1-12. doi:[10.3758/s13428-014-0458-y](http://link.springer.com/article/10.3758%2Fs13428-014-0458-y)

Citations help us demonstrate that this library is used and valued, which allows us to continue working on it.

## Contributors

jsPsych is open source project with [numerous contributors](https://github.com/jspsych/jsPsych/graphs/contributors).
The project is currently managed by the core team of Josh de Leeuw ([@jodeleeuw](https://github.com/jodeleeuw)), Becky Gilbert ([@becky-gilbert](https://github.com/becky-gilbert)), and Björn Luchterhandt ([@bjoluc](https://github.com/bjoluc)).

jsPsych was created by [Josh de Leeuw](http://www.twitter.com/joshdeleeuw).

We're also grateful for the generous support from a [Mozilla Open Source Support award](https://www.mozilla.org/en-US/moss/), which funded development of the library from 2020-2021.
