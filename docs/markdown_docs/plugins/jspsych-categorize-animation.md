# jspsych-categorize-animation

The categorize animation plugin shows a sequence of images at a specified frame rate. The subject responds by pressing a key. Feedback indicating the correctness of the response is given.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimuli | array | *undefined* | Each element of the array is an array containing strings. The strings are paths to image files. Each array of strings specifies a single sequence, and each sequence will be its own trial. The length of this array determines the total number of trials.
key_answer | array | *undefined* | Each element of the array is a [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) indicating the correct response for the corresponding trial. The length of this array should match the `stimuli` array.
choices | array | *undefined* | This array contains the keys that the subject is allowed to press in order to respond to the stimulus. Keys can be specified as their [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) or as characters (e.g. `'a'`, `'q'`). 
text_answer | array | "" | Array of strings representing a label that is associated with each correct answer. Used in conjunction with the `correct_text` and `incorrect_text` parameters.
correct_text | string | "Correct." | String to show when the correct answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below).
incorrect_text | string | "Wrong." | String to show when the wrong answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below).
frame_time | numeric | 250 | How long to display each image (in milliseconds).
sequence_reps | numeric | 1 | How many times to show the entire sequence.
allow_response_before_complete | boolean | false | If true, the subject can respond before the animation sequence finishes.
prompt | string | "" | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g. which key to press).
timing_feedback_duration | numeric | 2000 | How long to show the feedback (milliseconds).


## Data Generated

In addition to the [default data collected by all plugins](), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
stimulus | string | The first image in the animation sequence for this trial
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response. 
correct | boolean | `true` if the subject got the correct answer, `false` otherwise.

## Examples

These examples show how to define a block using the categorize-animation plugin to achieve various goals.

#### Basic example

```javascript
// declare variables to hold animation sequences
var animation_sequence_1 = ["img/face_1.jpg", "img/face_2.jpg", "img/face_3.jpg", "img/face_4.jpg", "img/face_3.jpg", "img/face_2.jpg"];
var animation_sequence_2 = ["img/face_3.jpg", "img/face_2.jpg", "img/face_4.jpg", "img/face_1.jpg"];

// create animation block for jspsych
var animation_block = {
    type: 'categorize-animation',
    stimuli: [animation_sequence_1, animation_sequence_2],
	choices: [80, 81], // 80 = 'p', 81 = 'q'
	key_answer: [81, 81], // correct answer is 'q' for both trials
};
```

#### Giving feedback with `%ANS%` string

```javascript

// declare variables to hold animation sequences
var animation_sequence_1 = ["img/face_1.jpg", "img/face_2.jpg", "img/face_3.jpg", "img/face_4.jpg", "img/face_3.jpg", "img/face_2.jpg"];
var animation_sequence_2 = ["img/face_3.jpg", "img/face_2.jpg", "img/face_4.jpg", "img/face_1.jpg"];

// create animation block for jspsych
var animation_block = {
    type: 'categorize-animation',
    stimuli: [animation_sequence_1, animation_sequence_2],
	choices: [80, 81], // 80 = 'p', 81 = 'q'
	key_answer: [81, 81], // correct answer is 'q' for both trials,
	text_answer: ['Dax', 'Dax'], // the label for the sequence is 'Dax'
	correct_text: 'Correct! This was a %ANS%.',
	incorrect_text: 'Incorrect. This was a %ANS%.'
};
```