# plugin-mts

Current version: 1.0.0. [See the version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-mts/CHANGELOG.md).

This plugin implements Match-to-Sample (MTS) procedures for equivalence class formation and behavioral research. It supports simultaneous (SMTS) and delayed (DMTS) matching, visual and auditory stimuli, customizable feedback, and comprehensive data collection.

MTS procedures are widely used in behavioral psychology to study stimulus equivalence, concept learning, and relational learning. This plugin is based on PyMTS (Carvalho, F. C., Regaço, A., & de Rose, J. C., 2023), a Python Match-to-Sample program.

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-mts@1.0.0"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-mts.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-mts
```

```js
import mts from '@jspsych/plugin-mts';
```

## Parameters

In addition to the [parameters available in all plugins](https://jspsych.org/latest/overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

### Sample Stimuli

| Parameter | Type | Default Value | Description |
| --------- | ---- | ------------- | ----------- |
| sample_stimuli | array | undefined | Array of image paths to display as sample stimuli. Multiple samples can be displayed simultaneously (e.g., for contextual stimuli). |
| sample_audio | string | null | Audio file path to play as sample stimulus. If provided, participant must click sample to play audio before comparisons appear (for SMTS). |
| sample_positions | array | [[0, 200]] | Positions for sample stimuli in pixels [x, y] relative to center. If only one position is provided, it applies to the first sample. |

### Comparison Stimuli

| Parameter | Type | Default Value | Description |
| --------- | ---- | ------------- | ----------- |
| comparison_stimuli | array | undefined | Array of image paths to display as comparison stimuli. |
| correct_comparison | string or array | undefined | The correct comparison stimulus (or array of correct stimuli for multiple correct responses). |
| comparison_positions | array | [[-350, -200], [350, -200]] | Positions for comparison stimuli in pixels [x, y] relative to center. |
| randomize_comparison_positions | boolean | true | Whether to randomize the positions of comparison stimuli. |

### Protocol & Timing

| Parameter | Type | Default Value | Description |
| --------- | ---- | ------------- | ----------- |
| protocol | string | "SMTS" | Protocol type: 'SMTS' (simultaneous matching) or 'DMTS' (delayed matching). |
| comparison_delay | integer | 0 | Delay in milliseconds before comparison stimuli appear (if protocol is DMTS). |
| require_sample_click | boolean | true | Whether the sample must be clicked before comparisons appear. |
| allow_sample_audio_replay | boolean | true | Whether to allow clicking on sample during comparison phase to replay audio (SMTS only). |

### Stimuli Appearance

| Parameter | Type | Default Value | Description |
| --------- | ---- | ------------- | ----------- |
| stimulus_size | array | [200, 200] | Size of stimuli in pixels [width, height]. |
| background_color | string | "#000000" | Background color of the display element. |

### Consequences (Feedback)

| Parameter | Type | Default Value | Description |
| --------- | ---- | ------------- | ----------- |
| correct_consequence_image | string | null | Image path to display as consequence for correct response. |
| correct_consequence_audio | string | null | Audio path to play as consequence for correct response. |
| correct_consequence_duration | integer | 1000 | Duration in milliseconds to display correct consequence. |
| incorrect_consequence_image | string | null | Image path to display as consequence for incorrect response. |
| incorrect_consequence_audio | string | null | Audio path to play as consequence for incorrect response. |
| incorrect_consequence_duration | integer | 1000 | Duration in milliseconds to display incorrect consequence. |
| consequence_size | array | [600, 400] | Size of consequence images in pixels [width, height]. |
| iti_duration | integer | 0 | Inter-trial interval in milliseconds after consequence. |

### Audio

| Parameter | Type | Default Value | Description |
| --------- | ---- | ------------- | ----------- |
| audio_volume | float | 0.5 | Volume for audio playback (0.0 to 1.0). |

## Data Generated

In addition to the [default data collected by all plugins](https://jspsych.org/latest/overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name | Type | Value |
| ---- | ---- | ----- |
| sample_stimuli | array | The sample stimuli that were displayed. |
| sample_audio | string | The sample audio that was played (if any). |
| comparison_stimuli | array | The comparison stimuli that were displayed. |
| correct_comparison | string or array | The correct comparison stimulus. |
| selected_comparison | string | The comparison stimulus that was selected. |
| selected_comparison_index | integer | Index of the selected comparison in the comparison_stimuli array. |
| correct | boolean | Whether the response was correct. |
| rt_sample | integer | Time from trial start to sample click in milliseconds (null if no click required). |
| rt_comparison | integer | Time from sample click to comparison selection in milliseconds. |
| rt_total | integer | Total trial duration in milliseconds. |
| sample_audio_plays | integer | Number of times the sample audio was played. |
| protocol | string | Protocol used for this trial (SMTS or DMTS). |

## Examples

### Basic SMTS (Simultaneous Matching-to-Sample)

```javascript
const trial = {
  type: jsPsychMts,
  sample_stimuli: ['stimuli/A1.png'],
  comparison_stimuli: ['stimuli/B1.png', 'stimuli/B2.png'],
  correct_comparison: 'stimuli/B1.png',
  require_sample_click: false,
  correct_consequence_image: 'stimuli/correct.png',
  incorrect_consequence_image: 'stimuli/incorrect.png'
};
```

### SMTS with Auditory Sample (AB Training)

```javascript
const trial = {
  type: jsPsychMts,
  sample_stimuli: ['stimuli/sound_icon.png'],
  sample_audio: 'audio/A1.wav',
  comparison_stimuli: ['stimuli/B1.png', 'stimuli/B2.png'],
  correct_comparison: 'stimuli/B1.png',
  require_sample_click: true,
  allow_sample_audio_replay: true,
  correct_consequence_image: 'stimuli/correct.png',
  correct_consequence_audio: 'audio/beep.wav',
  incorrect_consequence_image: 'stimuli/incorrect.png',
  audio_volume: 0.7
};
```

### SMTS with Contextual Stimulus (AC Training)

```javascript
const trial = {
  type: jsPsychMts,
  sample_stimuli: ['stimuli/A1.png', 'stimuli/sound_icon.png'],
  sample_positions: [[0, 200], [350, 250]],
  comparison_stimuli: ['stimuli/C1.png', 'stimuli/C2.png'],
  correct_comparison: 'stimuli/C1.png',
  require_sample_click: false,
  correct_consequence_image: 'stimuli/correct.png',
  incorrect_consequence_image: 'stimuli/incorrect.png'
};
```

### DMTS (Delayed Matching-to-Sample)

```javascript
const trial = {
  type: jsPsychMts,
  sample_stimuli: ['stimuli/A1.png'],
  comparison_stimuli: ['stimuli/B1.png', 'stimuli/B2.png'],
  correct_comparison: 'stimuli/B1.png',
  protocol: 'DMTS',
  comparison_delay: 2000, // 2 second delay
  correct_consequence_image: 'stimuli/correct.png',
  incorrect_consequence_image: 'stimuli/incorrect.png'
};
```

### Equivalence Testing (Multiple Correct Responses)

```javascript
const trial = {
  type: jsPsychMts,
  sample_stimuli: ['stimuli/B1.png'],
  comparison_stimuli: ['stimuli/C1.png', 'stimuli/C2.png'],
  correct_comparison: ['stimuli/C1.png'], // Can specify multiple correct options
  require_sample_click: false,
  // No consequences for testing phase
  iti_duration: 500
};
```

### Complete Equivalence Training Procedure

```javascript
// AB Training Block
const ab_training = {
  timeline: [
    {
      type: jsPsychMts,
      sample_stimuli: ['stimuli/sound_icon.png'],
      sample_audio: jsPsych.timelineVariable('sample_audio'),
      comparison_stimuli: ['stimuli/B1.png', 'stimuli/B2.png'],
      correct_comparison: jsPsych.timelineVariable('correct'),
      require_sample_click: true,
      correct_consequence_image: 'stimuli/correct.png',
      correct_consequence_duration: 1000,
      incorrect_consequence_image: 'stimuli/incorrect.png',
      incorrect_consequence_duration: 1000,
      iti_duration: 500
    }
  ],
  timeline_variables: [
    { sample_audio: 'audio/A1.wav', correct: 'stimuli/B1.png' },
    { sample_audio: 'audio/A2.wav', correct: 'stimuli/B2.png' }
  ],
  repetitions: 6,
  randomize_order: true
};

