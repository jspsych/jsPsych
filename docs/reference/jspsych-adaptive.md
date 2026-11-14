# jsPsych.adaptive

The jsPsych.adaptive module provides adaptive procedures: the difficulty (or "level") of the next trial is computed from the participant's previous responses. It currently includes staircases. It contains no DOM or timing code; you call it from your own trial parameters and `on_finish` callbacks.

The module is available on the jsPsych instance as `jsPsych.adaptive`. Anything random (choosing between interleaved tracks) uses `Math.random()`, so it is reproducible after `jsPsych.randomization.setSeed()`.

---

## jsPsych.adaptive.createStaircase

```javascript
const staircase = jsPsych.adaptive.createStaircase(config)
```

### Config parameters

| Parameter     | Type             | Default      | Description |
| ------------- | ---------------- | ------------ | ----------- |
| start_level   | numeric          | *required*   | The level of the first trial. Must be inside `bounds`. |
| up            | integer          | `1`          | Number of consecutive responses that move the level up one step: incorrect responses with the default `correct_moves: 'down'`, correct responses with `correct_moves: 'up'`. `null` means the level never moves up. |
| down          | integer          | `1`          | Number of consecutive responses that move the level down one step: correct responses with the default `correct_moves: 'down'`, incorrect responses with `correct_moves: 'up'`. `null` means the level never moves down. For both `up` and `down`, a response of the other kind resets the count, as does a move. |
| correct_moves | string           | `'down'`     | Which direction correct responses move the level: `'down'` (psychophysics convention: the level is stimulus intensity, higher is easier) or `'up'` (higher is harder, e.g. stop-signal delay or list length). |
| step_size     | number or object | `1`          | Size of each move. Either a number, or `{up: 20, down: 10}` for unequal sizes. `step_size.up` is the size of a move that raises the level and `step_size.down` of one that lowers it, whichever response caused the move. |
| step_sizes    | array            | `undefined`  | A schedule of step sizes (numbers or `{up, down}` objects) indexed by the number of reversals so far: entry 0 until the first reversal, entry 1 until the second, and so on; the last entry is used from then on. The move that causes a reversal already uses the new step size. Overrides `step_size`. |
| bounds        | array            | `[null, null]` | `[min, max]`. The level is clamped to this range. `null` means no bound on that side, e.g. `[0, null]`. |
| stop          | object           | `{}`         | Stopping rules; the staircase is `done` when any is met. See below. |
| label         | string           | `undefined`  | A name for the track, included in `toJSON()`. |

**`stop` properties:** each is a positive integer.

- `trials`: stop after this many updates.
- `reversals`: stop after this many reversals.
- `consecutive_failures`: stop after this many incorrect responses in a row, whether or not the level moved.
- `failures_at_level`: stop after this many incorrect responses since the level last changed.
- `ceiling`: stop after this many correct responses at the hardest level, counted since the level last reached it. The hardest level is the bound that correct responses move toward: `max` with `correct_moves: 'up'`, `min` with `'down'`. That bound must be finite.

If several rules are met on the same trial, `stop_reason` is the first one in this list.

The config is validated and copied when the staircase is created: an invalid value throws an error. Changing the config object afterwards has no effect. `Infinity` is also accepted wherever `null` is (`-Infinity` for a lower bound), but it is stored and saved as `null`, so the `config` in `toJSON()` can be passed back to `createStaircase()` unchanged.

### Staircase properties and methods

