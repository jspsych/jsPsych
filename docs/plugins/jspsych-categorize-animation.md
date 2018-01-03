# jspsych-categorize-animation

The categorize animation plugin shows a sequence of images at a specified frame rate. The subject responds by pressing a key. Feedback indicating the correctness of the response is given.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimuli | array | *undefined* | Each element of the array is a path to an image file.
choices | array of keycodes | `jsPsych.ALL_KEYS` | This array contains the keys that the subject is allowed to press in order to respond to the stimulus. Keys can be specified as their [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) or as characters (e.g., `'a'`, `'q'`). The default value of `jsPsych.ALL_KEYS` means that all keys will be accepted as valid responses. Specifying `jsPsych.NO_KEYS` will mean that no responses are allowed.
key_answer | numeric | *undefined* | A [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) indicating the correct response.
text_answer | string | "" | A text label that describes the correct answer. Used in conjunction with the `correct_text` and `incorrect_text` parameters.
correct_text | string | "Correct." | String to show when the correct answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below).
incorrect_text | string | "Wrong." | String to show when the wrong answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below).
frame_time | numeric | 500 | How long to display each image (in milliseconds).
sequence_reps | numeric | 1 | How many times to show the entire sequence.
allow_response_before_complete | boolean | false | If true, the subject can respond before the animation sequence finishes.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which key to press).
feedback_duration | numeric | 2000 | How long to show the feedback (milliseconds).

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
stimulus | JSON | JSON encoded representation of the array of stimuli displayed in the trial.
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response.
correct | boolean | `true` if the subject got the correct answer, `false` otherwise.

## Examples

#### Basic example

```javascript
var animation_trial = {
  type: 'categorize-animation',
  stimuli: ["img/face_3.jpg", "img/face_2.jpg", "img/face_4.jpg", "img/face_1.jpg"],
	choices: [80, 81], // 80 = 'p', 81 = 'q'
	key_answer: 81, // correct answer is 'q' for both trials
};
```

#### Giving feedback with `%ANS%` string

```javascript
var animation_trial = {
  type: 'categorize-animation',
  stimuli: ["img/face_3.jpg", "img/face_2.jpg", "img/face_4.jpg", "img/face_1.jpg"],
  choices: [80, 81], // 80 = 'p', 81 = 'q'
  key_answer: 81, // correct answer is 'q' for both trials
	text_answer: 'Dax', // the label for the sequence is 'Dax'
	correct_text: 'Correct! This was a %ANS%.',
	incorrect_text: 'Incorrect. This was a %ANS%.'
};
```
