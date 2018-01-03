# Event-related callback functions

jsPsych offers the ability to call arbitrary functions in response to certain events occurring, like the end of a trial or when new data is saved. This page summarizes the different opportunities for callback functions and how to specify them.

---

## on_data_update

The `on_data_update` callback can be declared in the `jsPsych.init` method. The callback triggers at the end of a data update cycle. This happens after every trial, after the on_finish (trial) and on_trial_finish events execute, allowing you to modify the data in those callbacks, and then use this callback to store the data. The function will be passed a single argument, which contains the data that was written.

#### Sample use
```javascript
jsPsych.init({
  timeline: exp,
  on_data_update: function(data) {
    console.log('Just added new data. The contents of the data are: '+JSON.stringify(data));
  }
});
```
---

## on_finish (trial)

The `on_finish` callback can be added to any trial. The callback will trigger whenever the trial ends. The callback function will be passed a single argument, containing the data object from the trial.

#### Sample use
```javascript
var trial = {
  type: 'image-keyboard-response',
  stimulus: 'imgA.png',
  on_finish: function(data) {
    console.log('The trial just ended.');
    console.log(JSON.stringify(data));
  }
};
```
---

## on_finish (experiment)

The `on_finish` callback can be declared in the `jsPsych.init` method. The callback will trigger once all trials in the experiment have been run. The method will be passed a single argument, containing all of the data generated in the experiment.

#### Sample use
```javascript
jsPsych.init({
  timeline: exp,
  on_finish: function(data) {
    console.log('The experiment is over! Here is all the data: '+JSON.stringify(data));
  }
});
```
---

## on_load

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
---

## on_start (trial)

The `on_start` callback can be added to any trial. The callback will trigger right before the trial begins. The callback function will be passed a single argument, containing the trial object. If any of the parameters of the trial are functions or timeline variables, these will be evaluated before `on_start` is called, and the trial object will contain the evaluated value. The trial object is modifiable, and any changes made will affect the trial.

#### Sample use
```javascript
var trial = {
  type: 'image-keyboard-response',
  stimulus: 'imgA.png',
  on_start: function(trial) {
    console.log('The trial is about to start.');
    trial.stimulus = 'imgB.png'; // this will change what stimulus is displayed in the trial
  }
};
```

---

## on_trial_finish

The `on_trial_finish` callback can be declared in the `jsPsych.init` method. The callback will trigger at the end of every trial in the experiment. If you want a callback to trigger only for the end of certain trials, use the [`on_finish`](#onfinishtrial) callback on the trial object. The callback function will be passed a single argument, containing the data object from the trial.

#### Sample use
```javascript
jsPsych.init({
  timeline: exp,
  on_trial_finish: function(data) {
    console.log('A trial just ended.');
    console.log(JSON.stringify(data));
  }
});
```
---

## on_trial_start

The `on_trial_start` callback can be declared in the `jsPsych.init` method. The callback will trigger at the start of every trial in the experiment. The function receives a single argument: a modifiable copy of the trial object that will be used to run the next trial. Changes can be made to this object to alter the parameters of the upcoming trial.

#### Sample use

```javascript
var current_score = 0; // a variable that is updated throughout the experiment to keep track of the current score.

jsPsych.init({
  timeline: exp,
  on_trial_start: function(trial) {
    trial.data.score_at_start_of_trial = current_score;
    console.log('A trial just started.');
  }
});
```
