# Summary of Tutorial Content

This tutorial will step through the creation of a simple response time task. The subject is asked to respond to blue circles by pressing the F key, but to not respond to orange circles. The concepts covered in the tutorial include:

* Creating trials to show instructions.
* Creating trials to show stimuli and measure response time.
* Using the randomization methods of the jsPsych library.
* Tagging trials with additional data to describe within-subject conditions.
* Using functions as trial parameters to generate dynamic content.
* Using callback functions to process the data for a trial immediately after the trial ends.

## Part 1: Creating a blank experiment

Start by downloading jsPsych and setting up a folder to contain your experiment files. If you are unsure how to do this, follow steps 1-5 in the [Hello World tutorial](hello-world.md). At the end of step 5 in the Hello World tutorial, you should have an experiment page that looks like this:

```html
<!doctype html>
<html>
  <head>
    <title>My experiment</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="jspsych-5.0/jspsych.js"></script>
    <script src="jspsych-5.0/plugins/jspsych-text.js"></script>
    <link href="jspsych-5.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
  </head>
  <body>
  </body>
</html>
```

This will be our starting point for building the rest of the experiment.

## Part 2: Display welcome message

Let's greet the subject with a simple welcome message using the [jspsych-text](../plugins/jspsych-text.md) plugin.

First, we create a block that uses the jspsych-text plugin and contains a simple string to show the subject.

```javascript
var welcome_block = {
  type: "text",
  text: "Welcome to the experiment. Press any key to begin."
};
```

Next, we create an array to hold the blocks of our experiment. Right now, we only have one block, but we will add several more throughout the tutorial.

```javascript
var timeline = [];
timeline.push(welcome_block);
```

