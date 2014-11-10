# Summary of Tutorial Content

This tutorial will step through the creation of a simple go/no-go task. The subject is asked to respond to blue circles by pressing the F key, but to not respond to orange circles. The concepts covered in the tutorial include:

* Creating blocks to show instructions
* Creating blocks to show stimuli and measure response time
* Using the randomization methods of the jsPsych library
* Tagging trials with additional data
* Using functions as trial parameters
* Using callback functions

## Part 1: Creating a blank experiment

Start by downloading jsPsych and setting up a folder to contain your experiment files. If you are unsure how to do this, follow steps 1-5 in the [Hello World tutorial](hello-world.md). At the end of step 5 in the Hello World tutorial, you should have an experiment page that looks like this:

```html
<!doctype html>
<html>
  <head>
    <title>My experiment</title>
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="jsPsych-4.0/jspsych.js"></script>
    <script src="jsPsych-4.0/plugins/jspsych-text.js"></script>
    <link href="jsPsych-4.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
  </head>
  <body>
  </body>
</html>
```

This will be our starting point for building the rest of the experiment.

## Part 2: Display welcome message

It doesn't hurt to greet the subject with a nice welcome message before the experiment starts. In the code below, some JavaScript is added to the blank page to display a message to the subject using the [jspsych-text](../plugins/jspsych-text.md) plugin.

To walkthrough the example, I'll start by annotating the individual chunks of code. Then I'll show everything put together at the end.

First, we create a block that uses the jspsych-text plugin and contains a simple string to show the subject.

```javascript
var welcome_block = {
  type: "text",
  text: "Welcome to the experiment. Press any key to begin."
};
```

Next, we create an array to hold the blocks of our experiment. Right now, we only have one block, but we will add several more throughout the tutorial.

```javascript
var experiment = [];
experiment.push(welcome_block);
```

