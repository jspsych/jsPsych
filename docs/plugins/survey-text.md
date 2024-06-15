# survey-text

Current version: 1.1.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-survey-text/CHANGELOG.md).

The survey-text plugin displays a set of questions with free response text fields. The participant types in answers.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
questions | array | *undefined* | An array of objects, each object represents a question that appears on the screen. Each object contains a prompt, placeholder, required, rows, and columns parameter that will be applied to the question. See examples below for further clarification. `prompt`: Type string, default value of *undefined*. The string is the prompt for the participant to respond to. Each question gets its own response field. `placeholder`: Type string, default value of `""`. The string will create placeholder text in the text field. `required`: Boolean; if `true` then the user must enter a response to submit. `rows`: Type integer, default value of 1. The number of rows for the response text box. `columns`: Type integer, default value of 40. The number of columns for the response text box. `name`: Name of the question. Used for storing data. If left undefined then default names (`Q0`, `Q1`, `...`) will be used for the questions.
randomize_question_order | boolean | `false` | If true, the display order of `questions` is randomly determined at the start of the trial. In the data object, `Q0` will still refer to the first question in the array, regardless of where it was presented visually.
preamble | string | empty string | HTML formatted string to display at the top of the page above all the questions.
button_label | string |  'Continue' | The text that appears on the button to finish the trial.
autocomplete | boolean | false | This determines whether or not all of the input elements on the page should allow autocomplete. Setting this to true will enable autocomplete or auto-fill for the form.

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
response | object | An object containing the response for each question. The object will have a separate key (variable) for each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. For each question, the response is a string containing whatever text was in the response box when the responses were submitted. If the `name` parameter is defined for the question, then the response object will use the value of `name` as the key for each question. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
rt | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the questions first appear on the screen until the participant's response(s) were submitted. |
question_order | array | An array with the order of questions. For example `[2,0,1]` would indicate that the first question was `trial.questions[2]` (the third item in the `questions` parameter), the second question was `trial.questions[0]`, and the final question was `trial.questions[1]`. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-survey-text@1.1.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-survey-text.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-survey-text
```
```js
import surveyText from '@jspsych/plugin-survey-text';
```

## Examples

???+ example "Single question and response"
    === "Code"

        ```javascript
        var trial = {
          type: jsPsychSurveyText,
          questions: [
            {prompt: 'How old are you?'}
          ]
        }
        ```
    
    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-text-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-text-demo1.html">Open demo in new tab</a>

???+ example "Multiple questions, with an optional placeholder and a required question"
    === "Code"

        ```javascript
        var trial = {
          type: jsPsychSurveyText,
          questions: [
            {prompt: 'What is your date of birth?', placeholder: 'mm/dd/yyyy', required: true},
            {prompt: 'What country do you currently live in?'}
          ]
        }
        ```
    
    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-text-demo2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-text-demo2.html">Open demo in new tab</a>

???+ example "Naming questions to improve readability of the stored data"
    === "Code"

        ```javascript
        var trial = {
          type: jsPsychSurveyText,
          questions: [
            {prompt: 'What did you eat for breakfast?', name: 'Breakfast'},
            {prompt: 'What did you eat for lunch?', name: 'Lunch'}
          ]
        }
        ```
    
    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-text-demo3.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-text-demo3.html">Open demo in new tab</a>

    
???+ example "Using the preamble and a longer textbox response"
    === "Code"

        ```javascript
        var trial = {
          type: jsPsychSurveyText,
          preamble: `<img src="img/navarro_burst_03.jpg" style="width:400px;"></img>`,
          questions: [
            {prompt: 'Describe your reaction to the image above', rows: 5}
          ]
        }
        ```

        *The artwork in this demo is by [Danielle Navarro](https://art.djnavarro.net/)*
    
    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-text-demo4.html" width="90%;" height="800px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-text-demo4.html">Open demo in new tab</a>