Finally, we tell jsPsych to run the experiment by calling the [jsPsych.init() function](../core_library/jspsych-core.md#jspsychinit) and passing in the array that defines the experiment timeline.

```javascript
jsPsych.init({
  timeline: timeline
});
```

### The complete code so far

```html
<!doctype html>
<html>
  <head>
    <title>My experiment</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="jspsych-5.0/jspsych.js"></script>
    <script src="jspsych-5.0/plugins/jspsych-text.js"></script>
    <link href="jspsych-5.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
  </head>
  <body>
  </body>
  <script>

    /* define welcome message block */
    var welcome_block = {
      type: "text",
      text: "Welcome to the experiment. Press any key to begin."
    };

    /* create experiment timeline array */
    var timeline = [];
    timeline.push(welcome_block);

    /* start the experiment */
    jsPsych.init({
      timeline: timeline
    });
  </script>
</html>
```

## Part 3: Show instructions

We can use the same basic structure from part 2 to create a new trial that shows instructions to the subject. The only difference in the trial we will create here is that we will use HTML formatting to control how the instructions display.

The block definition looks like this:

```javascript
var instructions_block = {
  type: "text",
  text: "<p>In this experiment, a circle will appear in the center " +
      "of the screen.</p><p>If the circle is <strong>blue</strong>, " +
      "press the letter F on the keyboard as fast as you can.</p>" +
      "<p>If the circle is <strong>orange</strong>, do not press " +
      "any key.</p>" +
      "<div class='left center-content'><img src='img/blue.png'></img>" +
      "<p class='small'><strong>Press the F key</strong></p></div>" +
      "<div class='right center-content'><img src='img/orange.png'></img>" +
      "<p class='small'><strong>Do not press a key</strong></p></div>" +
      "<p>Press any key to begin.</p>"
};
```

Don't forget to add it to the experiment definition array:

```javascript
timeline.push(instructions_block);
```

### The complete code so far

```html
<!doctype html>
<html>
  <head>
    <title>My experiment</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="jspsych-5.0/jspsych.js"></script>
    <script src="jspsych-5.0/plugins/jspsych-text.js"></script>
    <link href="jspsych-5.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
  </head>
  <body>
  </body>
  <script>

    /* define welcome message block */
    var welcome_block = {
      type: "text",
      text: "Welcome to the experiment. Press any key to begin."
    };

    /* define instructions block */
    var instructions_block = {
      type: "text",
      text: "<p>In this experiment, a circle will appear in the center " +
          "of the screen.</p><p>If the circle is <strong>blue</strong>, " +
          "press the letter F on the keyboard as fast as you can.</p>" +
          "<p>If the circle is <strong>orange</strong>, do not press " +
          "any key.</p>" +
          "<div class='left center-content'><img src='img/blue.png'></img>" +
          "<p class='small'><strong>Press the F key</strong></p></div>" +
          "<div class='right center-content'><img src='img/orange.png'></img>" +
          "<p class='small'><strong>Do not press a key</strong></p></div>" +
          "<p>Press any key to begin.</p>"
    };

    /* create experiment definition array */
    var timeline = [];
    timeline.push(welcome_block);
    timeline.push(instructions_block);

    /* start the experiment */
    jsPsych.init({
      timeline: timeline
    });
  </script>
</html>
```

## Part 4: Displaying stimuli and getting responses

Creating trials to show the stimuli is conceptually the same as creating a trial to show instructions. The only difference is that we will use the [jspsych-single-stim](../plugins/jspsych-single-stim.md) plugin to show the stimuli. This plugin has different options than the jspsych-text plugin, so the code that defines the trial will look slightly different.

First, to use a plugin we need to load it in the `<head>` section of the experiment page:

```html
<head>
  ...
  <script src="jspsych-5.0/plugins/jspsych-single-stim.js"></script>
  ...
</head>
```

You'll need to download the image files used as stimuli in the experiment. Here are the images we will use. Right-click on each image and select *Save Image As...*. Put the images in a folder called `img` in the experiment folder you created in Part 1.

![blue circle](../img/blue.png)
![orange circle](../img/orange.png)

Next, we will define the first trial. For now, we will just show each image once. The path to the image file should be set as the `stimulus` parameter. We will also set the option for which keys the subject is allowed to use to respond (`choices`) so that only the 'F' key is a valid response.

```javascript
var blue_trial = {
  type: 'single-stim',
  stimulus: 'img/blue.png',
  choices: ['F']
};

var orange_trial = {
  type: 'single-stim',
  stimulus: 'img/orange.png',
  choices: ['F']
}
```

As usual, we need to add the trials to the timeline.

```javascript
timeline.push(blue_trial, orange_trial);
```

### The complete code so far

```html
<!doctype html>
<html>
  <head>
    <title>My experiment</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="jspsych-5.0/jspsych.js"></script>
    <script src="jspsych-5.0/plugins/jspsych-text.js"></script>
    <script src="jspsych-5.0/plugins/jspsych-single-stim.js"></script>
    <link href="jspsych-5.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
  </head>
  <body>
  </body>
  <script>

    /* define welcome message block */
    var welcome_block = {
      type: 'text',
      text: 'Welcome to the experiment. Press any key to begin.'
    };

    /* define instructions block */
    var instructions_block = {
      type: "text",
      text: "<p>In this experiment, a circle will appear in the center " +
          "of the screen.</p><p>If the circle is <strong>blue</strong>, " +
          "press the letter F on the keyboard as fast as you can.</p>" +
          "<p>If the circle is <strong>orange</strong>, do not press " +
          "any key.</p>" +
          "<div class='left center-content'><img src='img/blue.png'></img>" +
          "<p class='small'><strong>Press the F key</strong></p></div>" +
          "<div class='right center-content'><img src='img/orange.png'></img>" +
          "<p class='small'><strong>Do not press a key</strong></p></div>" +
          "<p>Press any key to begin.</p>",
      timing_post_trial: 2000
    };

    /* define test trials */
    var blue_trial = {
      type: 'single-stim',
      stimulus: 'img/blue.png',
      choices: ['F']
    };

    var orange_trial = {
      type: 'single-stim',
      stimulus: 'img/orange.png',
      choices: ['F']
    }

    /* create experiment definition array */
    var timeline = [];
    timeline.push(welcome_block);
    timeline.push(instructions_block);
    timeline.push(blue_trial, orange_trial);

    /* start the experiment */
    jsPsych.init({
      timeline: timeline
    });
  </script>
</html>
```

## Part 5: Nesting timelines

In the full experiment, we will want more than two trials. One way we could do this is to create many more objects that define trials and push them all onto the timeline, but there is a more efficient way: using nested timelines.

Any trial object can have it's own `timeline` parameter. Just like the `timeline` parameter in `jsPsych.init`, the value of this parameter should be an array with trial objects (or more objects with timelines -- the nesting can be as deep as you'd like).

An advantage of nesting timelines is that all the parameters of an object are passed on to the other trials on the timeline. If you have many trials where the same plugin and parameters are used, save for one or a handful of parameters that differ for each trial, you can define all of the shared parameters in the parent object. In this experiment, each test trial uses the same `type` and `choices` parameter, so our test trials can be defined like this:

```javascript
var test_block = {
  type: 'single-stim',
  choices: ['F'],
  timeline: [
    {stimulus: 'img/blue.png'},
    {stimulus: 'img/orange.png'}
  ]
}
```