Finally, we tell jsPsych to run the experiment by calling the [jsPsych.init() function](../core_library/jspsych-core.md#jspsychinit) and passing in the array that defines the experiment structure.

```javascript
jsPsych.init({
  experiment_structure: experiment
});
```

### The complete code so far

```html
<!doctype html>
<html>
  <head>
    <title>My experiment</title>
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="jsPsych-4.0/jspsych.js"></script>
    <script src="jsPsych-4.0/plugins/jspsych-text.js"></script>
    <link href="jsPsych-4.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
  </head>
  <body>
  </body>
  <script>

    /* define welcome message block */
    var welcome_block = {
      type: "text",
      text: "Welcome to the experiment. Press any key to begin."
    };

    /* create experiment definition array */
    var experiment = [];
    experiment.push(welcome_block);

    /* start the experiment */
    jsPsych.init({
      experiment_structure: experiment
    });
  </script>
</html>
```

## Part 3: Show instructions

We can use the same basic structure from Part 2 to create a new block that shows instructions to the subject. The only difference in the block we will create here is that we'll use some HTML formatting to control how the instructions display.

The block definition looks like this:

```javascript
var instructions_block = {
  type: "text",
  text: "<p>In this experiment, a circle will appear in the center " +
      "of the screen.</p><p>If the circle is <strong>blue</strong>, " +
      "press the letter F on the keyboard as fast as you can.</p>" +
      "<p>If the circle is <strong>orange</strong>, do not press " +
      "any key.</p>" +
      "<div class='left center-content'><img src='static/images/blue.png'></img>" +
      "<p class='small'><strong>Press the F key</strong></p></div>" +
      "<div class='right center-content'><img src='static/images/orange.png'></img>" +
      "<p class='small'><strong>Do not press a key</strong></p></div>" +
      "<p>Press any key to begin.</p>"
};
```

Don't forget to add it to the experiment definition array:

```javascript
experiment.push(instructions_block);
```

### The complete code so far

```html
<!doctype html>
<html>
  <head>
    <title>My experiment</title>
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="jsPsych-4.0/jspsych.js"></script>
    <script src="jsPsych-4.0/plugins/jspsych-text.js"></script>
    <link href="jsPsych-4.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
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
          "<div class='left center-content'><img src='static/images/blue.png'></img>" +
          "<p class='small'><strong>Press the F key</strong></p></div>" +
          "<div class='right center-content'><img src='static/images/orange.png'></img>" +
          "<p class='small'><strong>Do not press a key</strong></p></div>" +
          "<p>Press any key to begin.</p>"
    };

    /* create experiment definition array */
    var experiment = [];
    experiment.push(welcome_block);
    experiment.push(instructions_block);

    /* start the experiment */
    jsPsych.init({
      experiment_structure: experiment
    });
  </script>
</html>
```

## Part 4: Displaying stimuli and getting responses

Conceptually, creating a block to show the stimuli is the same as creating a block to show instructions. The major difference is that we'll use the [jspsych-single-stim](../plugins/jspsych-single-stim.md) plugin to show the stimuli. This plugin has different options than the jspsych-text plugin, so the code that defines the block will look slightly different.

First, to use a plugin we need to load it in the `<head>` section of the experiment page:

```html
<head>
  ...
  <script src="jsPsych-4.0/plugins/jspsych-single-stim.js"></script>
  ...
</head>
```

You'll need to download the image files used as stimuli in the experiment. Here are the images we'll use. Right-click on each image and select *Save Image As...*. Put the images in a folder called `img` in the experiment folder you created in Part 1.

![blue circle](../img/blue.png)
![orange circle](../img/orange.png)

Next, we'll define the block. For now, we'll just show each image once. The `stimuli` parameter in the block definition below takes an array, and each element of the array represents an image that will be shown in its own trial. Because we are only specifying two images, there will only be two trials. You could create multiple trials for each image by repeating the array elements (there's functionality in jsPsych to help with this, which we'll see later in the tutorial).  We'll also set the option for which keys the subject is allowed to use to respond (`choices`) so that only the 'F' key is a valid response.

```javascript
var test_block = {
  type: "single-stim",
  stimuli: ['img/blue.png', 'img/orange.png'],
  choices: ['F']
};
```

As usual, we need to add the block to experiment definition array.

```javascript
experiment.push(test_block);
```

### The complete code so far

```html
<!doctype html>
<html>
  <head>
    <title>My experiment</title>
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="jsPsych-4.0/jspsych.js"></script>
    <script src="jsPsych-4.0/plugins/jspsych-text.js"></script>
    <script src="jsPsych-4.0/plugins/jspsych-single-stim.js"></script>
    <link href="jsPsych-4.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
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
          "<div class='left center-content'><img src='static/images/blue.png'></img>" +
          "<p class='small'><strong>Press the F key</strong></p></div>" +
          "<div class='right center-content'><img src='static/images/orange.png'></img>" +
          "<p class='small'><strong>Do not press a key</strong></p></div>" +
          "<p>Press any key to begin.</p>"
    };

    /* define test block */
    var test_block = {
      type: "single-stim",
      stimuli: ['img/blue.png', 'img/orange.png'],
      choices: ['F']
    };

    /* create experiment definition array */
    var experiment = [];
    experiment.push(welcome_block);
    experiment.push(instructions_block);
    experiment.push(test_block);

    /* start the experiment */
    jsPsych.init({
      experiment_structure: experiment
    });
  </script>
</html>
```

## Part 5: Modifying timing parameters

As currently constructed, the test trials start very soon after the instructions disappear. Also, the stimuli remain on the screen until a response is given. This clearly won't work, since the instructions are to **not** respond when the circle is orange. We can modify these parameters of the plugin. Currently, we haven't specified any values related to timing in our block definitions. This means we are using the default values generated by the plugin. If we specify a value, then we can override the default value.

First, let's give the subject a little more time to get ready after the instructions end by setting the `timing_post_trial` parameter in the instructions block. We'll give the subject 2,000 milliseconds in between the instructions and the first trial.

```javascript
var instructions_block = {
  type: "text",
  text: "<p>In this experiment, a circle will appear in the center " +
      "of the screen.</p><p>If the circle is <strong>blue</strong>, " +
      "press the letter F on the keyboard as fast as you can.</p>" +
      "<p>If the circle is <strong>orange</strong>, do not press " +
      "any key.</p>" +
      "<div class='left center-content'><img src='static/images/blue.png'></img>" +
      "<p class='small'><strong>Press the F key</strong></p></div>" +
      "<div class='right center-content'><img src='static/images/orange.png'></img>" +
      "<p class='small'><strong>Do not press a key</strong></p></div>" +
      "<p>Press any key to begin.</p>",
  timing_post_trial: 2000
};
```

Now, let's modify the test block so that the subject only has 1,500 milliseconds to respond before the trial ends.

```javascript
var test_block = {
  type: "single-stim",
  stimuli: ['img/blue.png', 'img/orange.png'],
  choices: ['F'],
  timing_response: 1500
};
```

If you are wondering where to figure out what the various parameter options for a plugin are, each plugin has its own [documentation page](../plugins/overview.md) which gives a list of all the parameters for that plugin and what the default values are.

### The complete code so far

```html
<!doctype html>
<html>
  <head>
    <title>My experiment</title>
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="jsPsych-4.0/jspsych.js"></script>
    <script src="jsPsych-4.0/plugins/jspsych-text.js"></script>
    <script src="jsPsych-4.0/plugins/jspsych-single-stim.js"></script>
    <link href="jsPsych-4.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
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
          "<div class='left center-content'><img src='static/images/blue.png'></img>" +
          "<p class='small'><strong>Press the F key</strong></p></div>" +
          "<div class='right center-content'><img src='static/images/orange.png'></img>" +
          "<p class='small'><strong>Do not press a key</strong></p></div>" +
          "<p>Press any key to begin.</p>",
      timing_post_trial: 2000
    };

    /* define test block */
    var test_block = {
      type: "single-stim",
      stimuli: ['img/blue.png', 'img/orange.png'],
      choices: ['F'],
      timing_response: 1500
    };

    /* create experiment definition array */
    var experiment = [];
    experiment.push(welcome_block);
    experiment.push(instructions_block);
    experiment.push(test_block);

    /* start the experiment */
    jsPsych.init({
      experiment_structure: experiment
    });
  </script>
</html>
```

## Part 6: Generating a random order of trials

Right now our experiment is a measly two trials long. Even worse is that the order of the stimuli is the same every time!

Fortunately, jsPsych has a number of different ways to randomize the order of trials and generate repeated trials. We'll walk through one way to do this.

First, we're going to create an array that contains one entry for each unique stimulus in the experiment (that's only two in this experiment, but it'll often be a lot more than that).

```javascript
var test_stimuli = ['img/blue.png', 'img/orange.png'];
```

Next, we'll use the [`jsPsych.randomization.repeat()` method](../core_library/jspsych-randomization.md#jspsychrandomizationrepeat) to generate an array that contains multiple copies of each stimulus in a random order. The first parameter to the method is the array containing the items to repeat and randomize. The second parameter is the number of times to repeat each element.

```javascript
var all_trials = jsPsych.randomization.repeat(test_stimuli, 10);
```

We can swap in this new array `all_trials` as the value for the `stimuli` parameter in the test block:

```javascript
var test_block = {
  type: "single-stim",
  stimuli: all_trials,
  choices: ['F'],
  timing_response: 1500
};
```

Now our experiment is 20 trials long, and the trials are shown in a random order.

### The complete code so far

```html
<!doctype html>
<html>
  <head>
    <title>My experiment</title>
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="jsPsych-4.0/jspsych.js"></script>
    <script src="jsPsych-4.0/plugins/jspsych-text.js"></script>
    <script src="jsPsych-4.0/plugins/jspsych-single-stim.js"></script>
    <link href="jsPsych-4.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
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
          "<div class='left center-content'><img src='static/images/blue.png'></img>" +
          "<p class='small'><strong>Press the F key</strong></p></div>" +
          "<div class='right center-content'><img src='static/images/orange.png'></img>" +
          "<p class='small'><strong>Do not press a key</strong></p></div>" +
          "<p>Press any key to begin.</p>",
      timing_post_trial: 2000
    };

    /* define test block */

    var test_stimuli = ['img/blue.png', 'img/orange.png'];

    var all_trials = jsPsych.randomization.repeat(test_stimuli, 10);

    var test_block = {
      type: "single-stim",
      stimuli: all_trials,
      choices: ['F'],
      timing_response: 1500
    };

    /* create experiment definition array */
    var experiment = [];
    experiment.push(welcome_block);
    experiment.push(instructions_block);
    experiment.push(test_block);

    /* start the experiment */
    jsPsych.init({
      experiment_structure: experiment
    });
  </script>
</html>
```

## Part 7: Displaying the data

We've got a reasonable experiment at this point, so let's take a look at the data being generated. jsPsych has a handy [function called `jsPsych.data.displayData()`](../core_library/jspsych-data.md#jspsychdatadisplaydata) that is useful for debugging your experiment. It will remove all of the information on the screen and replace it with the raw data collected so far. This isn't terribly useful when you are actually running an experiment, but it's very handy for checking the data during development.

We need the `displayData` function to execute when the experiment ends. One way to do this is to use the [`on_finish` callback function](../features/callbacks.md#on_finish-experiment). This function will automatically execute once all the blocks in the experiment are finished. We can specify a function to call in the `init` method.

```javascript
jsPsych.init({
  experiment_structure: experiment,
  on_finish: function() {
    jsPsych.data.displayData();
  }
});
```

### The complete code so far

```html
<!doctype html>
<html>
  <head>
    <title>My experiment</title>
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="jsPsych-4.0/jspsych.js"></script>
    <script src="jsPsych-4.0/plugins/jspsych-text.js"></script>
    <script src="jsPsych-4.0/plugins/jspsych-single-stim.js"></script>
    <link href="jsPsych-4.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
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
          "<div class='left center-content'><img src='static/images/blue.png'></img>" +
          "<p class='small'><strong>Press the F key</strong></p></div>" +
          "<div class='right center-content'><img src='static/images/orange.png'></img>" +
          "<p class='small'><strong>Do not press a key</strong></p></div>" +
          "<p>Press any key to begin.</p>",
      timing_post_trial: 2000
    };

    /* define test block */

    var test_stimuli = ['img/blue.png', 'img/orange.png'];

    var all_trials = jsPsych.randomization.repeat(test_stimuli, 10);

    var test_block = {
      type: "single-stim",
      stimuli: all_trials,
      choices: ['F'],
      timing_response: 1500
    };

    /* create experiment definition array */
    var experiment = [];
    experiment.push(welcome_block);
    experiment.push(instructions_block);
    experiment.push(test_block);

    /* start the experiment */
    jsPsych.init({
      experiment_structure: experiment,
      on_finish: function() {
        jsPsych.data.displayData();
      }
    });
  </script>
</html>
```

## Part 8: Using the optional data object

All trials in jsPsych can be tagged with additional data. This data will get stored alongside the data that the plugin generates, which allows experimenters to record properties of a trial with the data from the trial.

In this example experiment, we are going to tag each trial as being either a `go` or a `no-go` trial. In this particular example, this is somewhat redundant, since we can determine the trial type by looking at the stimulus that was displayed. However, the technique is useful in many circumstances.

We're going to make some changes to how we construct the trials in order to use the optional data object. First, we're going to change how we declare the `test_stimuli` array, so that each entry in the array is an object with an `image` property (containing the image to display) and a `data` property, which contains the data related to that image. The value of the `data` property is an object with `key: value` pairs. Each unique key will be recorded as a column in the data, and the value will be the entry for that trial.

```javascript
var test_stimuli = [
  {
    image: "img/blue.png",
    data: { response: 'go' }
  },
  {
    image: "img/orange.png",
    data: { response: 'no-go' }
  }
];
```

We also need to modify the call to `jsPsych.randomization.repeat`. We're going to specify a third variable in the function call. This variable determines how the randomized array is returned. If the value is `true`, then the array will come back with each different property of the elements in the array separated into its own value. If the value is `false`, then the elements are left as is, and just randomized and repeated as per the first two arguments. You can learn more about the function in the [API documentation](../core_library/jspsych-randomization.md#jspsychrandomizationrepeat).

Here we are going to specify `true` for the third parameter, to make it easier to create the testing block.

```javascript
var all_trials = jsPsych.randomization.repeat(test_stimuli, 10, true);
```

Now the `all_trials` variable is an object, containing two properties: `image` and `data`. Each of these properties is an array that is 20 elements long (since there were 2 elements in the `test_stimuli` array and we repeated each 10 times). The arrays will line-up with each other, so if the first element in the `all_trials.image` array is `'img/blue.png'`, the first element in the `data` array will be `{response: 'go'}`. This means we can simply use the two properties of the `all_trials` array to create the test block:

```javascript
var test_block = {
  type: "single-stim",
  stimuli: all_trials.image,
  choices: ['F'],
  data: all_trials.data,
  timing_response: 1500
};
```

### The complete code so far

```html
<!doctype html>
<html>
  <head>
    <title>My experiment</title>
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="jsPsych-4.0/jspsych.js"></script>
    <script src="jsPsych-4.0/plugins/jspsych-text.js"></script>
    <script src="jsPsych-4.0/plugins/jspsych-single-stim.js"></script>
    <link href="jsPsych-4.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
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
          "<div class='left center-content'><img src='static/images/blue.png'></img>" +
          "<p class='small'><strong>Press the F key</strong></p></div>" +
          "<div class='right center-content'><img src='static/images/orange.png'></img>" +
          "<p class='small'><strong>Do not press a key</strong></p></div>" +
          "<p>Press any key to begin.</p>",
      timing_post_trial: 2000
    };

    /* define test block */

    var test_stimuli = [
      {
        image: "img/blue.png",
        data: { response: 'go' }
      },
      {
        image: "img/orange.png",
        data: { response: 'no-go' }
      }
    ];

    var all_trials = jsPsych.randomization.repeat(test_stimuli, 10, true);

    var test_block = {
      type: "single-stim",
      stimuli: all_trials.image,
      choices: ['F'],
      data: all_trials.data,
      timing_response: 1500
    };

    /* create experiment definition array */
    var experiment = [];
    experiment.push(welcome_block);
    experiment.push(instructions_block);
    experiment.push(test_block);

    /* start the experiment */
    jsPsych.init({
      experiment_structure: experiment,
      on_finish: function() {
        jsPsych.data.displayData();
      }
    });
  </script>
</html>
```

## Part 9: Using functions as parameters

One serious methodological flaw in our experiment right now is that the time between trials is always the same. This will let people anticipate the response as they learn how much time is in between the trials.

We can fix this by generating a random value for the `timing_post_trial` parameter in the test block.

Most jsPsych plugins will allow you to set the value of a parameter as a function. The function will be called at the start of the trial, and the parameter will be replaced with the return value of the function. We'll create a simple function to generate a random value for the timing_post_trial parameter:

```javascript
var post_trial_gap = function() {
  return Math.floor( Math.random() * 1500 ) + 750;
}
```

The above function will return a random value between 750 and 2250, with uniform sampling from the range. A more sophisticated approach might be to sample from an exponential distribution, but that's beyond the scope of this tutorial.

Now that we've got a function that generates a random time, we can specify the `timing_post_trial` parameter in the testing block.

```javascript
var test_block = {
  type: "single-stim",
  stimuli: all_trials.image,
  choices: ['F'],
  data: all_trials.data,
  timing_response: 1500,
  timing_post_trial: post_trial_gap
};
```

If you run the experiment, you'll notice that the interval between trials changes randomly throughout the experiment.

### The complete code so far

```html
<!doctype html>
<html>
  <head>
    <title>My experiment</title>
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="jsPsych-4.0/jspsych.js"></script>
    <script src="jsPsych-4.0/plugins/jspsych-text.js"></script>
    <script src="jsPsych-4.0/plugins/jspsych-single-stim.js"></script>
    <link href="jsPsych-4.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
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
          "<div class='left center-content'><img src='static/images/blue.png'></img>" +
          "<p class='small'><strong>Press the F key</strong></p></div>" +
          "<div class='right center-content'><img src='static/images/orange.png'></img>" +
          "<p class='small'><strong>Do not press a key</strong></p></div>" +
          "<p>Press any key to begin.</p>",
      timing_post_trial: 2000
    };

    /* define test block */

    var test_stimuli = [
      {
        image: "img/blue.png",
        data: { response: 'go' }
      },
      {
        image: "img/orange.png",
        data: { response: 'no-go' }
      }
    ];

    var all_trials = jsPsych.randomization.repeat(test_stimuli, 10, true);

    var post_trial_gap = function() {
      return Math.floor( Math.random() * 1500 ) + 750;
    }

    var test_block = {
      type: "single-stim",
      stimuli: all_trials.image,
      choices: ['F'],
      data: all_trials.data,
      timing_response: 1500,
      timing_post_trial: post_trial_gap
    };

    /* create experiment definition array */
    var experiment = [];
    experiment.push(welcome_block);
    experiment.push(instructions_block);
    experiment.push(test_block);

    /* start the experiment */
    jsPsych.init({
      experiment_structure: experiment,
      on_finish: function() {
        jsPsych.data.displayData();
      }
    });
  </script>
</html>
```

## Part 10: Displaying data to the subject

We've got a reasonable experiment at this point. One thing that subjects might appreciate is knowing how fast they were at responding. We'll create a simple debriefing screen at the end of the experiment that shows the subject their average RT on correct responses.

First, we need a function to compute the average RT. We'll use the `jsPsych.data.getTrialsOfType()` method to get the data from all the trials run by the single-stim plugin. Then we'll iterate through that data to compute an average on correct responses.

```javascript
function getAverageResponseTime() {

  var trials = jsPsych.data.getTrialsOfType('single-stim');

  var sum_rt = 0;
  var valid_trial_count = 0;
  for (var i = 0; i < trials.length; i++) {
    if (trials[i].response == 'go' && trials[i].rt > -1) {
      sum_rt += trials[i].rt;
      valid_trial_count++;
    }
  }
  return Math.floor(sum_rt / valid_trial_count);
}
```

Next, we add a block using the text plugin to show the response time. However, there's one catch. We want to use the function we just added above to get the average response time of the subject. But we can't do this until the experiment is over! Therefore, we need to use a *function* as the value of the `text` parameter in the block. This will result in the function being called right when the trial begins. If we didn't do this, then the `getAverageResponseTime()` function would be executed at the beginning of the experiment, as we are creating the jsPsych blocks, which would be bad since there is no data yet!

```javascript
var debrief_block = {
  type: "text",
  text: function() {
    return "<p>Your average response time was <strong>" +
    getAverageResponseTime() + "ms</strong>. Press " +
    "any key to complete the experiment. Thank you!</p>";
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
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="jsPsych-4.0/jspsych.js"></script>
    <script src="jsPsych-4.0/plugins/jspsych-text.js"></script>
    <script src="jsPsych-4.0/plugins/jspsych-single-stim.js"></script>
    <link href="jsPsych-4.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
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
          "<div class='left center-content'><img src='static/images/blue.png'></img>" +
          "<p class='small'><strong>Press the F key</strong></p></div>" +
          "<div class='right center-content'><img src='static/images/orange.png'></img>" +
          "<p class='small'><strong>Do not press a key</strong></p></div>" +
          "<p>Press any key to begin.</p>",
      timing_post_trial: 2000
    };

    /* define test block */

    var test_stimuli = [
      {
        image: "img/blue.png",
        data: { response: 'go' }
      },
      {
        image: "img/orange.png",
        data: { response: 'no-go' }
      }
    ];

    var all_trials = jsPsych.randomization.repeat(test_stimuli, 10, true);

    var post_trial_gap = function() {
      return Math.floor( Math.random() * 1500 ) + 750;
    }

    var test_block = {
      type: "single-stim",
      stimuli: all_trials.image,
      choices: ['F'],
      data: all_trials.data,
      timing_response: 1500,
      timing_post_trial: post_trial_gap
    };

    /* define debrief block */

    function getAverageResponseTime() {

      var trials = jsPsych.data.getTrialsOfType('single-stim');

      var sum_rt = 0;
      var valid_trial_count = 0;
      for (var i = 0; i < trials.length; i++) {
        if (trials[i].response == 'go' && trials[i].rt > -1) {
          sum_rt += trials[i].rt;
          valid_trial_count++;
        }
      }
      return Math.floor(sum_rt / valid_trial_count);
    }

    var debrief_block = {
      type: "text",
      text: function() {
        return "<p>Your average response time was <strong>" +
        getAverageResponseTime() + "ms</strong>. Press " +
        "any key to complete the experiment. Thank you!</p>";
      }
    };

    /* create experiment definition array */
    var experiment = [];
    experiment.push(welcome_block);
    experiment.push(instructions_block);
    experiment.push(test_block);
    experiment.push(debrief_block);

    /* start the experiment */
    jsPsych.init({
      experiment_structure: experiment,
      on_finish: function() {
        jsPsych.data.displayData();
      }
    });
  </script>
</html>
```
