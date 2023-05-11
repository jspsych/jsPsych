![jspsych logo](http://www.jspsych.org/7.0/img/jspsych-logo.jpg)

jsPsych is a JavaScript framework for creating behavioral experiments that run in a web browser. 

Experiments in jsPsych are created using [plugins](https://www.jspsych.org/latest/overview/plugins). 
Each plugin defines different kinds of events, like showing an image on the screen, and collects different kinds of data, like recording which key was pressed at which time. 
By assembling different plugins together into [a timeline](https://www.jspsych.org/latest/overview/timeline), it is possible to create a wide range of online experiments. 

## What can I do with jsPsych?

jsPsych comes with a number of plugins that you can use create tasks and collect data. 
Some plugins do general things, like present a stimulus (text, image, audio, video) and record a key press or button response along with a response time. 
Other plugins do more specific things, like show a set of instructions pages, run a drag-and-drop image sorting task, or calibrate the WebGazer eye-tracking extension. 
See the [list of all plugins](https://www.jspsych.org/latest/plugins/list-of-plugins/) to see what each plugin can do.

Often people can create their experiment by combining these plugins together. 
But if that's not possible for your experiment, you can also modify a plugin file or [create your own plugin](https://www.jspsych.org/latest/developers/plugin-development). 
This gives you the flexibility to do exactly what you want, while still taking advantage of jsPsych's general experiment-building framework. 
The plugin template is *extremely* flexible. If a task is possible to do in a web browser, you can almost certainly implement it as a plugin.

## Getting started

jsPsych can be loaded into a project in a variety of ways, including via CDNs and through NPM. 
You can learn more about setting up a project by following the [hello world tutorial](https://www.jspsych.org/latest/tutorials/hello-world/) on the jsPsych website. 

Once you've got a project set up, the [reaction time task tutorial](https://www.jspsych.org/latest/tutorials/rt-task/) is a great next step, since it covers many core topics and features. 

There are also a number of [video tutorials](https://www.jspsych.org/latest/tutorials/video-tutorials) available on the website.

## Examples

Several example experiments and plugin demonstrations are available in the `/examples` folder. 
After you've downloaded the [latest release](https://github.com/jspsych/jsPsych/releases), double-click on an example HTML file to run it in your web browser, and open it with a programming-friendly text editor to see how it works.

## Documentation

Documentation is available at [https://www.jspsych.org](https://www.jspsych.org/).

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

We're also grateful for the generous support from a [Mozilla Open Source Support award](https://www.mozilla.org/en-US/moss/), which funded development of the library from 2020-2022.
