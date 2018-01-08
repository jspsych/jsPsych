![logo](http://www.jspsych.org/img/jspsych-logo.jpg)

jsPsych is a JavaScript library for creating behavioral experiments that run in a web browser. jsPsych provides a framework for defining experiments using a set of flexible plugins that create different kinds of tasks a subject could complete during an experiment. By assembling these different plugins together it is possible to create many different types of experiments.

Examples
----------

These examples are intended to illustrate what jsPsych code and experiments look like. There is a larger set of example code in the [examples folder](/examples).

#### #1: Displaying instructions [(code)](https://github.com/jspsych/jsPsych/tree/master/examples/demos/demo_1.html)
<div display="flex">
<img src="https://user-images.githubusercontent.com/14092539/28126774-801ea42e-66f8-11e7-9b6a-c8bad0026bec.gif" align="right" width=50% />
<div markdown="1" style="width: 50%;">
<sub>

```javascript













var trial = {       
    type: 'instructions',     
    pages: [      
      'Welcome to the experiment. Click next to begin.',

      '<p>In this experiment, you will view a ' +       
      'series of images and answer questions.</p>' +      
      '<p>Answer with the keys "y" or "n".</p>',

      '<p>Here is an example:</p>' +        
      '<img src="img/age/of2.jpg"></img>' +       
      '<p>Is this person OLD or YOUNG?</p>'      
    ],        
    show_clickable_nav: true      
}       

jsPsych.init({      
    timeline: [trial],        
});











```
</sub>
</div>
</div>


#### #2: Displaying images and recording a response [(code)](https://github.com/jspsych/jsPsych/tree/master/examples/demos/demo_2.html)
<div display="flex">
<img src="https://user-images.githubusercontent.com/14092539/28125911-0504cca2-66f6-11e7-8f5b-c9686f63aaa8.gif" align="right" width=50% />

<div markdown"2" style="width: 50%;">
<sub>

```javascript







var trial_1 = {
  type: "image-keyboard-response",
  stimulus: 'img/happy_face_1.jpg',
  choices: ['y', 'n'],
  prompt: '<p>Is this face happy? Y or N.</p>'
}

var trial_2 = {
  type: 'image-keyboard-response',
  stimulus: 'img/sad_face_2.jpg',
  choices: ['y', 'n'],
  prompt: '<p>Is this face happy? Y or N.</p>'
}

var trial_3 = {
  type: 'image-keyboard-response',
  stimulus: 'img/happy_face_2.jpg',
  choices: ['y', 'n'],
  prompt: '<p>Is this face happy? Y or N.</p>'
}


jsPsych.init({
  timeline: [trial_1, trial_2, trial_3],
  default_iti: 250
});







```
</sub>
</div>
</div>

#### #3: A flanker task showing a few advanced features of the library [(code)](https://github.com/jspsych/jsPsych/tree/master/examples/demos/demo_3.html)

<div display="flex">
<img src="https://user-images.githubusercontent.com/14092539/28126802-97b50d08-66f8-11e7-9a45-46561ab51a5f.gif" align="right" width=50% />
<div markdown="3" style="width: 50%;">
<sub>

```javascript
var test_stimuli = [
  { stimulus: "<<<<<", data: {stim_type: 'congruent'} },
  { stimulus: ">>>>>", data: {stim_type: 'congruent'} },
  { stimulus: "<<><<", data: {stim_type: 'incongruent'} },
  { stimulus: ">><>>", data: {stim_type: 'incongruent'} }
];

var test = {
  timeline: [{
     type: 'html-keyboard-response',
     choices: [37, 39],
     stimulus: jsPsych.timelineVariable('stimulus'),
     data: jsPsych.timelineVariable('data'),
     post_trial_gap: 1500,
     response_ends_trial: true
  }],
  timeline_variables: test_stimuli,
  sample: {type: 'fixed-repetitions', size: 2}
};

var debrief = {
  type: "html-keyboard-response",
  stimulus: function() {
    var congruent_rt = Math.round(jsPsych.data.get()
        .filter({stim_type: 'congruent'}).select('rt').mean());
    var incongruent_rt = Math.round(jsPsych.data.get()
        .filter({stim_type: 'incongruent'}).select('rt').mean());
    return "<p style='font-size:25px'>Your average response"+
    "time for congruent trials was <strong>"+congruent_rt+
    "ms</strong>.</p>"+
    "<p style='font-size:25px'>Your average response time for"+
    "incongruent trials was <strong>"+incongruent_rt+
    "ms</strong>.</p>";
  }
};

jsPsych.init({
   timeline: [test, debrief],
});
```
</sub>
</div>
</div>

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
