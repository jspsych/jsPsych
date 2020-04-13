# jspsych-html-button-response

This plugin displays an image and records audio responses using a media player. The stimulus can be displayed until a response is given, or for a pre-determined amount of time.

## Processing audio data

The plugin itself collects audio data as a stream, and breaks this into 1s chunks. These chunks are then handed to a function _you define_ called `postprocessing`. 

A good approach to take in the postprocessing function is to send the data to a backend capable of saving the data somewhere you can access it in a form you can access, and have that backend return an identifier you can later use to match up the recording with the trial.

For an example of a backend written in NodeJS, see this guide on [saving to files in NodeJS](https://stackabuse.com/writing-to-files-in-node-js/). 

The format of the chunks in the blob array is .webm, which can be played directly by some media programs (e.g. [VLC media player](https://videolan.org)).

If `postprocessing` is not defined (i.e. the default is used), the audio_data part of the data will contain the audio chunks encoded in .webm format. 

## Ethics

Please note that, as with any freeform response field, there is a chance that you will encounter a response which mandates some kind of action on your behalf, such as evidence leading you to believe there is a real danger of harm to your participant or another person. You may, for example, pick up background sounds which give cause for concern.

While this is probably unlikely to occur, you should have a plan in place for how to respond should a situation arise, and be clear on what your responsibilities are under your local laws, ethical oversight body, and personal conscience.

## Parameters

Parameters with a default value of *undefined* must be specified.
Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | string | undefined | The path of the image file to be displayed.
buffer_length | int | 4000 | Length of the audio recording in ms
postprocessing | function | async (x) => x | The function to handle the audio buffer data. Takes buffer as input and the output is saved in the trial response
allow_playback | boolean | true | Whether to allow participants to play back and re-record their answer
recording_light | string | _HTML_ | HTML for the recording light in its on-state
recording_light_off | string | _HTML_ | HTML for the recording light in its off-state
prompt | string | null | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which key to press).
stimulus_duration | numeric | null | How long to show the stimulus for in milliseconds. If the value is null, then the stimulus will be shown until the subject makes a response.
margin_vertical | string | '0px' | Vertical margin of the button(s).
margin_horizontal | string | '8px' | Horizontal margin of the button(s).
response_ends_trial | boolean | true | If true, then the trial will end whenever the subject makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `timing_response` is reached. You can use this parameter to force the subject to view a stimulus for a fixed amount of time, even if they respond before the time is complete.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
audio_data | any | The result of running the postprocessing function on the contents of the audio buffer
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response.
stimulus | string | The path of the image that was displayed.

## Examples

#### Displaying image until subject gives a response

```javascript
var trial = {
	type: "image-audio-response",
    stimulus: '../img/happy_face_1.jpg',
    choices: [89, 78],
    prompt: '<p>How would you greet this face?</p>',
    // Postprocessing function logs buffer to console and resolves immediately with buffer content. This will mean the content is saved directly into the audio_data field of the response.
    postprocessing: function(buffer) {
        return new Promise(
            function(resolve) {
                console.log(buffer);
                resolve(buffer);
            });
    }
};
```
