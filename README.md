![logo](http://www.jspsych.org/img/jspsych-logo.jpg)

jsPsych is a JavaScript library for creating behavioral experiments that run in a web browser. It provides a framework for defining experiments using a set of flexible plugins that create different kinds of events, and collect different kinds of data. By assembling these plugins together, it is possible to create a wide range of online experiments.

jsPsych experiments are created using the languages of the Web: HTML, CSS, and JavaScript. JavaScript is the programming language used by web browsers. It provides the most control and flexibility for creating web-based experiments, and allows for easy integration with other JavaScript libraries and server-side tools. Don't have JavaScript experience? Don't worry! jsPsych was designed to make creating online experiments as easy as possible for people without web development experience.

## What can I do with jsPsych?

jsPsych comes with a number of plugins that you can use create tasks and collect data. Some plugins do general things, like present a stimulus (text, image, audio, video) and record a key press or button response along with a response time. Other plugins do more specific things, like show a set of instructions pages, run a drag-and-drop image sorting task, present a Random-Dot Kinematogram, or calibrate the WebGazer eye-tracking extension. See the documentation website for a [list of all plugins](https://www.jspsych.org/plugins/list-of-plugins/), and to see what each plugin can do.

Often people can create their experiment by combining these plugins together. But if that's not possible for your experiment, you can also modify a plugin file or [create your own plugin](https://www.jspsych.org/overview/plugins/#creating-a-new-plugin). This gives you the flexibility to do exactly what you want, while still taking advantage of jsPsych's general experiment-building framework.

Getting started
---------------

New to jsPsych? A good place to start is the basic [Hello World tutorial](https://www.jspsych.org/tutorials/hello-world/) on the jsPsych website. The [Reaction Time Task tutorial](https://www.jspsych.org/tutorials/rt-task/) is a great next step, since it covers many core topics and features. 

There are also a number of [video tutorials](https://www.jspsych.org/tutorials/video-tutorials), including [Session 1 of the Moving Online Workshop](https://www.youtube.com/watch?v=BuhfsIFRFe8), which provides an overview of jsPsych suitable for brand new users. 

Examples
----------

Several example experiments and plugin demonstrations are available in the `/examples` folder. After you've downloaded the [latest release](https://github.com/jspsych/jsPsych/releases), double-click on an example HTML file to run it in your web browser, and open it with a programming-friendly text editor to see how it works.

Documentation
-------------

Documentation is available at [jspsych.org](https://www.jspsych.org/).

Need help?
----------

For questions about using the library, please use the GitHub [Discussions forum](https://github.com/jspsych/jsPsych/discussions).

Contributing
------------

Contributions to the code are welcome. Please use the [Issue tracker system](https://github.com/jspsych/jsPsych/issues) to report bugs or discuss suggestions for new features and improvements. If you would like to contribute code, [submit a Pull request](https://help.github.com/articles/using-pull-requests). See the [Contributing to jsPsych](https://www.jspsych.org/about/contributing/) documentation page for more information.

Citation
--------

If you use this library in academic work, please cite the [paper that describes jsPsych](http://link.springer.com/article/10.3758%2Fs13428-014-0458-y):

de Leeuw, J.R. (2015). jsPsych: A JavaScript library for creating behavioral experiments in a Web browser. *Behavior Research Methods*, _47_(1), 1-12. doi:10.3758/s13428-014-0458-y

Response times
--------------

Wondering if jsPsych can be used for research that depends on accurate response time measurement? For most purposes, the answer is yes. Response time measurements in jsPsych (and JavaScript in general) are comparable to those taken in standard lab software like Psychophysics Toolbox and E-Prime. Response times measured in JavaScript tend to be a little bit longer (10-40ms), but have similar variance. See the following references for extensive work on this topic.

* [de Leeuw, J. R., & Motz, B. A. (2016). Psychophysics in a Web browser? Comparing response times collected with JavaScript and Psychophysics Toolbox in a visual search task. *Behavior Research Methods*, *48*(1), 1-12.](http://link.springer.com/article/10.3758%2Fs13428-015-0567-2)
* [Hilbig, B. E. (2016). Reaction time effects in lab- versus web-based research: Experimental evidence. *Behavior Research Methods*, *48*(4), 1718-1724.](http://dx.doi.org/10.3758/s13428-015-0678-9)
* [Pinet, S., Zielinski, C., Mathôt, S. et al. (2017). Measuring sequences of keystrokes with jsPsych: Reliability of response times and interkeystroke intervals.  *Behavior Research Methods*, *49*(3), 1163-1176.](http://link.springer.com/article/10.3758/s13428-016-0776-3)
* [Reimers, S., & Stewart, N. (2015). Presentation and response time accuracy in Adobe Flash and HTML5/JavaScript Web experiments. *Behavior Research Methods*, *47*(2), 309-327.](http://link.springer.com/article/10.3758%2Fs13428-014-0471-1)


Credits
-------

jsPsych was created by Josh de Leeuw ([@jodeleeuw](https://github.com/jodeleeuw)).

We're grateful for the many [contributors](https://github.com/jspsych/jsPsych/blob/master/contributors.md) to the library, and for the generous support from a [Mozilla Open Source Support (MOSS)](https://www.mozilla.org/en-US/moss/) award. Thank you!