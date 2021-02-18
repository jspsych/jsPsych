# jspsych-audio-keyboard-response

This plugin plays audio files and records responses generated with the keyboard.

If the browser supports it, audio files are played using the WebAudio API. This allows for reasonably precise timing of the playback. The timing of responses generated is measured against the WebAudio specific clock, improving the measurement of response times. If the browser does not support the WebAudio API, then the audio file is played with HTML5 audio. 

Audio files can be automatically preloaded by jsPsych using the [`preload` plugin](jspsych-preload.md). However, if you are using timeline variables or another dynamic method to specify the audio stimulus, then you will need to [manually preload](/overview/media-preloading/#manual-preloading) the audio.

The trial can end when the subject responds, when the audio file has finished playing, or if the subject has failed to respond within a fixed length of time. You can also prevent a keyboard response from being recorded before the audio has finished playing.

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter                      | Type             | Default Value      | Description                              |
| ------------------------------ | ---------------- | ------------------ | ---------------------------------------- |
| stimulus                       | audio file       | undefined          | Path to audio file to be played.         |
| choices                        | array of strings | `jsPsych.ALL_KEYS` | This array contains the key(s) that the subject is allowed to press in order to respond to the stimulus. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/) for more examples. Any key presses that are not listed in the array will be ignored. The default value of `jsPsych.ALL_KEYS` means that all keys will be accepted as valid responses. Specifying `jsPsych.NO_KEYS` will mean that no responses are allowed. |
| prompt                         | string           | null               | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which key to press). |
| trial_duration                 | numeric          | null               | How long to wait for the subject to make a response before ending the trial in milliseconds. If the subject fails to make a response before this timer is reached, the subject's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely. |
| response_ends_trial            | boolean          | true               | If true, then the trial will end whenever the subject makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can use set this parameter to `false` to force the subject to listen to the stimulus for a fixed amount of time, even if they respond before the time is complete. |
| trial_ends_after_audio         | boolean          | false              | If true, then the trial will end as soon as the audio file finishes playing. |
| response_allowed_while_playing | boolean          | true               | If true, then responses are allowed while the audio is playing. If false, then the audio must finish playing before a keyboard response is accepted. Once the audio has played all the way through, a valid keyboard response is allowed (including while the audio is being re-played via on-screen playback controls). |

## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| response  | string  | Indicates which key the subject pressed. If no key was pressed before the trial ended, then the value will be `null`. |
| rt        | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first began playing until the subject made a key response. If no key was pressed before the trial ended, then the value will be `null`. |
| stimulus  | string  | Path to the audio file that played during the trial. |

## Examples

#### Displaying trial until subject gives a response

```javascript
var trial = {
	type: 'audio-keyboard-response',
	stimulus: 'sound/tone.mp3',
	choices: ['e', 'i'],
	prompt: "<p>Is the pitch high or low? Press 'e' for low and 'i' for high.</p>",
    response_ends_trial: false
};
```

#### Play a sound with no user response; trial ends after sound plays

```javascript
var trial = {
	type: 'audio-keyboard-response',
	stimulus: 'sound/tone.mp3',
	choices: jsPsych.NO_KEYS,
	trial_ends_after_audio: true
};
```
