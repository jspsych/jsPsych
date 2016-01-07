# jspsych-xab plugin

The XAB plugin displays either an image or HTML object stimulus (X). After a short gap, the plugin displays two additional stimuli (A and B). The subject selects which of the two stimuli matches X using the keyboard.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimuli | array | *undefined* | Array of two or three elements. If it is two elements, then the plugin will show the first element as X and as the target during the A/B portion (the second element will be the foil). If it is three elements, then the first is X the second is the target (A) and the third is the foil (B). This is useful if X and A are not identical, but A is still the correct choice (e.g. a categorization experiment where the goal is to pick the item that is in the same category). Stimuli can be paths to images, or html strings.
is_html | boolean | false | If the elements of the `stimuli` array are strings containing HTML content, then this parameter must be set to true.
left_key | numeric or string | 'Q' | Which key the subject should press to indicate that the target is on the left side.
right_key | numeric or string | 'P' | Which key the subject should press to indicate that the target is on the right side.
prompt | string | "" | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g. which key to press).
timing_x | numeric | 1000 | How long to show the X stimulus for in milliseconds.
timing_xab_gap | numeric | 1000 | How long to show a blank screen in between X and AB in milliseconds.
timing_ab | numeric | -1 | How long to show A and B in milliseconds. If the value of this parameter is -1, then the stimuli will remain on the screen until a response is given.
timing_response | numeric | -1 | The maximum duration to wait for a response, measured from the onset of the AB portion of the trial. If -1, then the trial will wait indefinitely for a response.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
stimulus | string | JSON-encoded array of the stimuli used in the trial.
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the A and B stimuli first appear on the screen until the subject's response.
correct | boolean | True if the subject picks the correct answer.

## Examples

#### Doing an exact match task

```javascript
var block = {
	type: 'xab',
	stimuli: ['img/happy_face.png', 'img/sad_face.png'],
	prompt: "Press Q if the face you just saw is on the left. Press P if the face you just saw is on the right."
}
```

#### Matching based on a feature

```javascript
var block = {
	type: 'xab',
	stimuli: ['img/happy_joe_face.png', 'img/sad_joe_face.png', 'img/sad_fred_face.png'],
	prompt: "Press Q if the person you just saw is on the left. Press P if the person you just saw is on the right."
}
```
