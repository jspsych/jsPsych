# About jsPsych

jsPsych is open source project with [numerous contributors](https://github.com/jspsych/jsPsych/graphs/contributors). The project is currently managed by the core team of Josh de Leeuw ([@jodeleeuw](https://github.com/jodeleeuw)), Becky Gilbert ([@becky-gilbert](https://github.com/becky-gilbert)), and Björn Luchterhandt ([@bjoluc](https://github.com/bjoluc)).

jsPsych was created by [Josh de Leeuw](https://www.vassar.edu/faculty/jdeleeuw).

### Citation

If you use this library in academic work, the preferred citation is:

> de Leeuw, J.R., Gilbert, R.A., & Luchterhandt, B. (2023). jsPsych: Enabling an open-source collaborative ecosystem of behavioral experiments. *Journal of Open Source Software*, *8*(85), 5351, [https://joss.theoj.org/papers/10.21105/joss.05351](https://joss.theoj.org/papers/10.21105/joss.05351).

This paper is an updated description of jsPsych and includes all current core team members. It replaces the earlier paper that described jsPsych:

> de Leeuw, J.R. (2015). jsPsych: A JavaScript library for creating behavioral experiments in a Web browser. *Behavior Research Methods*, _47_(1), 1-12. doi:[10.3758/s13428-014-0458-y](http://link.springer.com/article/10.3758%2Fs13428-014-0458-y)

Citations help us demonstrate that this library is used and valued, which allows us to continue working on it.

#### Citation tool for third-party plugins/extensions

jsPsych is an open-source, collaborative ecosystem, and many of the plugins/extensions you end up using may be contributed by third-party developers! We want to make sure they get recognition for their good work, so we  made a command-line citation tool that you should use to cite this library and the plugins/extensions used in your experiment. You can see this tool in action by following these steps:

1. Launch a jsPsych experiment in your browser
2. Open up the browser console using Ctrl + ⇧ + J (Windows) or ⌘ + ⌥ + J (Mac)
3. Type `jsPsych.getCitations()`

This should print the APA format citation for the jsPsych library, which you can then copy and paste into your working document. To cite the plugins/extensions in your experiment, you should pass in an array containing the name of each plugin/extension to generate a list of citations, e.g. `jsPsych.getCitations([jsPsychHtmlKeyboardResponse, jsPsychMouseTrackingExtension])`. You can also pass in the desired output citation format as the second argument, e.g. `jsPsych.getCitations([jsPsychHtmlKeyboardResponse, jsPsychMouseTrackingExtension], "apa")`. We currently support APA formatting (`"apa"`) and BibTex formatting (`"bibtex"`).