// AC Training Block
const ac_training = {
  timeline: [
    {
      type: jsPsychMts,
      sample_stimuli: jsPsych.timelineVariable('sample'),
      comparison_stimuli: ['stimuli/C1.png', 'stimuli/C2.png'],
      correct_comparison: jsPsych.timelineVariable('correct'),
      require_sample_click: false,
      correct_consequence_image: 'stimuli/correct.png',
      incorrect_consequence_image: 'stimuli/incorrect.png',
      iti_duration: 500
    }
  ],
  timeline_variables: [
    { sample: ['stimuli/A1.png'], correct: 'stimuli/C1.png' },
    { sample: ['stimuli/A2.png'], correct: 'stimuli/C2.png' }
  ],
  repetitions: 6,
  randomize_order: true
};

// Equivalence Test (BC/CB)
const equivalence_test = {
  timeline: [
    {
      type: jsPsychMts,
      sample_stimuli: jsPsych.timelineVariable('sample'),
      comparison_stimuli: jsPsych.timelineVariable('comparisons'),
      correct_comparison: jsPsych.timelineVariable('correct'),
      require_sample_click: false,
      // No consequences in testing
      iti_duration: 500
    }
  ],
  timeline_variables: [
    { sample: ['stimuli/B1.png'], comparisons: ['stimuli/C1.png', 'stimuli/C2.png'], correct: 'stimuli/C1.png' },
    { sample: ['stimuli/B2.png'], comparisons: ['stimuli/C1.png', 'stimuli/C2.png'], correct: 'stimuli/C2.png' },
    { sample: ['stimuli/C1.png'], comparisons: ['stimuli/B1.png', 'stimuli/B2.png'], correct: 'stimuli/B1.png' },
    { sample: ['stimuli/C2.png'], comparisons: ['stimuli/B1.png', 'stimuli/B2.png'], correct: 'stimuli/B2.png' }
  ],
  randomize_order: true
};
```

## Similarity to PyMTS

This plugin implements the core functionality of PyMTS, a Python-based Match-to-Sample program:

- **Sample presentation**: Visual and/or auditory sample stimuli
- **Comparison presentation**: SMTS and DMTS protocols
- **Multiple samples**: Support for contextual stimuli
- **Consequences**: Visual and auditory feedback for correct/incorrect responses
- **Comprehensive data**: RT measurements, accuracy, trial information
- **Flexible positioning**: Custom positioning for all stimuli

### Differences from PyMTS

- **Block management**: jsPsych handles block logic through timeline variables and loops
- **Criteria**: Use conditional functions in jsPsych timelines for advancement criteria
- **Instructions**: Use jsPsych's `html-keyboard-response` or `instructions` plugin
- **Configuration**: Parameters are specified per trial rather than in separate config files

## Reference

If you use this plugin in your research, please cite:

- Original PyMTS: Carvalho, F. C., Regaço, A., & de Rose, J. C. (2023). PyMTS [Computer Software]. Universidade Federal de São Carlos.
