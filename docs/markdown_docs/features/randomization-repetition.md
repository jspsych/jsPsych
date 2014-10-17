# Randomization & Repetition

Experiments often involve presenting a set of trials in a random order. It also might be necessary to present a set of trials multiple times. jsPsych makes both of these tasks very easy to do.

## Randomizing the order of trials within a block

To randomize the order of trials within a block, add the `randomize_order` property to the block definition with a value of `true`. This option works for all plugins.

```javascript
var block = {
	type: 'single-stim',
	stimuli: ['img/happy_face.png', 'img/sad_face.png'],
	randomize_order: true
}
```
In the above example, there would be two trials, one with a happy face and one with a sad face, and the order of presentation would be random.

You can only specify the `randomize_order` option for blocks. It doesn't work for chunks.

The randomization operation is performed immediately before the first trial in the block executes. This means that the order of trials is impossible to know until right before the first trial begins. It also means that the order will be re-randomized if the block is started multiple times (e.g. if the block appeas in a while chunk).

## Repeating a block of trials

To repeat a block multiple times, add the `repetitions` property to the block with the value being the number of repetitions. This option works for all plugins.

```javascript
var block = {
	type: 'single-stim',
	stimuli: ['img/happy_face.png', 'img/sad_face.png'],
	randomize_order: true,
	repetitions: 5
}
```

In the above example, there are two trials in the block. Both trials will occur (in a random order), and then the block will repeat 4 more times. The randomized order only applies to each individual repetition, so each set of two trials will contain one happy face and one sad face.

## Generating random orders of parameter values

The [jsPsych.randomization](../core_library/jspsych-randomization.md) module in the core library contains functions that assist with generating random orders of trial parameters.


