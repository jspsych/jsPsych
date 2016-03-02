#Eriksen Flanker Task

The flanker task is a popular task to measure response inhibition. In the variant presented here, participants are
required to judge whether an arrow presented between four other arrows is pointing in the same or the opposite
direction by pressing a key on the keyboard. We will create a 100-trial long version of this task which provides
feedback on the participant's performance at the end of the experiment.

##Part 1: Setting up the HTML file

As always, we need to create an HTML file which references the Javascript plugins and CSS required. For this experiment,
we will only use the [jspsych-text](../plugins/jspsych-text.md) and [jspsych-single-stim](../plugins/jspsych-single-stim.md)
plugins which can be specified in the `<head>` of the file.


```html
<!doctype html>
<html>
    <head>
         <title>Flanker Task</title>
         <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
         <script src="jspsych.js"></script>
         <script src="plugins/jspsych-text.js"></script>
         <script src="plugins/jspsych-single-stim.js"></script>
         <link href="css/jspsych.css" rel="stylesheet" type="text/css">
    </head>
    <body>
    </body>
</html>
```

##Part 2: Adding welcome and instructions block and starting the experiment

This is also very straightforward. We present a welcome message as well as the instructions in two separate blocks. Of
course, this text can be adapted according to what you want to focus on. Here, we're just saying that the task is to
press one of two buttons in response to the middle arrow displayed on the screen. Note that after the participants read
the instructions, they can start the experiment by pressing the <em>ENTER</em> key (defined as key 13). The first trial then
starts 3000 ms after that button press. These options obviously can be changed as well.

```javascript
var welcome = {
  type: "text",
  text: "<p style='margin:20%'>Welcome to the experiment. Press any key to begin.</p>"
};

var instructions = {
  type: "text",
  text: "<p style='margin-top:20%; margin-right:10%'>In this task you are required to respond to " +
        "stimuli displayed on the screen. In the following, you will see five arrows. Your task " +
        "is to decide as quickly as possible if the arrow in the middle is pointing in the same " +
        "direction as the others or not. If this is the case ('<strong><<<<<</strong>' or " +
        "'<strong>>>>>></strong>'), please press the left arrow button on the keyboard. If the " +
        "middle arrow is pointing in the opposite direction ('<strong><<><<</strong>' or " +
        "'<strong>>><>></strong>'), please press the right arrow button on the keyboard. You can " +
        "start the experiment by pressing ENTER.</p>",
  timing_post_trial: 3000
};
```

Both blocks need to be added to the timeline of the experiment.

```javascript
var timeline = [];
timeline.push(welcome);
timeline.push(instructions);
```

Finally, we need to initiate the experiment by adding this piece of code at the bottom:

```javascript
jsPsych.init({
    timeline: timeline,
    on_finish: function() {
        jsPsych.data.displayData();
    }
);
```

