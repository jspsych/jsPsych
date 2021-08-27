# jspsych-visual-search-circle plugin

This plugin presents a customizable visual-search task modelled after [Wang, Cavanagh, & Green (1994)](http://dx.doi.org/10.3758/BF03206946). The subject indicates whether or not a target is present among a set of distractors. The stimuli are displayed in a circle, evenly-spaced, equidistant from a fixation point. Here is an example using normal and backward Ns:

![Sample Visual Search Stimulus](/img/visual_search_example.jpg)

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
| circle_diameter    | numeric         | 250           | The diameter of the search array circle in pixels. |
| target_present_key | string          | 'j'           | The key to press if the target is present in the search array. |
| target_absent_key  | string          | 'f'           | The key to press if the target is not present in the search array. |
| trial_duration     | numeric         | null          | The maximum amount of time the subject is allowed to search before the trial will continue. A value of null will allow the subject to search indefinitely. |
| fixation_duration  | numeric         | 1000          | How long to show the fixation image for before the search array (in milliseconds). |

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

???+ example "Identical distractors"
    === "Code"
        ```javascript
        var instructions = {
          type: 'html-button-response',
          stimulus: `<p>Press J if there is a backwards N.</p>
            <p>Press F if all the Ns are in the normal orientation.</p>`,
          choices: ['Continue']
        }

        var trial = {
          type: 'visual-search-circle',
          target: 'img/backwardN.gif',
          foil: 'img/normalN.gif',
          fixation_image: 'img/fixation.gif',
          target_present: true,
          set_size: 4
        }
        ```
    
    === "Demo"
        <div style="text-align:center;">
          <iframe src="/demos/jspsych-visual-search-circle-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="/demos/jspsych-visual-search-circle-demo1.html">Open demo in new tab</a>

???+ example "Variety of different distractors"
    === "Code"
        ```javascript
        var instructions = {
          type: 'html-button-response',
          stimulus: `<p>Press E if there is an elephant in the group.</p>
            <p>Press N if there is no elephant in the group.</p>`,
          choices: ['Continue']
        }

        var trial = {
          type: 'visual-search-circle',
          target: 'img/elephant.png',
          foil: ['img/lion.png', 'img/monkey.png'],
          fixation_image: 'img/fixation.gif',
          target_present_key: 'e',
          target_absent_key: 'n',
          target_present: true,
          set_size: 3
        }
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="/demos/jspsych-visual-search-circle-demo2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="/demos/jspsych-visual-search-circle-demo2.html">Open demo in new tab</a>