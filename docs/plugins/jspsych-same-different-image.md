# jspsych-same-different plugin

The same-different plugin displays two stimuli sequentially. Stimuli are image objects. The subject responds using the keyboard, and indicates whether the stimuli were the same or different. Same does not necessarily mean identical; a category judgment could be made, for example.

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter            | Type    | Default Value | Description                              |
| -------------------- | ------- | ------------- | ---------------------------------------- |
| stimuli              | array   | *undefined*   | A pair of stimuli, represented as an array with two entries, one for each stimulus. The stimulus is a path to an image file. Stimuli will be shown in the order that they are defined in the array. |
| answer               | string  | *undefined*   | Either `'same'` or `'different'`.        |
| same_key             | string  | 'q'           | The key that subjects should press to indicate that the two stimuli are the same. |
| different_key        | string  | 'p'           | The key that subjects should press to indicate that the two stimuli are different. |
| first_stim_duration  | numeric | 1000          | How long to show the first stimulus for in milliseconds. If the value of this parameter is null then the stimulus will be shown until the subject presses any key. |
| gap_duration         | numeric | 500           | How long to show a blank screen in between the two stimuli. |
| second_stim_duration | numeric | 1000          | How long to show the second stimulus for in milliseconds. If the value of this parameter is null then the stimulus will be shown until the subject responds. |
| prompt               | string  | null          | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g., which key to press). |


## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| stimulus  | array   | An array of length 2 containing the paths to the image files that the subject saw for each trial. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
| response  | string  | Indicates which key the subject pressed. |
| rt        | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the second stimulus first appears on the screen until the subject's response. |
| correct   | boolean | `true` if the subject's response matched the `answer` for this trial. |
| answer    | string  | The correct answer to the trial, either `'same'` or `'different'`. |

Additionally, if `first_stim_duration` is  null, then the following data is also collected:

| Name            | Type    | Value                                    |
| --------------- | ------- | ---------------------------------------- |
| rt_stim1        | numeric | The response time in milliseconds for the subject to continue after the first stimulus. The time is measured from when the first stimulus appears on the screen until the subject's response. |
| response_stim1 | string  | Indicates which key the subject pressed to continue. |

## Examples

#### Presenting two different emotional expressions

```javascript
var block = {
  type: 'same-different-image',
  stimuli: ['img/happy_face_1.jpg', 'img/sad_face_3.jpg'],
  prompt: "<p>Press s if the faces had the same emotional expression. Press d if the faces had different emotional expressions.</p>",
  same_key: 's',
  different_key: 'd',
  answer: 'different'
}
```

#### Presenting the same emotional expression

```javascript
var block = {
  type: 'same-different-image',
  stimuli: ['img/happy_face_1.jpg', 'img/happy_face_3.jpg'],
  prompt: "<p>Press s if the faces had the same emotional expression. Press d if the faces had different emotional expressions.</p>",
  same_key: 's',
  different_key: 'd',
  answer: 'same'
}
```
