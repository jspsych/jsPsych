# Dynamic parameters

Most trial parameters can also be specified as functions. In a typical declaration of a jsPsych trial, parameters are known at the start of the experiment. This makes it impossible to alter the content of the trial based on the outcome of previous trials. However, **when functions are used as the parameter value, the function is evaluated right before the trial starts, and the return value of the function is used as the parameter value for that trial**. This enables dynamic updating of the parameter based on data that a subject has generated or any other information that you do not know in advance.

## Examples

### Providing Feedback

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
    // Score the response as correct or incorrect.
    if(jsPsych.pluginAPI.compareKeys(data.response, "f")){
      data.correct = true;
    } else {
      data.correct = false; 
    }
  }
}

var feedback = {
  type: 'html-keyboard-response',
  stimulus: function(){
    // The feedback stimulus is a dynamic parameter because we can't know in advance whether
    // the stimulus should be 'correct' or 'incorrect'.
    // Instead, this function will check the accuracy of the last response and use that information to set
    // the stimulus value on each trial.
    var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct;
    if(last_trial_correct){
      return "<p>Correct!</p>"; // the parameter value has to be returned from the function
    } else {
      return "<p>Wrong.</p>"; // the parameter value has to be returned from the function
    }
  }
}

timeline.push(trial, feedback);

```

### Randomizing a parameter value

Here's an example of using a dynamic parameter to randomize the inter-trial interval (ITI) duration. This time, the dynamic parameter is created using a named function instead of an anonymous function.

```js
var random_duration = function() {
    var rand_dur = jsPsych.randomization.sampleWithoutReplacement([500,600,700,800],1)[0];
    return rand_dur;
}

var trial = {
    type: 'html-keyboard-response'
    stimulus: '+',
    post_trial_gap: random_duration  // if you use a named function for a dynamic parameter, then just use the function name (without parentheses after it)
}
```

### Storing changing variables in the data

The trial's `data` parameter can be also function, which is useful for when you want to save information to the data that can change during the experiment. For example, if you have a global variable called `current_difficulty` that tracks the difficulty level in an adaptive task, you can save the current value of this variable to the trial data like this:

```js
var current_difficulty; // value changes during the experiment

var trial = {
  type: 'survey-text',
  questions: [{prompt: "Please enter your response."}]
  data: function() { 
    return {difficulty: current_difficulty}; 
  }
}
```

It's also possible to use a function for any of the _individual properties_ in the trial's `data` object, for instance if you want to combine static and dynamic information in the data:

```js
var trial = {
  type: 'survey-text',
  questions: [{prompt: "Please enter your response."}]
  data: {
    difficulty: function() { 
      return current_difficulty; // the difficulty value changes during the experiment
    },
    task_part: 'recall', // this part of the data is always the same
    block_number: 1
  }
}
```

### Nested Parameters

Dyanmic parameters work the same way with nested parameters, which are parameters that contain one or more sets of other parameters. For instance, many survey-* plugins have a `questions` parameter that is a nested parameter: it is an array that contains the parameters for one or more questions on the page. To make the `questions` parameter dynamic, you can use a function that returns the array with all of the parameters for each question:

```js
var subject_id; // value is set during the experiment

var trial = {
  type: 'survey-text',
  questions: function(){
    var questions_array = [ 
        {prompt: "Hi "+subject_id+"! What's your favorite city?", required: true, name: 'fav_city'},
        {prompt: "What is your favorite fruit?", required: true, name: 'fav_fruit'},
    ];
    return questions_array;
  }
}
```

You can also use a function for any of the _individual parameters_ inside of a nested parameter.

```js
var trial = {
  type: 'survey-text',
  questions: [
    { 
      prompt: function() {  
        // this question prompt is dynamic - the text that is shown 
        // will change based on the participant's earlier response
        var favorite_city = jsPsych.data.getLastTrialData().values()[0].response.fav_city;
        var text = "Earlier you said your favorite city is "+favorite_city+". What do you like most about "+favorite_city+"?"
        return text;
      }, 
      required: true,
      rows: 40,
      columns: 10
    },
    { prompt: "What is your favorite fruit?", required: true, name: 'fav_fruit' }
  ]
}
```
## When dynamic parameters can't be used

Note that if the plugin *expects* the value of a given parameter to be a function, then this function *will not* be evaluated at the start of the trial. This is because some plugins allow the researcher to specify functions that should be called at some point during the trial. Some examples of this include the `stimulus` parameter in the canvas-* plugins, the `mistake_fn` parameter in the cloze plugin, and the `stim_function` parameter in the reconstruction plugin. If you want to check whether this is the case for a particular plugin and parameter, then the parameter's `type` in the `plugin.info` section of the plugin file. If the parameter type is `jsPsych.plugins.parameterType.FUNCTION`, then this parameter must be a function and it will not be executed before the trial starts. 

Even though function evaluation doesn't work the same way with these parameters, the fact that the parameters are functions means that you can get the same dynamic functionality. These functions are typically evaluated at some point during the trial, so you still get updates to values within the function during the trial.