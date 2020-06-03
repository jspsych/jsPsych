# jspsych-iat-image plugin

This plugin runs a single trial of the [implicit association test (IAT)](https://implicit.harvard.edu/implicit/iatdetails.html), using an image as the stimulus.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | string | *undefined* | The stimulus to display. The path to an image.
htm_when_wrong | string | `<span style="color: red; font-size: 80px">X</span>` | The image to display when a user presses the wrong key.
bottom_instructions | string | `<p>If you press the wrong key, a red X will appear. Press any key to continue.</p>` | Instructions about making a wrong key press and whether another key press is needed to continue.
force_correct_key_press | boolean | false | If this is true and the user presses the wrong key then they have to press the other key to continue. An example would be two keys 'E' and 'I'. If the key associated with the stimulus is 'E' and key 'I' was pressed, then pressing 'E' is needed to continue the trial. When this is true, then parameter key_to_move_forward is not used.
display_feedback | boolean | false | If true, then image_when_wrong and wrong_image_name is required. If false, timing_response is needed and trial will continue automatically.
left_category_key | string | 'E' | Key press that is associated with the left_category_label.
right_category_key | string | 'I' | Key press that is associated with the right_category_label.
left_category_label | string | ['left'] | An array that contains the words/labels associated with a certain stimulus. The labels are aligned to the left side of the page.
right_category_label | string | ['right'] | An array that contains the words/labels associated with a certain stimulus. The labels are aligned to the right side of the page.
stim_key_association | string | 'undefined' | Inputs are either 'left' or 'right'. It will associate the stimulus with the key presses on the left or right side of the page(left_category_key or right_category_key).
key_to_move_forward | array of characters | [jsPsych.ALL_KEYS] | This array contains the characters the subject is allowed to press to move on to the next trial if their key press was incorrect and feedback was displayed. Can also have 'other key' as an option which will only allow the user to select the right key to move forward.
timing_response | numeric | null | How long to wait for the subject to make a response before ending the trial in milliseconds. If the subject fails to make a response before this timer is reached, the subject's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely.
response_ends_trial | boolean | true | If true, then the trial will end whenever the subject makes a response (assuming they make their response before the cutoff specified by the `timing_response` parameter). If false, then the trial will continue until the value for `timing_response` is reached. You can use this parameter to force the subject to view a stimulus for a fixed amount of time, even if they respond before the time is complete.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
stimulus | string | Either the path to the image file or the string containing the HTML formatted content that the subject saw on this trial.
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response.
correct | boolean | boolean of whether the user's key press was correct for the given image or incorrect.

## Examples

```javascript
var trial_block = {
  type: 'iat-image',
  stimulus: 'img/blue.png',
  stim_key_association: 'left',
  html_when_wrong: '<span style="color: red; font-size: 80px">X</span>',
  bottom_instructions: '<p>If you press the wrong key, a red X will appear. Press the other key to continue</p>',
  force_correct_key_press: true,
  display_feedback: true,
  timing_response: 3000, //Only if display_feedback is false
  left_category_key: 'E',
  right_category_key: 'I',
  left_category_label: ['OLD'],
  right_category_label: ['YOUNG'],
  response_ends_trial: true
}

var timeline = [];
timeline.push(trial_block);

jsPsych.init({
  timeline: timeline,
  on_finish: function() {
    jsPsych.data.displayData();
  }
});
```
