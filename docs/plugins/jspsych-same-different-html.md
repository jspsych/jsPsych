# jspsych-same-different-html plugin

The same-different-html plugin displays two stimuli sequentially. Stimuli are HTML objects. The subject responds using the keyboard, and indicates whether the stimuli were the same or different. Same does not necessarily mean identical; a category judgment could be made, for example.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimuli | array | *undefined* | A pair of stimuli, represented as an array with two entries, one for each stimulus. A stimulus is a string containing valid HTML markup. Stimuli will be shown in the order that they are defined in the array.
answer | string | *undefined* | Either `'same'` or `'different'`.
same_key | numeric or string | 'Q' | The key that subjects should press to indicate that the two stimuli are the same.
different_key | numeric or string | 'P' | The key that subjects should press to indicate that the two stimuli are different.
timing_first_stim | numeric | 1000 | How long to show the first stimulus for in milliseconds. If the value of this parameter is null then the stimulus will be shown until the subject presses any key.
timing_gap | numeric | 500 | How long to show a blank screen in between the two stimuli.
timing_second_stim | numeric | 1000 | How long to show the second stimulus for in milliseconds. If the value of this parameter is null then the stimulus will be shown until the subject responds.
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which key to press).


## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
stimulus | string | An JSON-encoded array of length 2 containing either the path to the image file or the string containing the HTML formatted content that the subject saw for each trial.
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the second stimulus first appears on the screen until the subject's response.
correct | boolean | `true` if the subject's response matched the `answer` for this trial.
answer | string | The correct answer to the trial, either `'same'` or `'different'`.

Additionally, if `timing_first_stim` is  null, then the following data is also collected:

Name | Type | Value
-----|------|------
rt_stim1 | numeric | The response time in milliseconds for the subject to continue after the first stimulus. The time is measured from when the first stimulus appears on the screen until the subject's response.
key_press_stim1 | numeric | Indicates which key the subject pressed to continue. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.

## Examples

#### Basic example

```javascript
  var trial = {
    type: 'same-different',
    stimuli: ['<p>Climbing</p>', '<p>Walking</p>'],
    prompt: "<p>Press S if the texts imply the same amount of physical exertion. Press D if the texts imply different amount of physical exertion.</p>",
    same_key: 'S',
    different_key: 'D',
    answer: 'different'
  }
```
