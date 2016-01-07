# jspsych-animation

This plugin displays a sequence of images at a fixed frame rate. The sequence can be looped a specified number of times. The subject is free to respond at any point during the animation, and the time of the response is recorded.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimuli | array | *undefined* | Each element of the array is a path to an image file.
frame_time | numeric | 250 | How long to display each image (in milliseconds).
frame_isi | numeric | 0 | If greater than 0, then a gap will be shown between each image in the sequence. This parameter specifies the length of the gap.
sequence_reps | numeric | 1 | How many times to show the entire sequence. There will be no gap (other than the gap specified by `frame_isi`) between repetitions.
choices | array | [ ] | This array contains the keys that the subject is allowed to press in order to respond to the stimulus. Keys can be specified as their [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) or as characters (e.g. `'a'`, `'q'`). The default value of an empty array means that all keys will be accepted as valid responses.
prompt | string | "" | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g. which key to press).


## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
animation_sequence | JSON string | An array, encoded in JSON string format. Each element of the array is an object that represents a stimulus in the animation sequence. Each object has a `stimulus` property, which is the image that was displayed, and a `time` property, which is the time in ms, measured from when the sequence began, that the stimulus was displayed.
responses | JSON string | An array, encoded in JSON format. Each element of the array is an object representing a response given by the subject. Each object has a `stimulus` property, indicating which image was displayed when the key was pressed, an `rt` property, indicating the time of the key press relative to the start of the animation, and a `key_press` property, indicating which key was pressed.

## Examples

#### Displaying a single sequence multiple times

```javascript
// declare variable to hold animation sequence
var animation_sequence = ["img/face_1.jpg", "img/face_2.jpg", "img/face_3.jpg", "img/face_4.jpg", "img/face_3.jpg", "img/face_2.jpg"];

var animation_trial = {
    type: 'animation',
    stimuli: animation_sequence,
    sequence_reps: 3
};
```

#### Specifying two trials with different sequences

```javascript
// declare variables to hold animation sequences
var animation_sequence_1 = ["img/face_1.jpg", "img/face_2.jpg", "img/face_3.jpg", "img/face_4.jpg", "img/face_3.jpg", "img/face_2.jpg"];
var animation_sequence_2 = ["img/face_3.jpg", "img/face_2.jpg", "img/face_4.jpg", "img/face_1.jpg"];

// create animation block for jspsych
var animation_block = {
    type: 'animation',
    stimuli: [animation_sequence_1, animation_sequence_2],
    sequence_reps: 3
};
```
