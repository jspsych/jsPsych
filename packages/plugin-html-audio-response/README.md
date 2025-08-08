![jspsych logo](http://www.jspsych.org/7.0/img/jspsych-logo.jpg)

jsPsych is a JavaScript framework for creating behavioral experiments that run in a web browser.

## Plugin Description

The html-audio-response plugin displays HTML content and records audio from the participant via a microphone. In order to get access to the microphone, use the [initialize-microphone plugin](https://www.jspsych.org/7.3/plugins/initialize-microphone/) before this plugin.

The audio data is recorded in base 64 format, which is a text representation of the audio that may be converted into others. Note that this plugin will _quickly_ generate large amounts of data, so if a large amount of audio needs to be recorded, consider storing the data on a server immediately and deleting it from the data object (This is shown in the documentation link below).

In addition to the default base64 saving, this plugin now supports:
- **Server upload** via the `save_via_api` parameter, which uploads the audio file to a specified API endpoint. A loading spinner and customizable `upload_wait_message` are shown during upload.
- **Local file saving** via the `save_locally` parameter, which saves the audio file directly to the participant's default Downloads folder with a random UUID filename.

These options can be used individually or together, and if neither is enabled, the original base64 behavior is preserved.

## Examples

Several example experiments and plugin demonstrations are available in the `/examples` folder.
After you've downloaded the [latest release](https://github.com/jspsych/jsPsych/releases), double-click on an example HTML file to run it in your web browser, and open it with a programming-friendly text editor to see how it works.

## Documentation

Documentation for this plugin is available [here](https://www.jspsych.org/latest/plugins/html-audio-response).

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
