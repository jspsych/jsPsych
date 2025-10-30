# instructions

Current version: 2.0.1. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-instructions/CHANGELOG.md).

This plugin is for showing instructions to the participant. It allows participants to navigate through multiple pages of instructions at their own pace, recording how long the participant spends on each page. Navigation can be done using the mouse or keyboard. participants can be allowed to navigate forwards and backwards through pages, if desired.

## Parameters	

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter             | Type     | Default Value | Description                              |
| --------------------- | --------  | ------------- | ---------------------------------------- |
| pages                 | array    | *undefined*   | Each element of the array is the content for a single page. Each page should be an HTML-formatted string. |
| key_forward           | string   | 'ArrowRight'  | This is the key that the participant can press in order to advance to the next page. This key should be specified as a string (e.g., `'a'`, `'ArrowLeft'`, `' '`, `'Enter'`). |
| key_backward          | string   | 'ArrowLeft'   | This is the key that the participant can press to return to the previous page. This key should be specified as a string (e.g., `'a'`, `'ArrowLeft'`, `' '`, `'Enter'`). |
| allow_backward        | boolean  | true          | If true, the participant can return to previous pages of the instructions. If false, they may only advace to the next page. |
| allow_keys            | boolean  | true          | If `true`, the participant can use keyboard keys to navigate the pages. If `false`, they may not. |
| show_clickable_nav    | boolean  | false         | If true, then a `Previous` and `Next` button will be displayed beneath the instructions. Participants can click the buttons to navigate. |
| button_label_previous | string   | 'Previous'    | The text that appears on the button to go backwards. |
| button_label_next     | string   | 'Next'        | The text that appears on the button to go forwards. |
| show_page_number      | boolean  | false         | If true, and clickable navigation is enabled, then Page x/y will be shown between the nav buttons. |
| page_label            | string   | 'Page'        | The text that appears before x/y pages displayed when show_page_number is true. |
| on_page_change  | function | ``function (current_page) {}`` | The function that is called upon trial start and every time the page changes afterwards. This function receives two arguments: `current_page`, which is the index of the current page **after page change**, and `from_page`, which is the index of the previous page the subject has been viewing. Both parameters start at `0`. The function is also called when going forward from the last page, i.e., finishing the trial. |

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name         | Type        | Value                                    |
| ------------ | ----------- | ---------------------------------------- |
| view_history | array       | An array containing the order of pages the participant viewed (including when the participant returned to previous pages) and the time spent viewing each page. Each object in the array represents a single page view, and contains keys called `page_index` (the page number, starting with 0) and `viewing_time` (duration of the page view). This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
| rt           | numeric     | The response time in milliseconds for the participant to view all of the pages. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-instructions@2.1.0"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-instructions.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-instructions
```
```js
import instructions from '@jspsych/plugin-instructions';
```

## Examples

#### Showing simple text instructions

???+ example "Showing simple text instructions"
    === "Code"

        ```javascript
        var trial = {
            type: jsPsychInstructions,
            pages: [
            'Welcome to the experiment. Click next to begin.',
            'This is the second page of instructions.',
            'This is the final page.'
            ],
            show_clickable_nav: true
        }
        ```

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-instructions-demo-1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-instructions-demo-1.html">Open demo in new tab</a>

#### Including images

???+ example "Including Images"
    === "Code"

        ```javascript
        var trial = {
            type: jsPsychInstructions,
            pages: [
            'Welcome to the experiment. Click next to begin.',
            'You will be looking at images of arrows: ' +
            '<br>' + 
            '<img src="con2.png"></img>'
            ],
            show_clickable_nav: true
        }
        ```

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-instructions-demo-2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-instructions-demo-2.html">Open demo in new tab</a>

#### Changing Button Text

???+ example "Changing Button Text"
    === "Code"

        ```javascript
        var trial = {
            type: jsPsychInstructions,
            pages: [
            'Welcome to the experiment. Click next to begin.',
            'This is the second page of instructions.',
            'This is the final page.'
            ],
            button_label_next: "Continue",
            button_label_previous: "Return to the dark side",
            show_clickable_nav: true
        }
        ```

    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-instructions-demo-3.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-instructions-demo-3.html">Open demo in new tab</a>
