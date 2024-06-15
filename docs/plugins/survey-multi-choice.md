# survey-multi-choice

Current version: 1.1.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-survey-multi-choice/CHANGELOG.md).

The survey-multi-choice plugin displays a set of questions with multiple choice response fields. The participant selects a single answer.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
questions | array | *undefined* | An array of objects, each object represents a question that appears on the screen. Each object contains a prompt, options, required, and horizontal parameter that will be applied to the question. See examples below for further clarification.`prompt`: Type string, default value is *undefined*. The string is prompt/question that will be associated with a group of options (radio buttons). All questions will get presented on the same page (trial).`options`: Type array, defualt value is *undefined*. An array of strings. The array contains a set of options to display for an individual question.`required`: Type boolean, default value is null. The boolean value indicates if a question is required('true') or not ('false'), using the HTML5 `required` attribute. If this parameter is undefined, the question will be optional. `horizontal`:Type boolean, default value is false. If true, then the question is centered and the options are displayed horizontally. `name`: Name of the question. Used for storing data. If left undefined then default names (`Q0`, `Q1`, `...`) will be used for the questions.
randomize_question_order | boolean | `false` | If true, the display order of `questions` is randomly determined at the start of the trial. In the data object, `Q0` will still refer to the first question in the array, regardless of where it was presented visually.
preamble | string | empty string | HTML formatted string to display at the top of the page above all the questions.
button_label | string |  'Continue' | Label of the button.
autocomplete | boolean | false | This determines whether or not all of the input elements on the page should allow autocomplete. Setting this to true will enable autocomplete or auto-fill for the form.

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
response | object | An object containing the response for each question. The object will have a separate key (variable) for each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. The responses are recorded as the name of the option label selected (string). If the `name` parameter is defined for the question, then the response object will use the value of `name` as the key for each question. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
rt | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the questions first appear on the screen until the participant's response(s) are submitted. |
question_order | array | An array with the order of questions. For example `[2,0,1]` would indicate that the first question was `trial.questions[2]` (the third item in the `questions` parameter), the second question was `trial.questions[0]`, and the final question was `trial.questions[1]`. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-survey-multi-choice@1.1.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-survey-multi-choice.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-survey-multi-choice
```
```js
import surveyMultiChoice from '@jspsych/plugin-survey-multi-choice';
```

## Examples

???+ example "Vertical Question Alignment"
    === "Code"

        ```javascript
        var trial = {
          type: jsPsychSurveyMultiChoice,
          questions: [
            {
              prompt: "Which of the following do you like the most?", 
              name: 'VegetablesLike', 
              options: ['Tomato', 'Cucumber', 'Eggplant', 'Corn', 'Peas'], 
              required: true
            }, 
            {
              prompt: "Which of the following do you like the least?", 
              name: 'FruitDislike', 
              options: ['Apple', 'Banana', 'Orange', 'Grape', 'Strawberry'], 
              required: false
            }
          ],
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-multi-choice-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-multi-choice-demo1.html">Open demo in new tab</a>

???+ example "Horizontal Question Alignment"
    === "Code"

        ```javascript
        var trial = {
          type: jsPsychSurveyMultiChoice,
          questions: [
            {
              prompt: "Which of the following do you like the most?", 
              name: 'VegetablesLike', 
              options: ['Tomato', 'Cucumber', 'Eggplant', 'Corn', 'Peas'], 
              required: true,
              horizontal: true
            }, 
            {
              prompt: "Which of the following do you like the least?", 
              name: 'FruitDislike', 
              options: ['Apple', 'Banana', 'Orange', 'Grape', 'Strawberry'], 
              required: false,
              horizontal: true
            }
          ],
        };
        ```

    === "Demo"
        <div style="text-align:center;">
          <iframe src="../../demos/jspsych-survey-multi-choice-demo2.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-survey-multi-choice-demo2.html">Open demo in new tab</a>
