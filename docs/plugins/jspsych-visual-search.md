# jspsych-visual-search plugin

This plugin presents a customizable visual-search task modelled after Treisman and Gelade (1980). The subject indicates whether or not a target is present among a set of distractors. The stimuli can be displayed in a circle or grid format. The stimuli can also be jittered as a ratio of image size

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter          | Type            | Default Value | Description                              |
| ------------------ | --------------- | ------------- | ---------------------------------------- |
| target_present     | boolean         | *undefined*   | Is the target present?                   |
| set_size           | numeric         | *undefined*   | How many items should be displayed?      |
| target             | string          | *undefined*   | Path to image file that is the search target. |
| foil               | string or array | *undefined*   | Path to image file that is the foil/distractor. Can specify an array of distractors if the distractors are all different images. |
| fixation_image     | string          | *undefined*   | Path to image file that is a fixation target. |
| target_size        | array           | `[50, 50]`    | Two element array indicating the height and width of the search array element images. |
| fixation_size      | array           | `[16, 16]`    | Two element array indicating the height and width of the fixation image. |
| circle_diameter    | numeric         | 500           | The diameter of the search array circle in pixels. |
| target_present_key | string          | 'j'           | The key to press if the target is present in the search array. |
| target_absent_key  | string          | 'f'           | The key to press if the target is not present in the search array. |
| trial_duration     | numeric         | null          | The maximum amount of time the subject is allowed to search before the trial will continue. A value of null will allow the subject to search indefinitely. |
| fixation_duration  | numeric         | 1000          | How long to show the fixation image for before the search array (in milliseconds). |
| usegrid            | boolean         | false         | Are we using a grid for the visual search task? |
| jitter_ratio       | numeric         | 0.0           | The distance to jitter the image as ratio of image size (average of x and y). |

## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name           | Type        | Value                                    |
| -------------- | ----------- | ---------------------------------------- |
| correct        | boolean     | True if the subject gave the correct response. |
| response       | string      | Indicates which key the subject pressed. |
| rt             | numeric     | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response. |
| set_size       | numeric     | The number of items in the search array  |
| target_present | boolean     | True if the target is present in the search array |
| locations      | array       | Array where each element is the pixel value of the center of an image in the search array. If the target is present, then the first element will represent the location of the target. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |

## Examples

#### Search for the green T in the grid, no jitter

```javascript
var trial_1 = {
  type: 'visual-search',
  target: 'img/greenT.png',
  foil: 'img/greenL.png',
  fixation_image: 'img/fixation.png',
  target_present: true,
  set_size: 4
  usegrid: true
}
```

#### Search for the green T in the circle, jitter 

```javascript
var trial_1 = {
  type: 'visual-search',
  target: 'img/greenT.png',
  foil: 'img/greenL.png',
  fixation_image: 'img/fixation.png',
  target_present: true,
  set_size: 4
  jitter_ratio: 1.0
}
```