| Name                          | Description |
| ----------------------------- | ----------- |
| `level`                       | The level to use on the next trial. |
| `update(correct)`             | Records whether the response to the trial at `level` was correct (`true` or `false`), and returns the new level. Throws if `correct` is not a boolean or if the staircase is already `done`. |
| `done`                        | `true` once a stopping rule has been met. |
| `stop_reason`                 | `'trials'`, `'reversals'`, `'consecutive_failures'`, `'failures_at_level'`, `'ceiling'`, or `null` while running. |
| `reversals`                   | Number of reversals so far. A reversal is a level move in the opposite direction to the previous move. A move that is clamped at a bound still counts as a move in its direction. |
| `reversal_levels`             | The level at which each reversal occurred (the level presented on the trial whose response caused the direction change). |
| `trial_count`                 | Number of updates so far. |
| `history`                     | Array of `{trial, level, correct, next_level, reversal}`, one per update. |
| `estimate({last_n_reversals})` | The staircase's estimate of the level it is tracking (for psychophysics, the threshold): the mean of the last `last_n_reversals` reversal levels (all of them if omitted or if fewer have occurred); `null` if there has been no reversal. |
| `toJSON()`                    | Plain-object snapshot (`procedure: 'staircase'`, config, level, done, stop_reason, counts, reversal levels, estimate, history), suitable for saving in the data (see the psychophysics example below). |

Levels are rounded to 10 decimal places so that fractional steps (e.g. 0.1) do not accumulate floating-point error. A level clamped to a bound is set to the bound exactly.

### What the rules converge to

For a 1-up/1-down staircase with equal steps the level converges to the 50% point of the psychometric function. With equal steps, 1-up/2-down converges to 70.7% correct and 1-up/3-down to 79.4% (Levitt, 1971). These names assume the default `correct_moves: 'down'`; with `correct_moves: 'up'` they swap, so 2-up/1-down (two correct responses to go up, one error to go down) converges to 70.7%. With unequal steps in a 1-up/1-down staircase the hit rate converges to `s_incorrect / (s_incorrect + s_correct)` (Kaernbach, 1991), where `s_incorrect` is the size of the step taken after an incorrect response and `s_correct` the size of the step taken after a correct one. With the default `correct_moves: 'down'`, `s_incorrect` is `step_size.up`; with `correct_moves: 'up'` it is `step_size.down`. For example, steps of +20 after a miss and -10 after a hit give a target of about 67%.

---

## jsPsych.adaptive.createInterleaved

```javascript
const tracks = jsPsych.adaptive.createInterleaved([configA, configB], { order: 'random' })
```

Interleaves several adaptive procedures ("tracks"). Each track is a procedure, such as a staircase from `createStaircase()`, or a plain object, which is taken as a `createStaircase` config. The tracks can be of different kinds. Separate procedures per condition that you pick yourself need no special support; use this when the module should choose the track.

| Parameter | Type   | Default    | Description |
| --------- | ------ | ---------- | ----------- |
| order     | string | `'random'` | `'random'` picks uniformly among unfinished tracks using `Math.random()` (seedable); `'alternate'` cycles through the unfinished tracks in order. |

| Name              | Description |
| ----------------- | ----------- |
| `next()`          | Chooses the track for the next trial and returns it. Throws if all tracks are done. |
| `update(response)` | Updates the track chosen by the last `next()` and returns its new level. Throws if called twice without a `next()` in between. |
| `current`, `current_index` | The chosen track and its index. |
| `tracks`          | The tracks. |
| `done`            | `true` when every track is done. |
| `toJSON()`        | `{procedure: 'interleaved', order, done, tracks}`, with a snapshot of each track. |

---

## What all adaptive procedures have in common

Every procedure in this module, and any procedure you write yourself to use with `createInterleaved()`, has these members:

| Name | Description |
| ---- | ----------- |
| `procedure` | The kind of procedure, e.g. `'staircase'`. |
| `label` | Optional name for the procedure. |
| `level` | What to present on the next trial. A number for a staircase; other procedures may use other kinds of values. |
| `update(response)` | Records the response to the trial presented at `level` and returns the next level. A staircase takes `true`/`false`; other procedures may take other kinds of responses, such as a response time. |
| `done`, `stop_reason` | Whether the procedure has ended, and why (`null` while running). |
| `trial_count` | Number of calls to `update()` so far. |
| `estimate()` | Optional. The procedure's current best estimate of the level it is tracking, or `null` if it has none yet. How it is computed depends on the procedure, and a procedure may accept its own options (a staircase takes `{last_n_reversals}`). A procedure that only adjusts a level, without estimating anything, may leave it out. |
| `toJSON()` | A plain-object snapshot with at least `procedure`, `label`, `done`, `stop_reason` and `trial_count`. |

