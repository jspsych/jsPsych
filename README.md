![logo](jspsych-logo-readme.jpg)

jsPsych is a JavaScript library for creating and running behavioral experiments in a web browser. jsPsych simplifies the process of coding browser-based experiments by providing a set of flexible plugins that define different kinds of tasks a subject could complete during an experiment. By assembling different plugins together and customizing the parameters of each, it is possible to create many different types of experiments.

Documentation
-------------

Documentation is available at [docs.jspsych.org](http://docs.jspsych.org).

Need help?
----------

For questions about using the library, please post to the [jsPsych e-mail list](https://groups.google.com/forum/#!forum/jspsych). This creates a public archive of questions and solutions.

Contributing
------------

Contributions to the code are welcome. Please use the [Issue tracker system](https://github.com/jodeleeuw/jsPsych/issues) to report bugs or discuss suggestions for new features and improvements. If you would like to contribute code, [submit a Pull request](https://help.github.com/articles/using-pull-requests).

Citation
--------

If you use this library in academic work, please cite the [paper that describes jsPsych](http://link.springer.com/article/10.3758%2Fs13428-014-0458-y):

de Leeuw, J.R. (2015). jsPsych: A JavaScript library for creating behavioral experiments in a Web browser. *Behavior Research Methods*, _47_(1), 1-12. doi:10.3758/s13428-014-0458-y

Response times
--------------

Wondering if jsPsych can be used for research that depends on accurate response time measurement? In general, the answer is yes. Response time measurements in jsPsych (and JavaScript in general) are comparable to those taken in standard lab software like Psychophysics Toolbox and E-Prime. Response times measured in JavaScript tend to be a little bit longer (10-40ms), but have similar variance. See the following references for extensive work on this topic.

* [de Leeuw, J. R., & Motz, B. A. (2016). Psychophysics in a Web browser? Comparing response times collected with JavaScript and Psychophysics Toolbox in a visual search task. *Behavior Research Methods*, *48*(1), 1-12.](http://link.springer.com/article/10.3758%2Fs13428-015-0567-2)
* [Hilbig, B. E. (in press). Reaction time effects in lab- versus web-based research: Experimental evidence. *Behavior Research Methods*.](http://dx.doi.org/10.3758/s13428-015-0678-9)
* [Pinet, S., Zielinski, C., Mathôt, S. et al. (in press). Measuring sequences of keystrokes with jsPsych: Reliability of response times and interkeystroke intervals.  *Behavior Research Methods*.](http://link.springer.com/article/10.3758/s13428-016-0776-3)
* [Reimers, S., & Stewart, N. (2015). Presentation and response time accuracy in Adobe Flash and HTML5/JavaScript Web experiments. *Behavior Research Methods*, *47*(2), 309-327.](http://link.springer.com/article/10.3758%2Fs13428-014-0471-1)


Credits
-------

jsPsych was created by Josh de Leeuw ([@jodeleeuw](https://github.com/jodeleeuw)).

There have been many [contributors](https://github.com/jodeleeuw/jsPsych/blob/master/contributors.md) to the library. Thank you!
