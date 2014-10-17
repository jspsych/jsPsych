# jspsych-same-different plugin

The same-different plugin displays two stimuli sequentially. Stimuli can be images or HTML objects. The subject responds using the keyboard, and indicates whether the stimuli were the same or different. Same does not necessarily mean identical; a category judgment could be made, for example.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimuli | array | *undefined* | Each element of the array is a pair of stimuli. Each pair is represented as an array with two entries, one for each stimulus. A stimulus can be either a path to an image file or a string containing valid HTML markup. Stimuli will be shown in the order that they are defined in the array. Each pair will be presented in its own trial, and thus the length of this array determines the total number of trials.
is_html | boolean | false | If the elements of the `stimuli` array are strings containing HTML content, then this parameter must be set to true. 
answer | array | *undefined* | Array of strings, where each string is either `'same'` or `'different'`. This array should be the same length as `stimuli` and the answers should correspond to the pairs in the `stimuli` array.
same_key | numeric or string | 'Q' | The key that subjects should press to indicate that the two stimuli are the same.
different_key | numeric or string | 'P' | The key that subjects should press to indicate that the two stimuli are different.
timing_first_stim | numeric | 1000 | How long to show the first stimulus for in milliseconds.
timing_gap | numeric | 500 | How long to show a blank screen in between the two stimuli.
timing_second_stim | numeric | 1000 | How long to show the second stimulus for in milliseconds. If the value of this parameter is `-1` then the stimulus will be shown until the subject responds.
prompt | string | "" | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g. which key to press).


## Data Generated

In addition to the [default data collected by all plugins](), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
stimulus | string | Either the path to the image file or the string containing the HTML formatted content that the subject saw first on this trial.
stimulus_2 | string | Either the path to the image file or the string containing the HTML formatted content that the subject saw second on this trial.
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the second stimulus first appears on the screen until the subject's response. 
correct | boolean | `true` if the subject's response matched the `answer` for this trial.

## Examples


