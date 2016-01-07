# jspsych-text plugin

This plugin is for showing instructions and other basic HTML content to the subject.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
text | string | *undefined* | A string containing HTML formatted text (no HTML code is necessary, but it is allowed).
cont_key | array or `'mouse'` | [ ] | This array contains the keys that the subject is allowed to press in order to advance to the next trial. Keys can be specified as their [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) or as characters (e.g. `'a'`, `'q'`). The default value of an empty array means that all keys will be accepted as valid responses. If the value of `'mouse'` is used, then clicking the mouse will advance to the next trial.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response.

## Example

#### Showing a welcome message

```javascript
var block = {
	type: 'text',
	text: 'Welcome to the experiment. Press any key to begin.'
}
```
