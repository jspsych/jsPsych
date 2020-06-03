# jspsych-categorize-html

The categorize html plugin shows an HTML object on the screen. The subject responds by pressing a key. Feedback indicating the correctness of the response is given.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | html string | *undefined* | The HTML stimulus to display.
choices | array of keycodes | `jsPsych.ALL_KEYS` | This array contains the keys that the subject is allowed to press in order to respond to the stimulus. Keys can be specified as their [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) or as characters (e.g., `'a'`, `'q'`). The default value of `jsPsych.ALL_KEYS` means that all keys will be accepted as valid responses. Specifying `jsPsych.NO_KEYS` will mean that no responses are allowed.
key_answer | numeric | *undefined* | The [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) indicating the correct response.
text_answer | string | "" | A label that is associated with the correct answer. Used in conjunction with the `correct_text` and `incorrect_text` parameters.
correct_text | string | "Correct." | String to show when the correct answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the `%ANS%` string (see example below).
incorrect_text | string | "Wrong." | String to show when the wrong answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the `%ANS%` string (see example below).
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which key to press).
force_correct_button_press | boolean | false | If set to true, then the subject must press the correct response key after feedback is given in order to advance to the next trial.
show_stim_with_feedback | boolean | true | If set to true, then the stimulus will be shown during feedback. If false, then only the text feedback will display during feedback.
show_feedback_on_timeout | boolean | false | If true, then category feedback will be displayed for an incorrect response after a timeout (timing_response is exceeded). If false, then a timeout message will be shown.
timeout_message | string | "Please respond faster." | The message to show on a timeout non-response.
stimulus_duration | numeric | null | How long to show the stimulus for (milliseconds). If null, then the stimulus is shown until a response is given.
feedback_duration | numeric | 2000 | How long to show the feedback for (milliseconds).
trial_duration | numeric | null | The maximum time allowed for a response. If null, then the experiment will wait indefinitely for a response.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
stimulus | string | Either the path to the image file or the string containing the HTML formatted content that the subject saw on this trial.
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response.
correct | boolean | `true` if the subject got the correct answer, `false` otherwise.

## Examples

#### Categorizing HTML content

```javascript
var categorization_trial = {
    type: 'categorize',
    stimulus: '<p>B</p>',
    key_answer: 80,
    text_answer: 'letter',
    choices: [80, 81],
    correct_text: "<p class='prompt'>Correct, this is a %ANS%.</p>",
    incorrect_text: "<p class='prompt'>Incorrect, this is a %ANS%.</p>",
    prompt: "<p>Press P for letter. Press Q for number.</p>"
};
```
