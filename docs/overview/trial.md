# Advanced Options for Trials

The parameters available for a trial depend primarily on what plugin is used for the trial. However, there are several options that do not depend on the particular plugin; they are available for all trials.

## The data parameter

The `data` parameter enables tagging the trial with additional properties. This can be useful for storing properties of the trial that are not directly apparent from the values that the plugin records. The `data` parameter value should be an object that contains key-value pairs.

A simple example is the [Flanker Task](https://en.wikipedia.org/wiki/Eriksen_flanker_task). In this experiment, participants respond to the direction of an arrow, pressing a key to the left for a left-pointing arrow (<) and a key to the right for a right-pointing arrow (>). The arrow appears in the center of *flankers*, or arrows that the participant should ignore. Those flankers can be congruent (>>>>>) or incongruent (<<><<).

A trial for the Flanker Task written with jsPsych might look like this:

```javascript
var trial = {
  type: 'html-keyboard-response',
  stimulus: '<<<<<',
  choices: ['f','j'],
  data: {
    stimulus_type: 'congruent',
    target_direction: 'left'
  }
}
```

Note the use of the data parameter to add a property `stimulus_type` with the value `congruent` and a property `target_direction` with the value `left`. Having these properties recorded directly in the data simplifies data analysis, making it easy to aggregate data by `stimulus_type` and/or `target_direction`.

## Inter-trial interval

The default inter-trial interval (ITI) in jsPsych is 0 ms. This can be adjusted at the experiment-wide level by changing the `default_iti` parameter in `jsPsych.init()`.

The ITI can also be controlled at the trial level through the `post_trial_gap` parameter. Setting this parameter to a positive integer *x* will cause a blank screen to display after the trial for *x* milliseconds.

```javascript
var trial = {
  type: 'html-keyboard-response',
  stimulus: 'There will be a 1.5 second blank screen after this trial.',
  post_trial_gap: 1500
}
```

## The on_start event

Immediately before a trial runs, there is an opportunity to run an arbitrary function through the `on_start` event handler. This event handler is passed a single argument containing an *editable* copy of the trial parameters. This event handler can therefore be used to alter the trial based on the state of the experiment, among other uses.

```javascript
var trial = {
  type: 'html-keyboard-response',
  stimulus: '<<<<<',
  choices: ['f','j'],
  data: {
    stimulus_type: 'congruent',
    target_direction: 'left'
  },
  on_start: function(trial){
    trial.stimulus = '<<><<';
    trial.data.stimulus_type = 'incongruent';
  }
}
```

## The on_finish event

After a trial is completed, there is an opportunity to run an arbitrary function through the `on_finish` event handler. This event handler is passed a single argument containing an *editable* copy of the data recorded for that trial. This event handler can therefore be used to update the state of the experiment based on the data collected or modify the data collected.

This can be useful to calculate new data properties that were unknowable at the start of the trial. For example, with the Flanker Task example above, the `on_finish` event could add a new property `correct`.

```javascript
var trial = {
  type: 'html-keyboard-response',
  stimulus: '<<<<<',
  choices: ['f','j'],
  data: {
    stimulus_type: 'congruent',
    target_direction: 'left'
  },
  on_finish: function(data){
    if(data.key_press == 70){// 70 is the numeric code for f
      data.correct = true; // can add property correct by modify data object directly
    } else {
      data.correct = false;
    }
  }
}
```

## The on_load event

The `on_load` callback can be added to any trial. The callback will trigger once the trial has completed loading. For most plugins, this will occur once the display has been initially updated but before any user interactions or timed events (e.g., animations) have occurred.

#### Sample use
```javascript
var trial = {
  type: 'image-keyboard-response',
  stimulus: 'imgA.png',
  on_load: function() {
    console.log('The trial just finished loading.');
  }
};
```

## Dynamic parameters

Most plugins allow parameters to be functions. In a typical declaration of a jsPsych trial, parameters have to be known at the start of the experiment. This makes it impossible to alter the content of the trial based on the outcome of previous trials. When functions are used as parameters for a block of trials, the function is evaluated at the start of each trial, and the return value of the function is used as the parameter. This enables dynamic updating of the parameter based on data that a subject has generated.

Here is a sketch of how this functionality could be used to display feedback to a subject in the Flanker Task.

```javascript

var timeline = [];

var trial = {
  type: 'html-keyboard-response',
  stimulus: '<<<<<',
  choices: ['f','j'],
  data: {
    stimulus_type: 'congruent',
    target_direction: 'left'
  },
  on_finish: function(data){
    if(data.key_press == 70){// 70 is the numeric code for f
      data.correct = true; // can add property correct by modify data object directly
    } else {
      data.correct = false;
    }
  }
}

var feedback = {
  type: 'html-keyboard-response',
  stimulus: function(){
    var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct;
    if(last_trial_correct){
      return "<p>Correct!</p>";
    } else {
      return "<p>Wrong.</p>"
    }
  }
}

timeline.push(trial, feedback);

```