A procedure's state depends only on its config, the responses passed to `update()`, and `Math.random()`, which `jsPsych.randomization.setSeed()` controls. In TypeScript, the shared members are the `AdaptiveProcedure` interface.

---

## Examples

### Stop-signal delay (1-up/1-down, 50 ms steps, two interleaved tracks)

A higher stop-signal delay (SSD) makes stopping harder, so a successful stop raises the SSD (`correct_moves: 'up'`).

```javascript
const ssd = jsPsych.adaptive.createInterleaved(
  [
    { start_level: 200, step_size: 50, correct_moves: 'up', bounds: [0, 900], label: 'track1' },
    { start_level: 300, step_size: 50, correct_moves: 'up', bounds: [0, 900], label: 'track2' }
  ],
  { order: 'random' }
);

const stop_trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<p>...</p>',
  data: { task: 'stop' },
  on_start: function (trial) {
    const track = ssd.next();
    trial.data.ssd = track.level;
    trial.data.track = track.label;
    // use track.level as the stop-signal delay in your own stimulus timing
  },
  on_finish: function (data) {
    const stopped_successfully = data.response === null;
    ssd.update(stopped_successfully);
  }
};
```

### Span task (2-up/1-down on list length, start at 3, discontinue after 2 errors in a row)

```javascript
const span = jsPsych.adaptive.createStaircase({
  start_level: 3,
  up: 2,                 // two correct recalls in a row make the list longer
  down: 1,               // one error makes it shorter
  correct_moves: 'up',
  step_size: 1,
  bounds: [2, 12],
  stop: { consecutive_failures: 2 }
});

const span_procedure = {
  timeline: [{
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => `List length: ${span.level}`,
    // scoreRecall() is your own function: true if the list was recalled correctly
    on_finish: (data) => { span.update(scoreRecall(data)); }
  }],
  loop_function: () => !span.done
};
```

For the classic ascending version ("go up after each success, stop after 2 failures at the same length, or when the longest list is recalled"), let correct responses move the level and incorrect ones never move it:

```javascript
const span = jsPsych.adaptive.createStaircase({
  start_level: 3,
  up: 1,                   // each correct recall makes the list longer...
  down: null,              // ...and errors never make it shorter
  correct_moves: 'up',
  step_size: 1,
  bounds: [2, 12],
  stop: { failures_at_level: 2, ceiling: 1 }
});
```

Because the level only ever moves one way, this staircase has no reversals.

### Psychophysics threshold (shrinking steps, mean of the last reversals)

```javascript
const contrast = jsPsych.adaptive.createStaircase({
  start_level: 0.5,
  up: 1,
  down: 2,                       // converges to ~70.7% correct
  step_sizes: [0.08, 0.04, 0.02], // shrinks after the 1st and 2nd reversals
  bounds: [0.01, 1],
  stop: { reversals: 12 }
});

let target_key;

const staircase_trial = {
  timeline: [{
    type: jsPsychImageKeyboardResponse,
    stimulus: () => {
      target_key = jsPsych.randomization.sampleWithoutReplacement(['f', 'j'], 1)[0];
      return makeGrating(contrast.level, target_key);
    },
    choices: ['f', 'j'],
    on_finish: (data) => {
      data.correct = data.response === target_key;
      contrast.update(data.correct);
    }
  }],
  loop_function: () => !contrast.done
};

// The object that func returns is saved in this trial's data as `value`.
const save = {
  type: jsPsychCallFunction,
  func: () => ({
    threshold: contrast.estimate({ last_n_reversals: 8 }),
    staircase: contrast.toJSON()
  })
};
```

### Response-window staircase with unequal steps

```javascript
const window_ms = jsPsych.adaptive.createStaircase({
  start_level: 400,
  step_size: { up: 20, down: 10 }, // +20 ms after a miss, -10 ms after a hit: ~67% hits
  bounds: [100, 1000]
});
```

---

## Not yet included

QUEST (Bayesian) and RT-based procedures are not part of this module yet. They will be added as new procedures with the members above, so they can be interleaved with staircases.
