# jspsych-categorize

The categorize plugin shows an image or HTML object on the screen. The subject responds by pressing a key. Feedback indicating the correctness of the response is given.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimuli | array | *undefined* | Each element of the array is a stimulus. A stimulus can be either a path to an image file or a string containing valid HTML markup. Each stimulus will be presented in its own trial, and thus the length of this array determines the total number of trials.
is_html | boolean | false | If the elements of the `stimuli` array are strings containing HTML content, then this parameter must be set to true. 
key_answer | array | *undefined* | Each element of the array is a [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) indicating the correct response for the corresponding trial. The length of this array should match the `stimuli` array.
choices | array | *undefined* | This array contains the keys that the subject is allowed to press in order to respond to the stimulus. Keys can be specified as their [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) or as characters (e.g. `'a'`, `'q'`). 
text_answer | array | "" | Array of strings representing a label that is associated with each correct answer. Used in conjunction with the `correct_text` and `incorrect_text` parameters.
correct_text | string | "Correct." | String to show when the correct answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below).
incorrect_text | string | "Wrong." | String to show when the wrong answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below).
prompt | string | "" | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g. which key to press).
force_correct_button_press | boolean | false | If set to true, then the subject must press the correct response key after feedback is given in order to advance to the next trial.
timing_stim | numeric | -1 | How long to show the stimulus for (milliseconds). If -1, then the stimulus is shown until a response is given.
timing_feedback_duration | numeric | 2000 | How long to show the feedback for (milliseconds).

## Data Generated

In addition to the [default data collected by all plugins](), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
stimulus | string | Either the path to the image file or the string containing the HTML formatted content that the subject saw on this trial.
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response. 
correct | boolean | `true` if the subject got the correct answer, `false` otherwise.

## Examples

These examples show how to define a block using the categorize plugin to achieve various goals.

#### Categorizing HTML content

```javascript
// number of trials
var n_trials = 6;

// this is an example of using HTML objects as stimuli.
// you could also use images.
var numbers = ["1", "2", "3", "4", "5"];
var letters = ["I", "Z", "B", "A", "S"];

var stimuli = [];
var answers = [];
var text_answers = [];

// randomly choose stimuli
for (var i = 0; i < n_trials; i++) {
    if (Math.floor(Math.random() * 2) === 0) {
        // pick a number
        stimuli.push("<div id='stimulus'><p>" + numbers[Math.floor(Math.random() * numbers.length)] + "</p></div>");
        answers.push(81);
        text_answers.push("number");
    }
    else {
        // pick a letter
        stimuli.push("<div id='stimulus'><p>" + letters[Math.floor(Math.random() * letters.length)] + "</p></div>");
        answers.push(80);
        text_answers.push("letter");
    }
}

// create categorization block for jspsych
var categorization_block = {
    type: 'categorize',
    stimuli: stimuli,
    key_answer: answers,
    text_answer: text_answers,
    choices: [80, 81],
    correct_text: "<p class='prompt'>Correct, this is a %ANS%.</p>",
    incorrect_text: "<p class='prompt'>Incorrect, this is a %ANS%.</p>",
    is_html: true,
    prompt: "<p class='prompt'>Press P for letter. Press Q for number.</p>"
};
```