If you are unsure about any of this, go back to the [tutorial for running a simple reaction time task]
(http://docs.jspsych.org/tutorials/rt-task/).

###The code so far:
```html
<!doctype html>
<html>
    <head>
         <title>Flanker Task</title>
         <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
         <script src="jspsych.js"></script>
         <script src="plugins/jspsych-text.js"></script>
         <script src="plugins/jspsych-single-stim.js"></script>
         <link href="css/jspsych.css" rel="stylesheet" type="text/css">
    </head>
    <body>
    </body>
    <script>
        /*set up welcome block*/
        var welcome = {
          type: "text",
          text: "<p style='margin:20%'>Welcome to the experiment. Press any key to begin.</p>"
        };

        /*set up instructions block*/
        var instructions = {
          type: "text",
          text: "<p style='margin-top:20%; margin-right:10%'>In this task you are required to respond to " +
                "stimuli displayed on the screen. In the following, you will see five arrows. Your task " +
                "is to decide as quickly as possible if the arrow in the middle is pointing in the same " +
                "direction as the others or not. If this is the case ('<strong><<<<<</strong>' or " +
                "'<strong>>>>>></strong>'), please press the left arrow button on the keyboard. If the " +
                "middle arrow is pointing in the opposite direction ('<strong><<><<</strong>' or " +
                "'<strong>>><>></strong>'), please press the right arrow button on the keyboard. You can " +
                "start the experiment by pressing ENTER.</p>",
          timing_post_trial: 3000
        };

        /*set up experiment structure*/
        var timeline = [];
        timeline.push(welcome);
        timeline.push(instructions);

        /*start experiment*/
        jsPsych.init({
            timeline: timeline,
            on_finish: function() {
                jsPsych.data.displayData();
            }
        );
    </script>
</html>
```

If you run this code in your browser, you should see the welcome message as well as the instructions. Next, we need to
define which stimuli we are going to use for the experiment.

##Part 3: Defining the stimuli

For this experiment we are using four image files which are stored in the `img` folder. First, we need to define them
as being the `test_stimuli` we want to use. At the same time, we can also define specific attributes per stimulus. For
instance, we might want to keep track of the congruency of the stimuli, regardless of the direction in which they are
pointing. To do this, we don't just define the location of the stimulus image in the `stimulus`, but also an additional
attribute in the `data` line. Note that this information will automatically be stored in your result file. You can add
whatever extra information you might need here.

```javascript
var test_stimuli = [
  {
    stimulus: "img/con1.png",
    data: { phase: 'congruent'}
  },
  {
    stimulus: "img/con2.png",
    data: { phase: 'congruent'}
  },
  {
    stimulus: "img/inc1.png",
    data: { phase: 'incongruent'}
  },
  {
    stimulus: "img/inc2.png",
    data: { phase: 'incongruent'}
  }
];
```

Now that we have defined our stimuli, we want them to be displayed and repeated in a random order. This can easily be
done by using the randomisation code implemented in jsPsych. We simply create a variable which we call `all_trials`
that is going to display each stimulus <em>x</em> times, <em>x</em> being the number you define. Let's say we want a
100-trial experiment:

```javascript
var all_trials = jsPsych.randomization.repeat(test_stimuli, 25);
```

We also want the inter-stimulus interval to be variable, so we define a `post_trial_gap`. This will use a random value
between 1000 and 2000 ms, with uniform sampling from the range. Again, you can modify these parameters as you please.

```javascript
var post_trial_gap = function() {
    return Math.floor(Math.random() * 1500) + 500;
};
```

##Part 4: Creating an experimental block

So far, we have set up a welcome message, an instructions block, and the stimuli for our experiment. Now comes the most
important part, that is, creating our `test_block`. It is supported by the `single-stim` plugin, so this information
needs to go in first. Then, we defined the left and right arrow of the keyboard as our response keys, so their keycodes
(37 and 39; look up your required keycodes [here](http://www.asquare.net/javascript/tests/KeyCode.html)) need to be
defined in the `choices` tag. We want each stimulus to be presented for 1500 ms at most, which should be defined in
`timing_response`. Finally, we need to state which stimuli we need to add the information we created in the previous
steps, i.e., defining `all_trials` as our stimulus variable and `post_trial_gap` as our inter-stimulus interval.

```javascript
var test_block = {
  type: 'single-stim',
  choices: [37, 39],
  timing_response: 1500,
  timeline: all_trials,
  timing_post_trial: post_trial_gap
};
```

Of course, this block also needs to be added to the experiment's timeline:

```javascript
timeline.push(test_block);
```

###The code so far:

```html
<!doctype html>
<html>
    <head>
         <title>Flanker Task</title>
         <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
         <script src="jspsych.js"></script>
         <script src="plugins/jspsych-text.js"></script>
         <script src="plugins/jspsych-single-stim.js"></script>
         <link href="css/jspsych.css" rel="stylesheet" type="text/css">
    </head>
    <body>
    </body>
    <script>
        /*set up welcome block*/
        var welcome = {
          type: "text",
          text: "<p style='margin:20%'>Welcome to the experiment. Press any key to begin.</p>"
        };

        /*set up instructions block*/
        var instructions = {
          type: "text",
          text: "<p style='margin-top:20%; margin-right:10%'>In this task you are required to respond to " +
                "stimuli displayed on the screen. In the following, you will see five arrows. Your task " +
                "is to decide as quickly as possible if the arrow in the middle is pointing in the same " +
                "direction as the others or not. If this is the case ('<strong><<<<<</strong>' or " +
                "'<strong>>>>>></strong>'), please press the left arrow button on the keyboard. If the " +
                "middle arrow is pointing in the opposite direction ('<strong><<><<</strong>' or " +
                "'<strong>>><>></strong>'), please press the right arrow button on the keyboard. You can " +
                "start the experiment by pressing ENTER.</p>",
          timing_post_trial: 3000
        };

        /*defining stimuli*/
        var test_stimuli = [
          {
            stimulus: "img/con1.png",
            data: { phase: 'congruent'}
          },
          {
            stimulus: "img/con2.png",
            data: { phase: 'congruent'}
          },
          {
            stimulus: "img/inc1.png",
            data: { phase: 'incongruent'}
          },
          {
            stimulus: "img/inc2.png",
            data: { phase: 'incongruent'}
          }
        ];

        /*randomising stimuli*/
        var all_trials = jsPsych.randomization.repeat(test_stimuli, 25);

        /*creating random ISI*/
        var post_trial_gap = function() {
            return Math.floor(Math.random() * 1500) + 500;
        };

        /*defining experimental block*/
        var test_block = {
          type: 'single-stim',
          choices: [37, 39],
          timing_response: 1500,
          timeline: all_trials,
          timing_post_trial: post_trial_gap
        };

        /*set up experiment structure*/
        var timeline = [];
        timeline.push(welcome);
        timeline.push(instructions);
        timeline.push(test_block);

        /*start experiment*/
        jsPsych.init({
            timeline: timeline,
            on_finish: function() {
                jsPsych.data.displayData();
            }
        );
    </script>
</html>
```

##Part 5: Presenting feedback to the participants

Running the experiment now will provide you with a welcome message, instructions, and 100 trials. We would like to give
the participants feedback about their performance at the end of the experiment. (Note: This was already part of the
[basic tutorial](http://docs.jspsych.org/tutorials/rt-task/#part-13-displaying-data-to-the-subject)). We first need to
modify our `test_block` a bit to define what a correct trial is.

```javascript
var test_block = {
  type: 'single-stim',
  choices: [37, 39],
  timing_response: 1500,
  on_finish: function(data){
      var correct = false;
      if(data.phase == 'congruent' &&  data.key_press == '37' && data.rt > -1){
        correct = true;
      } else if(data.phase == 'incongruent' && data.key_press == '39' && data.rt > -1){
        correct = true;
      }
      jsPsych.data.addDataToLastTrial({correct: correct});
    },
  timeline: all_trials,
  timing_post_trial: post_trial_gap
};
```

Essentially, what we're doing here is saying that whenever a congruent stimulus was displayed and the left arrow key
was pressed <em>or</em> an incongruent stimulus was displayed and the right arrow key was pressed (and neither of those
reactions was later than the 1500 ms limit we defined earlier), the program returns the information that these are
correct trials.

We want to display both the percentage of correct responses as well as the mean reaction time. For this, we need to add
the following function to the code:

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
};
```
Finally, we add a debriefing block which is displayed after the last trial of the experiment. Don't forget to add this
block to the timeline as well!

```javascript
var debrief_block = {
  type: "text",
  text: function() {
    var subject_data = getSubjectData();
    return "<p style='margin:20%'>You responded correctly on "+subject_data.accuracy+"% of the trials. " +
    "Your average response time was <strong>" + subject_data.rt + "ms</strong>. Press any key to complete the "+
    "experiment. Thank you!</p>";
  }
};
```

###The final code:
```html
<!doctype html>
<html>
    <head>
         <title>Flanker Task</title>
         <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
         <script src="jspsych.js"></script>
         <script src="plugins/jspsych-text.js"></script>
         <script src="plugins/jspsych-single-stim.js"></script>
         <link href="css/jspsych.css" rel="stylesheet" type="text/css">
    </head>
    <body>
    </body>
    <script>
        /*set up welcome block*/
        var welcome = {
          type: "text",
          text: "<p style='margin:20%'>Welcome to the experiment. Press any key to begin.</p>"
        };

        /*set up instructions block*/
        var instructions = {
          type: "text",
          text: "<p style='margin-top:20%; margin-right:10%'>In this task you are required to respond to " +
                "stimuli displayed on the screen. In the following, you will see five arrows. Your task " +
                "is to decide as quickly as possible if the arrow in the middle is pointing in the same " +
                "direction as the others or not. If this is the case ('<strong><<<<<</strong>' or " +
                "'<strong>>>>>></strong>'), please press the left arrow button on the keyboard. If the " +
                "middle arrow is pointing in the opposite direction ('<strong><<><<</strong>' or " +
                "'<strong>>><>></strong>'), please press the right arrow button on the keyboard. You can " +
                "start the experiment by pressing ENTER.</p>",
          timing_post_trial: 3000
        };

        /*defining stimuli*/
        var test_stimuli = [
          {
            stimulus: "img/con1.png",
            data: { phase: 'congruent'}
          },
          {
            stimulus: "img/con2.png",
            data: { phase: 'congruent'}
          },
          {
            stimulus: "img/inc1.png",
            data: { phase: 'incongruent'}
          },
          {
            stimulus: "img/inc2.png",
            data: { phase: 'incongruent'}
          }
        ];

        /*randomising stimuli*/
        var all_trials = jsPsych.randomization.repeat(test_stimuli, 25);

        /*creating random ISI*/
        var post_trial_gap = function() {
            return Math.floor(Math.random() * 1500) + 500;
        };

        /*defining experimental block*/
        var test_block = {
          type: 'single-stim',
          choices: [37, 39],
          timing_response: 1500,
          on_finish: function(data){
              var correct = false;
              if(data.phase == 'congruent' &&  data.key_press == '37' && data.rt > -1){
                correct = true;
              } else if(data.phase == 'incongruent' && data.key_press == '39' && data.rt > -1){
                correct = true;
              }
              jsPsych.data.addDataToLastTrial({correct: correct});
            },
          timeline: all_trials,
          timing_post_trial: post_trial_gap
        };

        /*function for getting mean RTs and error rates*/
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
        };

        /*defining debriefing block*/
        var debrief_block = {
          type: "text",
          text: function() {
            var subject_data = getSubjectData();
            return "<p style='margin:20%'>You responded correctly on "+subject_data.accuracy+"% of the trials. " +
            "Your average response time was <strong>" + subject_data.rt + "ms</strong>. Press any key to complete the "+
            "experiment. Thank you!</p>";
          }
        };

        /*set up experiment structure*/
        var timeline = [];
        timeline.push(welcome);
        timeline.push(instructions);
        timeline.push(test_block);
        timeline.push(debrief_block);

        /*start experiment*/
        jsPsych.init({
            timeline: timeline,
            on_finish: function() {
                jsPsych.data.displayData();
            }
        );
    </script>
</html>
```