# cloze

Current version: 1.2.1. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-cloze/CHANGELOG.md).

This plugin displays a text with certain words omitted. Participants are asked to replace the missing items. Responses are recorded when clicking a button. Responses can be evaluated and a function is called in case of either differences or incomplete answers, making it possible to inform participants about mistakes before proceeding.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter     | Type     | Default Value      | Description                              |
| ------------- | -------- | ------------------ | ---------------------------------------- |
| text          | string   | *undefined*        | The cloze text to be displayed. Blanks are indicated by %% signs and automatically replaced by input fields. If there is a correct answer you want the system to check against, it must be typed between the two percentage signs (i.e. % correct solution %). |
| button_text   | string   | OK                 | Text of the button participants have to press for finishing the cloze test. |
| check_answers | boolean  | false              | Boolean value indicating if the answers given by participants should be compared against a correct solution given in the text (between % signs) after the button was clicked. If ```true```, answers are checked and in case of differences, the ```mistake_fn``` is called. In this case, the trial does not automatically finish. If ```false```, no checks are performed and the trial automatically ends when clicking the button. |
| allow_blanks  | boolean  | true               | Boolean value indicating if the answers given by participants should be checked for completion after the button was clicked. If ```true```, answers are not checked for completion and blank answers are allowed. The trial will then automatically finish upon the clicking the button. If ```false```, answers are checked for completion, and in case there are some fields with missing answers, the ```mistake_fn``` is called. In this case, the trial does not automatically finish. |
| mistake_fn    | function | ```function(){}``` | Function called if ```check_answers``` is set to ```true``` and there is a difference between the participant's answers and the correct solution provided in the text, or if ```allow_blanks``` is set to ```false``` and there is at least one field with a blank answer. |

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name     | Type             | Value                       |
| -------- | ---------------- | --------------------------- |
| response | array of strings | Answers the partcipant gave |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-cloze@1.2.1"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-cloze.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-cloze
```
```js
import cloze from '@jspsych/plugin-cloze';
```

## Examples

???+ example "Simple cloze using default settings (no check against correct solution, no custom button text)"
    === "Code"
        ```javascript
            var cloze_trial = {
                type: jsPsychCloze,
                text: 'The %% is the largest terrestrial mammal. It lives in both %% and %%.'
            };
        ```
    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-cloze-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-cloze-demo1.html">Open demo in new tab</a>

???+ example "Cloze example using default settings with completion checking and custom error handling"
    === "Code"
        ```javascript
            var cloze_trial = {
                type: jsPsychCloze,
                text: 'Science notebooks have a %%-colored front cover. Math notebooks have a %%-colored front cover.',
                allow_blanks: false,
                mistake_fn: function() { alert('Please fill in all blanks.'); }
            };
        ```
    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-cloze-demo3.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-cloze-demo3.html">Open demo in new tab</a>


???+ example "More elaborate example (with check against correct solution, custom error handling and modified button text)"
    === "Code"
        ```javascript
            var cloze_trial = {
                type: jsPsychCloze,
                text: 'A rectangle has % 4 % corners and a triangle has % 3 %.',
                check_answers: true,
                button_text: 'Next',
                mistake_fn: function (){ alert("Wrong answer. Please check again.") }
            };
        ```
    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-cloze-demo2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-cloze-demo2.html">Open demo in new tab</a>
