![logo](jspsych-logo-readme.jpg)

jsPsych is a JavaScript library for creating behavioral experiments that run in a web browser. jsPsych creates a framework for defining experiments and provides a set of flexible plugins that create different kinds of tasks a subject could complete during an experiment. By assembling different plugins together and customizing the parameters of each, it is possible to create many different types of experiments.

<div display="flex"/>
<img src="https://user-images.githubusercontent.com/14092539/27804246-df170e8e-5ffb-11e7-8257-361afe46861b.gif" align="right" width=50% />


<div markdown="2" style="width: 50%;">
<sub>

```javascript
var test_stimuli = [
{ stimulus: "<<<<<", data: { stim_type: 'congruent', direction: 'left'} },
{ stimulus: ">>>>>", data: { stim_type: 'congruent', direction: 'right'} },
{ stimulus: "<<><<", data: { stim_type: 'incongruent', direction: 'right'} },
{ stimulus: ">><>>", data: { stim_type: 'incongruent', direction: 'left'} }
];

var test = {
timeline: [{
type: 'single-stim',
choices: [37, 39],
is_html: true,
stimulus: jsPsych.timelineVariable('stimulus'),
data: jsPsych.timelineVariable('data'),
timing_response: 1500,
response_ends_trial: false
}],
timeline_variables: test_stimuli,
sample: {type: 'fixed-repetitions', size: 2}
};

var debrief = {
type: "text",
text: function() {
var congruent_rt = Math.round(jsPsych.data.get().filter({stim_type: 'congruent'}).select('rt').mean());
var incongruent_rt = Math.round(jsPsych.data.get().filter({stim_type: 'incongruent'}).select('rt').mean());
return "<p>Your average response time for congruent trials was <strong>" + congruent_rt + "ms</strong>.</p>"+
"<p>Your average response time for incongruent trials was <strong>" + incongruent_rt + "ms</strong>.</p>";
}
};
```

</sub>
</div>
</div>

![Demo](https://user-images.githubusercontent.com/14092539/27794834-cc32c936-5fd1-11e7-9c37-f2dc5cabe32d.gif)
![Demo](https://user-images.githubusercontent.com/14092539/27794978-4fe9c2c0-5fd2-11e7-8a96-28d72fa103d1.gif)

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

Wondering if jsPsych can be used for research that depends on accurate response time measurement? For most purposes, the answer is yes. Response time measurements in jsPsych (and JavaScript in general) are comparable to those taken in standard lab software like Psychophysics Toolbox and E-Prime. Response times measured in JavaScript tend to be a little bit longer (10-40ms), but have similar variance. See the following references for extensive work on this topic.

* [de Leeuw, J. R., & Motz, B. A. (2016). Psychophysics in a Web browser? Comparing response times collected with JavaScript and Psychophysics Toolbox in a visual search task. *Behavior Research Methods*, *48*(1), 1-12.](http://link.springer.com/article/10.3758%2Fs13428-015-0567-2)
* [Hilbig, B. E. (2016). Reaction time effects in lab- versus web-based research: Experimental evidence. *Behavior Research Methods*, *48*(4), 1718-1724.](http://dx.doi.org/10.3758/s13428-015-0678-9)
* [Pinet, S., Zielinski, C., Mathôt, S. et al. (in press). Measuring sequences of keystrokes with jsPsych: Reliability of response times and interkeystroke intervals.  *Behavior Research Methods*.](http://link.springer.com/article/10.3758/s13428-016-0776-3)
* [Reimers, S., & Stewart, N. (2015). Presentation and response time accuracy in Adobe Flash and HTML5/JavaScript Web experiments. *Behavior Research Methods*, *47*(2), 309-327.](http://link.springer.com/article/10.3758%2Fs13428-014-0471-1)


Credits
-------

jsPsych was created by Josh de Leeuw ([@jodeleeuw](https://github.com/jodeleeuw)).

There have been many [contributors](https://github.com/jodeleeuw/jsPsych/blob/master/contributors.md) to the library. Thank you!
