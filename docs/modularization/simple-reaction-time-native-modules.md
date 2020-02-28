## Part 1: Creating a blank experiment
Follow steps in the [Simple Reaction Time Tutorial](../tutorials/rt-task.md).

## Part 2: Handle assets
Create a `img` folder under project root directory, copy `blue.png` and `orange.png` from the `jspsych-6.1.0/examples/img`

## Part 3: Modify plugins
Modify `jspsych-image-keyboard-response.js` and `jspsych-html-keyboard-response.js`:

Import jsPsych at the top: `import jsPsych from '../jspsych.js';` 

Change `jsPsych.plugins["html-keyboard-response"]` to `const htmlKeyboardResponse`, `jsPsych.plugins["image-keyboard-response"] to `const imageKeyboardResponse`

Export the plugin at the end: `export default htmlKeyboardResponse`, `export default imageKeyboardResponse`

## Part 4: Move code to a new JS file
Create `experiment.js`, copy the final code in Simple Reaction Task Turtorial into it.

Import jsPsych and plugins at the top of `experiment.js`, change all the type attribute in the timelines to objects(eg. `"html-keyboard-response"` to `htmlKeyboardResponse`:
```javascript
import jsPsych from './jspsych-6.1.0/jspsych.js';
import htmlKeyboardResponse from './jspsych-6.1.0/plugins/jspsych-html-keyboard-response.js';
import imageKeyboardResponse from './jspsych-6.1.0/plugins/jspsych-image-keyboard-response.js';

/* create timeline */
var timeline = [];

/* define welcome message trial */
var welcome = {
  type: htmlKeyboardResponse,
  stimulus: "Welcome to the experiment. Press any key to begin."
};
timeline.push(welcome);

/* define instructions trial */
var instructions = {
  type: htmlKeyboardResponse,
  stimulus: "<p>In this experiment, a circle will appear in the center " +
      "of the screen.</p><p>If the circle is <strong>blue</strong>, " +
      "press the letter F on the keyboard as fast as you can.</p>" +
      "<p>If the circle is <strong>orange</strong>, press the letter J " +
      "as fast as you can.</p>" +
      "<div style='width: 700px;'>"+
      "<div style='float: left;'><img src='img/blue.png'></img>" +
      "<p class='small'><strong>Press the F key</strong></p></div>" +
      "<div class='float: right;'><img src='img/orange.png'></img>" +
      "<p class='small'><strong>Press the J key</strong></p></div>" +
      "</div>"+
      "<p>Press any key to begin.</p>",
  post_trial_gap: 2000
};
timeline.push(instructions);

/* test trials */

var test_stimuli = [
  { stimulus: "img/blue.png", data: { test_part: 'test', correct_response: 'f' } },
  { stimulus: "img/orange.png", data: { test_part: 'test', correct_response: 'j' } }
];

var fixation = {
  type: htmlKeyboardResponse,
  stimulus: '<div style="font-size:60px;">+</div>',
  choices: jsPsych.NO_KEYS,
  trial_duration: function(){
    return jsPsych.randomization.sampleWithoutReplacement([250, 500, 750, 1000, 1250, 1500, 1750, 2000], 1)[0];
  },
  data: {test_part: 'fixation'}
}

var test = {
  type: imageKeyboardResponse,
  stimulus: jsPsych.timelineVariable('stimulus'),
  choices: ['f', 'j'],
  data: jsPsych.timelineVariable('data'),
  on_finish: function(data){
    data.correct = data.key_press == jsPsych.pluginAPI.convertKeyCharacterToKeyCode(data.correct_response);
  },
}

var test_procedure = {
  timeline: [fixation, test],
  timeline_variables: test_stimuli,
  repetitions: 5,
  randomize_order: true
}
timeline.push(test_procedure);

/* define debrief */

var debrief_block = {
  type: htmlKeyboardResponse,
  stimulus: function() {

    var trials = jsPsych.data.get().filter({test_part: 'test'});
    var correct_trials = trials.filter({correct: true});
    var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
    var rt = Math.round(correct_trials.select('rt').mean());

    return "<p>You responded correctly on "+accuracy+"% of the trials.</p>"+
    "<p>Your average response time was "+rt+"ms.</p>"+
    "<p>Press any key to complete the experiment. Thank you!</p>";

  }
};
timeline.push(debrief_block);

/* start the experiment */
jsPsych.init({
  timeline: timeline,
  on_finish: function() {
    jsPsych.data.displayData();
  }
});
```

## Part 5: Modify html file
In `experiment.html`:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>My experiment</title>
        <link href="jspsych-6.1.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
    </head>
    <body></body>
    <script type="module" src="experiment.js"></script>
</html>
```

## Part 6: Local testing
To get rid of the CORS block in some browsers, you have to setup a static server.

Make sure [Node.js](https://nodejs.org/en/) is installed.

Run `npm i -g serve`

Under to the project directory, run `serve ./`

Go to `http://localhost:5000/` and open `experiment.html`

And you should see the experiment running.
