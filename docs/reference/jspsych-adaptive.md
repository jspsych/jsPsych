# jsPsych.adaptive

The jsPsych.adaptive module provides adaptive staircase procedures: the difficulty (or "level") of the next trial is computed from the participant's previous responses. It contains no DOM or timing code; you call it from your own trial parameters and `on_finish` callbacks.

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
| up            | integer          | `1`          | Number of consecutive **incorrect** responses that move the level one step against `correct_moves` (up, with the default `correct_moves: 'down'`). `staircase` mode only. |
| down          | integer          | `1`          | Number of consecutive **correct** responses that move the level one step in the `correct_moves` direction (down by default). A response of the other kind resets the count, as does a move. `staircase` mode only. |
| correct_moves | string           | `'down'`     | Which direction a run of correct responses moves the level: `'down'` (psychophysics convention: the level is stimulus intensity, higher is easier) or `'up'` (higher is harder, e.g. stop-signal delay or list length). `up` and `down` always count incorrect and correct responses, whichever way they move the level. `staircase` mode only. |
| step_size     | number or object | `1`          | Size of each move. Either a number, or `{up: 20, down: 10}` for unequal sizes. `step_size.up` is the size of a move that raises the level and `step_size.down` of one that lowers it, whichever response caused the move. |
| step_sizes    | array            | `undefined`  | A schedule of step sizes (numbers or `{up, down}` objects) indexed by the number of reversals so far: entry 0 until the first reversal, entry 1 until the second, and so on; the last entry is used from then on. The move that causes a reversal already uses the new step size. Overrides `step_size`. `staircase` mode only. |
| bounds        | array            | `[-Infinity, Infinity]` | `[min, max]`. The level is clamped to this range. |
| stop          | object           | `{}`         | Stopping rules; the staircase is `done` when any is met. See below. |
| mode          | string           | `'staircase'` | `'staircase'` or `'ascending_discontinue'`. See below. |
| label         | string           | `undefined`  | A name for the track, included in `toJSON()`. |

**`stop` properties:** each is a positive integer. `trials` (stop after this many updates), `reversals` (`staircase` mode only: stop after this many reversals), `consecutive_failures` (stop after this many incorrect responses in a row, regardless of level moves), and `failures_at_level` (`ascending_discontinue` mode only: stop after this many incorrect responses at one level).

The config is validated and copied when the staircase is created: an invalid value throws an error, as does an option marked as belonging to the other mode (`up`, `down`, `correct_moves`, `step_sizes` and `stop.reversals` in `ascending_discontinue` mode; `stop.failures_at_level` in `staircase` mode). Changing the config object afterwards has no effect.

**Modes.** In `staircase` mode the n-up/m-down rule above applies. In `ascending_discontinue` mode the level moves up by the `up` step size after each correct response, never moves after an incorrect response, and the procedure ends when a stop rule is met or when a correct response is given at the upper bound (`stop_reason` is `'ceiling'`, unless another stop rule is met on the same trial). Reversals are not tracked in this mode.

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
| `threshold({last_n_reversals})` | Mean of the last `last_n_reversals` reversal levels (all of them if omitted or if fewer have occurred); `null` if there has been no reversal. |
| `toJSON()`                    | Plain-object snapshot (config, level, done, stop_reason, counts, reversal levels, threshold, history), suitable for saving in the data (see the psychophysics example below). |

Levels are rounded to 10 decimal places so that fractional steps (e.g. 0.1) do not accumulate floating-point error. A level clamped to a bound is set to the bound exactly.

### What the rules converge to

For a 1-up/1-down staircase with equal steps the level converges to the 50% point of the psychometric function. With equal steps, 1-up/2-down converges to 70.7% correct and 1-up/3-down to 79.4% (Levitt, 1971). With unequal steps in a 1-up/1-down staircase the hit rate converges to `s_incorrect / (s_incorrect + s_correct)` (Kaernbach, 1991), where `s_incorrect` is the size of the step taken after an incorrect response and `s_correct` the size of the step taken after a correct one. With the default `correct_moves: 'down'`, `s_incorrect` is `step_size.up`; with `correct_moves: 'up'` it is `step_size.down`. For example, steps of +20 after a miss and -10 after a hit give a target of about 67%.

---

## jsPsych.adaptive.createInterleaved

```javascript
const tracks = jsPsych.adaptive.createInterleaved([configA, configB], { order: 'random' })
```

Interleaves several staircases (each config is a `createStaircase` config, or an existing staircase). Separate staircases per condition that you pick yourself need no special support; use this when the module should choose the track.

| Parameter | Type   | Default    | Description |
| --------- | ------ | ---------- | ----------- |
| order     | string | `'random'` | `'random'` picks uniformly among unfinished tracks using `Math.random()` (seedable); `'alternate'` cycles through the unfinished tracks in order. |

| Name              | Description |
| ----------------- | ----------- |
| `next()`          | Chooses the track for the next trial and returns that staircase. Throws if all tracks are done. |
| `update(correct)` | Updates the track chosen by the last `next()` and returns its new level. Throws if called twice without a `next()` in between. |
| `current`, `current_index` | The chosen track and its index. |
| `tracks`          | The staircases. |
| `done`            | `true` when every track is done. |
| `toJSON()`        | Snapshot of all tracks. |

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

### Span task (1-up/2-down on list length, start at 3, discontinue after 2 errors in a row)

```javascript
const span = jsPsych.adaptive.createStaircase({
  start_level: 3,
  up: 1,
  down: 2,
  correct_moves: 'up',   // two correct recalls make the list longer
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

For the classic "go up after a success, stop after N failures at the same length" version, use `ascending_discontinue` mode. It does not accept `up`, `down` or `correct_moves`, so the config becomes:

```javascript
const span = jsPsych.adaptive.createStaircase({
  start_level: 3,
  step_size: 1,
  bounds: [2, 12],
  mode: 'ascending_discontinue',
  stop: { failures_at_level: 2 }
});
```

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
    threshold: contrast.threshold({ last_n_reversals: 8 }),
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

QUEST (Bayesian) and RT-based procedures are not part of this module yet.