## Part 6: Generating a random order of trials

Right now our experiment is a measly two trials long. Even worse is that the order of the stimuli is the same every time!

Fortunately, jsPsych has a number of different ways to randomize the order of trials and generate repeated trials. One easy way to do this is to set the `randomize_order` parameter to `true` on any object with a timeline. This will randomize the order of all of the trials in that timeline.

```javascript
var test_block = {
  type: 'single-stim',
  choices: ['F'],
  randomize_order: true,
  timeline: [
    {stimulus: 'img/blue.png'},
    {stimulus: 'img/orange.png'}
  ]
}
```

But, this doesn't make the number of trials any greater. You could copy and paste the objects inside the timeline array a few times to make 20 trials. For short experiments, this is perfectly reasonable. However, many experiments have many more trials, and it would be useful to have other tools for repeating and randomizing trials. This is what the methods in the [jsPsych.randomization](../core_library/jspsych-randomization.md) portion of the library are for.

Let's start by taking the array that contains the two stimuli, and creating a new variable to hold the different kinds of trials.

```javascript
var test_stimuli = [
  {stimulus: 'img/blue.png'},
  {stimulus: 'img/orange.png'}
];
```

Next, we will use the [`jsPsych.randomization.repeat()` method](../core_library/jspsych-randomization.md#jspsychrandomizationrepeat) to generate an array that contains multiple copies of each stimulus in a random order. The first parameter to the method is the array containing the items to repeat and randomize. The second parameter is the number of times to repeat each element.

```javascript
var all_trials = jsPsych.randomization.repeat(test_stimuli, 10);
```

This creates a new array, `all_trials`, that contains a random order of 10 blue trials and 10 orange trials. We can use this new array as the value for the `timeline` parameter in the `test_block`.

```javascript
var test_block = {
  type: 'single-stim',
  choices: ['F'],
  timeline: all_trials
};
```

Now the experiment is 20 trials long, and the trials are shown in a random order.

## Part 8: Modifying timing parameters

As currently constructed, the test trials start very soon after the instructions disappear. The stimuli also remain on the screen until a response is given. This clearly won't work, since the instructions are to **not** respond when the circle is orange. We can modify these parameters of the plugin. Currently, we haven't specified any values related to timing in our block definitions. This means we are using the default values generated by the plugin. If we specify a value, then we can override the default value.

First, let's give the subject a little more time to get ready after the instructions end by setting the `timing_post_trial` parameter in the instructions trial. We will give the subject 2,000 milliseconds in between the instructions and the first trial.

```javascript
var instructions_block = {
  type: "text",
  text: "<p>In this experiment, a circle will appear in the center " +
      "of the screen.</p><p>If the circle is <strong>blue</strong>, " +
      "press the letter F on the keyboard as fast as you can.</p>" +
      "<p>If the circle is <strong>orange</strong>, do not press " +
      "any key.</p>" +
      "<div class='left center-content'><img src='img/blue.png'></img>" +
      "<p class='small'><strong>Press the F key</strong></p></div>" +
      "<div class='right center-content'><img src='img/orange.png'></img>" +
      "<p class='small'><strong>Do not press a key</strong></p></div>" +
      "<p>Press any key to begin.</p>",
  timing_post_trial: 2000
};
```

Now, let's modify the test block so that the subject only has 1,500 milliseconds to respond before the trial ends.

```javascript
var test_block = {
  type: 'single-stim',
  choices: ['F'],
  timing_response: 1500,
  timeline: all_trials
};
```

If you are wondering where to figure out what the various parameter options for a plugin are, each plugin has its own [documentation page](../plugins/overview.md) which gives a list of all the parameters for that plugin and what the default values are.

## Part 9: Displaying the data

We have created a somewhat reasonable experiment at this point, so let's take a look at the data being generated. jsPsych has a handy [function called `jsPsych.data.displayData()`](../core_library/jspsych-data.md#jspsychdatadisplaydata) that is useful for debugging your experiment. It will remove all of the information on the screen and replace it with the raw data collected so far. This isn't terribly useful when you are actually running an experiment, but it's very handy for checking the data during development.

We need the `displayData` function to execute when the experiment ends. One way to do this is to use the [`on_finish` callback function](../features/callbacks.md#on_finish-experiment). This function will automatically execute once all the trials in the experiment are finished. We can specify a function to call in the `init` method.

```javascript
jsPsych.init({
  experiment_structure: experiment,
  on_finish: function() {
    jsPsych.data.displayData();
  }
});
```

## Part 10: Adding tagging data to a trial

All trials in jsPsych can be tagged with additional arbitrary data. This data will get stored alongside the data that the plugin generates, which allows experimenters to record properties of a trial with the data from the trial.

In this example experiment, we are going to tag each trial as being either a `go` or a `no-go` trial. In this particular example, this is somewhat redundant, since we can determine the trial type by looking at the stimulus that was displayed. However, the technique is essential in many circumstances for marking the data for subsequent analysis.

Adding tagging data involves setting the `data` parameter of a trial. Like other parameters, you can set the `data` parameter of any object and it will be passed on to the objects in the timeline. In this particular experiment, we want to set the data parameter for each type of stimulus. We can do that by adding a data property to the items in the `test_stimuli` array:

```javascript
var test_stimuli = [
  {
    stimulus: "img/blue.png",
    data: { response: 'go' }
  },
  {
    stimulus: "img/orange.png",
    data: { response: 'no-go' }
  }
];
```

The value for the data property should be an object. Each key in the object will be a new entry in the data for that trial, with the corresponding value attached.

## Part 11: Using functions as parameters

One methodological flaw in our experiment right now is that the time between trials is always the same. This will let people anticipate the response as they learn how much time is in between the trials.

We can fix this by generating a random value for the `timing_post_trial` parameter in the test block.

Most jsPsych plugins will allow you to set the value of a parameter as a function. The function will be called at the start of the trial, and the parameter will be replaced with the return value of the function. We will create a simple function to generate a random value for the timing_post_trial parameter:

```javascript
var post_trial_gap = function() {
  return Math.floor( Math.random() * 1500 ) + 750;
}
```

The above function will return a random value between 750 and 2250, with uniform sampling from the range. You can do whatever you like inside a function that is a parameter, as long as the return value is a valid value for the parameter.

Now that we've got a function that generates a random time, we can specify the `timing_post_trial` parameter in the testing block.

```javascript
var test_block = {
  type: "single-stim",
  choices: ['F'],
  timing_response: 1500,
  timing_post_trial: post_trial_gap,
  timeline: all_trials
};
```

If you run the experiment, you'll notice that the interval between trials changes randomly throughout the experiment.

## Part 12: Adding data to a trial that is based on the subject's performance

If you examine the data generated by the experiment, one thing that is missing is any direct indication of whether the subject responded correctly or not. It's possible to derive the correctness of the response by looking at a combination of the `rt` and `stimulus` values, but for subsequent analysis, it would also be useful to tag each trial with a `correct` property that is either `true` or `false`.

We can only determine whether a trial should be marked as correct or not after the trial is complete. What we really want to do is run some code after each trial to determine the correctness of the response that was made. We can use the `on_finish` event to do this. If we attach an `on_finish` event handler to a trial, we can execute a function immediately after the trial ends. The event handler (a function) is passed a single argument containing the data generated by the trial. In the example below, the event handler calculates the correctness of the response, and then uses the jsPsych.data.addDataToLastTrial method to add a correct property to the previous trial.

```javascript
var test_block = {
  type: "single-stim",
  choices: ['F'],
  timing_response: 1500,
  timing_post_trial: post_trial_gap,
  on_finish: function(data){
    var correct = false;
    if(data.response == 'go' && data.rt > -1){
      correct = true;
    } else if(data.response == 'no-go' && data.rt == -1){
      correct = true;
    }
    jsPsych.data.addDataToLastTrial({correct: correct});
  },
  timeline: all_trials
};
```

## Part 13: Displaying data to the subject

We've got a reasonable experiment at this point. One thing that subjects might appreciate is knowing how well they performed at the end of the experiment. We will create a simple debriefing screen at the end of the experiment that shows the subject their accuracy and average response time on correct responses.

First, we need a function to compute the subject's accuracy and mean RT. We will use the `jsPsych.data.getTrialsOfType()` method to get the data from all the trials run by the single-stim plugin. Then we will iterate through that data to compute the desired measures.

```javascript
function getSubjectData() {

  var trials = jsPsych.data.getTrialsOfType('single-stim');

  var sum_rt = 0;
  var correct_trial_count = 0;
  var correct_rt_count = 0;
  for (var i = 0; i < trials.length; i++) {
    if (trials[i].correct == true) {
      correct_trial_count++;
      if(trials[i].rt > -1){
        sum_rt += trials[i].rt;
        correct_rt_count++;
      }
    }
  }
  return {
    rt: Math.floor(sum_rt / correct_rt_count),
    accuracy: Math.floor(correct_trial_count / trials.length * 100)
  }
}
```

Next, we add a trial using the text plugin to show the response time. However, there's one catch. We want to use the function we just added above to get the average response time of the subject. But we can't do this until the experiment is over. Therefore, we need to use a *function* as the value of the `text` parameter in the block. This will result in the function being called right when the trial begins. If we didn't do this, then the `getAverageResponseTime()` function would be executed at the beginning of the experiment, which would be bad since there is no data at that point!

```javascript
var debrief_block = {
  type: "text",
  text: function() {
    var subject_data = getSubjectData();
    return "<p>You responded correctly on "+subject_data.accuracy+"% of "+
    "the trials.</p><p>Your average response time was <strong>" +
    subject_data.rt + "ms</strong>. Press any key to complete the "+
    "experiment. Thank you!</p>";
  }
};
```

We need to add the debrief block to the experiment definition array.

```javascript
experiment.push(debrief_block);
```

## The final code

```html
<!doctype html>
<html>
  <head>
    <title>My experiment</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="jspsych-5.0/jspsych.js"></script>
    <script src="jspsych-5.0/plugins/jspsych-text.js"></script>
    <script src="jspsych-5.0/plugins/jspsych-single-stim.js"></script>
    <link href="jspsych-5.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
  </head>
  <body>
  </body>
  <script>

  /* define welcome message block */
  var welcome_block = {
    type: "text",
    text: "Welcome to the experiment. Press any key to begin."
  };

  /* define instructions block */
  var instructions_block = {
    type: "text",
    text: "<p>In this experiment, a circle will appear in the center " +
        "of the screen.</p><p>If the circle is <strong>blue</strong>, " +
        "press the letter F on the keyboard as fast as you can.</p>" +
        "<p>If the circle is <strong>orange</strong>, do not press " +
        "any key.</p>" +
        "<div class='left center-content'><img src='img/blue.png'></img>" +
        "<p class='small'><strong>Press the F key</strong></p></div>" +
        "<div class='right center-content'><img src='img/orange.png'></img>" +
        "<p class='small'><strong>Do not press a key</strong></p></div>" +
        "<p>Press any key to begin.</p>",
    timing_post_trial: 2000
  };

  /* define test block */

  var test_stimuli = [
    {
      stimulus: "img/blue.png",
      data: { response: 'go' }
    },
    {
      stimulus: "img/orange.png",
      data: { response: 'no-go' }
    }
  ];

  var all_trials = jsPsych.randomization.repeat(test_stimuli, 10);

  var post_trial_gap = function() {
    return Math.floor( Math.random() * 1500 ) + 750;
  }

  var test_block = {
    type: "single-stim",
    choices: ['F'],
    timing_response: 1500,
    timing_post_trial: post_trial_gap,
    on_finish: function(data){
      var correct = false;
      if(data.response == 'go' && data.rt > -1){
        correct = true;
      } else if(data.response == 'no-go' && data.rt == -1){
        correct = true;
      }
      jsPsych.data.addDataToLastTrial({correct: correct});
    },
    timeline: all_trials
  };

  /* define debrief block */

  function getSubjectData() {

    var trials = jsPsych.data.getTrialsOfType('single-stim');

    var sum_rt = 0;
    var correct_trial_count = 0;
    var correct_rt_count = 0;
    for (var i = 0; i < trials.length; i++) {
      if (trials[i].correct == true) {
        correct_trial_count++;
        if(trials[i].rt > -1){
          sum_rt += trials[i].rt;
          correct_rt_count++;
        }
      }
    }
    return {
      rt: Math.floor(sum_rt / correct_rt_count),
      accuracy: Math.floor(correct_trial_count / trials.length * 100)
    }
  }

  var debrief_block = {
    type: "text",
    text: function() {
      var subject_data = getSubjectData();
      return "<p>You responded correctly on "+subject_data.accuracy+"% of "+
      "the trials.</p><p>Your average response time was <strong>" +
      subject_data.rt + "ms</strong>. Press any key to complete the "+
      "experiment. Thank you!</p>";
    }
  };

  /* create experiment timeline array */
  var timeline = [];
  timeline.push(welcome_block);
  timeline.push(instructions_block);
  timeline.push(test_block);
  timeline.push(debrief_block);

  /* start the experiment */
  jsPsych.init({
    timeline: timeline,
    on_finish: function() {
      jsPsych.data.displayData();
    }
  });
</script>
</html>
```
